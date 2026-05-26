/**
 * browserTts.ts — Web Speech API TTS Provider
 * 纯浏览器端朗读，不依赖任何MP3或外部API
 */

export type VoicePreference = 'auto' | 'female-like' | 'male-like' | string // string = voiceURI

export interface TtsSettings {
  rate: number       // 0.1 - 10, default 1
  pitch: number      // 0 - 2, default 1
  volume: number     // 0 - 1, default 1
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

/** 从 localStorage 读取设置 */
export function loadTtsSettings(): TtsSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS }
}

/** 保存设置到 localStorage */
export function saveTtsSettings(settings: TtsSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

/** 获取可用英语声音列表 */
export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'))
}

/** 根据偏好选择声音 */
function pickVoice(preference: VoicePreference, lang: string): SpeechSynthesisVoice | null {
  const voices = getEnglishVoices().filter(v => v.lang === lang)
  if (voices.length === 0) return null

  if (preference === 'auto') return voices[0] || null

  if (preference === 'female-like') {
    // Heuristic: match common female voice name patterns
    const female = voices.find(v =>
      /female|woman|zira|samantha|karen|victoria|fiona|susan|kate|alice/i.test(v.name)
    )
    return female || voices[0]
  }

  if (preference === 'male-like') {
    const male = voices.find(v =>
      /male|man|david|daniel|james|tom|alex|george|richard|mark/i.test(v.name) &&
      !/female/i.test(v.name)
    )
    return male || voices[0]
  }

  // voiceURI
  const match = voices.find(v => v.voiceURI === preference)
  return match || voices[0]
}

/** 当前播放状态 */
export type TtsState = 'idle' | 'playing' | 'paused'

let currentState: TtsState = 'idle'
const listeners: ((state: TtsState) => void)[] = []

function setState(state: TtsState) {
  currentState = state
  listeners.forEach(fn => fn(state))
}

/** 监听播放状态变化 */
export function onTtsStateChange(fn: (state: TtsState) => void): () => void {
  listeners.push(fn)
  return () => {
    const idx = listeners.indexOf(fn)
    if (idx >= 0) listeners.splice(idx, 1)
  }
}

/** 获取当前状态 */
export function getTtsState(): TtsState {
  return currentState
}

/** 朗读文本 */
export function speak(text: string, settings?: Partial<TtsSettings>): void {
  if (!window.speechSynthesis) return

  // Stop any current speech
  speechSynthesis.cancel()

  const s = { ...loadTtsSettings(), ...settings }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = s.lang
  utterance.rate = s.rate
  utterance.pitch = s.pitch
  utterance.volume = s.volume

  const voice = pickVoice(s.voicePreference, s.lang)
  if (voice) utterance.voice = voice

  utterance.onstart = () => setState('playing')
  utterance.onend = () => setState('idle')
  utterance.onerror = () => setState('idle')
  utterance.onpause = () => setState('paused')
  utterance.onresume = () => setState('playing')

  speechSynthesis.speak(utterance)
}

/** 暂停 */
export function pause(): void {
  speechSynthesis.pause()
}

/** 恢复 */
export function resume(): void {
  speechSynthesis.resume()
}

/** 停止 */
export function stop(): void {
  speechSynthesis.cancel()
  setState('idle')
}

/** 切换播放/暂停 */
export function toggle(text: string, settings?: Partial<TtsSettings>): void {
  if (currentState === 'playing') {
    pause()
  } else if (currentState === 'paused') {
    resume()
  } else {
    speak(text, settings)
  }
}
