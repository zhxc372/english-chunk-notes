<template>
  <!-- 词块卡片组件 -->
  <div class="ecn-card ecn-chunk-card">
    <div class="chunk-header">
      <div>
        <span class="chunk-text">{{ chunk.chunk }}</span>
        <span class="chunk-meaning">{{ chunk.meaning_cn }}</span>
      </div>
      <div class="chunk-actions">
        <FavoriteButton :chunkId="chunk.id" :lessonId="lessonId" />
      </div>
    </div>

    <!-- 解释 -->
    <p v-if="chunk.plain_explanation_cn" class="chunk-explanation">
      💡 {{ chunk.plain_explanation_cn }}
    </p>

    <!-- 搭配 -->
    <div class="chunk-section" v-if="chunk.collocations?.length">
      <span class="section-label">搭配</span>
      <div class="chunk-collocations">
        <code v-for="col in chunk.collocations" :key="col" class="collocation-item">
          {{ col }}
        </code>
      </div>
    </div>

    <!-- 例句 -->
    <div class="chunk-section">
      <span class="section-label">例句</span>
      <p class="chunk-sentence">{{ chunk.sentence }}</p>
      <p class="chunk-sentence-cn">{{ chunk.sentence_cn }}</p>
      <AudioPlayer v-if="chunk.audio" :audioSrc="chunk.audio" />
    </div>

    <!-- 技术例句 -->
    <div class="chunk-section" v-if="chunk.technical_sentence">
      <span class="section-label">技术语境</span>
      <p class="chunk-sentence">{{ chunk.technical_sentence }}</p>
    </div>

    <!-- 考试例句 -->
    <div class="chunk-section" v-if="chunk.exam_sentence">
      <span class="section-label">考试写作</span>
      <p class="chunk-sentence">{{ chunk.exam_sentence }}</p>
    </div>

    <!-- 训练提示 -->
    <div class="chunk-training">
      <div class="training-item">
        <span class="training-label">中译英</span>
        <span class="training-text">{{ chunk.rewrite_prompt_cn }}</span>
      </div>
      <div class="training-item">
        <span class="training-label">复述</span>
        <span class="training-text">{{ chunk.retelling_prompt }}</span>
      </div>
    </div>

    <!-- 标签 -->
    <div class="chunk-tags">
      <span v-for="tag in chunk.tags" :key="tag" class="ecn-tag ecn-tag-theme">{{ tag }}</span>
      <span v-for="tag in chunk.exam_tags" :key="'exam-' + tag" class="ecn-tag ecn-tag-exam">{{ tag }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chunk } from '../data/types'
import FavoriteButton from './FavoriteButton.vue'
import AudioPlayer from './AudioPlayer.vue'

defineProps<{
  chunk: Chunk
  lessonId: string
}>()
</script>

<style scoped>
.ecn-chunk-card {
  padding: 20px;
  margin-bottom: 12px;
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.chunk-text {
  display: block;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 4px;
}

.chunk-meaning {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
}

.chunk-explanation {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  background: var(--vp-bg-soft);
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.chunk-section {
  margin-bottom: 12px;
}

.section-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.chunk-collocations {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.collocation-item {
  display: inline-block;
  padding: 3px 10px;
  background: var(--vp-bg-soft);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.chunk-sentence {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  line-height: 1.6;
  margin: 4px 0;
}

.chunk-sentence-cn {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}

.chunk-training {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 14px 0;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}

@media (max-width: 640px) {
  .chunk-training {
    grid-template-columns: 1fr;
  }
}

.training-item {
  padding: 8px;
  background: var(--vp-bg-alt);
  border-radius: 8px;
}

.training-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}

.training-text {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.chunk-tags {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
}
</style>
