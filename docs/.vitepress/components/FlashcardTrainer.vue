<template>
  <!-- 闪卡训练组件 -->
  <div class="flashcard-app">
    <!-- 模式选择 -->
    <div v-if="!started || favorites.length === 0">
      <h2>🃏 闪卡训练</h2>
      <div v-if="favorites.length === 0" class="ecn-empty">
        <div class="ecn-empty-icon">📭</div>
        <p>没有收藏的词块</p>
        <p style="font-size: 0.85rem; margin-top: 8px;">先去主题页面收藏词块，再来训练</p>
        <a href="/themes/" class="ecn-btn ecn-btn-primary" style="margin-top: 16px;">去浏览主题</a>
      </div>

      <div v-else>
        <p style="color: var(--vp-c-text-2); margin-bottom: 16px;">
          共 {{ favorites.length }} 个收藏词块，选择训练模式开始：
        </p>
        <div class="mode-cards">
          <button class="ecn-card mode-card" @click="startMode('en2cn')">
            <div class="mode-icon">🔤</div>
            <h3>英译中</h3>
            <p>看英文词块，回忆中文含义</p>
          </button>
          <button class="ecn-card mode-card" @click="startMode('cn2en')">
            <div class="mode-icon">🔤</div>
            <h3>中译英</h3>
            <p>看中文含义，回忆英文词块</p>
          </button>
          <button class="ecn-card mode-card" @click="startMode('fill')">
            <div class="mode-icon">✏️</div>
            <h3>句子填空</h3>
            <p>补全例句中的词块</p>
          </button>
          <button class="ecn-card mode-card" @click="startMode('dictation')">
            <div class="mode-icon">🎧</div>
            <h3>音频听写</h3>
            <p>听音频，写出完整句子</p>
          </button>
        </div>
      </div>
    </div>

    <!-- 训练进行中 -->
    <div v-else>
      <!-- 顶部控制栏 -->
      <div class="train-header">
        <button class="ecn-btn ecn-btn-sm" @click="started = false">← 返回</button>
        <span class="mode-label">{{ modeLabel }}</span>
        <span class="progress-text">{{ currentIndex + 1 }} / {{ cards.length }}</span>
      </div>

      <!-- 进度条 -->
      <div class="ecn-progress">
        <div class="ecn-progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <!-- 闪卡 -->
      <div v-if="currentCard" class="flashcard-container">
        <!-- 英译中模式 -->
        <template v-if="mode === 'en2cn'">
          <div class="ecn-flashcard" @click="showAnswer = !showAnswer">
            <div class="ecn-flashcard-inner" :class="{ flipped: showAnswer }">
              <div class="ecn-flashcard-front">
                <div class="flash-label">英文词块</div>
                <div class="flash-main">{{ currentCard.chunk.chunk }}</div>
              </div>
              <div class="ecn-flashcard-back">
                <div class="flash-label">中文含义</div>
                <div class="flash-main">{{ currentCard.chunk.meaning_cn }}</div>
                <div class="flash-sub">{{ currentCard.chunk.sentence }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- 中译英模式 -->
        <template v-if="mode === 'cn2en'">
          <div class="ecn-flashcard" @click="showAnswer = !showAnswer">
            <div class="ecn-flashcard-inner" :class="{ flipped: showAnswer }">
              <div class="ecn-flashcard-front">
                <div class="flash-label">中文含义</div>
                <div class="flash-main">{{ currentCard.chunk.meaning_cn }}</div>
              </div>
              <div class="ecn-flashcard-back">
                <div class="flash-label">英文词块</div>
                <div class="flash-main">{{ currentCard.chunk.chunk }}</div>
                <div class="flash-sub" v-for="col in currentCard.chunk.collocations" :key="col">
                  {{ col }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 填空模式 -->
        <template v-if="mode === 'fill'">
          <div class="ecn-card fill-card">
            <div class="flash-label">句子填空</div>
            <p class="fill-sentence">
              <template v-for="(part, i) in fillParts" :key="i">
                <span>{{ part.text }}</span>
                <span
                  v-if="part.isBlank"
                  class="ecn-blank"
                  :class="{ revealed: showAnswer }"
                >{{ currentCard.chunk.chunk }}</span>
              </template>
            </p>
            <div class="fill-sentence-cn">{{ currentCard.chunk.sentence_cn }}</div>
          </div>
        </template>

        <!-- 听写模式 -->
        <template v-if="mode === 'dictation'">
          <div class="ecn-card dictation-card">
            <div class="flash-label">音频听写</div>
            <AudioPlayer v-if="currentCard.chunk.audio" :audioSrc="currentCard.chunk.audio" />
            <p v-else style="color: var(--vp-c-text-3); margin: 10px 0;">🔇 音频待生成</p>
            <div class="dictation-input-area" v-if="!showAnswer">
              <textarea
                v-model="userInput"
                class="dictation-textarea"
                placeholder="听音频后输入你听到的句子..."
                rows="3"
                @keydown.enter.ctrl="showAnswer = true"
              ></textarea>
              <p class="dictation-hint">Ctrl+Enter 显示答案</p>
            </div>
            <div v-if="showAnswer" class="dictation-result">
              <div class="dictation-correct">{{ currentCard.chunk.sentence }}</div>
              <div class="dictation-user">你的输入：{{ userInput || '(未输入)' }}</div>
              <div class="dictation-compare" :class="similarityClass">
                相似度：{{ similarityScore }}%
              </div>
            </div>
          </div>
        </template>

        <!-- 答题控制 -->
        <div v-if="showAnswer" class="answer-controls">
          <button class="ecn-btn ecn-btn-danger" @click="mark(false)">😞 不熟</button>
          <button class="ecn-btn ecn-btn-primary" @click="mark(true)">👍 记住了</button>
        </div>
        <div v-else class="show-answer-hint">
          <button class="ecn-btn ecn-btn-primary" @click="showAnswer = true">
            {{ mode === 'fill' ? '显示答案' : mode === 'dictation' ? '检查答案' : '翻转卡片' }}
          </button>
        </div>
      </div>

      <!-- 完成页 -->
      <div v-if="!currentCard && finished" class="ecn-card finish-card">
        <div class="finish-icon">🎉</div>
        <h3>训练完成！</h3>
        <div class="finish-stats">
          <div class="stat">
            <span class="stat-num known">{{ knownCount }}</span>
            <span class="stat-label">记住</span>
          </div>
          <div class="stat">
            <span class="stat-num unknown">{{ unknownCount }}</span>
            <span class="stat-label">不熟</span>
          </div>
        </div>
        <button class="ecn-btn ecn-btn-primary" @click="restart">再来一轮</button>
        <button class="ecn-btn" @click="started = false">返回选择</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getFavorites } from '../data/types'
import { getChunkById } from '../data/loader'
import { updateReviewState } from '../data/types'
import type { Chunk, Lesson } from '../data/types'
import AudioPlayer from './AudioPlayer.vue'

type TrainMode = 'en2cn' | 'cn2en' | 'fill' | 'dictation'

interface Card {
  chunk: Chunk
  lesson: Lesson
}

const favorites = ref<Card[]>([])
const mode = ref<TrainMode>('en2cn')
const started = ref(false)
const currentIndex = ref(0)
const showAnswer = ref(false)
const knownCount = ref(0)
const unknownCount = ref(0)
const finished = ref(false)
const userInput = ref('')

const modeLabels: Record<TrainMode, string> = {
  en2cn: '英译中',
  cn2en: '中译英',
  fill: '句子填空',
  dictation: '音频听写'
}

const modeLabel = computed(() => modeLabels[mode.value])

const cards = computed(() => favorites.value)
const currentCard = computed(() => cards.value[currentIndex.value] || null)

const progressPercent = computed(() => {
  if (cards.value.length === 0) return 0
  return ((currentIndex.value + 1) / cards.value.length) * 100
})

// 填空模式：将例句中的词块替换为空
const fillParts = computed(() => {
  if (!currentCard.value) return []
  const sentence = currentCard.value.chunk.sentence
  const chunk = currentCard.value.chunk.chunk
  const escaped = chunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts: { text: string; isBlank: boolean }[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: sentence.slice(lastIndex, match.index), isBlank: false })
    }
    parts.push({ text: match[1], isBlank: true })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < sentence.length) {
    parts.push({ text: sentence.slice(lastIndex), isBlank: false })
  }
  return parts.length > 1 ? parts : [{ text: sentence, isBlank: false }]
})

