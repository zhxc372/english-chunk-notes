<template>
  <div class="deck-builder">
    <!-- 阶段 1: 选择来源 -->
    <div v-if="phase === 'select'" class="deck-select-phase">
      <h2>🃏 构建闪卡组</h2>
      <p class="deck-desc">选择词块来源，构建你的专属训练卡组</p>

      <div class="source-grid">
        <button class="ecn-card source-card" :class="{ active: config.source === 'favorites' }" @click="selectSource('favorites')">
          <div class="source-icon">❤️</div>
          <h3>我的收藏</h3>
          <p class="source-count">{{ favoritesCount }} 个词块</p>
          <p class="source-hint">收藏夹中的所有词块</p>
        </button>

        <button class="ecn-card source-card" :class="{ active: config.source === 'lesson' }" @click="selectSource('lesson')">
          <div class="source-icon">📚</div>
          <h3>按课程</h3>
          <p class="source-count">{{ lessonsCount }} 个课程</p>
          <p class="source-hint">选择一个或多个课程</p>
        </button>

        <button class="ecn-card source-card" :class="{ active: config.source === 'tag' }" @click="selectSource('tag')">
          <div class="source-icon">🏷️</div>
          <h3>按标签</h3>
          <p class="source-count">{{ allTags.length }} 个标签</p>
          <p class="source-hint">按主题/考试标签筛选</p>
        </button>

        <button class="ecn-card source-card" :class="{ active: config.source === 'weak' }" @click="selectSource('weak')">
          <div class="source-icon">🔥</div>
          <h3>错题重练</h3>
          <p class="source-count">{{ weakChunks.length }} 个错题</p>
          <p class="source-hint">记错次数超过记住的词块</p>
        </button>

        <button class="ecn-card source-card" :class="{ active: config.source === 'due' }" @click="selectSource('due')">
          <div class="source-icon">📅</div>
          <h3>到期复习</h3>
          <p class="source-count">{{ dueChunks.length }} 个待复习</p>
          <p class="source-hint">间隔重复到期的词块</p>
        </button>
      </div>
    </div>

    <!-- 阶段 2: 筛选 & 预览 -->
    <div v-if="phase === 'filter'" class="deck-filter-phase">
      <div class="filter-header">
        <button class="ecn-btn ecn-btn-sm" @click="goBack">← 返回</button>
        <span class="filter-title">{{ sourceLabel }}</span>
        <span class="filter-count">{{ filteredChunks.length }} 个词块</span>
      </div>

      <!-- 课程选择 -->
      <div v-if="config.source === 'lesson'" class="filter-section">
        <h4>选择课程</h4>
        <div class="lesson-checkboxes">
          <label v-for="lesson in lessons" :key="lesson.lesson_id" class="lesson-check">
            <input
              type="checkbox"
              :value="lesson.lesson_id"
              v-model="selectedLessonIds"
              @change="updateFiltered"
            />
            <span class="lesson-check-label">{{ lesson.title }}</span>
            <span class="lesson-check-count">{{ lesson.chunks?.length || 0 }}</span>
          </label>
        </div>
        <div class="filter-actions">
          <button class="ecn-btn ecn-btn-sm" @click="selectAllLessons">全选</button>
          <button class="ecn-btn ecn-btn-sm" @click="selectedLessonIds = []; updateFiltered()">清空</button>
        </div>
      </div>

      <!-- 标签选择 -->
      <div v-if="config.source === 'tag'" class="filter-section">
        <h4>选择标签</h4>
        <div class="tag-cloud">
          <button
            v-for="tag in allTags"
            :key="tag"
            class="ecn-btn ecn-btn-sm"
            :class="{ 'ecn-btn-active': selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
        <p v-if="selectedTags.length === 0" class="filter-hint">请至少选择一个标签</p>
      </div>

      <!-- 错题/到期/收藏 无需额外筛选，直接预览 -->
      <div v-if="config.source === 'favorites' || config.source === 'weak' || config.source === 'due'" class="filter-section">
        <div class="preview-list">
          <div v-for="item in filteredChunks.slice(0, 10)" :key="item.chunk.id" class="preview-item">
            <span class="preview-chunk">{{ item.chunk.chunk }}</span>
            <span class="preview-meaning">{{ item.chunk.meaning_cn }}</span>
          </div>
          <div v-if="filteredChunks.length > 10" class="preview-more">
            ...还有 {{ filteredChunks.length - 10 }} 个
          </div>
        </div>
      </div>

      <!-- 课程/标签的预览 -->
      <div v-if="(config.source === 'lesson' || config.source === 'tag') && filteredChunks.length > 0" class="filter-section">
        <h4>预览 (前 10 个)</h4>
        <div class="preview-list">
          <div v-for="item in filteredChunks.slice(0, 10)" :key="item.chunk.id" class="preview-item">
            <span class="preview-chunk">{{ item.chunk.chunk }}</span>
            <span class="preview-meaning">{{ item.chunk.meaning_cn }}</span>
          </div>
          <div v-if="filteredChunks.length > 10" class="preview-more">
            ...还有 {{ filteredChunks.length - 10 }} 个
          </div>
        </div>
      </div>

      <!-- 卡片数量不足提示 -->
      <div v-if="filteredChunks.length === 0" class="ecn-empty" style="padding: 40px 20px;">
        <div class="ecn-empty-icon">📭</div>
        <p>没有符合条件的词块</p>
      </div>

      <!-- 下一步 -->
      <div v-if="filteredChunks.length > 0" class="filter-next">
        <button class="ecn-btn ecn-btn-primary" @click="phase = 'mode'">
          选好模式开始训练 →
        </button>
      </div>
    </div>

    <!-- 阶段 3: 选择训练模式 -->
    <div v-if="phase === 'mode'" class="deck-mode-phase">
      <div class="filter-header">
        <button class="ecn-btn ecn-btn-sm" @click="phase = 'filter'">← 返回</button>
        <span class="filter-title">{{ sourceLabel }} · {{ filteredChunks.length }} 个词块</span>
      </div>

      <h3 style="margin-bottom: 16px;">选择训练模式</h3>
      <div class="mode-grid">
        <button class="ecn-card mode-card" @click="startTraining('en2cn')">
          <div class="mode-icon">🔤</div>
          <h4>英译中</h4>
          <p>看英文词块，回忆中文含义</p>
        </button>
        <button class="ecn-card mode-card" @click="startTraining('cn2en')">
          <div class="mode-icon">🔤</div>
          <h4>中译英</h4>
          <p>看中文含义，回忆英文词块</p>
        </button>
        <button class="ecn-card mode-card" @click="startTraining('fill')">
          <div class="mode-icon">✏️</div>
          <h4>句子填空</h4>
          <p>补全例句中的词块</p>
        </button>
        <button class="ecn-card mode-card" @click="startTraining('dictation')">
          <div class="mode-icon">🎧</div>
          <h4>音频听写</h4>
          <p>听音频，写出完整句子</p>
        </button>
      </div>

      <div class="export-section">
        <h3>或者直接导出</h3>
        <div class="export-btns">
          <button class="ecn-btn ecn-btn-sm" @click="exportDeck('json')">📁 JSON</button>
          <button class="ecn-btn ecn-btn-sm" @click="exportDeck('tsv')">📥 Anki TSV</button>
          <button class="ecn-btn ecn-btn-sm" @click="exportDeck('csv')">📊 CSV</button>
        </div>
      </div>
    </div>

    <!-- 阶段 4: 训练中 - 使用 FlashcardTrainer -->
    <div v-if="phase === 'training'">
      <FlashcardTrainer :chunks="filteredChunks" :initial-mode="trainingMode" @exit="phase = 'mode'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { getFavorites, getWeakChunks, getDueForReview } from '../data/types'
