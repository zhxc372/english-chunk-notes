<template>
  <div class="max-w-3xl mx-auto" v-if="article">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-wrap gap-2 mb-3">
        <span class="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">{{ article.level }}</span>
        <span class="px-2.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">{{ categoryName }}</span>
        <span v-for="tag in article.examTags?.slice(0, 3)" :key="tag" class="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium">{{ tag }}</span>
      </div>
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{{ article.title }}</h1>
      <p v-if="article.titleZh" class="text-lg text-gray-500 dark:text-gray-400 mt-1">{{ article.titleZh }}</p>
      <p v-if="article.summaryZh" class="text-sm text-gray-400 dark:text-gray-500 mt-2">{{ article.summaryZh }}</p>
    </div>

    <!-- Paragraphs -->
    <section class="mb-12">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">📖 正文</h2>
        <TtsButton :text="fullText" />
      </div>
      <div class="space-y-4">
        <div
          v-for="para in article.paragraphs"
          :key="para.id"
          class="relative pl-4 py-3 pr-12 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-l-3 border-blue-400"
        >
          <p class="text-base leading-relaxed text-gray-800 dark:text-gray-200" v-html="highlightParagraph(para)"></p>
          <p v-if="para.zh" class="text-sm text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">{{ para.zh }}</p>
          <TtsButton :text="para.text" class="absolute top-2 right-2" />
        </div>
      </div>
    </section>

    <!-- Chunk List -->
    <section v-if="chunkItems.length" class="mb-12">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📝 词块 <span class="text-sm font-normal text-gray-400">({{ chunkItems.length }})</span></h2>
      <div class="space-y-2">
        <div v-for="item in chunkItems" :key="item.chunkId" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="font-semibold text-gray-800 dark:text-gray-100">{{ item.chunk?.canonical || item.chunkId }}</span>
            <span v-if="item.surface !== item.chunk?.canonical" class="text-xs text-gray-400 italic">→ {{ item.surface }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ item.chunk?.meaningZh }}</span>
          </div>
          <p v-if="item.sentence" class="text-sm text-gray-400 mt-1 pl-3 border-l-2 border-gray-200 dark:border-gray-600">"{{ item.sentence }}"</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs px-1.5 py-0.5 rounded" :class="matchClass(item.matchType)">{{ item.matchType }}</span>
            <TtsButton :text="item.chunk?.canonical || item.surface" />
          </div>
        </div>
      </div>
    </section>

    <SelectionLookup :articleId="articleId" />
  </div>
  <div v-else class="text-center py-20 text-gray-400">加载中...</div>
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
})

function matchClass(type: string) {
  const map: Record<string, string> = {
    exact: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    surface_form: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    alias: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    manual: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  }
  return map[type] || 'bg-gray-50 dark:bg-gray-700 text-gray-500'
}

function highlightParagraph(para: ArticleParagraph): string {
  let html = escapeHtml(para.text)
  const paraChunks = chunkItems.value.filter(c => c.sentence && para.text.includes(c.surface))
  paraChunks.sort((a, b) => b.surface.length - a.surface.length)
  for (const c of paraChunks) {
    const escaped = escapeHtml(c.surface)
    const title = escapeHtml(c.chunk?.meaningZh || '')
    const replacement = `<span class="bg-blue-100/60 dark:bg-blue-800/30 border-b-2 border-blue-400 dark:border-blue-500 px-0.5 rounded cursor-help" title="${title}">${escaped}</span>`
    html = html.replaceAll(escaped, replacement)
  }
  return html
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
</script>
