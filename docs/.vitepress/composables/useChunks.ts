/**
 * useChunks.ts — v0.3 Chunk 数据加载
 * 支持按chunkId获取、按normalized lookup查询
 */

import type { Chunk, ChunkIndexItem } from '../../../../types/content'

// 静态导入 chunk-index（全局词块索引）
import chunkIndexData from '../../../data/chunks/chunk-index.json'

const chunkIndex = chunkIndexData as ChunkIndexItem[]

/** 获取所有chunk索引 */
export function getChunkIndex(): ChunkIndexItem[] {
  return chunkIndex
}

/** 按chunkId获取索引项 */
export function getChunkIndexItem(chunkId: string): ChunkIndexItem | undefined {
  return chunkIndex.find(c => c.id === chunkId)
}

/** 按canonical精确查找 */
export function findChunkByCanonical(canonical: string): ChunkIndexItem | undefined {
  const lower = canonical.toLowerCase()
  return chunkIndex.find(c => c.canonical.toLowerCase() === lower)
}

/** 按normalizedCanonical查找（忽略冠词和空格差异） */
export function findChunkByNormalized(normalized: string): ChunkIndexItem[] {
  const lower = normalized.toLowerCase().replace(/\s+/g, ' ').trim()
  return chunkIndex.filter(c => c.normalizedCanonical === lower)
}

/** 搜索chunk（模糊匹配 canonical/meaningZh/surfaceForms/aliases） */
export function searchChunks(query: string): ChunkIndexItem[] {
  const q = query.toLowerCase()
  return chunkIndex.filter(c =>
    c.canonical.toLowerCase().includes(q) ||
    c.meaningZh.includes(q) ||
    c.surfaceForms?.some(s => s.toLowerCase().includes(q)) ||
    c.aliases?.some(a => a.toLowerCase().includes(q))
  )
}

/** 按tag筛选 */
export function getChunksByTag(tag: string): ChunkIndexItem[] {
  return chunkIndex.filter(c => c.tags?.includes(tag))
}

// 动态加载完整chunk数据（从shards）
const chunkModules = import.meta.glob<{ default: Chunk }>(
  '../../../data/chunks/shards/*.json'
)

export async function loadChunk(chunkId: string): Promise<Chunk | null> {
  // For now, chunks are in chunk-index.json which has all fields
  // Shard loading can be added later when data grows
  const item = getChunkIndexItem(chunkId)
  if (item) return item as unknown as Chunk
  return null
}
