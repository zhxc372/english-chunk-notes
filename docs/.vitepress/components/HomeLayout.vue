<template>
  <div class="home">
    <!-- Hero -->
    <div class="ecn-hero">
      <h1>📖 English Chunk Notes</h1>
      <p>考试英语 + 技术英语双轨主题词块学习站</p>
      <p style="font-size: 0.85rem; color: var(--vp-c-text-3); margin-top: 12px;">
        通过主题文章学习词块，用闪卡巩固记忆
      </p>
    </div>

    <!-- 词块搜索 -->
    <HomeSearch @search="onSearch" @clear="onClearSearch" />

    <!-- Tag 筛选 -->
    <TagFilterBar
      :tags="allTags"
      :active-tags="activeTags"
      @toggle="toggleTag"
      @clear="clearTags"
    />

    <!-- 搜索/筛选结果 -->
    <div v-if="searchQuery || hasActiveTags" class="search-results">
      <p v-if="filteredLessons.length" class="results-count">
        找到 {{ filteredLessons.length }} 个主题
        <span v-if="searchQuery"> — "{{ searchQuery }}"</span>
      </p>
      <div v-else class="no-results">
        <p>没有找到相关主题</p>
        <p class="no-results-hint">试试其他关键词或清除筛选条件</p>
      </div>
      <div class="results-grid">
        <div
          v-for="entry in filteredLessons"
          :key="entry.lessonId"
          class="ecn-card result-card"
          @click="goToEntry(entry.route)"
        >
          <div class="card-title">{{ entry.title }}</div>
          <div v-if="entry.titleCn" class="card-title-cn">{{ entry.titleCn }}</div>
          <div v-if="entry.summaryZh" class="card-summary">{{ entry.summaryZh.slice(0, 80) }}{{ entry.summaryZh.length > 80 ? '...' : '' }}</div>
          <div class="card-tags">
            <span class="ecn-tag ecn-tag-level">{{ entry.level }}</span>
            <span v-for="tag in (entry.topicTags || []).slice(0, 2)" :key="'t'+tag" class="ecn-tag ecn-tag-topic">{{ tag }}</span>
            <span v-for="tag in (entry.examTags || []).slice(0, 2)" :key="'e'+tag" class="ecn-tag ecn-tag-exam">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 默认首页内容（无搜索/筛选时显示） -->
    <template v-else>
      <!-- 学习进度 -->
      <div class="ecn-card progress-card">
        <div class="progress-header">
          <h3>📊 学习进度</h3>
          <span class="progress-count">{{ stats.reviewedChunks }} / {{ stats.totalChunks }} 词块</span>
        </div>
        <div class="ecn-progress">
          <div class="ecn-progress-bar" :style="{ width: stats.masteryPercent + '%' }"></div>
        </div>
        <div class="progress-stats">
          <div class="progress-stat">
            <span class="stat-dot stat-dot-green"></span>
            <span>已掌握 {{ stats.knownChunks }}</span>
          </div>
          <div class="progress-stat">
            <span class="stat-dot stat-dot-red"></span>
            <span>待加强 {{ stats.unknownChunks }}</span>
          </div>
          <div class="progress-stat">
            <span class="stat-dot stat-dot-gray"></span>
            <span>已复习 {{ stats.reviewedChunks }}</span>
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="home-shortcuts">
        <button v-if="randomLesson" class="shortcut-card ecn-card shortcut-random" @click="goToLesson(randomLesson.lesson_id)">
          <div class="shortcut-icon">🎲</div>
          <h3>随机开始</h3>
          <p>{{ randomLesson.title_cn }}</p>
        </button>
        <a :href="withBase('/themes/')" class="shortcut-card ecn-card">
          <div class="shortcut-icon">📚</div>
          <h3>主题学习</h3>
          <p>按主题阅读文章、学习词块</p>
        </a>
        <a :href="withBase('/favorites/')" class="shortcut-card ecn-card">
          <div class="shortcut-icon">❤️</div>
          <h3>我的收藏</h3>
          <p>管理已收藏的词块</p>
        </a>
        <a :href="withBase('/flashcards/')" class="shortcut-card ecn-card">
          <div class="shortcut-icon">🃏</div>
          <h3>闪卡训练</h3>
          <p>英译中、中译英、填空、听写</p>
        </a>
        <a :href="withBase('/tech-english')" class="shortcut-card ecn-card">
          <div class="shortcut-icon">💻</div>
          <h3>技术英语</h3>
          <p>AI、软件工程、系统设计</p>
        </a>
        <a :href="withBase('/general-english')" class="shortcut-card ecn-card">
          <div class="shortcut-icon">🌍</div>
          <h3>通用英语</h3>
          <p>雅思、托福常考话题</p>
        </a>
      </div>

      <!-- 推荐主题 -->
      <div v-if="dueLessons.length" class="home-section">
        <h2>🎯 建议复习</h2>
        <div class="recommend-grid">
          <div v-for="lesson in dueLessons.slice(0, 3)" :key="lesson.lesson_id"
            class="ecn-card recommend-card" @click="goToLesson(lesson.lesson_id)">
            <div class="recommend-title">{{ lesson.title }}</div>
            <div class="recommend-title-cn">{{ lesson.title_cn }}</div>
            <div class="recommend-badges">
              <span class="ecn-tag ecn-tag-level">{{ lesson.level }}</span>
              <span v-for="tag in lesson.exam_tags" :key="tag" class="ecn-tag ecn-tag-exam">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 全部主题列表 -->
      <div class="home-section">
        <h2>📚 全部主题</h2>
        <div class="results-grid">
          <div
            v-for="lesson in publishedLessons"
            :key="lesson.lesson_id"
            class="ecn-card result-card"
            @click="goToLesson(lesson.lesson_id)"
          >
            <div class="card-title">{{ lesson.title }}</div>
            <div class="card-title-cn">{{ lesson.title_cn }}</div>
            <div class="card-tags">
              <span class="ecn-tag ecn-tag-level">{{ lesson.level }}</span>
              <span v-for="tag in (lesson.exam_tags || []).slice(0, 3)" :key="tag" class="ecn-tag ecn-tag-exam">{{ tag }}</span>
              <span class="chunk-count">📚 {{ lesson.chunks?.length || 0 }} 词块</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 考试标签入口 -->
      <div class="home-section">
        <h2>📋 考试标签</h2>
        <div class="exam-tags">
          <span v-for="tag in examTags" :key="tag" class="ecn-tag ecn-tag-exam exam-tag-lg">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 学习流程 -->
      <div class="home-section">
        <h2>🔄 学习流程</h2>
        <div class="flow-steps">
          <div class="flow-step ecn-card">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>选择主题</h4>
              <p>按兴趣或推荐选择</p>
            </div>
          </div>
          <div class="flow-step ecn-card">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>阅读文章</h4>
              <p>中英对照，理解语境</p>
            </div>
          </div>
          <div class="flow-step ecn-card">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4>收藏词块</h4>
              <p>标记重要的主题词块</p>
            </div>
          </div>
          <div class="flow-step ecn-card">
            <div class="step-num">4</div>
            <div class="step-content">
              <h4>闪卡训练</h4>
              <p>多种模式巩固记忆</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { withBase, useRouter } from 'vitepress'
