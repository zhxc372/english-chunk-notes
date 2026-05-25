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
import governmentPolitics from '../../../data/lessons/government-politics.json'
import crimePunishment from '../../../data/lessons/crime-punishment.json'
import mediaAdvertising from '../../../data/lessons/media-advertising.json'
import globalizationTrade from '../../../data/lessons/globalization-trade.json'
import cultureTourism from '../../../data/lessons/culture-tourism.json'
import familyChildren from '../../../data/lessons/family-children.json'
import transportUrbanization from '../../../data/lessons/transport-urbanization.json'
import housingArchitecture from '../../../data/lessons/housing-architecture.json'
import sportLeisure from '../../../data/lessons/sport-leisure.json'
import languageCommunication from '../../../data/lessons/language-communication.json'
import socialProblems from '../../../data/lessons/social-problems.json'
import animalRights from '../../../data/lessons/animal-rights.json'
import foodDiet from '../../../data/lessons/food-diet.json'
import aiAutomation from '../../../data/lessons/ai-automation.json'
import systemDesign from '../../../data/lessons/system-design.json'

// Lesson 注册表
const lessonRegistry: Lesson[] = [
  // Technical English
  aiCodingWorkflow as Lesson,
  softwareEngineering as Lesson,
  projectManagement as Lesson,
  systemDesign as Lesson,
  aiAutomation as Lesson,
  // General English
  educationLearning as Lesson,
  workCareer as Lesson,
  environmentClimate as Lesson,
  technologySociety as Lesson,
  healthWellbeing as Lesson,
  governmentPolitics as Lesson,
  crimePunishment as Lesson,
  mediaAdvertising as Lesson,
  globalizationTrade as Lesson,
  cultureTourism as Lesson,
  familyChildren as Lesson,
  transportUrbanization as Lesson,
  housingArchitecture as Lesson,
  sportLeisure as Lesson,
  languageCommunication as Lesson,
  socialProblems as Lesson,
  animalRights as Lesson,
  foodDiet as Lesson
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
