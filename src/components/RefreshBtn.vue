<template>
  <div class="refresh-btn btn flex"><RefreshIcon /></div>
</template>

<script setup lang="ts">
import RefreshIcon from '../assets/icons/refresh.svg';
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
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(30deg);
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
