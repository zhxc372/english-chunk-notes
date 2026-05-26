/**
 * browserTts.ts — Web Speech API TTS Provider
 * 纯浏览器端朗读，不依赖任何MP3或外部API
 * 
 * 关键设计：每个 TtsButton 独立管理自己的播放状态，
 * 点击任何新按钮会自动取消之前的播放。
 */

export type VoicePreference = 'auto' | 'female-like' | 'male-like' | string

export interface TtsSettings {
  rate: number
  pitch: number
  volume: number
  lang: 'en-US' | 'en-GB'
  voicePreference: VoicePreference
}

const SETTINGS_KEY = 'ecn-tts-settings'

const DEFAULT_SETTINGS: TtsSettings = {
  rate: 0.9,
  pitch: 1,
  volume: 1,
  lang: 'en-US',
  voicePreference: 'auto'
}

export function loadTtsSettings(): TtsSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS }
}

export function saveTtsSettings(settings: TtsSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'))
}

function pickVoice(preference: VoicePreference, lang: string): SpeechSynthesisVoice | null {
  const voices = getEnglishVoices().filter(v => v.lang === lang)
  if (voices.length === 0) return null

  if (preference === 'auto') return voices[0] || null

  if (preference === 'female-like') {
    const female = voices.find(v =>
      /zira|samantha|karen|victoria|fiona|susan|kate|alice|hazel|sarah|linda|catherine/i.test(v.name)
    )
    return female || voices[0]
  }

  if (preference === 'male-like') {
    const male = voices.find(v =>
      /david|daniel|james|george|richard|mark|thomas|paul|steven|microsoft david/i.test(v.name)
    )
    return male || voices[0]
  }

  const match = voices.find(v => v.voiceURI === preference)
  return match || voices[0]
}

// ── TTS Context（每个按钮独立） ──────────────────────────

export type TtsState = 'idle' | 'playing' | 'paused'

let activeContext: TtsContext | null = null

export class TtsContext {
  state: TtsState = 'idle'
  private listener: ((state: TtsState) => void) | null = null
  private currentText: string = ''
  private currentSettings: Partial<TtsSettings> = {}

  constructor() {}

  onStateChange(fn: (state: TtsState) => void) {
    this.listener = fn
  }

  private setState(s: TtsState) {
    this.state = s
    this.listener?.(s)
  }

  /** 播放。会自动取消其他 context 的播放 */
  speak(text: string, settings?: Partial<TtsSettings>) {
    if (!window.speechSynthesis) return

    // 取消其他 context
    if (activeContext && activeContext !== this) {
      activeContext.stop()
    }
    activeContext = this

    speechSynthesis.cancel()
    this.currentText = text
    this.currentSettings = settings || {}

    const s = { ...loadTtsSettings(), ...settings }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = s.lang
    utterance.rate = s.rate
    utterance.pitch = s.pitch
    utterance.volume = s.volume

    const voice = pickVoice(s.voicePreference, s.lang)
    if (voice) utterance.voice = voice

    utterance.onstart = () => this.setState('playing')
    utterance.onend = () => { this.setState('idle'); if (activeContext === this) activeContext = null }
    utterance.onerror = () => { this.setState('idle'); if (activeContext === this) activeContext = null }
    utterance.onpause = () => this.setState('paused')
    utterance.onresume = () => this.setState('playing')

    speechSynthesis.speak(utterance)
  }

  pause() {
    if (activeContext === this) speechSynthesis.pause()
  }

  resume() {
    if (activeContext === this) speechSynthesis.resume()
  }

  stop() {
    if (activeContext === this) {
      speechSynthesis.cancel()
      activeContext = null
    }
    this.setState('idle')
  }

  toggle(text: string, settings?: Partial<TtsSettings>) {
    if (this.state === 'playing') {
      this.pause()
    } else if (this.state === 'paused') {
      this.resume()
    } else {
      this.speak(text, settings)
    }
  }

  destroy() {
    if (activeContext === this) {
      speechSynthesis.cancel()
      activeContext = null
    }
    this.listener = null
  }
}
