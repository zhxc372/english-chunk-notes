/**
 * userState.ts — 用户学习状态管理
 * 统一管理 localStorage 读写，namespace 隔离
 */

const NS = 'ecn-v03-'

function getKey(key: string): string {
  return NS + key
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getKey(key))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return fallback
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value))
  } catch { /* quota exceeded, ignore */ }
}

// ── Favorites ──────────────────────────────────────────

export function getFavoriteChunkIds(): string[] {
  // 先尝试 v0.3 格式
  const v03 = read<string[]>('favoriteChunkIds', [])
  if (v03.length > 0) return v03

  // 兼容 v0.2 格式（存储在 ecn-favorites）
  try {
    const old = localStorage.getItem('ecn-favorites')
    if (old) {
      const parsed = JSON.parse(old)
      if (Array.isArray(parsed)) return parsed
    }
  } catch { /* ignore */ }

  return v03
}

export function setFavoriteChunkIds(ids: string[]): void {
  write('favoriteChunkIds', ids)
}

export function toggleFavorite(chunkId: string): boolean {
  const ids = new Set(getFavoriteChunkIds())
  if (ids.has(chunkId)) {
    ids.delete(chunkId)
  } else {
    ids.add(chunkId)
  }
  setFavoriteChunkIds(Array.from(ids))
  return ids.has(chunkId)
}

export function isFavorite(chunkId: string): boolean {
  return getFavoriteChunkIds().includes(chunkId)
}

// ── Read Articles ──────────────────────────────────────

export function getReadArticleIds(): string[] {
  return read<string[]>('readArticleIds', [])
}

export function markArticleRead(articleId: string): void {
  const ids = new Set(getReadArticleIds())
  ids.add(articleId)
  write('readArticleIds', Array.from(ids))
}

// ── Recent Articles ────────────────────────────────────

export function getRecentArticleIds(): string[] {
  return read<string[]>('recentArticleIds', [])
}

export function addRecentArticle(articleId: string): void {
  const ids = getRecentArticleIds()
  const updated = [articleId, ...ids.filter(id => id !== articleId)].slice(0, 20)
  write('recentArticleIds', updated)
}

// ── Flashcard State ────────────────────────────────────

export interface FlashcardState {
  chunkId: string
  status: 'new' | 'learning' | 'reviewing' | 'known'
  correctCount: number
  wrongCount: number
  lastReviewAt?: string
  nextReviewAt?: string
}

export function getFlashcardStates(): FlashcardState[] {
  return read<FlashcardState[]>('flashcardStates', [])
}

export function updateFlashcardState(state: FlashcardState): void {
  const states = getFlashcardStates()
  const idx = states.findIndex(s => s.chunkId === state.chunkId)
  if (idx >= 0) {
    states[idx] = state
  } else {
    states.push(state)
  }
  write('flashcardStates', states)
}

export function getDueChunks(): string[] {
  const now = new Date().toISOString()
  return getFlashcardStates()
    .filter(s => s.nextReviewAt && s.nextReviewAt <= now)
    .map(s => s.chunkId)
}

// ── Stats ──────────────────────────────────────────────

export function getStats() {
  const favorites = getFavoriteChunkIds().length
  const readArticles = getReadArticleIds().length
  const flashcards = getFlashcardStates().length
  const known = getFlashcardStates().filter(s => s.status === 'known').length
  return { favorites, readArticles, flashcards, known }
}
