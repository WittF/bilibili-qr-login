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
  display: block !important;
  width: 64px !important;
  height: 64px !important;
  position: static !important;
  top: auto !important;
  left: auto !important;
  transform: none !important;

  svg {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    transition: transform 0.3s ease;
    position: static !important;
  }

  // 响应式调整
  @media (max-width: 768px) {
    width: 56px !important;
    height: 56px !important;
  }
}
</style>
