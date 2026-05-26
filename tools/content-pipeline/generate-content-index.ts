#!/usr/bin/env tsx
/**
 * generate-content-index.ts — 构建v0.3 article-index 和 chunk-index
 * 从 data/articles/ 和 data/chunks/ 生成轻量级索引
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
  publishedAt: string
  tags: string[]
  examTags?: string[]
}

interface ArticleIndexItem {
  id: string
  categoryId: string
  title: string
  titleZh?: string
  summaryZh?: string
  level: string
  publishedAt: string
  tags: string[]
  examTags?: string[]
  chunkCount?: number
  url: string
}

interface ArticleChunks {
  articleId: string
  occurrences: Array<{ chunkId: string }>
}

const ROOT = path.resolve('.')

function scanArticles(): ArticleIndexItem[] {
  const articlesDir = path.join(ROOT, 'data', 'articles')
  const acDir = path.join(ROOT, 'data', 'article-chunks')
  const items: ArticleIndexItem[] = []

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.name.endsWith('.json')) {
        try {
          const article: Article = JSON.parse(fs.readFileSync(full, 'utf-8'))
          
          // Try to load article-chunks to get chunk count
          let chunkCount = 0
          const acPath = full.replace('/articles/', '/article-chunks/')
          if (fs.existsSync(acPath)) {
            const ac: ArticleChunks = JSON.parse(fs.readFileSync(acPath, 'utf-8'))
            chunkCount = ac.occurrences.length
          }

          items.push({
            id: article.id,
            categoryId: article.categoryId,
            title: article.title,
            titleZh: article.titleZh,
            summaryZh: article.summaryZh,
            level: article.level,
            publishedAt: article.publishedAt,
            tags: article.tags,
            examTags: article.examTags,
            chunkCount,
            url: `/articles/${article.id}/`
          })
        } catch { /* skip */ }
      }
    }
  }

  walk(articlesDir)
  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

function scanChunkIndex() {
  const indexPath = path.join(ROOT, 'data', 'chunks', 'chunk-index.json')
  if (!fs.existsSync(indexPath)) return []
  return JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
}

// Main
const articleIndex = scanArticles()
const chunks = scanChunkIndex()

const indexesDir = path.join(ROOT, 'data', 'indexes')
fs.mkdirSync(indexesDir, { recursive: true })

fs.writeFileSync(
  path.join(indexesDir, 'article-index.json'),
  JSON.stringify(articleIndex, null, 2),
  'utf-8'
)
console.log(`✅ article-index.json: ${articleIndex.length} articles`)

// Chunk index is already built by migration, just copy the stats
console.log(`✅ chunk-index.json: ${chunks.length} chunks (from data/chunks/)`)