import { getAllLessons, getChunkById, getAllExamTags, getAllThemeTags } from '../data/loader'
import type { Chunk, Lesson } from '../data/types'
import FlashcardTrainer from './FlashcardTrainer.vue'

type DeckSource = 'favorites' | 'lesson' | 'tag' | 'weak' | 'due' | 'custom'
type TrainMode = 'en2cn' | 'cn2en' | 'fill' | 'dictation'

interface DeckConfig {
  id: string
  name: string
  source: DeckSource
  filters: {
    lessonId?: string
    lessonIds?: string[]
    tags?: string[]
    cardTypes?: string[]
    onlyDue?: boolean
    onlyWeak?: boolean
  }
  cardCount: number
  createdAt: string
}

interface CardItem {
  chunk: Chunk
  lesson: Lesson
}

// 状态
const phase = ref<'select' | 'filter' | 'mode' | 'training'>('select')
const config = ref<DeckConfig>({
  id: '',
  name: '',
  source: 'favorites',
  filters: {},
  cardCount: 0,
  createdAt: ''
})
const trainingMode = ref<TrainMode>('en2cn')
const selectedLessonIds = ref<string[]>([])
const selectedTags = ref<string[]>([])

// 数据
const lessons = getAllLessons()
const allTags = [...new Set([...getAllExamTags(), ...getAllThemeTags()])]

