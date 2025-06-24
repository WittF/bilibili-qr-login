<template>
  <div class="refresh-btn btn flex">
    <RefreshIcon v-if="!isDarkTheme" />
    <RefreshWhiteIcon v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import RefreshIcon from '../assets/icons/refresh.svg';
import RefreshWhiteIcon from '../assets/icons/refresh-white.svg';

// 检测当前是否为暗色主题
const isDarkTheme = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'dark';
});
</script>

<style scoped lang="less">
.refresh-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-round);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  user-select: none;

  // 使用统一的半透明变量
  background-color: var(--overlay-light);
  border: 1px solid var(--overlay-medium);

  &:hover {
    transform: translateY(-2px);
    background-color: var(--overlay-medium);
    border-color: var(--overlay-strong);
    box-shadow: var(--shadow-md);
  }

  &:active {
    background-color: var(--overlay-strong);
  }

  svg {
    width: 20px;
    height: 20px;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: center;
  }

  &:hover svg {
    transform: rotate(180deg) scale(1.1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  &:active svg {
    transform: rotate(360deg) scale(0.95);
    transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
}

// 暗色主题下的特殊颜色调整
[data-theme='dark'] .refresh-btn {
  color: var(--text-primary);

  &:hover {
    color: var(--bilibili-blue);
  }

  &:active {
    color: var(--bilibili-pink);
  }
}
</style>
