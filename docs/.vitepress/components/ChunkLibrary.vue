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
        <div class="font-semibold text-gray-800 dark:text-gray-100 mb-1">{{ chunk.canonical }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ chunk.meaningZh }}</div>
        <div class="flex gap-1.5">
          <span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 text-xs capitalize">{{ chunk.type.replace('_', ' ') }}</span>
          <span v-if="chunk.level" class="px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-500 text-xs">{{ chunk.level }}</span>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-16 text-gray-400">没有匹配的词块</div>

    <!-- Detail Modal -->
    <ChunkDetail v-if="selectedChunk" :chunk="selectedChunk" @close="selectedChunk = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getChunkIndex } from '../composables/useChunks'
import ChunkDetail from './ChunkDetail.vue'
import type { ChunkIndexItem } from '../../../types/content'

const chunks = getChunkIndex()
const query = ref('')
const activeType = ref('')
const selectedChunk = ref<ChunkIndexItem | null>(null)

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
