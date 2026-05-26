/**
 * v0.3 Content Types
 * 文章驱动的英语词块学习站数据模型
 */

// ── Category ──────────────────────────────────────────

export interface Category {
  id: string
  name: string
  nameZh: string
  description?: string
  order: number
  tags?: string[]
}

// ── Article ───────────────────────────────────────────

export interface Article {
  id: string
  categoryId: string
  title: string
  titleZh?: string
  summaryZh?: string
  level: 'A2' | 'B1' | 'B2' | 'C1'
  sourceType: 'generated' | 'curated' | 'imported'
  sourceUrl?: string
  publishedAt: string
  updatedAt?: string
  order?: number
  tags: string[]
  examTags?: string[]
  paragraphs: ArticleParagraph[]
}

export interface ArticleParagraph {
  id: string
  text: string
  zh?: string
}

// ── Article Index (lightweight, for listing) ──────────

export interface ArticleIndexItem {
  id: string
  categoryId: string
  title: string
  titleZh?: string
  summaryZh?: string
  level: Article['level']
  publishedAt: string
  tags: string[]
  examTags?: string[]
  chunkCount?: number
  url: string
}

// ── Chunk ─────────────────────────────────────────────

export interface Chunk {
  id: string
  canonical: string
  normalizedCanonical: string
  meaningZh: string
  type: ChunkType
  level?: 'A2' | 'B1' | 'B2' | 'C1'
  tags?: string[]
  surfaceForms?: string[]
  aliases?: string[]
  relatedChunkIds?: string[]
  coreExamples?: ChunkExample[]
}

export type ChunkType =
  | 'noun_phrase'
  | 'verb_phrase'
  | 'adj_phrase'
  | 'prep_phrase'
  | 'sentence_pattern'
  | 'collocation'
  | 'idiom'

export interface ChunkExample {
  text: string
  zh?: string
}

// ── Chunk Index (lightweight, for lookup) ─────────────

export interface ChunkIndexItem {
  id: string
  canonical: string
  normalizedCanonical: string
  meaningZh: string
  type: ChunkType
  level?: string
  tags?: string[]
  surfaceForms?: string[]
  aliases?: string[]
  url: string
}

// ── ArticleChunkOccurrence ────────────────────────────

export interface ArticleChunkOccurrence {
  articleId: string
  chunkId: string
  paragraphId: string
  order: number
  surface: string
  sentence?: string
  sentenceZh?: string
  startOffset?: number
  endOffset?: number
  localMeaningZh?: string
  matchType: MatchType
  confidence?: number
  importance?: 1 | 2 | 3 | 4 | 5
}

export type MatchType =
  | 'exact'
  | 'surface_form'
  | 'alias'
  | 'lemma_fallback'
  | 'manual'

export interface ArticleChunks {
  articleId: string
  occurrences: ArticleChunkOccurrence[]
}

// ── Search Index ──────────────────────────────────────

export interface SearchIndexItem {
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

// ── User Progress ─────────────────────────────────────

export interface UserProgress {
  chunkId: string
  status: 'new' | 'learning' | 'reviewing' | 'known'
  correctCount: number
  wrongCount: number
  lastReviewAt?: string
  nextReviewAt?: string
}

// ── Dictionary Lookup ─────────────────────────────────

export interface LookupInput {
  text: string
  articleId?: string
  paragraphId?: string
}

export interface LookupResult {
  found: boolean
  source: 'article_occurrence' | 'global_chunk' | 'external'
  chunk?: Chunk
  occurrence?: ArticleChunkOccurrence
  externalUrl?: string
}

export interface DictionaryProvider {
  name: string
  lookup(input: LookupInput): Promise<LookupResult | null>
}
