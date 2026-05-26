/**
 * ExternalLinkProvider — 未命中时提供外部词典链接
 */
import type { DictionaryProvider, LookupInput, LookupResult } from '../types'

export const externalLinkProvider: DictionaryProvider = {
  name: 'external',

  async lookup(input: LookupInput): Promise<LookupResult | null> {
    const encoded = encodeURIComponent(input.text.trim())
    return {
      found: false,
      source: 'external',
      externalUrl: `https://www.dictionary.com/browse/${encoded}`
    }
  }
}
