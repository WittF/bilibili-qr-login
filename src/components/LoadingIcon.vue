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
  animation: rotate 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
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
    animation: dotPulse 1.5s ease-in-out infinite;
    box-shadow: 0 0 10px rgba(251, 114, 153, 0.3);
  }

  &::after {
    content: '';
    position: absolute;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-round);
    background-color: var(--card-background);
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

@keyframes dotPulse {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    box-shadow: 0 0 10px rgba(251, 114, 153, 0.3);
  }
  50% {
    transform: translateX(-50%) scale(1.2);
    box-shadow: 0 0 15px rgba(251, 114, 153, 0.6);
  }
}
</style>
