/**
 * normalizeText.ts — 文本标准化工具
 */

/** 基础标准化：小写、去多余空格 */
export function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
}

/** 去掉常见冠词 */
export function stripArticles(text: string): string {
  return normalize(text).replace(/\b(a|an|the)\b/g, '').replace(/\s+/g, ' ').trim()
}
