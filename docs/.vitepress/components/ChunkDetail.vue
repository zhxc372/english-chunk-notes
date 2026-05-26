<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
      <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg" @click="$emit('close')">✕</button>

      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ chunk.canonical }}</h3>
      <p class="text-base text-gray-500 dark:text-gray-400 mb-4">{{ chunk.meaningZh }}</p>

      <div v-if="chunk.surfaceForms?.length" class="mb-4">
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">变形形式</div>
        <div class="flex flex-wrap gap-1.5">
          <code v-for="f in chunk.surfaceForms" :key="f" class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">{{ f }}</code>
        </div>
      </div>

      <div v-if="chunk.aliases?.length" class="mb-4">
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">近义表达</div>
        <div class="flex flex-wrap gap-1.5">
          <code v-for="a in chunk.aliases" :key="a" class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">{{ a }}</code>
        </div>
      </div>

      <div v-if="chunk.coreExamples?.length" class="mb-4">
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">例句</div>
        <div v-for="(ex, i) in chunk.coreExamples" :key="i" class="pl-3 border-l-2 border-gray-200 dark:border-gray-600 mb-2">
          <p class="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">{{ ex.text }} <TtsButton :text="ex.text" /></p>
          <p v-if="ex.zh" class="text-xs text-gray-400 mt-0.5">{{ ex.zh }}</p>
        </div>
      </div>

      <div v-if="chunk.tags?.length" class="flex flex-wrap gap-1.5">
        <span v-for="t in chunk.tags" :key="t" class="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-500">{{ t }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TtsButton from './TtsButton.vue'
import type { ChunkIndexItem } from '../../../types/content'

defineProps<{ chunk: ChunkIndexItem }>()
defineEmits<{ close: [] }>()
</script>
