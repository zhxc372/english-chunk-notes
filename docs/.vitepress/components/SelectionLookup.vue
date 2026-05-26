<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="selection-lookup"
      :style="popupStyle"
      @mousedown.stop
    >
      <div v-if="loading" class="lookup-loading">查询中...</div>
      <div v-else-if="result?.found" class="lookup-result">
        <div class="lookup-header">
          <span class="lookup-canonical">{{ result.canonical }}</span>
          <span v-if="result.surface && result.surface !== result.canonical" class="lookup-surface">({{ result.surface }})</span>
          <TtsButton :text="result.canonical || ''" />
        </div>
        <p class="lookup-meaning">{{ result.localMeaningZh || result.meaningZh }}</p>
        <p v-if="result.sentence" class="lookup-sentence">"{{ result.sentence }}"</p>
        <div class="lookup-actions">
          <span class="lookup-source">{{ result.source.replace('_', ' ') }}</span>
          <a v-if="result.chunkId" class="lookup-link" @click="goToChunk(result.chunkId)">查看词块 →</a>
        </div>
      </div>
      <div v-else class="lookup-not-found">
        <p>未找到「{{ selectedText }}」</p>
        <a v-if="result?.externalUrl" :href="result.externalUrl" target="_blank" class="lookup-link">查外部词典 →</a>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vitepress'
import { withBase } from 'vitepress'
import TtsButton from './TtsButton.vue'
import { currentArticleChunkProvider } from '../dictionary/providers/currentArticleChunkProvider'
import { globalChunkProvider } from '../dictionary/providers/globalChunkProvider'
import { externalLinkProvider } from '../dictionary/providers/externalLinkProvider'
import type { LookupResult, LookupInput } from '../dictionary/types'

const props = defineProps<{ articleId?: string }>()

const router = useRouter()
const visible = ref(false)
const loading = ref(false)
const selectedText = ref('')
const result = ref<LookupResult | null>(null)
const popupStyle = ref({})

const providers = [currentArticleChunkProvider, globalChunkProvider, externalLinkProvider]

function handleMouseUp(e: MouseEvent) {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || !sel.toString().trim()) {
    // Small delay to hide on click-away
    setTimeout(() => { visible.value = false }, 150)
    return
  }

  const text = sel.toString().trim()
  if (text.length < 2 || text.length > 60) return

  // Position popup near selection
  const range = sel.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  
  selectedText.value = text
  visible.value = true
  loading.value = true
  result.value = null

  popupStyle.value = {
    position: 'fixed',
    left: `${Math.min(rect.left, window.innerWidth - 320)}px`,
    top: `${rect.bottom + 8}px`,
    zIndex: 200
  }

  lookup(text)
}

async function lookup(text: string) {
  const input: LookupInput = { text, articleId: props.articleId }

  for (const provider of providers) {
    try {
      const r = await provider.lookup(input)
      if (r) {
        result.value = r
        loading.value = false
        return
      }
    } catch { /* continue */ }
  }

  // No match found
  result.value = null
  loading.value = false
}

function goToChunk(chunkId: string) {
  visible.value = false
  router.go(withBase(`/chunks/#${chunkId}`))
}

onMounted(() => {
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchend', handleTouchEnd)
})

function handleTouchEnd(e: TouchEvent) {
  // 移动端：延迟等 selection 稳定
  setTimeout(() => handleMouseUp(e as any), 300)
}
</script>

<style scoped>
.selection-lookup {
  min-width: 250px;
  max-width: 360px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  font-size: 0.85rem;
}

.lookup-loading {
  color: var(--vp-c-text-3);
}

.lookup-result {
  
}

.lookup-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.lookup-canonical {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.lookup-surface {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.lookup-meaning {
  color: var(--vp-c-text-2);
  margin: 0 0 6px;
}

.lookup-sentence {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  padding-left: 8px;
  border-left: 2px solid var(--vp-c-divider);
  margin: 0 0 8px;
}

.lookup-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lookup-source {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  text-transform: capitalize;
}

.lookup-link {
  font-size: 0.8rem;
  color: var(--vp-c-brand);
  cursor: pointer;
  text-decoration: none;
}

.lookup-link:hover {
  text-decoration: underline;
}

.lookup-not-found p {
  color: var(--vp-c-text-3);
  margin: 0 0 6px;
}
</style>
