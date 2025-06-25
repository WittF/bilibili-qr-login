<template>
  <div class="check-icon" :class="{ 'check-icon--success': true }">
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
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 64px !important;
  height: 64px !important;
  position: relative !important;
  top: 0 !important;
  left: 0 !important;
  transform: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: none !important;
  box-shadow: none !important;
  outline: none !important;

  // 防止任何调试信息显示
  &::before,
  &::after {
    display: none !important;
    content: none !important;
  }

  svg {
    width: 24px !important; // 保持原始尺寸
    height: 24px !important; // 保持原始尺寸
    display: block !important;
    position: relative !important;
    margin: 0 auto !important;
    padding: 0 !important;
    border: none !important;
    background: none !important;
    box-shadow: none !important;
    outline: none !important;

    // 从24px缩放到64px
    transform: scale(2.67) !important;
    transform-origin: center center !important;

    // 确保SVG正确填充和对齐
    object-fit: contain !important;
    object-position: center !important;

    transition: transform 0.3s ease;

    // 防止SVG上的调试信息
    &::before,
    &::after {
      display: none !important;
      content: none !important;
    }
  }

  // 确保成功状态下的样式
  &--success {
    z-index: 1;

    svg {
      filter: drop-shadow(0 2px 8px rgba(68, 194, 133, 0.3));
    }
  }

  // 响应式调整
  @media (max-width: 768px) {
    width: 56px !important;
    height: 56px !important;

    svg {
      width: 24px !important; // 保持原始尺寸
      height: 24px !important; // 保持原始尺寸
      transform: scale(2.33) !important; // 从24px缩放到56px (56/24=2.33)
    }
  }
}

// 清除任何可能的调试样式
.check-icon * {
  &::before,
  &::after {
    display: none !important;
    content: none !important;
  }
}
</style>
