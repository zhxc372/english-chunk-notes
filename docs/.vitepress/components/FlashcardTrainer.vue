<template>
  <div class="max-w-2xl mx-auto">
    <!-- 模式选择 -->
    <div v-if="!started || cards.length === 0">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">🃏 闪卡训练</h2>
      <div v-if="cards.length === 0" class="text-center py-16 text-gray-400">
        <div class="text-4xl mb-4">📭</div>
        <p>没有可训练的词块</p>
        <p class="text-sm mt-2">先去文章页或词块库收藏词块</p>
      </div>
      <div v-else>
        <p class="text-gray-500 dark:text-gray-400 mb-6">共 {{ cards.length }} 个词块，选择训练模式：</p>
        <div class="grid grid-cols-2 gap-3">
          <button v-for="m in modes" :key="m.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer transition-all text-left" @click="startMode(m.id)">
            <div class="text-2xl mb-1">{{ m.icon }}</div>
            <div class="font-semibold text-gray-800 dark:text-gray-100">{{ m.name }}</div>
            <div class="text-xs text-gray-400 mt-0.5">{{ m.desc }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 训练中 -->
    <div v-else>
      <div class="flex items-center justify-between mb-3">
        <button v-if="isExternalMode" class="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click="$emit('exit')">← 返回</button>
        <button v-else class="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click="started = false">← 返回</button>
        <span class="text-sm text-gray-400">{{ modeLabel }}</span>
        <span class="text-sm text-gray-400">{{ currentIndex + 1 }} / {{ cards.length }}</span>
      </div>

      <div class="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
        <div class="h-full bg-blue-500 rounded-full transition-all" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <!-- Card display -->
      <div v-if="currentCard">
        <!-- en2cn -->
        <template v-if="mode === 'en2cn'">
          <div class="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer text-center min-h-[200px] flex items-center justify-center" @click="showAnswer = !showAnswer">
            <div v-if="!showAnswer">
              <div class="text-xs text-gray-400 mb-2">英文词块</div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentCard.chunk }}</div>
            </div>
            <div v-else>
              <div class="text-xs text-gray-400 mb-2">中文含义</div>
              <div class="text-2xl font-bold text-blue-500 mb-2">{{ currentCard.meaning }}</div>
              <div v-if="currentCard.example" class="text-sm text-gray-400">"{{ currentCard.example }}"</div>
            </div>
          </div>
        </template>

        <!-- cn2en -->
        <template v-if="mode === 'cn2en'">
          <div class="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer text-center min-h-[200px] flex items-center justify-center" @click="showAnswer = !showAnswer">
            <div v-if="!showAnswer">
              <div class="text-xs text-gray-400 mb-2">中文含义</div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentCard.meaning }}</div>
            </div>
            <div v-else>
              <div class="text-xs text-gray-400 mb-2">英文词块</div>
              <div class="text-2xl font-bold text-blue-500">{{ currentCard.chunk }}</div>
            </div>
          </div>
        </template>

        <!-- fill -->
        <template v-if="mode === 'fill'">
          <div class="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div class="text-xs text-gray-400 mb-3">句子填空</div>
            <p class="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
              <template v-for="(part, i) in fillParts" :key="i">
                <span>{{ part.text }}</span>
                <span v-if="part.isBlank" class="px-1 border-b-2 border-blue-400 text-blue-500 font-bold" :class="{ 'bg-blue-50 dark:bg-blue-900/30 rounded': showAnswer }">{{ showAnswer ? currentCard.chunk : '____' }}</span>
              </template>
            </p>
          </div>
        </template>

        <!-- dictation -->
        <template v-if="mode === 'dictation'">
          <div class="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div class="text-xs text-gray-400 mb-3">听写训练</div>
            <div class="mb-4">
              <TtsButton :text="currentCard.example || currentCard.chunk" class="text-lg" />
              <span class="text-sm text-gray-400 ml-2">点击朗读</span>
            </div>
            <div v-if="!showAnswer">
              <textarea v-model="userInput" class="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" placeholder="输入你听到的句子..." rows="3"></textarea>
              <p class="text-xs text-gray-400 mt-1">点击下方按钮查看答案</p>
            </div>
            <div v-if="showAnswer" class="space-y-2">
              <div class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm text-gray-700 dark:text-gray-300">✅ {{ currentCard.example || currentCard.chunk }}</div>
              <div v-if="userInput" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-500">你的输入：{{ userInput }}</div>
            </div>
          </div>
        </template>

        <!-- Controls -->
        <div class="flex justify-center gap-3 mt-6">
          <template v-if="showAnswer">
            <button class="px-6 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" @click="mark(false)">😞 不熟</button>
            <button class="px-6 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors" @click="mark(true)">👍 记住了</button>
          </template>
          <template v-else>
            <button class="px-6 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors" @click="showAnswer = true">
              {{ mode === 'fill' ? '显示答案' : mode === 'dictation' ? '查看答案' : '翻转卡片' }}
            </button>
          </template>
        </div>
      </div>

      <!-- Finished -->
      <div v-if="!currentCard && finished" class="text-center py-12">
        <div class="text-5xl mb-4">🎉</div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">训练完成！</h3>
        <div class="flex justify-center gap-8 mb-6">
          <div><span class="text-3xl font-bold text-green-500">{{ knownCount }}</span><div class="text-xs text-gray-400">记住</div></div>
          <div><span class="text-3xl font-bold text-red-400">{{ unknownCount }}</span><div class="text-xs text-gray-400">不熟</div></div>
        </div>
        <div class="flex justify-center gap-3">
          <button class="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600" @click="restart">再来一轮</button>
          <button class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600" @click="started = false">返回选择</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { withBase } from 'vitepress'
