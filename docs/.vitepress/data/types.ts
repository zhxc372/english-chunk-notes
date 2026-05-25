// Lesson / Chunk 数据类型定义

export interface Lesson {
  lesson_id: string
  title: string
  title_cn: string
  category: string
  level: string
  theme_tags?: string[]
  exam_tags?: string[]
  article: {
    text: string
    text_cn: string
    audio: string
  }
  model_paragraph?: {
    text: string
    text_cn: string
  }
  chunks?: Chunk[]
}

export interface Chunk {
  id: string
  chunk: string
  meaning_cn: string
  plain_explanation_cn?: string
  collocations: string[]
  sentence: string
  sentence_cn: string
  technical_sentence?: string
  exam_sentence?: string
  audio?: string
  rewrite_prompt_cn: string
  retelling_prompt: string
  tags: string[]
  exam_tags: string[]
}

// 收藏数据
export interface FavoriteItem {
  id: string
  type: string
  source_lesson_id: string
  created_at: string
}

export interface FavoriteStore {
  version: number
  items: FavoriteItem[]
}

// 复习状态
export interface ReviewState {
  seen: number
  known: number
  unknown: number
  last_seen_at: string
}

export interface ReviewStore {
  version: number
  items: Record<string, ReviewState>
}

// 收藏操作
const FAVORITES_KEY = 'ecn:favorites'
const REVIEW_STATE_KEY = 'ecn:reviewState'

// 缓存避免反复 JSON.parse
let _favCache: FavoriteStore | null = null
let _favCacheRaw: string | null = null

function _getFavoritesRaw(): FavoriteStore {
  const raw = localStorage.getItem(FAVORITES_KEY)
  if (raw === _favCacheRaw && _favCache) return _favCache
  _favCacheRaw = raw
  if (!raw) return (_favCache = { version: 1, items: [] })
  try {
    const data = JSON.parse(raw)
    _favCache = data.version ? data : { version: 1, items: data.items || [] }
  } catch {
    _favCache = { version: 1, items: [] }
  }
  return _favCache
}

function _invalidateFavCache() {
  _favCache = null
  _favCacheRaw = null
}

export function getFavorites(): FavoriteStore {
  return _getFavoritesRaw()
}

export function addFavorite(id: string, sourceLessonId: string): void {
  const store = _getFavoritesRaw()
  if (store.items.some(item => item.id === id)) return
  store.items.push({
    id,
    type: 'chunk',
    source_lesson_id: sourceLessonId,
    created_at: new Date().toISOString()
  })
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(store))
  _invalidateFavCache()
}

export function removeFavorite(id: string): void {
  const store = _getFavoritesRaw()
  store.items = store.items.filter(item => item.id !== id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(store))
  _invalidateFavCache()
}

export function isFavorite(id: string): boolean {
  return _getFavoritesRaw().items.some(item => item.id === id)
}

export function exportFavorites(): string {
  return JSON.stringify(_getFavoritesRaw(), null, 2)
}

export function getReviewState(): ReviewStore {
  try {
    const raw = localStorage.getItem(REVIEW_STATE_KEY)
    if (!raw) return { version: 1, items: {} }
    return JSON.parse(raw)
  } catch {
    return { version: 1, items: {} }
  }
}

export function updateReviewState(id: string, known: boolean): void {
 const store = getReviewState()
  if (!store.items[id]) {
    store.items[id] = { seen: 0, known: 0, unknown: 0, last_seen_at: '' }
  }
  store.items[id].seen++
  if (known) {
    store.items[id].known++
  } else {
    store.items[id].unknown++
  }
  store.items[id].last_seen_at = new Date().toISOString()
  localStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(store))
}
