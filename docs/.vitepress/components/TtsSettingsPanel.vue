<template>
  <div class="tts-settings">
    <h4>朗读设置</h4>
    
    <div class="setting-row">
      <label>语速 ({{ settings.rate.toFixed(1) }})</label>
      <input type="range" min="0.5" max="2" step="0.1" v-model.number="settings.rate" @change="save" />
    </div>

    <div class="setting-row">
      <label>音调 ({{ settings.pitch.toFixed(1) }})</label>
      <input type="range" min="0.5" max="2" step="0.1" v-model.number="settings.pitch" @change="save" />
    </div>

    <div class="setting-row">
      <label>音量 ({{ (settings.volume * 100).toFixed(0) }}%)</label>
      <input type="range" min="0" max="1" step="0.1" v-model.number="settings.volume" @change="save" />
    </div>

    <div class="setting-row">
      <label>口音</label>
      <select v-model="settings.lang" @change="save">
        <option value="en-US">美式英语</option>
        <option value="en-GB">英式英语</option>
      </select>
    </div>

    <div class="setting-row">
      <label>声音</label>
      <select v-model="settings.voicePreference" @change="save">
        <option value="auto">自动</option>
        <option value="female-like">偏女声</option>
        <option value="male-like">偏男声</option>
        <option v-for="voice in voices" :key="voice.voiceURI" :value="voice.voiceURI">
          {{ voice.name }} ({{ voice.lang }})
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadTtsSettings, saveTtsSettings, getEnglishVoices, type TtsSettings } from '../utils/browserTts'

const settings = ref<TtsSettings>(loadTtsSettings())
const voices = ref<SpeechSynthesisVoice[]>([])

function save() {
  saveTtsSettings(settings.value)
}

onMounted(() => {
  voices.value = getEnglishVoices()
  speechSynthesis.addEventListener('voiceschanged', () => {
    voices.value = getEnglishVoices()
  })
})
</script>

<style scoped>
.tts-settings {
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.tts-settings h4 {
  margin: 0 0 12px;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.setting-row label {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  min-width: 120px;
}

.setting-row input[type="range"] {
  flex: 1;
  max-width: 200px;
}

.setting-row select {
  flex: 1;
  max-width: 200px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
}
</style>
