<template>
  <div class="article-page" v-if="article">
    <!-- Header -->
    <div class="article-header">
      <div class="article-badges">
        <span class="ecn-tag ecn-tag-level">{{ article.level }}</span>
        <span class="ecn-tag ecn-tag-category">{{ categoryName }}</span>
        <span v-for="tag in article.examTags?.slice(0, 3)" :key="tag" class="ecn-tag ecn-tag-exam">{{ tag }}</span>
      </div>
      <h1 class="article-title">{{ article.title }}</h1>
      <p v-if="article.titleZh" class="article-title-zh">{{ article.titleZh }}</p>
      <p v-if="article.summaryZh" class="article-summary">{{ article.summaryZh }}</p>
    </div>

    <!-- Paragraphs -->
    <section class="article-body">
      <div class="article-toolbar">
        <h2>📖 正文</h2>
        <TtsButton :text="fullText" />
      </div>
      <div
        v-for="para in article.paragraphs"
        :key="para.id"
        class="article-paragraph"
      >
        <p class="para-en" v-html="highlightParagraph(para)"></p>
        <p v-if="para.zh" class="para-zh">{{ para.zh }}</p>
        <TtsButton :text="para.text" class="para-tts" />
      </div>
    </section>

    <!-- Chunk List -->
    <section v-if="chunkItems.length" class="article-chunks">
      <h2>📝 词块 ({{ chunkItems.length }})</h2>
      <div class="chunk-list">
        <div v-for="item in chunkItems" :key="item.chunkId" class="chunk-item ecn-card">
          <div class="chunk-main">
            <span class="chunk-canonical">{{ item.chunk?.canonical || item.chunkId }}</span>
            <span v-if="item.surface !== item.chunk?.canonical" class="chunk-surface">→ 原文: {{ item.surface }}</span>
            <span class="chunk-meaning">{{ item.chunk?.meaningZh || '' }}</span>
          </div>
          <p v-if="item.sentence" class="chunk-sentence">"{{ item.sentence }}"</p>
          <div class="chunk-meta">
            <span class="ecn-tag" :class="'match-' + item.matchType">{{ item.matchType }}</span>
            <TtsButton :text="item.chunk?.canonical || item.surface" />
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading && !article" class="loading">加载中...</div>
  </div>
  <div v-if="!article && !loading" class="loading">文章不存在</div>
  <SelectionLookup :articleId="articleId" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loadArticle } from '../composables/useArticles'
import { getCategoryById } from '../composables/useCategories'
import { loadArticleChunkItems } from '../composables/useArticleChunks'
import TtsButton from './TtsButton.vue'
import SelectionLookup from './SelectionLookup.vue'
import type { Article, ArticleParagraph } from '../../../types/content'

interface ChunkItem {
  chunkId: string
  surface: string
  sentence?: string
  sentenceZh?: string
  matchType: string
  chunk?: { canonical?: string; meaningZh?: string; [k: string]: any }
}

const props = defineProps<{ articleId: string }>()

const article = ref<Article | null>(null)
const chunkItems = ref<ChunkItem[]>([])
const loading = ref(true)

const categoryName = computed(() => {
  if (!article.value) return ''
  const cat = getCategoryById(article.value.categoryId)
  return cat?.nameZh || cat?.name || article.value.categoryId
})

const fullText = computed(() => {
  if (!article.value) return ''
  return article.value.paragraphs.map(p => p.text).join(' ')
})

onMounted(async () => {
  article.value = await loadArticle(props.articleId)
  chunkItems.value = await loadArticleChunkItems(props.articleId)
  loading.value = false
})

function highlightParagraph(para: ArticleParagraph): string {
  let html = escapeHtml(para.text)
  // Highlight occurrences in this paragraph
  const paraChunks = chunkItems.value.filter(c => c.sentence && para.text.includes(c.surface))
  // Sort by surface length descending to avoid partial matches
  paraChunks.sort((a, b) => b.surface.length - a.surface.length)
  for (const c of paraChunks) {
    const escaped = escapeHtml(c.surface)
    html = html.replace(escaped, `<span class="chunk-highlight" title="${escapeHtml(c.chunk?.meaningZh || '')}">${escaped}</span>`)
  }
  return html
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
</script>

<style scoped>
.article-page {
  max-width: 800px;
  margin: 0 auto;
}

.article-header {
  margin-bottom: 32px;
}

.article-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.article-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
}

.article-title-zh {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin: 0 0 8px;
}

.article-summary {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
}

.article-body {
  margin-bottom: 40px;
}

.article-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.article-toolbar h2 {
  margin: 0;
}

.article-paragraph {
  position: relative;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border-left: 3px solid var(--vp-c-brand);
}

.para-en {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--vp-c-text-1);
  margin: 0 0 6px;
}

.para-zh {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin: 0 0 4px;
  line-height: 1.6;
}

.para-tts {
  position: absolute;
  top: 8px;
  right: 8px;
}

:deep(.chunk-highlight) {
  background: rgba(59, 130, 246, 0.15);
  border-bottom: 2px solid rgba(59, 130, 246, 0.5);
  padding: 0 2px;
  border-radius: 2px;
  cursor: help;
}

.article-chunks h2 {
  margin-bottom: 16px;
}

.chunk-list {
  display: grid;
  gap: 8px;
}

.chunk-item {
  padding: 12px 16px;
}

.chunk-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.chunk-canonical {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.chunk-surface {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.chunk-meaning {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.chunk-sentence {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin: 6px 0;
  padding-left: 12px;
  border-left: 2px solid var(--vp-c-divider);
}

.chunk-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.match-exact { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
.match-surface_form { background: rgba(234, 179, 8, 0.1); color: #ca8a04; }
.match-alias { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.match-manual { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

.loading {
  text-align: center;
  padding: 40px;
  color: var(--vp-c-text-3);
}
</style>
