<template>
  <button
    class="tts-btn"
    :title="stateTitle"
    :aria-label="stateTitle"
    @click.stop="handleClick"
  >
    <span v-if="state === 'idle'">🔊</span>
    <span v-else-if="state === 'playing'" class="tts-pulse">⏸️</span>
    <span v-else>▶️</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { toggle, speak, getTtsState, onTtsStateChange, stop, type TtsState } from '../utils/browserTts'

const props = withDefaults(defineProps<{
  text: string
  lang?: 'en-US' | 'en-GB'
}>(), {
  lang: 'en-US'
})

const state = ref<TtsState>('idle')
let unsubscribe: (() => void) | null = null

const stateTitle = ref('朗读')

onMounted(() => {
  state.value = getTtsState()
  unsubscribe = onTtsStateChange((s) => {
    state.value = s
    if (s === 'idle') stateTitle.value = '朗读'
    else if (s === 'playing') stateTitle.value = '暂停'
    else stateTitle.value = '继续'
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

function handleClick() {
  if (state.value === 'playing' || state.value === 'paused') {
    toggle(props.text, { lang: props.lang })
  } else {
    speak(props.text, { lang: props.lang })
  }
}
</script>

<style scoped>
.tts-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.tts-btn:hover {
  background: var(--vp-c-bg-mute);
}

.tts-pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
