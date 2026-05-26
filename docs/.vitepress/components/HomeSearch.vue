<template>
  <div class="home-search">
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="search-input"
        @input="onInput"
        @keyup.escape="clear"
      />
      <button v-if="query" class="search-clear" @click="clear" title="清除">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{ modelValue?: string }>(), {
  modelValue: ''
})

const emit = defineEmits<{
  search: [query: string]
  clear: []
}>()

const inputRef = ref<HTMLInputElement>()
const query = ref(props.modelValue)

const placeholder = computed(() => {
  return '搜索词块、中文含义...'
})

function onInput() {
  emit('search', query.value)
}

function clear() {
  query.value = ''
  emit('clear')
  inputRef.value?.blur()
}
</script>

<style scoped>
.home-search {
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box:focus-within {
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.search-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
  outline: none;
  width: 100%;
}

.search-input::placeholder {
  color: var(--vp-c-text-3);
}

.search-clear {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}

.search-clear:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
}
</style>
