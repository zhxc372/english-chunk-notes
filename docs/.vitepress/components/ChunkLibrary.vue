<template>
  <div class="chunk-library">
    <h2>📚 全局词块库 ({{ chunks.length }})</h2>

    <!-- Search -->
    <div class="search-box">
      <input v-model="query" type="text" placeholder="搜索词块或中文含义..." class="search-input" />
    </div>

    <!-- Filter by type -->
    <div class="filter-bar">
      <button
        v-for="t in types"
        :key="t"
        :class="['filter-btn', { active: activeType === t }]"
        @click="activeType = activeType === t ? '' : t"
      >
        {{ t.replace('_', ' ') }}
      </button>
    </div>

    <!-- List -->
    <div v-if="filteredChunks.length" class="chunk-grid">
      <div
        v-for="chunk in filteredChunks"
        :key="chunk.id"
        class="ecn-card chunk-card"
        @click="selectedChunk = chunk"
      >
        <div class="chunk-canonical">{{ chunk.canonical }}</div>
        <div class="chunk-meaning">{{ chunk.meaningZh }}</div>
        <div class="chunk-tags">
          <span class="ecn-tag ecn-tag-type">{{ chunk.type.replace('_', ' ') }}</span>
          <span v-if="chunk.level" class="ecn-tag ecn-tag-level">{{ chunk.level }}</span>
        </div>
      </div>
    </div>
    <div v-else class="empty">没有匹配的词块</div>

    <!-- Detail Modal -->
    <ChunkDetail
      v-if="selectedChunk"
      :chunk="selectedChunk"
      @close="selectedChunk = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getChunkIndex, searchChunks } from '../composables/useChunks'
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

<style scoped>
.chunk-library h2 {
  margin-bottom: 16px;
}

.search-box {
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.filter-bar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filter-btn {
  padding: 3px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  cursor: pointer;
  text-transform: capitalize;
}

.filter-btn.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.chunk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
}

.chunk-card {
  cursor: pointer;
  padding: 14px;
  transition: transform 0.2s;
}

.chunk-card:hover {
  transform: translateY(-2px);
}

.chunk-canonical {
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.chunk-meaning {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.chunk-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.ecn-tag-type {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  text-transform: capitalize;
}

.empty {
  text-align: center;
  padding: 40px;
  color: var(--vp-c-text-3);
}
</style>
