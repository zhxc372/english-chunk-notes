<template>
  <div>
    <div v-if="results.length" class="search-results">
      <p class="results-count">
        找到 {{ results.length }} 个主题
        <span v-if="query"> - "{{ query }}"</span>
      </p>
      <div class="lesson-grid">
        <div
          v-for="entry in results"
          :key="entry.lessonId"
          class="ecn-card lesson-card"
          @click="goTo(entry.route)"
        >
          <div class="card-title">{{ entry.title }}</div>
          <div v-if="entry.titleCn" class="card-title-cn">{{ entry.titleCn }}</div>
          <div v-if="entry.summaryZh" class="card-summary">{{ entry.summaryZh.slice(0, 80) }}...</div>
          <div class="card-badges">
            <span class="ecn-tag ecn-tag-level">{{ entry.level }}</span>
            <span v-for="tag in (entry.topicTags || []).slice(0, 2)" :key="'t'+tag" class="ecn-tag ecn-tag-topic">{{ tag }}</span>
            <span v-for="tag in (entry.examTags || []).slice(0, 2)" :key="'e'+tag" class="ecn-tag ecn-tag-exam">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-results">
      <p>没有找到相关主题</p>
      <p class="no-results-hint">试试其他关键词或清除筛选条件</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  results: Array<{
    lessonId: string
    title: string
    titleCn?: string
    summaryZh: string
    level: string
    topicTags?: string[]
    examTags?: string[]
    route: string
  }>
  query: string
}>()

function goTo(route: string) {
  window.location.href = withBase(route)
}
</script>

<style scoped>
.results-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-bottom: 12px;
}

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .lesson-grid {
    grid-template-columns: 1fr;
  }
}

.lesson-card {
  cursor: pointer;
  padding: 16px;
  transition: all 0.2s;
}

.lesson-card:hover {
  transform: translateY(-2px);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.card-title-cn {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin: 2px 0 6px;
}

.card-summary {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin-bottom: 8px;
}

.card-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: var(--vp-c-text-3);
}

.no-results-hint {
  font-size: 0.85rem;
  margin-top: 4px;
}

.ecn-tag {
  display: inline-block;
  padding: 1px 8px;
  font-size: 0.7rem;
  border-radius: 10px;
  font-weight: 500;
}

.ecn-tag-level {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
}

.ecn-tag-topic {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.ecn-tag-exam {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
}
</style>
