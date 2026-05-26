<template>
  <div class="home-dashboard">
    <!-- Hero -->
    <div class="hero">
      <h1>📖 English Chunk Notes</h1>
      <p>文章驱动的英语词块学习站</p>
    </div>

    <!-- Method -->
    <div class="method-section">
      <h2>🎯 学习方法</h2>
      <div class="method-steps">
        <div class="step"><span class="step-label">Read</span><span class="step-desc">先读文章，理解语境</span></div>
        <div class="step"><span class="step-label">Notice</span><span class="step-desc">标出词块，不孤立背单词</span></div>
        <div class="step"><span class="step-label">Listen</span><span class="step-desc">用朗读听文章和例句</span></div>
        <div class="step"><span class="step-label">Recall</span><span class="step-desc">用闪卡回忆含义和用法</span></div>
        <div class="step"><span class="step-label">Output</span><span class="step-desc">把词块迁移到写作和口语</span></div>
      </div>
    </div>

    <!-- Two columns -->
    <div class="two-col">
      <!-- Latest Articles -->
      <div class="col">
        <h2>📰 最新文章</h2>
        <div v-if="latestArticles.length" class="article-list">
          <div v-for="a in latestArticles" :key="a.id" class="ecn-card article-card" @click="goTo(a.url)">
            <div class="article-title">{{ a.title }}</div>
            <div v-if="a.titleZh" class="article-title-zh">{{ a.titleZh }}</div>
            <div class="article-meta">
              <span class="ecn-tag">{{ a.level }}</span>
              <span v-if="a.chunkCount">📚 {{ a.chunkCount }} 词块</span>
            </div>
          </div>
        </div>
        <div v-else class="empty">暂无文章</div>
      </div>

      <!-- Categories -->
      <div class="col">
        <h2>📂 分类</h2>
        <div class="category-grid">
          <div v-for="cat in categories" :key="cat.id" class="ecn-card category-card" @click="goToCategory(cat.id)">
            <div class="cat-name">{{ cat.nameZh }}</div>
            <div class="cat-en">{{ cat.name }}</div>
            <div class="cat-count">{{ getArticleCount(cat.id) }} 篇</div>
          </div>
        </div>

        <!-- Quick links -->
        <div class="quick-links">
          <h3>快捷入口</h3>
          <div class="link-grid">
            <button class="link-btn" @click="goTo('/chunks/')">📚 词块库</button>
            <button class="link-btn" @click="goTo('/favorites')">⭐ 收藏</button>
            <button class="link-btn" @click="goTo('/flashcards')">🃏 闪卡</button>
            <button class="link-btn" @click="goTo('/themes/')">📖 旧版主题</button>
          </div>
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

<style scoped>
.home-dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.hero {
  text-align: center;
  padding: 40px 0 20px;
}

.hero h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.hero p {
  color: var(--vp-c-text-2);
  font-size: 1.05rem;
}

.method-section {
  margin-bottom: 32px;
}

.method-steps {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

@media (max-width: 768px) {
  .method-steps {
    grid-template-columns: repeat(2, 1fr);
  }
}

.step {
  text-align: center;
  padding: 12px 8px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.step-label {
  display: block;
  font-weight: 700;
  color: var(--vp-c-brand);
  margin-bottom: 4px;
}

.step-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .two-col {
    grid-template-columns: 1fr;
  }
}

.col h2 {
  margin-bottom: 12px;
}

.article-card, .category-card {
  cursor: pointer;
  padding: 12px 14px;
  margin-bottom: 8px;
  transition: transform 0.2s;
}

.article-card:hover, .category-card:hover {
  transform: translateY(-1px);
}

.article-title {
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-size: 0.92rem;
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

.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cat-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.cat-en {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.cat-count {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}

.quick-links {
  margin-top: 20px;
}

.quick-links h3 {
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.link-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.link-btn {
  padding: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  transition: background 0.2s;
}

.link-btn:hover {
  background: var(--vp-c-bg-mute);
}

.empty {
  color: var(--vp-c-text-3);
  text-align: center;
  padding: 20px;
}
</style>
