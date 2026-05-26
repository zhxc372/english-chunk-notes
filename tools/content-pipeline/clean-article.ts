/**
 * clean-article.ts - 清洗文章正文
 * 
 * 去除广告、导航、重复内容，保留有价值的学习素材
 */

export interface CleanedArticle {
  text: string
  wordCount: number
  paragraphs: string[]
}

export function cleanArticle(text: string, maxWords = 3000): CleanedArticle {
  // Basic cleanup
  let cleaned = text
    .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' ') // Zero-width chars
    .replace(/[^\x20-\x7E\u4e00-\u9fff\u3000-\u303f\uff00-\uffef.,;:!?'"()\[\]{}\-\/\\@#$%^&*+=~`|]/g, ' ')
    .replace(/([.!?])\s{2,}/g, '$1 ') // Multiple punctuation
    .replace(/\n{3,}/g, '\n\n') // Multiple newlines

  // Split into paragraphs
  let paragraphs = cleaned.split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 30) // Keep substantial paragraphs

  // Remove very short paragraphs (likely ads)
  paragraphs = paragraphs.filter(p => {
    const words = p.split(/\s+/)
    return words.length >= 5
  })

  // Truncate to maxWords
  let wordCount = 0
  const truncated: string[] = []
  for (const p of paragraphs) {
    const words = p.split(/\s+/)
    if (wordCount + words.length > maxWords) break
    truncated.push(p)
    wordCount += words.length
  }

  const finalText = truncated.join('\n\n')
  return { text: finalText, wordCount, paragraphs: truncated }
}
