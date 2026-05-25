<template>
  <!-- 音频播放器组件 -->
  <div class="ecn-audio">
    <span v-if="!audioSrc" style="color: var(--vp-c-text-3); font-size: 0.8rem;">
      🔇 音频待生成
    </span>
    <template v-else>
      <span>🎧</span>
      <audio controls preload="none" :src="audioSrc">
        浏览器不支持音频播放
      </audio>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  audioSrc: string
}>()
</script>
