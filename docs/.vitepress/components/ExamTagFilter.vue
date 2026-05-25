<template>
  <!-- 考试标签筛选组件 -->
  <div class="ecn-tag-filter">
    <div class="ecn-mode-tabs">
      <button
        class="ecn-btn ecn-btn-sm"
        :class="{ 'ecn-btn-active': !selectedTag }"
        @click="$emit('select', '')"
      >
        全部
      </button>
      <button
        v-for="tag in tags"
        :key="tag"
        class="ecn-btn ecn-btn-sm"
        :class="{ 'ecn-btn-active': selectedTag === tag }"
        @click="$emit('select', tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tags: string[]
  selectedTag: string
}>()

defineEmits<{
  select: [tag: string]
}>()
</script>
