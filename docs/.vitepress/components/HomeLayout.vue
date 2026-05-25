<template>
  <!-- 首页布局组件 -->
  <div class="home">
    <!-- Hero -->
    <div class="ecn-hero">
      <h1>📖 English Chunk Notes</h1>
      <p>考试英语 + 技术英语双轨主题词块学习站</p>
      <p style="font-size: 0.85rem; color: var(--vp-c-text-3); margin-top: 12px;">
        通过主题文章学习词块，用闪卡巩固记忆
      </p>
    </div>

    <!-- 快捷入口 -->
    <div class="home-shortcuts">
      <a href="/themes/" class="shortcut-card ecn-card">
        <div class="shortcut-icon">📚</div>
        <h3>主题学习</h3>
        <p>按主题阅读文章、学习词块</p>
      </a>
      <a href="/favorites.html" class="shortcut-card ecn-card">
        <div class="shortcut-icon">❤️</div>
        <h3>我的收藏</h3>
        <p>管理已收藏的词块</p>
      </a>
      <a href="/flashcards.html" class="shortcut-card ecn-card">
        <div class="shortcut-icon">🃏</div>
        <h3>闪卡训练</h3>
        <p>英译中、中译英、填空、听写</p>
      </a>
      <a href="/tech-english" class="shortcut-card ecn-card">
        <div class="shortcut-icon">💻</div>
        <h3>技术英语</h3>
        <p>AI、软件工程、系统设计</p>
      </a>
      <a href="/general-english" class="shortcut-card ecn-card">
        <div class="shortcut-icon">📚</div>
        <h3>通用英语</h3>
        <p>雅思、托福常考话题</p>
      </a>
    </div>

    <!-- 考试标签入口 -->
    <div class="home-section">
      <h2>📋 考试标签</h2>
      <div class="exam-tags">
        <span v-for="tag in examTags" :key="tag" class="ecn-tag ecn-tag-exam exam-tag-lg">
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- 主题列表 -->
    <div class="home-section">
      <h2>📖 学习主题</h2>
      <LessonList />
    </div>

    <!-- 学习流程 -->
    <div class="home-section">
      <h2>🔄 学习流程</h2>
      <div class="flow-steps">
        <div class="flow-step ecn-card">
          <div class="step-num">1</div>
          <div class="step-content">
            <h4>选择主题</h4>
            <p>按兴趣选择学习主题</p>
          </div>
        </div>
        <div class="flow-step ecn-card">
          <div class="step-num">2</div>
          <div class="step-content">
            <h4>阅读文章</h4>
            <p>中英对照，理解语境</p>
          </div>
        </div>
        <div class="flow-step ecn-card">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>收藏词块</h4>
            <p>标记重要的主题词块</p>
          </div>
        </div>
        <div class="flow-step ecn-card">
          <div class="step-num">4</div>
          <div class="step-content">
            <h4>闪卡训练</h4>
            <p>多种模式巩固记忆</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAllExamTags } from '../data/loader'
import LessonList from './LessonList.vue'

const examTags = getAllExamTags()
</script>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.home-shortcuts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 48px;
}

@media (max-width: 768px) {
  .home-shortcuts {
    grid-template-columns: repeat(2, 1fr);
  }
}

.shortcut-card {
  text-align: center;
  padding: 20px 12px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.shortcut-card:hover {
  transform: translateY(-2px);
}

.shortcut-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.shortcut-card h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 4px;
}

.shortcut-card p {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

.home-section {
  margin-bottom: 48px;
}

.home-section h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--vp-c-brand-soft);
}

.exam-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.exam-tag-lg {
  font-size: 0.85rem;
  padding: 6px 16px;
  cursor: default;
}

.flow-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .flow-steps {
    grid-template-columns: 1fr;
  }
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.step-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.step-content h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 2px;
}

.step-content p {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
</style>
