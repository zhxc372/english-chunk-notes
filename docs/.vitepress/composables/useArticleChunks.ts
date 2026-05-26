/**
 * useArticleChunks.ts — v0.3 Article-Chunk 关联数据加载
 */

import type { ArticleChunks, ArticleChunkOccurrence, Chunk, ChunkIndexItem } from '../../../types/content'
import { getChunkIndexItem } from './useChunks'

// 动态加载 article-chunks
const acModules = import.meta.glob<{ default: ArticleChunks }>(
  '../../../../data/article-chunks/**/*.json'
)

/** 按articleId动态加载occurrences */
export async function loadArticleChunks(articleId: string): Promise<ArticleChunkOccurrence[]> {
  for (const path of Object.keys(acModules)) {
    if (path.includes(`/${articleId}.json`)) {
      const mod = await acModules[path]()
      return mod.default.occurrences
    }
  }
  return []
}

/** 获取某篇文章关联的所有chunk索引项 */
export async function loadArticleChunkItems(articleId: string): Promise<(ArticleChunkOccurrence & { chunk?: ChunkIndexItem })[]> {
  const occurrences = await loadArticleChunks(articleId)
  return occurrences.map(occ => ({
    ...occ,
    chunk: getChunkIndexItem(occ.chunkId)
  }))
}
