<template>
  <div class="chunk-detail-overlay" @click.self="$emit('close')">
    <div class="chunk-detail ecn-card">
      <button class="close-btn" @click="$emit('close')">✕</button>

      <h3 class="canonical">{{ chunk.canonical }}</h3>
      <p class="meaning">{{ chunk.meaningZh }}</p>

      <div class="detail-section">
        <span class="label">类型</span>
        <span class="ecn-tag">{{ chunk.type.replace('_', ' ') }}</span>
        <span v-if="chunk.level" class="ecn-tag">{{ chunk.level }}</span>
      </div>

      <div v-if="chunk.surfaceForms?.length" class="detail-section">
        <span class="label">变形形式</span>
        <div class="form-list">
          <code v-for="f in chunk.surfaceForms" :key="f" class="form-item">{{ f }}</code>
        </div>
      </div>

      <div v-if="chunk.aliases?.length" class="detail-section">
        <span class="label">近义表达</span>
        <div class="form-list">
          <code v-for="a in chunk.aliases" :key="a" class="form-item">{{ a }}</code>
        </div>
      </div>

      <div v-if="chunk.coreExamples?.length" class="detail-section">
        <span class="label">例句</span>
        <div v-for="(ex, i) in chunk.coreExamples" :key="i" class="example">
          <p class="example-en">{{ ex.text }} <TtsButton :text="ex.text" /></p>
          <p v-if="ex.zh" class="example-zh">{{ ex.zh }}</p>
        </div>
      </div>

      <div v-if="chunk.tags?.length" class="detail-section">
        <span class="label">标签</span>
        <div class="tag-list">
          <span v-for="t in chunk.tags" :key="t" class="ecn-tag">{{ t }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TtsButton from './TtsButton.vue'
import type { ChunkIndexItem } from '../../../types/content'

defineProps<{ chunk: ChunkIndexItem }>()
defineEmits<{ close: [] }>()
</script>

<style scoped>
.chunk-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.chunk-detail {
  position: relative;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--vp-c-text-3);
  cursor: pointer;
}

.canonical {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
}

.meaning {
  font-size: 1.05rem;
  color: var(--vp-c-text-2);
  margin: 0 0 16px;
}

.detail-section {
  margin-bottom: 14px;
}

.label {
  display: block;
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  margin-bottom: 6px;
  font-weight: 600;
}

.form-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.form-item {
  padding: 2px 8px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.example {
  margin-bottom: 8px;
  padding-left: 12px;
  border-left: 2px solid var(--vp-c-divider);
}

.example-en {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.example-zh {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}

.tag-list {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
