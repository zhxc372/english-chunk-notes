#!/usr/bin/env tsx
/**
 * validate-lesson.ts - 校验 lesson JSON 是否符合 v0.2 schema
 *
 * 兼容策略：
 * - v0.1 lessons 缺少 source/reviewStatus 等字段时，自动补充默认值
 * - 仅校验补充后的完整结构
 *
 * 用法：
 *   npx tsx tools/content-pipeline/validate-lesson.ts <file-or-dir>
 *   npx tsx tools/content-pipeline/validate-lesson.ts data/lessons/
 */

import fs from 'node:fs'
import path from 'node:path'

// ---- Inline v0.2 validation (no Ajv dependency) ----

const VALID_LEVELS = new Set(['A2', 'B1', 'B2', 'C1'])
const VALID_REVIEW_STATUSES = new Set(['draft', 'reviewed', 'published', 'rejected'])
const VALID_SOURCE_TYPES = new Set(['web', 'manual', 'public_domain', 'open_license'])
const VALID_USAGE_POLICIES = new Set(['full_text_allowed', 'summary_chunks_only', 'metadata_only'])

interface ValidationError {
  file: string
  field: string
  message: string
}

function normalizeV01(lesson: Record<string, unknown>): Record<string, unknown> {
  // v0.1 compatibility: add missing required fields with defaults
  const id = (lesson.lesson_id || lesson.id || 'unknown') as string

  const normalized: Record<string, unknown> = {
    ...lesson,
    id: lesson.id || id,
    title: lesson.title || '',
    level: normalizeLevel(lesson.level as string),
    reviewStatus: lesson.reviewStatus || 'published', // v0.1 lessons are treated as published
    source: lesson.source || {
      type: 'manual',
      url: '',
      name: 'v0.1 legacy',
      usagePolicy: 'full_text_allowed',
      fetchedAt: new Date().toISOString()
    }
  }

  // Normalize chunks
  if (Array.isArray(normalized.chunks)) {
    normalized.chunks = normalized.chunks.map((c: Record<string, unknown>, i: number) => ({
      id: c.id || `${id}-${String(i + 1).padStart(3, '0')}`,
      chunk: c.chunk || '',
      meaningZh: c.meaningZh || c.meaning_cn || '',
      example: c.example || c.sentence || '',
      difficulty: normalizeLevel(c.difficulty as string || (lesson.level as string)),
      tags: c.tags || [],
      chunkType: c.chunkType || 'collocation',
      ...c
    }))
  }

  return normalized
}

function normalizeLevel(level: string | undefined): string {
  if (!level) return 'B2'
  // Handle v0.1 combined levels like "B1-B2"
  if (level.includes('-')) {
    const parts = level.split('-').map(s => s.trim().toUpperCase())
    return VALID_LEVELS.has(parts[parts.length - 1] || '')
      ? parts[parts.length - 1]!
      : 'B2'
  }
  return VALID_LEVELS.has(level.toUpperCase()) ? level.toUpperCase() : 'B2'
}

function validateLesson(data: Record<string, unknown>, filePath: string): ValidationError[] {
  const errors: ValidationError[] = []

  // Required top-level fields
  if (!data.id || typeof data.id !== 'string') {
    errors.push({ file: filePath, field: 'id', message: 'Missing or invalid id' })
  }
  if (!data.title || typeof data.title !== 'string') {
    errors.push({ file: filePath, field: 'title', message: 'Missing or invalid title' })
  }
  if (!VALID_LEVELS.has(data.level as string)) {
    errors.push({ file: filePath, field: 'level', message: `Invalid level: ${data.level}` })
  }
  if (!VALID_REVIEW_STATUSES.has(data.reviewStatus as string)) {
    errors.push({ file: filePath, field: 'reviewStatus', message: `Invalid reviewStatus: ${data.reviewStatus}` })
  }

  // Validate source
  const source = data.source as Record<string, unknown> | undefined
  if (!source || typeof source !== 'object') {
    errors.push({ file: filePath, field: 'source', message: 'Missing or invalid source' })
  } else {
    if (!VALID_SOURCE_TYPES.has(source.type as string)) {
      errors.push({ file: filePath, field: 'source.type', message: `Invalid source.type: ${source.type}` })
    }
    if (!VALID_USAGE_POLICIES.has(source.usagePolicy as string)) {
      errors.push({ file: filePath, field: 'source.usagePolicy', message: `Invalid usagePolicy: ${source.usagePolicy}` })
    }
    if (!source.name || typeof source.name !== 'string') {
      errors.push({ file: filePath, field: 'source.name', message: 'Missing source.name' })
    }
  }

  // Validate chunks
  const chunks = data.chunks as Record<string, unknown>[]
  if (!Array.isArray(chunks) || chunks.length === 0) {
    errors.push({ file: filePath, field: 'chunks', message: 'chunks must be a non-empty array' })
  } else {
    chunks.forEach((c, i) => {
      if (!c.id || typeof c.id !== 'string') {
        errors.push({ file: filePath, field: `chunks[${i}].id`, message: 'Missing chunk id' })
      }
      if (!c.chunk || typeof c.chunk !== 'string') {
        errors.push({ file: filePath, field: `chunks[${i}].chunk`, message: 'Missing chunk text' })
      }
      if (!c.meaningZh || typeof c.meaningZh !== 'string') {
        errors.push({ file: filePath, field: `chunks[${i}].meaningZh`, message: 'Missing meaningZh' })
      }
      if (!c.difficulty || !VALID_LEVELS.has(c.difficulty as string)) {
        errors.push({ file: filePath, field: `chunks[${i}].difficulty`, message: `Invalid difficulty: ${c.difficulty}` })
      }
    })
  }

  return errors
}

function processFile(filePath: string): { file: string; valid: boolean; errors: ValidationError[] } {
  const raw = fs.readFileSync(filePath, 'utf-8')
  let data: Record<string, unknown>
  try {
    data = JSON.parse(raw)
  } catch (e) {
    return { file: filePath, valid: false, errors: [{ file: filePath, field: 'JSON', message: (e as Error).message }] }
  }

  const normalized = normalizeV01(data)
  const errors = validateLesson(normalized, filePath)
  return { file: filePath, valid: errors.length === 0, errors }
}

// Main
const target = process.argv[2] || 'data/lessons'
const resolved = path.resolve(process.cwd(), target)
const stat = fs.statSync(resolved)

let results: ReturnType<typeof processFile>[]
if (stat.isDirectory()) {
  const files = fs.readdirSync(resolved)
    .filter(f => f.endsWith('.json'))
    .map(f => processFile(path.join(resolved, f)))
  results = files
} else {
  results = [processFile(resolved)]
}

let hasErrors = false
for (const r of results) {
  if (!r.valid) {
    hasErrors = true
    console.error(`❌ ${r.file}`)
    for (const e of r.errors) {
      console.error(`   → ${e.field}: ${e.message}`)
    }
  } else {
    console.log(`✅ ${r.file}`)
  }
}

const total = results.length
const passed = results.filter(r => r.valid).length
console.log(`\n${passed}/${total} lessons passed validation`)

if (hasErrors) process.exit(1)
