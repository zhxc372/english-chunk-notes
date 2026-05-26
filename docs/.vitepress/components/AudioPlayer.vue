<template>
  <!-- 音频播放器组件 -->
  <div class="ecn-audio">
    <span v-if="!audioSrc" style="color: var(--vp-c-text-3); font-size: 0.8rem;">
      🔇 音频待生成
    </span>
    <template v-else>
      <span>🎧</span>
      <audio controls preload="none" :src="resolvedSrc">
        浏览器不支持音频播放
      </audio>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{
  audioSrc: string
}>()

const resolvedSrc = computed(() => withBase(props.audioSrc))
</script>
