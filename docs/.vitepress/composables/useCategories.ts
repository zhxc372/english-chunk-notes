/**
 * categories.ts — v0.3 Category 数据
 */

import type { Category } from '../../../../types/content'
import categoriesData from '../../../data/categories.json'

const categories = categoriesData as Category[]

/** 获取所有分类 */
export function getCategories(): Category[] {
  return categories.sort((a, b) => a.order - b.order)
}

/** 按ID获取分类 */
export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id)
}
