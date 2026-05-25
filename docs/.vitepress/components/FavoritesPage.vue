<template>
  <!-- 收藏页面组件 -->
  <div>
    <div class="favorites-header">
      <h2>❤️ 我的收藏</h2>
      <div class="favorites-actions" v-if="favoriteChunks.length">
        <span class="fav-count">{{ favoriteChunks.length }} 个词块</span>
        <button class="ecn-btn ecn-btn-sm" @click="handleExport('anki')">📥 Anki CSV</button>
        <button class="ecn-btn ecn-btn-sm" @click="handleExport('csv')">📊 纯 CSV</button>
        <button class="ecn-btn ecn-btn-sm" @click="handleExport('json')">📁 JSON</button>
        <button class="ecn-btn ecn-btn-sm ecn-btn-danger" @click="handleClear">🗑️ 清空</button>
      </div>
    </div>

    <div v-if="favoriteChunks.length">
      <ChunkCard
        v-for="item in favoriteChunks"
        :key="item.chunk.id"
        :chunk="item.chunk"
        :lessonId="item.lesson.lesson_id"
      />
    </div>

    <div v-else class="ecn-empty">
      <div class="ecn-empty-icon">💔</div>
      <p>还没有收藏任何词块</p>
      <p style="font-size: 0.85rem; margin-top: 8px;">在主题页面中点击 ❤️ 收藏词块</p>
      <a href="/themes/" class="ecn-btn ecn-btn-primary" style="margin-top: 16px;">去浏览主题</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getFavorites } from '../data/types'
import { getChunkById } from '../data/loader'
import type { Chunk, Lesson } from '../data/types'
import ChunkCard from './ChunkCard.vue'

interface FavChunk {
  chunk: Chunk
  lesson: Lesson
}

const favoriteChunks = ref<FavChunk[]>([])

function loadFavorites() {
  const store = getFavorites()
  const chunks: FavChunk[] = []
  for (const item of store.items) {
    const result = getChunkById(item.id)
    if (result) {
      chunks.push(result)
    }
  }
  favoriteChunks.value = chunks
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

function handleExport(format: 'anki' | 'csv' | 'json'): void {
  const items = favoriteChunks.value
  if (items.length === 0) return

  if (format === 'json') {
    const data = items.map(item => ({
      id: item.chunk.id,
      chunk: item.chunk.chunk,
      meaning_cn: item.chunk.meaning_cn,
      collocations: item.chunk.collocations,
      sentence: item.chunk.sentence,
      sentence_cn: item.chunk.sentence_cn,
      exam_sentence: item.chunk.exam_sentence,
      tags: item.chunk.tags,
      exam_tags: item.chunk.exam_tags,
      source: item.lesson.title
    }))
    downloadBlob(JSON.stringify(data, null, 2), 'ecn-favorites.json', 'application/json')
  } else if (format === 'csv') {
    const header = 'chunk,meaning_cn,sentence,sentence_cn,exam_sentence,lesson'
    const rows = items.map(item => {
      const fields = [
        item.chunk.chunk,
        item.chunk.meaning_cn,
        item.chunk.sentence,
        item.chunk.sentence_cn,
        item.chunk.exam_sentence || '',
        item.lesson.title
      ]
      return fields.map(f => `"${(f || '').replace(/"/g, '""')}"`).join(',')
    })
    downloadBlob(header + '\n' + rows.join('\n'), 'ecn-favorites.csv', 'text/csv')
  } else if (format === 'anki') {
    const header = 'chunk,meaning_cn,sentence,exam_sentence,collocations'
    const rows = items.map(item => {
      const fields = [
        item.chunk.chunk,
        item.chunk.meaning_cn,
        item.chunk.sentence,
        item.chunk.exam_sentence || item.chunk.sentence,
        item.chunk.collocations.join('<br>')
      ]
      return fields.map(f => `"${(f || '').replace(/"/g, '""')}"`).join(',')
    })
    downloadBlob(header + '\n' + rows.join('\n'), 'ecn-favorites-anki.csv', 'text/csv')
  }
}

function handleClear() {
  if (confirm('确定要清空所有收藏吗？')) {
    localStorage.removeItem('ecn:favorites')
    loadFavorites()
  }
}

function onStorageChange() {
  loadFavorites()
}

onMounted(() => {
  loadFavorites()
  window.addEventListener('storage', onStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', onStorageChange)
})
</script>

<style scoped>
.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.favorites-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.favorites-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fav-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}
</style>
