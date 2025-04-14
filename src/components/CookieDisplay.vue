<template>
  <div class="cookie">
    <div class="cookie__header">
      <span class="cookie__title">Cookie 信息</span>
      <div class="cookie__copy btn" @click="copy">
        <CopyIcon class="cookie__icon" />
        <span>{{ text }}</span>
      </div>
    </div>
    <pre ref="pre" class="cookie__pre">{{ value }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CopyIcon from '../assets/icons/content_copy.svg';
import { useTipText } from '../utils/tipText';

defineProps<{ value: string }>();

const pre = ref<HTMLElement>();
const { text, changeText } = useTipText('复制');

const copy = () => {
  const selection = window.getSelection()!;
  const range = window.document.createRange();
  selection.removeAllRanges();
  range.selectNode(pre.value!);
  selection.addRange(range);
  window.document.execCommand('copy');
  selection.removeAllRanges();
  changeText('已复制');
};
</script>

<style lang="less" scoped>
.cookie {
  width: 100%;
  max-width: 596px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #eee;
  }

  &__title {
    font-size: 1rem;
    font-weight: 500;
    color: #333;
  }

  &__copy {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    background-color: #00a1d6;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: darken(#00a1d6, 5%);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &__icon {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  &__pre {
    margin: 0;
    padding: 16px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #333;
    background-color: white;
    text-wrap: wrap;
    word-break: break-all;
    white-space: pre-wrap;
  }
}
</style>
