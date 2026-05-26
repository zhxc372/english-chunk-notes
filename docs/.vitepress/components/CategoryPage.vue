<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">📂 文章分类</h1>
    <div v-for="cat in categories" :key="cat.id" :id="cat.id" class="mb-10 scroll-mt-16">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
        {{ cat.nameZh }}
        <span class="text-sm font-normal text-gray-400 ml-1">{{ cat.name }}</span>
      </h2>
      <p v-if="cat.description" class="text-sm text-gray-400 mb-3">{{ cat.description }}</p>
      <div class="grid sm:grid-cols-2 gap-3">
        <div
          v-for="a in getArticlesByCategory(cat.id)"
          :key="a.id"
          class="group p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer transition-all"
          @click="router.go(withBase(a.url))"
        >
          <div class="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-500 transition-colors">{{ a.title }}</div>
          <div v-if="a.titleZh" class="text-sm text-gray-400 mt-1">{{ a.titleZh }}</div>
          <div class="flex gap-2 mt-2 text-xs text-gray-400">
            <span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 font-medium">{{ a.level }}</span>
            <span v-if="a.chunkCount">📚 {{ a.chunkCount }}</span>
            <span>{{ a.publishedAt }}</span>
          </div>
        </div>
        <div v-if="!getArticlesByCategory(cat.id).length" class="text-sm text-gray-400 col-span-2">暂无文章</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vitepress'
import { withBase } from 'vitepress'
import { getCategories } from '../composables/useCategories'
import { getArticlesByCategory } from '../composables/useArticles'

const router = useRouter()
const categories = getCategories()
</script>
