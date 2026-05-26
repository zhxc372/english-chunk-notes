<template>
  <!-- Lesson 列表组件 -->
  <div>
    <ExamTagFilter
      :tags="allExamTags"
      :selectedTag="activeTag"
      @select="activeTag = $event"
    />

    <div class="ecn-grid ecn-grid-2" v-if="filteredLessons.length">
      <div
        v-for="lesson in filteredLessons"
        :key="lesson.lesson_id"
        class="ecn-card lesson-card"
        @click="goToLesson(lesson.lesson_id)"
      >
        <div class="lesson-category">
          <span class="ecn-tag ecn-tag-level">{{ lesson.level }}</span>
          <span class="ecn-tag ecn-tag-theme">{{ lesson.category }}</span>
        </div>
        <h3 class="lesson-title">{{ lesson.title }}</h3>
        <p class="lesson-title-cn">{{ lesson.title_cn }}</p>
        <p class="lesson-desc">{{ lesson.article?.text?.slice(0, 80) }}...</p>
        <div class="lesson-tags">
          <span v-for="tag in lesson.exam_tags" :key="tag" class="ecn-tag ecn-tag-exam">{{ tag }}</span>
        </div>
        <div class="lesson-meta">
          <span>📚 {{ lesson.chunks?.length || 0 }} 词块</span>
        </div>
      </div>
    </div>

    <div v-else class="ecn-empty">
      <div class="ecn-empty-icon">📭</div>
      <p>暂无匹配的主题</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vitepress'
import { withBase } from 'vitepress'
import { getAllLessons, getAllExamTags } from '../data/loader'
import ExamTagFilter from './ExamTagFilter.vue'

const router = useRouter()
const lessons = getAllLessons()
const allExamTags = getAllExamTags()
const activeTag = ref('')

const filteredLessons = computed(() => {
  if (!activeTag.value) return lessons
  return lessons.filter(l => l.exam_tags?.includes(activeTag.value))
})

function goToLesson(id: string) {
  router.go(withBase(`/themes/${id}/`))
}
</script>

<style scoped>
.lesson-card {
  cursor: pointer;
  padding: 20px;
}

.lesson-card:hover {
  transform: translateY(-2px);
}

.lesson-category {
  margin-bottom: 10px;
}

.lesson-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
}

.lesson-title-cn {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0 0 10px;
}

.lesson-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
  margin: 0 0 12px;
}

.lesson-tags {
  margin-bottom: 10px;
}

.lesson-meta {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
</style>
