<template>
  <div class="max-w-5xl mx-auto px-4 pb-16">
    <!-- Hero -->
    <div class="text-center py-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-3">📖 English Chunk Notes</h1>
      <p class="text-lg text-gray-500 dark:text-gray-400">文章驱动的英语词块学习站</p>
    </div>

    <!-- Method -->
    <div class="mb-10">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">🎯 学习方法</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div v-for="step in methodSteps" :key="step.label" class="text-center p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <span class="block text-sm font-bold text-blue-500 mb-1">{{ step.label }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ step.desc }}</span>
        </div>
      </div>
    </div>

    <!-- Two columns -->
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Latest Articles -->
      <div>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">📰 最新文章</h2>
        <div class="space-y-3">
          <div
            v-for="a in latestArticles"
            :key="a.id"
            class="group p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer transition-all"
            @click="goTo(a.url)"
          >
            <div class="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-500 transition-colors">{{ a.title }}</div>
            <div v-if="a.titleZh" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ a.titleZh }}</div>
            <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 font-medium">{{ a.level }}</span>
              <span v-if="a.chunkCount">📚 {{ a.chunkCount }} 词块</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories + Quick links -->
      <div>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">📂 分类</h2>
        <div class="grid grid-cols-2 gap-3 mb-8">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all"
            @click="goToCategory(cat.id)"
          >
            <div class="font-semibold text-gray-800 dark:text-gray-100">{{ cat.nameZh }}</div>
            <div class="text-xs text-gray-400 mt-0.5">{{ cat.name }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ getArticleCount(cat.id) }} 篇</div>
          </div>
        </div>

        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">快捷入口</h3>
        <div class="grid grid-cols-2 gap-3">
          <button v-for="link in quickLinks" :key="link.url" class="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-sm text-gray-700 dark:text-gray-300" @click="goTo(link.url)">
            {{ link.icon }} {{ link.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vitepress'
import { withBase } from 'vitepress'
import { getArticleIndex, getArticlesByCategory } from '../composables/useArticles'
import { getCategories } from '../composables/useCategories'

const router = useRouter()
const articles = getArticleIndex()
const categories = getCategories()
const latestArticles = articles.slice(0, 6)

const methodSteps = [
  { label: 'Read', desc: '先读文章，理解语境' },
  { label: 'Notice', desc: '标出词块，不孤立背单词' },
  { label: 'Listen', desc: '用朗读听文章和例句' },
  { label: 'Recall', desc: '用闪卡回忆含义和用法' },
  { label: 'Output', desc: '把词块迁移到写作和口语' }
]

const quickLinks = [
  { icon: '📚', label: '词块库', url: '/chunks/' },
  { icon: '⭐', label: '收藏', url: '/favorites' },
  { icon: '🃏', label: '闪卡', url: '/flashcards' }
]

function getArticleCount(categoryId: string): number {
  return getArticlesByCategory(categoryId).length
}

function goTo(url: string) {
  router.go(withBase(url))
}

function goToCategory(id: string) {
  router.go(withBase(`/categories/#${id}`))
}
</script>
