<template>
  <div class="refresh-btn btn flex"><RefreshIcon /></div>
</template>

<script setup lang="ts">
import RefreshIcon from '../assets/icons/refresh.svg';
</script>

<style scoped lang="less">
.refresh-btn {
  width: 36px;
  height: 36px;
  background-color: var(--card-background);
  border-radius: var(--radius-round);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  color: var(--bilibili-blue);
  transition: all 0.3s ease;
  transform-origin: center;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: scale(1.05);
  }

  &:active {
    color: var(--bilibili-pink);
    transform: scale(0.95) rotate(30deg);
  }

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(30deg);
  }
}

// 暗色主题下的特殊样式
[data-theme='dark'] .refresh-btn {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--bilibili-blue);

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--bilibili-pink);
  }
}
</style>
