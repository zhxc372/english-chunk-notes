#!/usr/bin/env tsx
/**
 * ingest-daily.ts - 每日自动抓取
 * 
 * Usage:
 *   npx tsx tools/content-pipeline/ingest-daily.ts
 *   npx tsx tools/content-pipeline/ingest-daily.ts --limit 2
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fetchArticle } from './fetch-article.js'
import { cleanArticle } from './clean-article.js'
import { callAI, parseAIJson } from './call-ai.js'
import { classifySource } from './classify-source.js'
import { buildLesson } from './build-lesson.js'
import { loadSourcesConfig, loadHistory, selectDailySources } from './select-daily-sources.js'

const PROMPT_TEMPLATE = fs.readFileSync(
  path.join(path.dirname(new URL(import.meta.url).pathname), 'prompts', 'chunk-extractor.md'),
  'utf-8'
)

function parseArgs(): { limit?: number } {
  const args = process.argv.slice(2)
  const limitIdx = args.indexOf('--limit')
  return {
    limit: limitIdx !== -1 ? parseInt(args[limitIdx + 1] || '3') : undefined
  }
}

interface ReportEntry {
  sourceName: string
  title: string
  url: string
  level: string
  tags: string[]
  draftPath: string
  status: 'success' | 'skipped' | 'failed'
  error?: string
}

async function main() {
  const { limit } = parseArgs()
  const config = loadSourcesConfig()
  const history = loadHistory()
  const sources = selectDailySources(config, history, limit)

  if (sources.length === 0) {
    console.log('📭 No new sources to ingest today')
    return
  }

  console.log(`📋 Selected ${sources.length} sources for today`)
  const report: ReportEntry[] = []
  const today = new Date().toISOString().slice(0, 10)

  for (const source of sources) {
    const entry: ReportEntry = {
      sourceName: source.name,
      title: '',
      url: source.url,
      level: '',
      tags: [],
      draftPath: '',
      status: 'success'
    }

    try {
      console.log(`\n📥 [${source.name}] Fetching: ${source.url}`)
      const article = await fetchArticle(source.url)
      entry.title = article.title

      if (!article.title || article.text.length < 100) {
        entry.status = 'skipped'
        entry.error = 'Article too short or no title'
        console.log(`   ⏭️ Skipped: ${entry.error}`)
        report.push(entry)
        continue
      }

      const cleaned = cleanArticle(article.text)
      if (cleaned.wordCount < 50) {
        entry.status = 'skipped'
        entry.error = `Too few words after cleaning: ${cleaned.wordCount}`
        console.log(`   ⏭️ Skipped: ${entry.error}`)
        report.push(entry)
        continue
      }

      // Classify
      const classification = await classifySource(cleaned.text, {
        url: source.url,
        name: source.name,
        usagePolicy: source.usagePolicy
      })

      if (!classification.isSuitable) {
        entry.status = 'skipped'
        entry.error = classification.reasonZh
        console.log(`   ⏭️ Skipped: not suitable - ${classification.reasonZh}`)
        report.push(entry)
        continue
      }

      entry.level = classification.level
      entry.tags = [...classification.topicTags, ...classification.examTags]

      // Extract chunks
      const metadata = JSON.stringify({
        url: source.url,
        title: article.title,
        siteName: article.siteName,
        publishedAt: article.publishedAt,
        usagePolicy: source.usagePolicy,
        level: classification.level
      }, null, 2)

      const prompt = PROMPT_TEMPLATE
        .replace('{{ARTICLE_METADATA}}', metadata)
        .replace('{{ARTICLE_TEXT}}', cleaned.text)

      const aiResponse = await callAI(prompt)
      const lesson = buildLesson(
        parseAIJson(aiResponse.content),
        source.url,
        source.name,
        'web',
        source.usagePolicy,
        classification,
        article.publishedAt || new Date().toISOString()
      )

      // Save
      const draftsDir = path.resolve('data/lessons/drafts')
      fs.mkdirSync(draftsDir, { recursive: true })
      const outPath = path.join(draftsDir, `${lesson.id}.json`)
      fs.writeFileSync(outPath, JSON.stringify(lesson, null, 2), 'utf-8')
      entry.draftPath = outPath

      // Update history
      history.unshift({
        url: source.url,
        id: lesson.id,
        status: 'draft',
        date: new Date().toISOString()
      })

      console.log(`   ✅ ${lesson.chunks.length} chunks → ${lesson.id}`)

    } catch (err) {
      entry.status = 'failed'
      entry.error = (err as Error).message
      console.error(`   ❌ Failed: ${entry.error}`)
    }

    report.push(entry)
  }

  // Save history
  const historyPath = path.resolve('data/ingest/history.json')
  fs.mkdirSync(path.dirname(historyPath), { recursive: true })
  fs.writeFileSync(historyPath, JSON.stringify(history.slice(0, 200), null, 2), 'utf-8')

  // Generate report
  const reportsDir = path.resolve('data/ingest/reports')
  fs.mkdirSync(reportsDir, { recursive: true })
  const reportPath = path.join(reportsDir, `${today}.md`)
  
  let reportMd = `# Ingest Report: ${today}\n\n`
  
  const successes = report.filter(r => r.status === 'success')
  const skipped = report.filter(r => r.status === 'skipped')
  const failed = report.filter(r => r.status === 'failed')

  if (successes.length) {
    reportMd += `## Success\n\n`
    for (const r of successes) {
      reportMd += `- [${r.sourceName}] ${r.title}\n  - URL: ${r.url}\n  - Level: ${r.level}\n  - Tags: ${r.tags.join(', ')}\n  - Draft: ${r.draftPath}\n\n`
    }
  }

  if (skipped.length) {
    reportMd += `## Skipped\n\n`
    for (const r of skipped) {
      reportMd += `- ${r.url}: ${r.error}\n`
    }
    reportMd += '\n'
  }

  if (failed.length) {
    reportMd += `## Failed\n\n`
    for (const r of failed) {
      reportMd += `- ${r.url}: ${r.error}\n`
    }
    reportMd += '\n'
  }

  fs.writeFileSync(reportPath, reportMd, 'utf-8')
  console.log(`\n📊 Report saved: ${reportPath}`)
}

main().catch(err => {
  console.error('❌ Daily ingest failed:', err.message)
  process.exit(1)
})
