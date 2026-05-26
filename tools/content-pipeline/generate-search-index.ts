#!/usr/bin/env tsx
/**
 * generate-search-index.ts - 构建时生成搜索索引
 * 
 * 从所有 lesson JSON 生成 search-index.json，供前端搜索和筛选使用
 * 
 * Usage: npx tsx tools/content-pipeline/generate-search-index.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

interface V01Lesson {
  lesson_id: string
  title: string
  title_cn: string
  category: string
  level: string
  theme_tags?: string[]
  exam_tags?: string[]
  chunks?: Array<{
    id: string
    chunk: string
    meaning_cn?: string
    meaningZh?: string
    tags?: string[]
    exam_tags?: string[]
  }>
}

interface V02Lesson {
  id: string
  title: string
  level: string
  summaryEn?: string
  summaryZh?: string
  topicTags?: string[]
  examTags?: string[]
  useCaseTags?: string[]
  reviewStatus?: string
  source?: { name?: string }
  chunks?: Array<{
    id: string
    chunk: string
    meaningZh?: string
    difficulty?: string
    tags?: string[]
  }>
}

interface SearchEntry {
  lessonId: string
  title: string
  titleCn?: string
  summaryZh: string
  level: string
  topicTags: string[]
  examTags: string[]
  useCaseTags: string[]
  sourceName: string
  chunkTexts: string[]
  chunkMeaningZhs: string[]
  route: string
  reviewStatus: string
}

function isV02(data: Record<string, unknown>): boolean {
  return !!(data.id && data.source && data.reviewStatus)
}

function normalizeToSearchEntry(rawData: Record<string, unknown>, filePath: string): SearchEntry {
  if (isV02(rawData)) {
    const d = rawData as unknown as V02Lesson
    const chunkTexts = (d.chunks || []).map(c => c.chunk)
    const chunkMeaningZhs = (d.chunks || []).map(c => c.meaningZh || '').filter(Boolean)
    return {
      lessonId: d.id,
      title: d.title,
      summaryZh: d.summaryZh || '',
      level: normalizeLevel(d.level),
      topicTags: d.topicTags || [],
      examTags: d.examTags || [],
      useCaseTags: d.useCaseTags || [],
      sourceName: d.source?.name || '',
      chunkTexts,
      chunkMeaningZhs,
      route: `/themes/${d.id}/`,
      reviewStatus: d.reviewStatus || 'published'
    }
  }

  // v0.1 format
  const d = rawData as unknown as V01Lesson
  const chunkTexts = (d.chunks || []).map(c => c.chunk)
  const chunkMeaningZhs = (d.chunks || []).map(c => c.meaningZh || c.meaning_cn || '').filter(Boolean)
  return {
    lessonId: d.lesson_id,
    title: d.title,
    titleCn: d.title_cn,
    summaryZh: '',
    level: normalizeLevel(d.level),
    topicTags: d.theme_tags || [],
    examTags: d.exam_tags || [],
    useCaseTags: [],
    sourceName: 'v0.1',
    chunkTexts,
    chunkMeaningZhs,
    route: `/themes/${d.lesson_id}/`,
    reviewStatus: 'published'
  }
}

function normalizeLevel(level: string): string {
  if (level.includes('-')) {
    const parts = level.split('-').map(s => s.trim().toUpperCase())
    return parts[parts.length - 1] || 'B2'
  }
  return level.toUpperCase() || 'B2'
}

function scanDirectory(dir: string, entries: SearchEntry[]): void {
  if (!fs.existsSync(dir)) return
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      scanDirectory(filePath, entries)
    } else if (file.endsWith('.json')) {
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        entries.push(normalizeToSearchEntry(raw, filePath))
      } catch (e) {
        console.warn(`⚠️  Failed to parse ${filePath}: ${(e as Error).message}`)
      }
    }
  }
}

// Main
const projectRoot = path.resolve(import.meta.dirname || '.', '..', '..')
const lessonsDir = path.join(projectRoot, 'data', 'lessons')
const outputDir = path.join(projectRoot, 'docs', '.vitepress', 'data')

console.log('🔍 Scanning lessons...')
const entries: SearchEntry[] = []

// Scan all lesson directories (including drafts)
for (const subdir of ['drafts', 'published']) {
  scanDirectory(path.join(lessonsDir, subdir), entries)
}

// Scan root lessons (v0.1)
const rootFiles = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.json'))
for (const file of rootFiles) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(lessonsDir, file), 'utf-8'))
    entries.push(normalizeToSearchEntry(raw, file))
  } catch (e) {
    console.warn(`⚠️  Failed to parse ${file}: ${(e as Error).message}`)
  }
}

// Deduplicate by lessonId
const seen = new Set<string>()
const unique = entries.filter(e => {
  if (seen.has(e.lessonId)) return false
  seen.add(e.lessonId)
  return true
})

fs.mkdirSync(outputDir, { recursive: true })
const outPath = path.join(outputDir, 'search-index.json')
fs.writeFileSync(outPath, JSON.stringify(unique, null, 2), 'utf-8')

console.log(`✅ Generated ${unique.length} entries → ${outPath}`)
const published = unique.filter(e => e.reviewStatus === 'published').length
console.log(`   Published: ${published}, Drafts: ${unique.length - published}`)
