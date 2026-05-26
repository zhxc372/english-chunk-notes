/**
 * export-anki.ts - 导出闪卡为 JSON / Anki TSV / CSV
 * 
 * Usage:
 *   npx tsx tools/content-pipeline/export-anki.ts --format json --output export.json
 *   npx tsx tools/content-pipeline/export-anki.ts --format tsv --output anki-deck.tsv
 *   npx tsx tools/content-pipeline/export-anki.ts --format csv --output anki-deck.csv
 * 
 * Options:
 *   --format json|tsv|csv  (default: json)
 *   --output <path>        (default: dist/export.json)
 *   --lesson <id>          export from specific lesson
 *   --favorites            export from favorites (localStorage not available in CLI, uses all)
 *   --tag <tag>            export by tag
 *   --level <level>        filter by level
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import YAML from 'yaml'

interface ExportCard {
  id: string
  front: string
  back: string
  example?: string
  cloze?: string
  source?: string
  audio?: string
  tags: string[]
}

interface ExportData {
  schemaVersion: string
  exportedAt: string
  deck: {
    name: string
    source: string
    cards: ExportCard[]
  }
}

function parseArgs() {
  const args = process.argv.slice(2)
  const result: Record<string, string | boolean> = {
    format: 'json',
    output: 'dist/export',
    lesson: '',
    favorites: false,
    tag: '',
    level: ''
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!
    if (arg === '--format') result.format = args[++i] || 'json'
    else if (arg === '--output') result.output = args[++i] || 'dist/export'
    else if (arg === '--lesson') result.lesson = args[++i] || ''
    else if (arg === '--favorites') result.favorites = true
    else if (arg === '--tag') result.tag = args[++i] || ''
    else if (arg === '--level') result.level = args[++i] || ''
  }
  return result
}

function loadLessons(): ExportCard[] {
  const lessonsDir = path.resolve('data/lessons')
  const cards: ExportCard[] = []
  
  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json')) continue
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'))
        const lessonId = data.id || data.lesson_id
        const sourceName = data.source?.name || 'v0.1'
        const chunks = data.chunks || []
        
        for (const c of chunks) {
          const chunk = c.chunk || ''
          const meaningZh = c.meaningZh || c.meaning_cn || ''
          if (!chunk) continue
          
          const tags: string[] = []
          if (data.level) tags.push(data.level.toLowerCase())
          if (c.difficulty) tags.push(c.difficulty.toLowerCase())
          if (data.examTags) tags.push(...data.examTags.map((t: string) => t.toLowerCase()))
          if (c.tags) tags.push(...c.tags.map((t: string) => t.toLowerCase()))
          if (data.topicTags) tags.push(...data.topicTags.map((t: string) => t.toLowerCase()))
          
          // Deduplicate tags
          const uniqueTags = [...new Set(tags)]
          
          cards.push({
            id: c.id || `${lessonId}-${chunk.slice(0, 10)}`,
            front: chunk,
            back: meaningZh,
            example: c.example || c.sentence || c.sourceSentence || '',
            cloze: c.cloze?.question || '',
            source: sourceName,
            audio: c.audio || '',
            tags: uniqueTags
          })
        }
      } catch {
        // skip invalid files
      }
    }
  }
  
  // Scan root lessons (v0.1)
  scanDir(lessonsDir)
  // Scan subdirs
  for (const subdir of ['drafts', 'published']) {
    scanDir(path.join(lessonsDir, subdir))
  }
  
  return cards
}

function filterCards(cards: ExportCard[], opts: Record<string, string | boolean>): ExportCard[] {
  let result = cards
  
  // Filter by lesson
  if (opts.lesson) {
    result = result.filter(c => c.id.startsWith(opts.lesson as string))
  }
  
  // Filter by tag
  if (opts.tag) {
    const tag = (opts.tag as string).toLowerCase()
    result = result.filter(c => c.tags.some(t => t.includes(tag)))
  }
  
  // Filter by level
  if (opts.level) {
    const level = (opts.level as string).toUpperCase()
    result = result.filter(c => c.tags.some(t => t === level.toLowerCase()))
  }
  
  return result
}

function exportJSON(cards: ExportCard[], outputPath: string): void {
  const data: ExportData = {
    schemaVersion: 'flashcards.v0.2',
    exportedAt: new Date().toISOString(),
    deck: {
      name: 'English Chunk Notes Export',
      source: 'english-chunk-notes',
      cards
    }
  }
  
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')
}

function exportTSV(cards: ExportCard[], outputPath: string): void {
  const header = [
    '#separator:Tab',
    '#html:true',
    '#deck:English Chunk Notes',
    '#notetype:Basic',
    '#tags column:7',
    '#columns:Front\tBack\tExample\tCloze\tSource\tAudio\tTags'
  ].join('\n')
  
  const rows = cards.map(c => [
    c.front,
    c.back,
    c.example || '',
    c.cloze || '',
    c.source || '',
    c.audio ? `[sound:${c.audio}]` : '',
    c.tags.join(' ')
  ].join('\t'))
  
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, header + '\n' + rows.join('\n'), 'utf-8')
}

function exportCSV(cards: ExportCard[], outputPath: string): void {
  function escapeCSV(str: string): string {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }
  
  const header = 'Front,Back,Example,Cloze,Source,Audio,Tags'
  const rows = cards.map(c => [
    escapeCSV(c.front),
    escapeCSV(c.back),
    escapeCSV(c.example || ''),
    escapeCSV(c.cloze || ''),
    escapeCSV(c.source || ''),
    escapeCSV(c.audio || ''),
    escapeCSV(c.tags.join(' '))
  ].join(','))
  
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  // Write with BOM for Excel compatibility
  fs.writeFileSync(outputPath, '\uFEFF' + header + '\n' + rows.join('\n'), 'utf-8')
}

// Main
const opts = parseArgs()
const allCards = loadLessons()
const cards = filterCards(allCards, opts)

if (cards.length === 0) {
  console.log('📭 No cards to export')
  process.exit(0)
}

const format = opts.format as string
const outputPath = opts.output as string
const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'tsv'
const finalPath = outputPath.endsWith(`.${ext}`) ? outputPath : `${outputPath}.${ext}`

if (format === 'json') exportJSON(cards, finalPath)
else if (format === 'csv') exportCSV(cards, finalPath)
else exportTSV(cards, finalPath)

console.log(`✅ Exported ${cards.length} cards → ${finalPath}`)