function loadFavorites() {
  const store = getFavorites()
  const cards_: Card[] = []
  for (const item of store.items) {
    const result = getChunkById(item.id)
    if (result) {
      cards_.push(result)
    }
  }
  favorites.value = cards_
}

function startMode(m: TrainMode) {
  mode.value = m
  currentIndex.value = 0
  showAnswer.value = false
  knownCount.value = 0
  unknownCount.value = 0
  finished.value = false
  userInput.value = ''
  started.value = true
}

function mark(known: boolean) {
  if (!currentCard.value) return
  updateReviewState(currentCard.value.chunk.id, known)
  if (known) {
    knownCount.value++
  } else {
    unknownCount.value++
  }
  nextCard()
}

function nextCard() {
  showAnswer.value = false
  userInput.value = ''
  currentIndex.value++
  if (currentIndex.value >= cards.value.length) {
    finished.value = true
  }
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function computeSimilarity(a: string, b: string): number {
  const na = normalizeText(a)
  const nb = normalizeText(b)
  if (na === nb) return 100
  if (!na || !nb) return 0
  const wordsA = na.split(' ')
  const wordsB = nb.split(' ')
  const setA = new Set(wordsA)
  const setB = new Set(wordsB)
  let matchCount = 0
  for (const w of setA) {
    if (setB.has(w)) matchCount++
  }
  const jaccard = matchCount / (setA.size + setB.size - matchCount)
  return Math.round(jaccard * 100)
}

const similarityScore = computed(() => {
  if (!currentCard.value || !showAnswer.value) return 0
  return computeSimilarity(userInput.value, currentCard.value.chunk.sentence)
})

const similarityClass = computed(() => {
  const s = similarityScore.value
  if (s >= 80) return 'similarity-high'
  if (s >= 50) return 'similarity-medium'
  return 'similarity-low'
})

function restart() {
  startMode(mode.value)
}

onMounted(loadFavorites)
</script>

<style scoped>
.flashcard-app {
  max-width: 600px;
  margin: 0 auto;
}

.mode-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 640px) {
  .mode-cards {
    grid-template-columns: 1fr;
  }
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

.mode-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px;
}

