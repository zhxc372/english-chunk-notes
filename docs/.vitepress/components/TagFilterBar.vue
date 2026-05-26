<template>
  <div class="tag-filter-bar">
    <div class="tag-groups">
      <div v-for="group in tagGroups" :key="group.key" class="tag-group">
        <span class="tag-group-label">{{ group.label }}</span>
        <div class="tag-group-items">
          <button
            v-for="tag in group.items"
            :key="tag"
            class="tag-btn"
            :class="{ active: isActive(group.key, tag) }"
            @click="toggle(group.key, tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>
    <button v-if="activeTags.length" class="clear-all" @click="$emit('clear')">
      清除筛选
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

interface TagItem {
  group: string
  value: string
}

const props = defineProps({
  tags: { type: Array as PropType<TagItem[]>, required: true },
  activeTags: { type: Array as PropType<TagItem[]>, default: () => [] }
})

const emit = defineEmits<{
  toggle: [tag: TagItem]
  clear: []
}>()

const GROUP_LABELS: Record<string, string> = {
  level: '难度',
  topic: '主题',
  exam: '考试',
  useCase: '用途',
  source: '来源'
}

const tagGroups = computed(() => {
  const map = new Map<string, Set<string>>()
  for (const tag of props.tags) {
    if (!map.has(tag.group)) map.set(tag.group, new Set())
    map.get(tag.group)!.add(tag.value)
  }
  return Array.from(map.entries()).map(([key, values]) => ({
    key,
    label: GROUP_LABELS[key] || key,
    items: Array.from(values).sort()
  }))
})

function isActive(group: string, value: string): boolean {
  return props.activeTags.some(t => t.group === group && t.value === value)
}

function toggle(group: string, value: string) {
  emit('toggle', { group, value })
}
</script>

<style scoped>
.tag-filter-bar {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.tag-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-group-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  min-width: 36px;
  padding-top: 4px;
  flex-shrink: 0;
}

.tag-group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-btn {
  display: inline-block;
  padding: 3px 10px;
  font-size: 0.78rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.tag-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.tag-btn.active {
  background: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  color: #fff;
}

.clear-all {
  margin-top: 10px;
  padding: 4px 12px;
  font-size: 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.clear-all:hover {
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

@media (max-width: 768px) {
  .tag-group {
    flex-direction: column;
    gap: 4px;
  }

  .tag-group-label {
    padding-top: 0;
  }
}
</style>