import TtsButton from './TtsButton.vue'

export interface Card {
  id: string
  chunk: string
  meaning: string
  example?: string
  tags?: string[]
}

type TrainMode = 'en2cn' | 'cn2en' | 'fill' | 'dictation'

const modes = [
  { id: 'en2cn' as TrainMode, icon: '🔤', name: '英译中', desc: '看英文词块，回忆中文含义' },
  { id: 'cn2en' as TrainMode, icon: '🔤', name: '中译英', desc: '看中文含义，回忆英文词块' },
  { id: 'fill' as TrainMode, icon: '✏️', name: '句子填空', desc: '补全例句中的词块' },
  { id: 'dictation' as TrainMode, icon: '🎧', name: '听写', desc: '听朗读，写出句子' }
]

const props = withDefaults(defineProps<{
  chunks?: Card[]
  initialMode?: TrainMode
}>(), {
  chunks: undefined,
  initialMode: undefined
})

const emit = defineEmits<{ (e: 'exit'): void }>()

const isExternalMode = computed(() => !!props.chunks)
const mode = ref<TrainMode>('en2cn')
const started = ref(false)
const currentIndex = ref(0)
const showAnswer = ref(false)
const knownCount = ref(0)
const unknownCount = ref(0)
const finished = ref(false)
const userInput = ref('')

// Internal cards (from favorites)
const internalCards = ref<Card[]>([])

const cards = computed(() => {
  if (isExternalMode.value && props.chunks) return props.chunks
  return internalCards.value
})

const currentCard = computed(() => {
  if (finished.value) return null
  return cards.value[currentIndex.value] || null
})

const progressPercent = computed(() => {
  if (cards.value.length === 0) return 0
  return ((currentIndex.value + (showAnswer.value ? 1 : 0)) / cards.value.length) * 100
})

const modeLabel = computed(() => modes.find(m => m.id === mode.value)?.name || '')

const fillParts = computed(() => {
  if (!currentCard.value?.example || !currentCard.value.chunk) return [{ text: currentCard.value?.example || '', isBlank: false }]
  const sentence = currentCard.value.example
  const chunkLower = currentCard.value.chunk.toLowerCase()
  const idx = sentence.toLowerCase().indexOf(chunkLower)
  if (idx < 0) return [{ text: sentence, isBlank: false }]
  return [
    { text: sentence.slice(0, idx), isBlank: false },
    { text: '', isBlank: true },
    { text: sentence.slice(idx + currentCard.value.chunk.length), isBlank: false }
  ]
})

function startMode(m: TrainMode) {
  mode.value = m
  started.value = true
  currentIndex.value = 0
  showAnswer.value = false
  knownCount.value = 0
  unknownCount.value = 0
  finished.value = false
  userInput.value = ''
}

function mark(known: boolean) {
  if (known) knownCount.value++
  else unknownCount.value++
  showAnswer.value = false
  userInput.value = ''
  if (currentIndex.value < cards.value.length - 1) {
    currentIndex.value++
  } else {
    finished.value = true
  }
}

function restart() {
  currentIndex.value = 0
  showAnswer.value = false
  knownCount.value = 0
  unknownCount.value = 0
  finished.value = false
  userInput.value = ''
}

function handleBack() {
  if (isExternalMode.value) emit('exit')
  else started.value = false
}

// Load internal cards from v0.1 favorites
onMounted(() => {
  if (!isExternalMode.value) {
    loadInternalCards()
  }
})

function loadInternalCards() {
  try {
    // v0.2 favorites from localStorage
    const raw = localStorage.getItem('ecn-favorites')
    if (raw) {
      const ids: string[] = JSON.parse(raw)
      // Try to load from v0.1 loader
      import('../data/loader').then(loader => {
        const cards: Card[] = []
        for (const id of ids) {
          const found = loader.getChunkById(id)
          if (found) {
            cards.push({
              id: found.chunk.id,
              chunk: found.chunk.chunk,
              meaning: found.chunk.meaning_cn || '',
              example: found.chunk.sentence || '',
              tags: [...(found.chunk.tags || []), ...(found.chunk.exam_tags || [])]
            })
          }
        }
        internalCards.value = cards
      })
    }
  } catch { /* ignore */ }
}

// External mode auto-start
watch(() => props.chunks, (newChunks) => {
  if (newChunks && newChunks.length > 0) {
    started.value = true
    currentIndex.value = 0
    finished.value = false
  }
}, { immediate: true })

watch(() => [props.chunks, props.initialMode], ([chunks, initMode]) => {
  if (chunks && chunks.length > 0 && initMode) {
    mode.value = initMode
  }
}, { immediate: true })
</script>
