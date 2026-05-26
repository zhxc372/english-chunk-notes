/**
 * select-daily-sources.ts - 从 enabled sources 中选择每日要抓取的文章
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import YAML from 'yaml'

interface SourceConfig {
  id: string
  name: string
  enabled: boolean
  type: string
  url: string
  usagePolicy: string
  levelRange: string[]
  topicTags: string[]
  examTags: string[]
  useCaseTags: string[]
  quotaWeight: number
}

interface SourcesYaml {
  version: number
  daily: {
    enabled: boolean
    maxArticlesPerDay: number
    minPublicDomainArticles: number
    maxSummaryOnlyArticles: number
    outputDir: string
    historyFile: string
  }
  sources: SourceConfig[]
}

interface HistoryEntry {
  url: string
  id: string
  status: string
  date: string
}

export function loadSourcesConfig(configPath = 'config/sources.yaml'): SourcesYaml {
  const raw = fs.readFileSync(path.resolve(configPath), 'utf-8')
  return YAML.parse(raw) as SourcesYaml
}

export function loadHistory(historyPath = 'data/ingest/history.json'): HistoryEntry[] {
  const resolved = path.resolve(historyPath)
  if (!fs.existsSync(resolved)) return []
  return JSON.parse(fs.readFileSync(resolved, 'utf-8'))
}

export function selectDailySources(
  config: SourcesYaml,
  history: HistoryEntry[],
  limit?: number
): SourceConfig[] {
  const maxArticles = limit || config.daily.maxArticlesPerDay
  const enabledSources = config.sources.filter(s => s.enabled && s.type !== 'manual')

  // Get recent URLs (last 7 days) to avoid duplicates
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentUrls = new Set(
    history
      .filter(h => new Date(h.date) > sevenDaysAgo)
      .map(h => h.url)
  )

  // Sort by quotaWeight descending
  const sorted = [...enabledSources]
    .sort((a, b) => b.quotaWeight - a.quotaWeight)

  // Select based on policy quotas
  const selected: SourceConfig[] = []
  let publicDomainCount = 0
  let summaryOnlyCount = 0

  for (const source of sorted) {
    if (selected.length >= maxArticles) break
    if (recentUrls.has(source.url)) continue

    if (source.usagePolicy === 'full_text_allowed') {
      if (publicDomainCount >= config.daily.minPublicDomainArticles) continue
      publicDomainCount++
    } else if (source.usagePolicy === 'summary_chunks_only') {
      if (summaryOnlyCount >= config.daily.maxSummaryOnlyArticles) continue
      summaryOnlyCount++
    }

    selected.push(source)
  }

  return selected
}
