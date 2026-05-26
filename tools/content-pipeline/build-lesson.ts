/**
 * build-lesson.ts - 从 AI 输出构建完整 lesson JSON
 * 
 * 将 chunk-extractor 的输出转换为符合 v0.2 schema 的 lesson
 */

import * as crypto from 'node:crypto'
import { parseAIJson } from './call-ai.js'
import type { ClassificationResult } from './classify-source.js'

export interface AIChunkOutput {
  title: string
  summaryEn: string
  summaryZh: string
  level: string
  topicTags: string[]
  examTags: string[]
  useCaseTags: string[]
  chunks: Array<{
    chunk: string
    chunkType?: string
    difficulty?: string
    meaningZh?: string
    literalZh?: string
    usageNoteZh?: string
    sourceSentence?: string
    rewrittenExamples?: { daily: string; exam: string; tech: string }
    cloze?: { question: string; answer: string }
    retellPrompt?: string
    writingPrompt?: string
    tags?: string[]
  }>
  qualityNotes?: string[]
}

export interface LessonV02 {
  id: string
  title: string
  level: string
  summaryEn: string
  summaryZh: string
  topicTags: string[]
  examTags: string[]
  useCaseTags: string[]
  reviewStatus: 'draft' | 'reviewed' | 'published' | 'rejected'
  source: {
    type: string
    url: string
    name: string
    author?: string
    publishedAt?: string
    fetchedAt: string
    license?: string
    usagePolicy: string
    attribution?: string
  }
  article?: {
    mode: string
    originalText?: string
    teachingTextEn?: string
    teachingTextZh?: string
  }
  chunks: Array<{
    id: string
    chunk: string
    chunkType: string
    difficulty: string
    meaningZh: string
    literalZh?: string
    usageNoteZh?: string
    sourceSentence?: string
    example: string
    cloze?: { question: string; answer: string }
    retellPrompt?: string
    writingPrompt?: string
    tags: string[]
  }>
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 8)
}

export function buildLesson(
  aiOutput: string | AIChunkOutput,
  sourceUrl: string,
  sourceName: string,
  sourceType: string = 'web',
  usagePolicy: string = 'summary_chunks_only',
  classification?: ClassificationResult,
  fetchedAt?: string
): LessonV02 {
  const parsed = typeof aiOutput === 'string' ? parseAIJson<AIChunkOutput>(aiOutput) : aiOutput

  const id = slugify(parsed.title) || `article-${hashUrl(sourceUrl)}`
  const level = classification?.level || parsed.level || 'B2'
  const now = new Date().toISOString()

  return {
    id,
    title: parsed.title,
    level,
    summaryEn: parsed.summaryEn || '',
    summaryZh: parsed.summaryZh || '',
    topicTags: classification?.topicTags || parsed.topicTags || [],
    examTags: classification?.examTags || parsed.examTags || [],
    useCaseTags: classification?.useCaseTags || parsed.useCaseTags || [],
    reviewStatus: 'draft',
    source: {
      type: sourceType,
      url: sourceUrl,
      name: sourceName,
      fetchedAt: fetchedAt || now,
      usagePolicy
    },
    article: usagePolicy !== 'metadata_only'
      ? { mode: usagePolicy === 'full_text_allowed' ? 'original_allowed' : 'summary_only' }
      : undefined,
    chunks: (parsed.chunks || []).map((c, i) => ({
      id: `${id}-${String(i + 1).padStart(3, '0')}`,
      chunk: c.chunk,
      chunkType: c.chunkType || 'collocation',
      difficulty: c.difficulty || level,
      meaningZh: c.meaningZh || '',
      literalZh: c.literalZh,
      usageNoteZh: c.usageNoteZh,
      sourceSentence: c.sourceSentence,
      example: c.sourceSentence || c.rewrittenExamples?.exam || '',
      cloze: c.cloze,
      retellPrompt: c.retellPrompt,
      writingPrompt: c.writingPrompt,
      tags: c.tags || []
    }))
  }
}