import { getAllExamTags, getAllLessons } from '../data/loader'
import { getProgressStats, getDueForReview } from '../data/types'
import type { Lesson } from '../data/types'
import HomeSearch from './HomeSearch.vue'
import TagFilterBar from './TagFilterBar.vue'
import searchIndex from '../data/search-index.json'

interface TagItem {
  group: string
  value: string
}

const examTags = getAllExamTags()
const stats = ref(getProgressStats())
const randomLesson = ref<Lesson | null>(null)
const dueLessons = ref<Lesson[]>([])

// Search state
const searchQuery = ref('')
const activeTags = ref<TagItem[]>([])

// All tags from search index for filter bar
const allTags = computed(() => {
  const tagMap = new Map<string, Set<string>>()
  const levelSet = new Set<string>()
  const topicSet = new Set<string>()
  const examSet = new Set<string>()
  const useCaseSet = new Set<string>()
  const sourceSet = new Set<string>()

  for (const entry of searchIndex) {
    if (entry.reviewStatus !== 'published') continue
    if (entry.level) levelSet.add(entry.level)
    entry.topicTags?.forEach(t => topicSet.add(t))
    entry.examTags?.forEach(t => examSet.add(t))
    entry.useCaseTags?.forEach(t => useCaseSet.add(t))
    if (entry.sourceName) sourceSet.add(entry.sourceName)
  }

  const items: TagItem[] = []
  levelSet.forEach(v => items.push({ group: 'level', value: v }))
  topicSet.forEach(v => items.push({ group: 'topic', value: v }))
  examSet.forEach(v => items.push({ group: 'exam', value: v }))
  useCaseSet.forEach(v => items.push({ group: 'useCase', value: v }))
  sourceSet.forEach(v => items.push({ group: 'source', value: v }))

  return items
})

// Published-only lessons
const publishedLessons = computed(() => getAllLessons())

