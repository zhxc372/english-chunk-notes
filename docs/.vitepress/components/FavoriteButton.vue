<template>
  <!-- 收藏按钮组件 -->
  <button
    class="ecn-fav-btn"
    :class="{ active: isFav }"
    @click.stop="toggle"
    :title="isFav ? '取消收藏' : '收藏'"
    :aria-label="isFav ? '取消收藏' : '收藏'"
  >
    {{ isFav ? '❤️' : '🤍' }}
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { isFavorite, addFavorite, removeFavorite } from '../data/types'

const props = defineProps<{
  chunkId: string
  lessonId: string
}>()

const isFav = ref(false)

function toggle() {
  if (isFav.value) {
    removeFavorite(props.chunkId)
    isFav.value = false
  } else {
    addFavorite(props.chunkId, props.lessonId)
    isFav.value = true
  }
}

onMounted(() => {
  isFav.value = isFavorite(props.chunkId)
})
</script>
