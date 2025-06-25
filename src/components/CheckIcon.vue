<template>
  <div class="check-icon">
    <CheckIconGreen v-if="!isDarkTheme" />
    <CheckIconWhite v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CheckIconGreen from '../assets/icons/check_circle.svg';
import CheckIconWhite from '../assets/icons/check_circle_white.svg';

// 检测当前是否为暗色主题
const isDarkTheme = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'dark';
});
</script>

<style scoped lang="less">
.check-icon {
  display: block;
  width: 64px;
  height: 64px;

  svg {
    width: 100%;
    height: 100%;
    display: block;
    transition: transform 0.3s ease;
  }

  // 响应式调整
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }
}
</style>
