<template>
  <button
    class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
    :title="stateTitle"
    @click.stop="handleClick"
  >
    <span v-if="state === 'idle'">🔊</span>
    <span v-else-if="state === 'playing'" class="animate-pulse">⏸️</span>
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