// 计算属性
const favoritesCount = computed(() => getFavorites().items.length)
const lessonsCount = computed(() => lessons.length)
const weakChunks = computed(() => {
  return getWeakChunks()
    .map(id => getChunkById(id))
    .filter((r): r is CardItem => !!r)
})
const dueChunks = computed(() => {
  return getDueForReview()
    .map(id => getChunkById(id))
    .filter((r): r is CardItem => !!r)
})

const sourceLabels: Record<DeckSource, string> = {
  favorites: '❤️ 我的收藏',
  lesson: '📚 按课程',
  tag: '🏷️ 按标签',
  weak: '🔥 错题重练',
  due: '📅 到期复习',
  custom: '🔧 自定义'
}

const sourceLabel = computed(() => sourceLabels[config.value.source])

// 根据来源和筛选条件获取词块
const filteredChunks = computed<CardItem[]>(() => {
  const source = config.value.source

  if (source === 'favorites') {
    const ids = getFavorites().items.map(i => i.id)
    return ids.map(id => getChunkById(id)).filter((r): r is CardItem => !!r)
  }

  if (source === 'weak') {
    return weakChunks.value
  }

  if (source === 'due') {
    return dueChunks.value
  }

  if (source === 'lesson') {
    if (selectedLessonIds.value.length === 0) return []
    const items: CardItem[] = []
    for (const lid of selectedLessonIds.value) {
      const lesson = lessons.find(l => l.lesson_id === lid)
      if (lesson?.chunks) {
        for (const chunk of lesson.chunks) {
          items.push({ chunk: chunk as Chunk, lesson: lesson as Lesson })
        }
      }
    }
    return items
  }

  if (source === 'tag') {
    if (selectedTags.value.length === 0) return []
    const tagSet = new Set(selectedTags.value)
    const seen = new Set<string>()
    const items: CardItem[] = []
    for (const lesson of lessons) {
      if (!lesson.chunks) continue
      for (const chunk of lesson.chunks) {
        const c = chunk as Chunk
        // 匹配 lesson 级别或 chunk 级别的标签
        const lessonTags = [...(lesson.exam_tags || []), ...(lesson.theme_tags || [])]
        const chunkTags = [...(c.exam_tags || []), ...(c.tags || [])]
        const allChunkTags = [...lessonTags, ...chunkTags]
        if (allChunkTags.some(t => tagSet.has(t)) && !seen.has(c.id)) {
          seen.add(c.id)
          items.push({ chunk: c, lesson: lesson as Lesson })
        }
      }
    }
    return items
  }

  return []
})

// 方法
function selectSource(source: DeckSource) {
  config.value.source = source
  selectedLessonIds.value = []
  selectedTags.value = []

  // 错题和到期如果没数据，提示并留在此页
  if (source === 'weak' && weakChunks.value.length === 0) return
  if (source === 'due' && dueChunks.value.length === 0) return
  if (source === 'favorites' && favoritesCount.value === 0) return

  phase.value = 'filter'
}

function goBack() {
  phase.value = 'select'
}

function updateFiltered() {
  // reactive by computed
}

function selectAllLessons() {
  selectedLessonIds.value = lessons.map(l => l.lesson_id)
  updateFiltered()
}

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

function startTraining(mode: TrainMode) {
  trainingMode.value = mode
  phase.value = 'training'
}

// 导出功能
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

