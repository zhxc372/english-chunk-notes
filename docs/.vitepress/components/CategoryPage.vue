<template>
  <div class="category-page">
    <h1>📂 文章分类</h1>
    <div v-for="cat in categories" :key="cat.id" :id="cat.id" class="category-section">
      <h2>{{ cat.nameZh }} <span class="cat-en">{{ cat.name }}</span></h2>
      <p v-if="cat.description" class="cat-desc">{{ cat.description }}</p>
      <div class="article-grid">
        <div
          v-for="a in getArticlesByCategory(cat.id)"
          :key="a.id"
          class="ecn-card article-card"
          @click="router.go(withBase(a.url))"
        >
          <div class="article-title">{{ a.title }}</div>
          <div v-if="a.titleZh" class="article-title-zh">{{ a.titleZh }}</div>
          <div class="article-meta">
            <span class="ecn-tag">{{ a.level }}</span>
            <span v-if="a.chunkCount">📚 {{ a.chunkCount }}</span>
            <span>{{ a.publishedAt }}</span>
          </div>
        </div>
        <div v-if="!getArticlesByCategory(cat.id).length" class="empty">暂无文章</div>
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

<style scoped>
.category-page {
  max-width: 900px;
  margin: 0 auto;
}

.category-section {
  margin-bottom: 32px;
  scroll-margin-top: 60px;
}

.cat-en {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.cat-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-bottom: 12px;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

.article-card {
  cursor: pointer;
  padding: 14px;
  transition: transform 0.2s;
}

.article-card:hover {
  transform: translateY(-1px);
}

.article-title {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.article-title-zh {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-top: 2px;
}

.article-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.empty {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}
</style>
