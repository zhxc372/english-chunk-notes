/**
 * GlobalChunkProvider — 查全局词块库
 */
import type { DictionaryProvider, LookupInput, LookupResult } from '../types'
import { getChunkIndex } from '../../composables/useChunks'
import { normalize, stripArticles } from '../../utils/normalizeText'
import { lightLemmaPhrase } from '../../utils/lightLemma'

export const globalChunkProvider: DictionaryProvider = {
  name: 'globalChunk',

  async lookup(input: LookupInput): Promise<LookupResult | null> {
    const q = normalize(input.text)
    const qStripped = stripArticles(input.text)
    const qLemmatized = lightLemmaPhrase(input.text).toLowerCase()
    const chunks = getChunkIndex()

    for (const chunk of chunks) {
      // 1. canonical 精确匹配
      if (normalize(chunk.canonical) === q) {
        return buildResult(chunk)
      }

      // 2. 去冠词匹配
      if (stripArticles(chunk.canonical) === qStripped) {
        return buildResult(chunk)
      }

      // 3. surfaceForms 匹配
      if (chunk.surfaceForms?.some(sf => normalize(sf) === q)) {
        return buildResult(chunk)
      }

      // 4. aliases 匹配
      if (chunk.aliases?.some(a => normalize(a) === q)) {
        return buildResult(chunk)
      }

      // 5. 轻量词形还原匹配
      if (lightLemmaPhrase(chunk.canonical) === qLemmatized) {
        return buildResult(chunk)
      }
    }

    return null
  }
}

function buildResult(chunk: any): LookupResult {
  return {
    found: true,
    source: 'global_chunk',
    chunkId: chunk.id,
    canonical: chunk.canonical,
    meaningZh: chunk.meaningZh,
    examples: chunk.coreExamples
  }
}