function exportDeck(format: 'json' | 'tsv' | 'csv') {
  const items = filteredChunks.value
  if (items.length === 0) return

  const timestamp = new Date().toISOString().slice(0, 10)

  if (format === 'json') {
    const data = {
      schemaVersion: 'flashcards.v0.2',
      exportedAt: new Date().toISOString(),
      deck: {
        name: `ECN Deck - ${sourceLabel.value}`,
        source: config.value.source,
        cards: items.map(item => ({
          id: item.chunk.id,
          front: item.chunk.chunk,
          back: item.chunk.meaning_cn,
          example: item.chunk.sentence,
          cloze: '',
          source: item.lesson.title,
          audio: item.chunk.audio || '',
          tags: item.chunk.tags
        }))
      }
    }
    downloadBlob(JSON.stringify(data, null, 2), `ecn-deck-${timestamp}.json`, 'application/json')
  } else if (format === 'tsv') {
    const header = [
      '#separator:Tab',
      '#html:true',
      '#deck:English Chunk Notes',
      '#notetype:Basic',
      '#tags column:7',
      '#columns:Front\tBack\tExample\tCloze\tSource\tAudio\tTags'
    ].join('\n')

    const rows = items.map(item => [
      item.chunk.chunk,
      item.chunk.meaning_cn,
      item.chunk.sentence,
      '',
      item.lesson.title,
      item.chunk.audio ? `[sound:${item.chunk.audio}]` : '',
      item.chunk.tags.join(' ')
    ].join('\t'))

    downloadBlob(header + '\n' + rows.join('\n'), `ecn-deck-${timestamp}.tsv`, 'text/tab-separated-values')
  } else if (format === 'csv') {
    function escapeCSV(str: string): string {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }

    const header = 'Front,Back,Example,Source,Tags'
    const rows = items.map(item => [
      escapeCSV(item.chunk.chunk),
      escapeCSV(item.chunk.meaning_cn),
      escapeCSV(item.chunk.sentence),
      escapeCSV(item.lesson.title),
      escapeCSV(item.chunk.tags.join(' '))
    ].join(','))

    // BOM for Excel
    downloadBlob('\uFEFF' + header + '\n' + rows.join('\n'), `ecn-deck-${timestamp}.csv`, 'text/csv')
  }
}
</script>

<style scoped>
.deck-builder {
  max-width: 700px;
  margin: 0 auto;
}

.deck-select-phase {
  text-align: center;
}

.deck-select-phase h2 {
  font-size: 1.4rem;
  margin: 0 0 8px;
}

.deck-desc {
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  margin-bottom: 24px;
}

.source-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  text-align: center;
}

.source-card {
  text-align: center;
  padding: 20px 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.source-card:hover {
  transform: translateY(-2px);
}

.source-card.active {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}

.source-icon {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.source-card h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--vp-c-text-1);
}

.source-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin: 0;
}

.source-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 4px 0 0;
}

/* 筛选阶段 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-title {
  font-weight: 600;
  font-size: 1rem;
}

.filter-count {
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--vp-c-text-2);
}

/* 课程选择 */
.lesson-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px;
}

.lesson-check {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.lesson-check:hover {
  background: var(--vp-bg-soft);
}

.lesson-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--vp-c-brand-1);
}

.lesson-check-label {
  flex: 1;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.lesson-check-count {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  background: var(--vp-bg-soft);
  padding: 2px 8px;
  border-radius: 99px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* 标签云 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-hint {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-top: 12px;
}

/* 预览列表 */
.preview-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--vp-bg-alt);
  border-radius: 8px;
  font-size: 0.85rem;
}

.preview-chunk {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.preview-meaning {
  color: var(--vp-c-text-2);
  text-align: right;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-more {
  text-align: center;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  padding: 8px;
}

.filter-next {
  text-align: center;
  margin-top: 24px;
}

/* 模式选择 */
.deck-mode-phase h3 {
  font-size: 1.1rem;
  margin: 0 0 16px;
}

.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
}

.mode-card {
  text-align: center;
  padding: 20px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.mode-card:hover {
  transform: translateY(-2px);
}

.mode-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.mode-card h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 4px;
}

.mode-card p {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

/* 导出 */
.export-section {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-border);
}

.export-section h3 {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  margin-bottom: 12px;
}

.export-btns {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* 暗色主题 */
html.dark .preview-item {
  background: var(--vp-bg-soft);
}

html.dark .lesson-check:hover {
  background: var(--vp-bg-soft);
}

html.dark .lesson-check-count {
  background: var(--vp-bg);
}

/* 响应式 */
@media (max-width: 640px) {
  .source-grid {
    grid-template-columns: 1fr 1fr;
  }

  .mode-grid {
    grid-template-columns: 1fr;
  }

  .filter-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 400px) {
  .source-grid {
    grid-template-columns: 1fr;
  }
}
</style>
