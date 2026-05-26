#!/usr/bin/env tsx
/**
 * ingest-url.ts - 手动抓取单个 URL 生成 lesson
 * 
 * Usage:
 *   npx tsx tools/content-pipeline/ingest-url.ts "https://example.com/article" --topic ai
 *   npx tsx tools/content-pipeline/ingest-url.ts "https://example.com/article" --topic technology --usage-policy summary_chunks_only
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fetchArticle } from './fetch-article.js'
import { cleanArticle } from './clean-article.js'
import { callAI, parseAIJson } from './call-ai.js'
import { classifySource } from './classify-source.js'
import { buildLesson } from './build-lesson.js'

const PROMPT_TEMPLATE = fs.readFileSync(
  path.join(path.dirname(new URL(import.meta.url).pathname), 'prompts', 'chunk-extractor.md'),
  'utf-8'
)

// Parse CLI args
function parseArgs(): { url: string; topic?: string; usagePolicy: string } {
  const args = process.argv.slice(2)
  const urlIdx = args.findIndex(a => !a.startsWith('--'))
  if (urlIdx === -1) {
    console.error('Usage: ingest-url.ts <url> [--topic topic] [--usage-policy policy]')
    process.exit(1)
  }
  
  const url = args[urlIdx]!
  const topicIdx = args.indexOf('--topic')
  const policyIdx = args.indexOf('--usage-policy')
  
  return {
    url,
    topic: topicIdx !== -1 ? args[topicIdx + 1] : undefined,
    usagePolicy: policyIdx !== -1 ? args[policyIdx + 1] || 'summary_chunks_only' : 'summary_chunks_only'
  }
}

async function main() {
  const { url, topic, usagePolicy } = parseArgs()
  
  console.log(`📥 Fetching: ${url}`)
  const article = await fetchArticle(url)
  console.log(`   Title: ${article.title}`)
  console.log(`   Site: ${article.siteName}`)
  
  // Clean
  const cleaned = cleanArticle(article.text)
  console.log(`   Cleaned: ${cleaned.wordCount} words`)

  if (cleaned.wordCount < 50) {
    console.error('❌ Article too short, skipping')
    process.exit(1)
  }

  // Classify
  console.log('🔍 Classifying...')
  const classification = await classifySource(cleaned.text, {
    url,
    name: article.siteName,
    usagePolicy
  })

  if (!classification.isSuitable) {
    console.error(`❌ Article not suitable: ${classification.reasonZh}`)
    process.exit(1)
  }
  console.log(`   Level: ${classification.level}`)
  console.log(`   Topics: ${classification.topicTags.join(', ')}`)

  // Extract chunks
  console.log('🧠 Extracting chunks...')
  const metadata = JSON.stringify({
    url,
    title: article.title,
    siteName: article.siteName,
    publishedAt: article.publishedAt,
    author: article.author,
    topic,
    usagePolicy,
    level: classification.level,
    topicTags: classification.topicTags
  }, null, 2)

  const prompt = PROMPT_TEMPLATE
    .replace('{{ARTICLE_METADATA}}', metadata)
    .replace('{{ARTICLE_TEXT}}', cleaned.text)

  const aiResponse = await callAI(prompt)
  const lesson = buildLesson(
    parseAIJson(aiResponse.content),
    url,
    article.siteName,
    'web',
    usagePolicy,
    classification,
    article.publishedAt || new Date().toISOString()
  )

  // Save to drafts
  const draftsDir = path.resolve('data/lessons/drafts')
  fs.mkdirSync(draftsDir, { recursive: true })
  const outPath = path.join(draftsDir, `${lesson.id}.json`)
  fs.writeFileSync(outPath, JSON.stringify(lesson, null, 2), 'utf-8')
  
  console.log(`✅ Draft saved: ${outPath}`)
  console.log(`   ${lesson.chunks.length} chunks extracted`)
  
  // Update history
  const historyPath = path.resolve('data/ingest/history.json')
  fs.mkdirSync(path.dirname(historyPath), { recursive: true })
  let history: Array<{ url: string; id: string; status: string; date: string }> = []
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'))
  }
  history.unshift({
    url,
    id: lesson.id,
    status: 'draft',
    date: new Date().toISOString()
  })
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8')
  console.log('📝 History updated')
}

main().catch(err => {
  console.error('❌ Ingest failed:', err.message)
  process.exit(1)
})
