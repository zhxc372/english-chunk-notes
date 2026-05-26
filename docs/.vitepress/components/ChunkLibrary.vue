<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">📚 全局词块库 <span class="text-base font-normal text-gray-400">({{ chunks.length }})</span></h2>

    <!-- Search -->
    <div class="mb-4">
      <input v-model="query" type="text" placeholder="搜索词块或中文含义..." class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-shadow" />
    </div>

    <!-- Filter -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="t in types"
        :key="t"
        :class="['px-3 py-1 rounded-full text-xs font-medium border transition-colors', activeType === t ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-600 hover:border-blue-300']"
        @click="activeType = activeType === t ? '' : t"
      >
        {{ t.replace('_', ' ') }}
      </button>
    </div>

    <!-- Grid -->
    <div v-if="filteredChunks.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="chunk in filteredChunks"
        :key="chunk.id"
        class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all"
        @click="selectedChunk = chunk"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-semibold text-gray-800 dark:text-gray-100 mb-1">{{ chunk.canonical }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ chunk.meaningZh }}</div>
            <div class="flex gap-1.5">
              <span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 text-xs capitalize">{{ chunk.type.replace('_', ' ') }}</span>
              <span v-if="chunk.level" class="px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-500 text-xs">{{ chunk.level }}</span>
            </div>
          </div>
          <div class="flex gap-1 flex-shrink-0" @click.stop>
            <button class="w-7 h-7 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" :class="isFav(chunk.id) ? 'text-yellow-500' : 'text-gray-300'" @click="toggleFav(chunk.id)" :title="isFav(chunk.id) ? '取消收藏' : '收藏'">⭐</button>
            <button class="w-7 h-7 rounded-lg text-sm text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" @click="addToFlashcards(chunk)" title="加入闪卡">🃏</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-16 text-gray-400">没有匹配的词块</div>

    <!-- Detail Modal -->
    <ChunkDetail v-if="selectedChunk" :chunk="selectedChunk" @close="selectedChunk = null" />

    <!-- Flashcard trigger -->
    <div v-if="flashcardDeck.length" class="fixed bottom-4 right-4 z-40">
      <button class="px-5 py-3 rounded-xl bg-blue-500 text-white font-medium shadow-lg hover:bg-blue-600 transition-colors" @click="showFlashcards = true">
        🃏 闪卡 ({{ flashcardDeck.length }})
      </button>
    </div>

    <!-- Flashcard overlay -->
    <div v-if="showFlashcards" class="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto p-4 pt-8">
      <FlashcardTrainer :chunks="flashcardDeck" initial-mode="en2cn" @exit="showFlashcards = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getChunkIndex } from '../composables/useChunks'
import { toggleFavorite, isFavorite } from '../composables/userState'
import ChunkDetail from './ChunkDetail.vue'
import FlashcardTrainer from './FlashcardTrainer.vue'
import type { Card } from './FlashcardTrainer.vue'
import type { ChunkIndexItem } from '../../../types/content'

const chunks = getChunkIndex()
const query = ref('')
const activeType = ref('')
const selectedChunk = ref<ChunkIndexItem | null>(null)
const flashcardDeck = ref<Card[]>([])
const showFlashcards = ref(false)

function isFav(id: string) { return isFavorite(id) }
function toggleFav(id: string) { toggleFavorite(id) }
function addToFlashcards(chunk: ChunkIndexItem) {
  if (!flashcardDeck.value.some(c => c.id === chunk.id)) {
    flashcardDeck.value.push({
      id: chunk.id,
      chunk: chunk.canonical,
      meaning: chunk.meaningZh,
      example: chunk.coreExamples?.[0]?.text || '',
      tags: chunk.tags
    })
  }
}

const types = computed(() => {
  const s = new Set(chunks.map(c => c.type))
  return Array.from(s).sort()
})

const filteredChunks = computed(() => {
  let result = chunks as ChunkIndexItem[]
  if (query.value) {
    const q = query.value.toLowerCase()
    result = result.filter(c =>
      c.canonical.toLowerCase().includes(q) ||
      c.meaningZh.includes(q) ||
      c.surfaceForms?.some(s => s.toLowerCase().includes(q)) ||
      c.aliases?.some(a => a.toLowerCase().includes(q))
    )
  }
  if (activeType.value) {
    result = result.filter(c => c.type === activeType.value)
  }
  return result
})
</script>
