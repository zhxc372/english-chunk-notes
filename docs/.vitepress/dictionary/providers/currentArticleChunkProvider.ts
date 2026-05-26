/**
 * CurrentArticleChunkProvider — 优先查当前文章的occurrence
 */
import type { DictionaryProvider, LookupInput, LookupResult } from '../types'
import type { ArticleChunkOccurrence, ChunkIndexItem } from '../../../../types/content'
import { loadArticleChunks } from '../../composables/useArticleChunks'
import { getChunkIndexItem } from '../../composables/useChunks'
import { normalize } from '../../utils/normalizeText'

// 组件级缓存，避免SPA全局残留
const cacheMap = new Map<string, ArticleChunkOccurrence[]>()

async function getOccurrences(articleId: string): Promise<ArticleChunkOccurrence[]> {
  if (cacheMap.has(articleId)) return cacheMap.get(articleId)!
  const occs = await loadArticleChunks(articleId)
  cacheMap.set(articleId, occs)
  // 只缓存最近3篇文章
  if (cacheMap.size > 3) {
    const firstKey = cacheMap.keys().next().value!
    cacheMap.delete(firstKey)
  }
  return occs
}

export const currentArticleChunkProvider: DictionaryProvider = {
  name: 'currentArticle',

  async lookup(input: LookupInput): Promise<LookupResult | null> {
    if (!input.articleId) return null
    const q = normalize(input.text)
    const occurrences = await getOccurrences(input.articleId)

    // 1. 精确匹配 surface
    const exact = occurrences.find(o => normalize(o.surface) === q)
    if (exact) return buildResult(exact)

    // 2. surface 包含
    const contains = occurrences.find(o => q.includes(normalize(o.surface)) || normalize(o.surface).includes(q))
    if (contains) return buildResult(contains)

    return null
  }
}

function buildResult(occ: ArticleChunkOccurrence): LookupResult {
  const chunk = getChunkIndexItem(occ.chunkId)
  return {
    found: true,
    source: 'article_occurrence',
    chunkId: occ.chunkId,
    canonical: chunk?.canonical,
    surface: occ.surface,
    meaningZh: chunk?.meaningZh,
    localMeaningZh: occ.localMeaningZh,
    sentence: occ.sentence,
    sentenceZh: occ.sentenceZh,
    examples: chunk?.coreExamples
  }
}
