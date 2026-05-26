#!/usr/bin/env tsx
/**
 * publish-lesson.ts - 发布 draft lesson
 * 
 * Usage:
 *   npx tsx tools/content-pipeline/publish-lesson.ts <draft-file>
 *   npx tsx tools/content-pipeline/publish-lesson.ts data/lessons/drafts/example.json
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

const draftPath = process.argv[2]
if (!draftPath) {
  console.error('Usage: publish-lesson.ts <draft-file>')
  process.exit(1)
}

const resolved = path.resolve(draftPath)
if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`)
  process.exit(1)
}

// Check it's in drafts
if (!resolved.includes('drafts')) {
  console.error('Only files in data/lessons/drafts/ can be published')
  process.exit(1)
}

// Read and update
const lesson = JSON.parse(fs.readFileSync(resolved, 'utf-8'))
if (lesson.reviewStatus === 'published') {
  console.log(`ℹ️  Already published: ${lesson.id}`)
  process.exit(0)
}

lesson.reviewStatus = 'published'

// Write to published
const publishedDir = path.resolve('data/lessons/published')
fs.mkdirSync(publishedDir, { recursive: true })
const publishedPath = path.join(publishedDir, `${lesson.id}.json`)
fs.writeFileSync(publishedPath, JSON.stringify(lesson, null, 2), 'utf-8')

// Remove from drafts (optional - keep a backup)
// fs.unlinkSync(resolved)

console.log(`✅ Published: ${lesson.id}`)
console.log(`   → ${publishedPath}`)
console.log(`   Title: ${lesson.title}`)
console.log(`   Chunks: ${lesson.chunks?.length || 0}`)