// Search + filter logic
const filteredLessons = computed(() => {
  let results = searchIndex.filter(e => e.reviewStatus === 'published')

  // Apply search query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    results = results.filter(entry => {
      return (
        (entry.title && entry.title.toLowerCase().includes(q)) ||
        (entry.titleCn && entry.titleCn.includes(q)) ||
        (entry.summaryZh && entry.summaryZh.includes(q)) ||
        (entry.topicTags && entry.topicTags.some(t => t.toLowerCase().includes(q))) ||
        (entry.examTags && entry.examTags.some(t => t.toLowerCase().includes(q))) ||
        (entry.chunkTexts && entry.chunkTexts.some(c => c.toLowerCase().includes(q))) ||
        (entry.chunkMeaningZhs && entry.chunkMeaningZhs.some(m => m.includes(q)))
      )
    })
  }

  // Apply tag filters: same group OR, different groups AND
  if (activeTags.value.length > 0) {
    const groups = new Map<string, Set<string>>()
    for (const tag of activeTags.value) {
      if (!groups.has(tag.group)) groups.set(tag.group, new Set())
      groups.get(tag.group)!.add(tag.value.toLowerCase())
    }

    results = results.filter(entry => {
      for (const [, values] of groups) {
        // Same group: OR
        const match = values.has(entry.level?.toLowerCase() || '') ||
          entry.topicTags?.some(t => values.has(t.toLowerCase())) ||
          entry.examTags?.some(t => values.has(t.toLowerCase())) ||
          entry.useCaseTags?.some(t => values.has(t.toLowerCase())) ||
          values.has((entry.sourceName || '').toLowerCase())
        if (!match) return false
      }
      return true // All groups matched (AND)
    })
  }

  return results
})

const hasActiveTags = computed(() => activeTags.value.length > 0)

function onSearch(query: string) {
  searchQuery.value = query
}

function onClearSearch() {
  searchQuery.value = ''
}

function toggleTag(tag: TagItem) {
  const idx = activeTags.value.findIndex(t => t.group === tag.group && t.value === tag.value)
  if (idx >= 0) {
    activeTags.value.splice(idx, 1)
  } else {
    activeTags.value.push({ ...tag })
  }
}

function clearTags() {
  activeTags.value = []
}

const router = useRouter()

function goToEntry(route: string): void {
  router.go(withBase(route))
}

function goToLesson(lessonId: string): void {
  router.go(withBase(`/themes/${lessonId}/`))
}

onMounted(() => {
  const lessons = getAllLessons()
  if (lessons.length) {
    randomLesson.value = lessons[Math.floor(Math.random() * lessons.length)]
  }
  const dueChunkIds = new Set(getDueForReview())
  if (dueChunkIds.size > 0) {
    dueLessons.value = lessons.filter(l =>
      l.chunks?.some(c => dueChunkIds.has(c.id))
    ).slice(0, 3)
  }
})
</script>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

/* 进度卡片 */
.progress-card {
  padding: 20px 24px;
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-header h3 {
  margin: 0;
  font-size: 1rem;
}

.progress-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.progress-stats {
  display: flex;
  gap: 20px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.progress-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-dot-green { background: #16a34a; }
.stat-dot-red { background: #dc2626; }
.stat-dot-gray { background: #9ca3af; }

/* 快捷入口 */
.home-shortcuts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 48px;
}

@media (max-width: 768px) {
  .home-shortcuts {
    grid-template-columns: repeat(2, 1fr);
  }
}

.shortcut-card {
  text-align: center;
  padding: 20px 12px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.shortcut-card:hover {
  transform: translateY(-2px);
}

.shortcut-random {
  border: 2px solid var(--vp-c-brand);
  background: var(--vp-c-brand-soft);
}

.shortcut-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.shortcut-card h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 4px;
}

.shortcut-card p {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

/* 推荐复习 */
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .recommend-grid {
    grid-template-columns: 1fr;
  }
}

.recommend-card {
  cursor: pointer;
  padding: 16px;
  transition: all 0.2s;
}

.recommend-card:hover {
  transform: translateY(-2px);
}

.recommend-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.recommend-title-cn {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin: 2px 0 8px;
}

.recommend-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* Sections */
.home-section {
  margin-bottom: 48px;
}

.home-section h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--vp-c-brand-soft);
}

.exam-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.exam-tag-lg {
  font-size: 0.85rem;
  padding: 6px 16px;
  cursor: default;
}

/* Flow steps */
.flow-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .flow-steps {
    grid-template-columns: 1fr;
  }
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.step-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.step-content h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 2px;
}

.step-content p {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
</style>
