// Lesson 数据加载工具
// 所有 lesson JSON 从这里 import，不写死在组件里

import type { Lesson, Chunk } from './types'

// 静态导入所有 lesson 数据
import aiCodingWorkflow from '../../../data/lessons/ai-coding-workflow.json'
import educationLearning from '../../../data/lessons/education-learning.json'
import workCareer from '../../../data/lessons/work-career.json'
import softwareEngineering from '../../../data/lessons/software-engineering.json'
import projectManagement from '../../../data/lessons/project-management.json'
import environmentClimate from '../../../data/lessons/environment-climate.json'
import technologySociety from '../../../data/lessons/technology-society.json'
import healthWellbeing from '../../../data/lessons/health-wellbeing.json'

// Lesson 注册表
const lessonRegistry: Lesson[] = [
  aiCodingWorkflow as Lesson,
  educationLearning as Lesson,
  workCareer as Lesson,
  softwareEngineering as Lesson,
  projectManagement as Lesson,
  environmentClimate as Lesson,
  technologySociety as Lesson,
  healthWellbeing as Lesson
]

// 按 ID 获取 lesson
export function getLessonById(id: string): Lesson | undefined {
  return lessonRegistry.find(l => l.lesson_id === id)
}

// 获取所有 lessons
export function getAllLessons(): Lesson[] {
  return lessonRegistry
}

// 按分类筛选
export function getLessonsByCategory(category: string): Lesson[] {
  return lessonRegistry.filter(l => l.category === category)
}

// 按考试标签筛选
export function getLessonsByExamTag(tag: string): Lesson[] {
  return lessonRegistry.filter(l => l.exam_tags?.includes(tag))
}

// 获取所有唯一的考试标签（含 chunk 级别）
export function getAllExamTags(): string[] {
  const tags = new Set<string>()
  lessonRegistry.forEach(l => {
    l.exam_tags?.forEach(t => tags.add(t))
    l.chunks?.forEach(c => {
      c.exam_tags?.forEach(t => tags.add(t))
    })
  })
  return Array.from(tags).sort()
}

// 获取所有唯一的主题标签
export function getAllThemeTags(): string[] {
  const tags = new Set<string>()
  lessonRegistry.forEach(l => {
    l.theme_tags?.forEach(t => tags.add(t))
  })
  return Array.from(tags).sort()
}

// 从收藏 ID 查找 chunk
export function getChunkById(chunkId: string): { chunk: Chunk; lesson: Lesson } | undefined {
  for (const lesson of lessonRegistry) {
    const chunk = lesson.chunks?.find(c => c.id === chunkId)
    if (chunk) {
      return { chunk: chunk as Chunk, lesson: lesson as Lesson }
    }
  }
  return undefined
}

// 类型导出
export type { Lesson, Chunk } from './types'
