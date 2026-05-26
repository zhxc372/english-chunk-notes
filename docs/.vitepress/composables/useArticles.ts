/**
 * useArticles.ts — v0.3 Article 数据加载
 * 首页只加载 article-index（轻量），文章页按需加载完整article
 */

import type { Article, ArticleIndexItem } from '../../../../types/content'

// 静态导入 article-index（轻量，只有标题/摘要/标签）
import articleIndexData from '../../../data/indexes/article-index.json'

const articleIndex = articleIndexData as ArticleIndexItem[]

/** 获取所有文章索引（轻量，用于列表页） */
export function getArticleIndex(): ArticleIndexItem[] {
  return articleIndex
}

/** 按分类筛选文章 */
export function getArticlesByCategory(categoryId: string): ArticleIndexItem[] {
  return articleIndex.filter(a => a.categoryId === categoryId)
}

/** 按文章ID获取索引项 */
export function getArticleIndexItem(articleId: string): ArticleIndexItem | undefined {
  return articleIndex.find(a => a.id === articleId)
}

/**
 * 按文章ID动态加载完整文章数据
 * 使用Vite的glob import实现按需加载
 */
const articleModules = import.meta.glob<{ default: Article }>(
  '../../../data/articles/**/*.json'
)

export async function loadArticle(articleId: string): Promise<Article | null> {
  // Find the matching module path
  for (const path of Object.keys(articleModules)) {
    if (path.includes(`/${articleId}.json`)) {
      const mod = await articleModules[path]()
      return mod.default
    }
  }
  return null
}

/** 获取最新N篇文章 */
export function getLatestArticles(n: number): ArticleIndexItem[] {
  return articleIndex.slice(0, n)
}

/** 按考试标签筛选 */
export function getArticlesByExamTag(tag: string): ArticleIndexItem[] {
  return articleIndex.filter(a => a.examTags?.includes(tag))
}