.mode-card p {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

.train-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mode-label {
  font-weight: 600;
  font-size: 0.95rem;
}

.progress-text {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.flashcard-container {
  margin-top: 24px;
  text-align: center;
}

.flash-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.flash-main {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.flash-sub {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 4px 0;
}

.fill-card, .dictation-card {
  padding: 32px;
  text-align: center;
}

.fill-sentence {
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
  line-height: 1.8;
  margin: 16px 0;
}

.fill-sentence-cn {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-top: 12px;
}

.dictation-answer {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--vp-c-brand-soft);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.dictation-input-area {
  margin-top: 16px;
}

.dictation-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.dictation-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.dictation-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin-top: 6px;
  text-align: right;
}

.dictation-result {
  margin-top: 16px;
  text-align: left;
}

.dictation-correct {
  padding: 12px 16px;
  background: var(--vp-c-brand-soft);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.dictation-user {
  padding: 8px 16px;
  margin-top: 8px;
  background: rgba(0,0,0,0.03);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.dictation-compare {
  margin-top: 8px;
  font-weight: 600;
  font-size: 0.95rem;
}

.similarity-high { color: #16a34a; }
.similarity-medium { color: #d97706; }
.similarity-low { color: #dc2626; }

.answer-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.show-answer-hint {
  margin-top: 24px;
}

.finish-card {
  text-align: center;
  padding: 40px 24px;
}

.finish-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.finish-card h3 {
  font-size: 1.3rem;
  margin: 0 0 20px;
}

.finish-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.stat {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 2rem;
  font-weight: 700;
}

.stat-num.known {
  color: #16a34a;
}

.stat-num.unknown {
  color: #dc2626;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
</style>
