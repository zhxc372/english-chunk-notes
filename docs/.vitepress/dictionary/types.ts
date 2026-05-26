/**
 * Dictionary Provider 类型定义
 */

export interface LookupInput {
  text: string
  articleId?: string
}

export interface LookupResult {
  found: boolean
  source: 'article_occurrence' | 'global_chunk' | 'external'
  chunkId?: string
  canonical?: string
  surface?: string
  meaningZh?: string
  localMeaningZh?: string
  sentence?: string
  sentenceZh?: string
  examples?: Array<{ text: string; zh?: string }>
  externalUrl?: string
}

export interface DictionaryProvider {
  name: string
  lookup(input: LookupInput): Promise<LookupResult | null>
}
