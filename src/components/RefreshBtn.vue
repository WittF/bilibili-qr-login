<template>
  <div
    class="refresh-btn btn flex"
    tabindex="0"
    role="button"
    :aria-label="t.common.refresh"
    @keydown="handleKeyDown"
    @click="handleClick"
  >
    <RefreshIcon v-if="!isDarkTheme" />
    <RefreshWhiteIcon v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../utils/i18n';
import RefreshIcon from '../assets/icons/refresh.svg';
import RefreshWhiteIcon from '../assets/icons/refresh-white.svg';

const { t } = useI18n();

// 定义事件
const emit = defineEmits<{
  click: [event: Event];
}>();

// 检测当前是否为暗色主题
const isDarkTheme = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'dark';
});

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick(event);
  }
};

// 处理点击事件
const handleClick = (event: Event) => {
  emit('click', event);
};
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
    transform: translateY(0) scale(0.98);
  }

  // 特殊的聚焦效果已在全局样式中定义

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(90deg);
  }

  &:active svg {
    transform: rotate(180deg);
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
