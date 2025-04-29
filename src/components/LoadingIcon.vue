<template>
  <div class="loader"></div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.loader {
  width: 48px;
  height: 48px;
  aspect-ratio: 1;
  border-radius: var(--radius-round);
  position: relative;
  background: conic-gradient(transparent 25%, var(--bilibili-pink));
  animation: rotate 1s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: var(--radius-round);
    background-color: var(--bilibili-pink);
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
  }

  &::after {
    content: '';
    position: absolute;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-round);
    background-color: white;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
