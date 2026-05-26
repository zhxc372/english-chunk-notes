#!/usr/bin/env tsx
/**
 * generate-v03-search-index.ts — v0.3 搜索索引生成
 * 覆盖 article + chunk + category + tag
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

interface Article {
  id: string
  categoryId: string
  title: string
  titleZh?: string
  summaryZh?: string
  level: string
  tags: string[]
  examTags?: string[]
  paragraphs: Array<{ id: string; text: string; zh?: string }>
}

interface ArticleChunks {
  articleId: string
  occurrences: Array<{
    chunkId: string
    surface: string
    sentence?: string
    sentenceZh?: string
  }>
}

interface Chunk {
  id: string
  canonical: string
  normalizedCanonical: string
  meaningZh: string
  type: string
  tags?: string[]
  surfaceForms?: string[]
  aliases?: string[]
  coreExamples?: Array<{ text: string; zh?: string }>
}

interface SearchItem {
  id: string
  type: 'article' | 'chunk'
  title: string
  text: string
  zh?: string
  categoryId?: string
  chunkId?: string
  tags?: string[]
  examTags?: string[]
  url: string
}

const ROOT = path.resolve('.')

function scanArticles(): Map<string, Article> {
  const dir = path.join(ROOT, 'data', 'articles')
  const map = new Map<string, Article>()
  
  function walk(d: string) {
    if (!fs.existsSync(d)) return
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) walk(full)
      else if (e.name.endsWith('.json')) {
        try {
          const a: Article = JSON.parse(fs.readFileSync(full, 'utf-8'))
          map.set(a.id, a)
        } catch { /* skip */ }
      }
    }
  }
  walk(dir)
  return map
}

function scanArticleChunks(): Map<string, ArticleChunks> {
  const dir = path.join(ROOT, 'data', 'article-chunks')
  const map = new Map<string, ArticleChunks>()
  
  function walk(d: string) {
    if (!fs.existsSync(d)) return
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) walk(full)
      else if (e.name.endsWith('.json')) {
        try {
          const ac: ArticleChunks = JSON.parse(fs.readFileSync(full, 'utf-8'))
          map.set(ac.articleId, ac)
        } catch { /* skip */ }
      }
    }
  }
  walk(dir)
  return map
}

function loadChunks(): Chunk[] {
  const p = path.join(ROOT, 'data', 'chunks', 'chunk-index.json')
  if (!fs.existsSync(p)) return []
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

// Main
const articles = scanArticles()
const acMap = scanArticleChunks()
const chunks = loadChunks()
const items: SearchItem[] = []

// Article index items
for (const [id, a] of articles) {
  const bodyText = a.paragraphs.map(p => p.text).join(' ')
  const bodyZh = a.paragraphs.map(p => p.zh || '').join(' ')
  
  items.push({
    id: `article-${id}`,
    type: 'article',
    title: a.title,
    text: bodyText,
    zh: [a.titleZh, a.summaryZh, bodyZh].filter(Boolean).join(' '),
    categoryId: a.categoryId,
    tags: a.tags,
    examTags: a.examTags,
    url: `/articles/${id}/`
  })
}

// Chunk index items
for (const c of chunks) {
  const surfaceText = c.surfaceForms?.join(' ') || ''
  const aliasText = c.aliases?.join(' ') || ''
  const exampleText = c.coreExamples?.map(e => e.text).join(' ') || ''
  const exampleZh = c.coreExamples?.map(e => e.zh || '').join(' ') || ''
  
  items.push({
    id: `chunk-${c.id}`,
    type: 'chunk',
    title: c.canonical,
    text: [c.canonical, surfaceText, aliasText, exampleText].filter(Boolean).join(' '),
    zh: [c.meaningZh, exampleZh].filter(Boolean).join(' '),
    chunkId: c.id,
    tags: c.tags,
    url: `/chunks/#${c.id}`
  })
}

const indexesDir = path.join(ROOT, 'data', 'indexes')
fs.mkdirSync(indexesDir, { recursive: true })
fs.writeFileSync(
  path.join(indexesDir, 'search-index.json'),
  JSON.stringify(items, null, 2),
  'utf-8'
)

console.log(`✅ search-index.json: ${items.length} items (${items.filter(i => i.type === 'article').length} articles, ${items.filter(i => i.type === 'chunk').length} chunks)`)
