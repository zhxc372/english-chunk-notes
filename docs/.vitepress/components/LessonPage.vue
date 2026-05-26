<template>
  <!-- 单个主题页面组件 -->
  <div class="lesson-page" v-if="lesson">
    <!-- 头部 -->
    <div class="lesson-header">
      <div class="lesson-badges">
        <span class="ecn-tag ecn-tag-level">{{ lesson.level }}</span>
        <span class="ecn-tag ecn-tag-theme">{{ lesson.category }}</span>
        <span
          v-for="tag in lesson.exam_tags"
          :key="tag"
          class="ecn-tag ecn-tag-exam"
        >{{ tag }}</span>
      </div>
      <h1 class="lesson-title">{{ lesson.title }}</h1>
      <p class="lesson-title-cn">{{ lesson.title_cn }}</p>
    </div>

    <!-- 主题文章 -->
    <section class="lesson-section">
      <h2>📖 主题文章</h2>
      <div class="ecn-article">
        <div class="ecn-article-en">
          <p v-for="(para, i) in articleParagraphs" :key="i" v-html="highlightChunks(para)"></p>
        </div>
        <div class="ecn-article-cn">
          <p v-for="(para, i) in articleParagraphsCn" :key="i">{{ para }}</p>
        </div>
      </div>
      <AudioPlayer v-if="lesson.article?.audio" :audioSrc="lesson.article.audio" />
    </section>

    <!-- 核心词块 -->
    <section class="lesson-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0;">📝 核心词块 ({{ lesson.chunks?.length || 0 }})</h2>
        <button class="ecn-btn ecn-btn-sm" @click="cardMode = cardMode === 'list' ? 'flip' : 'list'">
          {{ cardMode === 'list' ? '📖 翻页模式' : '📋 列表模式' }}
        </button>
      </div>

      <!-- 列表模式 -->
      <template v-if="cardMode === 'list'">
        <ChunkCard
          v-for="chunk in lesson.chunks"
          :key="chunk.id"
          :chunk="chunk"
          :lessonId="lesson.lesson_id"
        />
      </template>

      <!-- 翻页模式 -->
      <template v-else-if="cardMode === 'flip' && currentFlipChunk">
        <div class="flip-card-container">
          <div class="flip-card-progress">{{ flipIndex + 1 }} / {{ lesson.chunks.length }}</div>
          <div class="ecn-progress" style="margin-bottom: 16px;">
            <div class="ecn-progress-bar" :style="{ width: flipProgressPercent + '%' }"></div>
          </div>
          <div class="ecn-flashcard" @click="flipShowBack = !flipShowBack" style="margin-bottom: 16px;">
            <div class="ecn-flashcard-inner" :class="{ flipped: flipShowBack }">
              <div class="ecn-flashcard-front">
                <div class="flash-label">英文词块</div>
                <div class="flash-main">{{ currentFlipChunk.chunk }}</div>
                <AudioPlayer v-if="currentFlipChunk.audio" :audioSrc="currentFlipChunk.audio" style="margin-top: 12px;" />
              </div>
              <div class="ecn-flashcard-back">
                <div class="flash-label">中文含义</div>
                <div class="flash-main">{{ currentFlipChunk.meaning_cn }}</div>
                <div class="flash-sub">{{ currentFlipChunk.sentence }}</div>
                <div class="flash-sub">{{ currentFlipChunk.sentence_cn }}</div>
                <div class="flash-collocations" v-if="currentFlipChunk.collocations?.length">
                  <span class="flash-label" style="margin-bottom: 6px;">搭配</span>
                  <span class="flash-sub" v-for="col in currentFlipChunk.collocations" :key="col">• {{ col }}</span>
                </div>
                <div class="flash-exam" v-if="currentFlipChunk.exam_sentence">
                  <span class="flash-label" style="margin-bottom: 4px;">写作句</span>
                  <span class="flash-sub">{{ currentFlipChunk.exam_sentence }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flip-nav">
            <button class="ecn-btn ecn-btn-sm" :disabled="flipIndex === 0" @click="flipPrev">← 上一个</button>
            <span class="flip-hint">点击卡片翻转</span>
            <button class="ecn-btn ecn-btn-sm" :disabled="flipIndex >= lesson.chunks.length - 1" @click="flipNext">下一个 →</button>
          </div>
        </div>
      </template>
    </section>

    <!-- 可套作文段落 -->
    <section class="lesson-section" v-if="lesson.model_paragraph">
      <h2>✍️ 可套作文段落</h2>
      <div class="ecn-card model-para">
        <p class="model-en">{{ lesson.model_paragraph.text }}</p>
        <p class="model-cn">{{ lesson.model_paragraph.text_cn }}</p>
      </div>
    </section>

    <!-- 复述问题 -->
    <section class="lesson-section" v-if="retellingChunks.length">
      <h2>🗣️ 复述训练</h2>
      <div
        v-for="(chunk, i) in retellingChunks"
        :key="chunk.id"
        class="ecn-card retelling-card"
      >
        <div class="retelling-num">{{ i + 1 }}</div>
        <p class="retelling-prompt">{{ chunk.retelling_prompt }}</p>
        <details class="retelling-hint">
          <summary>💡 提示</summary>
          <p>{{ chunk.chunk }} — {{ chunk.meaning_cn }}</p>
        </details>
      </div>
    </section>
  </div>

  <!-- 找不到 lesson -->
  <div v-else class="ecn-empty">
    <div class="ecn-empty-icon">📄</div>
    <p>未找到该主题内容</p>
    <a :href="withBase('/themes/')" class="ecn-btn ecn-btn-primary" style="margin-top: 16px;">返回主题列表</a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'
import { getLessonById } from '../data/loader'
import ChunkCard from './ChunkCard.vue'
import AudioPlayer from './AudioPlayer.vue'

const props = defineProps<{
  lessonId: string
}>()

const lesson = computed(() => getLessonById(props.lessonId))

const articleParagraphs = computed(() => {
  return lesson.value?.article?.text?.split('\n\n') || []
})

const articleParagraphsCn = computed(() => {
  return lesson.value?.article?.text_cn?.split('\n\n') || []
})

const retellingChunks = computed(() => {
  return lesson.value?.chunks?.filter(c => c.retelling_prompt) || []
})

function highlightChunks(text: string): string {
  if (!lesson.value?.chunks) return text
  let result = text
  for (const chunk of lesson.value.chunks) {
    const escaped = chunk.chunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    result = result.replace(regex, '<span class="chunk-highlight">$1</span>')
  }
  return result
}

// 翻页模式状态
const cardMode = ref<'list' | 'flip'>('list')
const flipIndex = ref(0)
const flipShowBack = ref(false)

const currentFlipChunk = computed(() => {
  return lesson.value?.chunks?.[flipIndex.value] || null
})

const flipProgressPercent = computed(() => {
  const total = lesson.value?.chunks?.length || 1
  return ((flipIndex.value + 1) / total) * 100
})

function flipPrev() {
  if (flipIndex.value > 0) {
    flipIndex.value--
    flipShowBack.value = false
  }
}

function flipNext() {
  const total = lesson.value?.chunks?.length || 0
  if (flipIndex.value < total - 1) {
    flipIndex.value++
    flipShowBack.value = false
  }
}
</script>

<style scoped>
.lesson-page {
  max-width: 800px;
  margin: 0 auto;
}

.lesson-header {
  margin-bottom: 32px;
}

.lesson-badges {
  margin-bottom: 12px;
}

.lesson-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
}

.lesson-title-cn {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.lesson-section {
  margin-bottom: 40px;
}

.lesson-section h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--vp-c-brand-soft);
}

.model-para {
  background: var(--vp-bg-alt);
}

.model-en {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  line-height: 1.8;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.model-cn {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0;
}

.retelling-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  margin-bottom: 10px;
}

.retelling-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
}

.retelling-prompt {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.retelling-hint {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  margin-top: 8px;
}

.retelling-hint summary {
  cursor: pointer;
  font-weight: 500;
}

.retelling-hint p {
  margin: 6px 0 0;
  padding: 6px 10px;
  background: var(--vp-bg-soft);
  border-radius: 6px;
}

/* 翻页模式 */
.flip-card-container {
  max-width: 560px;
  margin: 0 auto;
}

.flip-card-progress {
  text-align: center;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-bottom: 8px;
}

.flip-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flip-hint {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.flip-collocations {
  margin-top: 10px;
  text-align: left;
}

.flip-exam {
  margin-top: 10px;
  text-align: left;
  padding: 8px 12px;
  background: var(--vp-c-brand-soft);
  border-radius: 6px;
}

:deep(.chunk-highlight) {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 600;
}
</style>
