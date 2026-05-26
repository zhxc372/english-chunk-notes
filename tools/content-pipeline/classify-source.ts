/**
 * classify-source.ts - 分类文章来源
 * 
 * 根据文章内容判断学习级别、主题、考试相关性等
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { callAI, parseAIJson } from './call-ai.js'

interface ClassificationResult {
  level: 'A2' | 'B1' | 'B2' | 'C1'
  topicTags: string[]
  examTags: string[]
  useCaseTags: string[]
  articleType: string
  isSuitable: boolean
  reasonZh: string
  riskFlags: string[]
}

const PROMPT_TEMPLATE = fs.readFileSync(
  path.join(path.dirname(new URL(import.meta.url).pathname), 'prompts', 'source-classifier.md'),
  'utf-8'
)

export async function classifySource(
  articleText: string,
  sourceMetadata: { url: string; name: string; usagePolicy?: string }
): Promise<ClassificationResult> {
  const prompt = PROMPT_TEMPLATE
    .replace('{{SOURCE_METADATA}}', JSON.stringify(sourceMetadata, null, 2))
    .replace('{{ARTICLE_TEXT}}', articleText.slice(0, 8000))

  const response = await callAI(prompt)
  return parseAIJson<ClassificationResult>(response.content)
}
