<template>
  <div class="lesson-grid">
    <div
      v-for="lesson in lessons"
      :key="lesson.lesson_id"
      class="ecn-card lesson-card"
      @click="goTo(lesson.lesson_id)"
    >
      <div class="card-title">{{ lesson.title }}</div>
      <div class="card-title-cn">{{ lesson.title_cn }}</div>
      <div class="card-badges">
        <span class="ecn-tag ecn-tag-level">{{ lesson.level }}</span>
        <span v-for="tag in (lesson.exam_tags || []).slice(0, 2)" :key="tag" class="ecn-tag ecn-tag-exam">{{ tag }}</span>
        <span v-if="lesson.chunks" class="chunk-count">{{ lesson.chunks.length }} 词块</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'
import type { Lesson } from '../data/types'

defineProps<{ lessons: Lesson[] }>()

function goTo(lessonId: string) {
  window.location.href = withBase(`/themes/${lessonId}/`)
}
</script>

<style scoped>
.lesson-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .lesson-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
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
  margin: 2px 0 8px;
}

.card-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.chunk-count {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  margin-left: auto;
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

.ecn-tag-exam {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
}
</style>
