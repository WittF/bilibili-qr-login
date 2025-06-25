<template>
  <div class="cookie-converter">
    <div class="cookie-card">
      <div class="cookie-card__header">
        <div class="cookie-card__title">
          <span>{{ t.cookie.info }}</span>
        </div>
        <div class="cookie-card__actions">
          <button class="cookie-btn cookie-btn--convert" :disabled="isConverting" @click="convert">
            <ConvertIcon class="cookie-btn__icon" />
            <span class="cookie-btn__text">
              {{ isConverting ? t.cookie.converting : t.cookie.convert }}
            </span>
          </button>
        </div>
      </div>

      <div class="cookie-card__content">
        <pre ref="pre" class="cookie-card__pre" @click="copy">{{ value }}</pre>

        <div class="cookie-card__copy-indicator" :class="{ 'cookie-card__copy-indicator--visible': copied }">
          <CheckCopyIcon class="cookie-card__copy-icon" />
          <span>{{ t.cookie.copied }}</span>
        </div>
      </div>
    </div>

    <div v-if="convertedData" class="cookie-card cookie-card--result">
      <div class="cookie-card__header">
        <div class="cookie-card__title">
          <span>{{ t.cookie.result }}</span>
        </div>
        <div class="cookie-card__actions">
          <button class="cookie-btn cookie-btn--copy" @click="copyConverted">
            <ContentCopyIcon class="cookie-btn__icon" />
            <span class="cookie-btn__text">{{ convertedCopyText }}</span>
          </button>
          <button class="cookie-btn cookie-btn--download" @click="downloadConverted">
            <DownloadIcon class="cookie-btn__icon" />
            <span class="cookie-btn__text">{{ t.cookie.download }}</span>
          </button>
        </div>
      </div>

      <div class="cookie-card__content">
        <pre ref="convertedPre" class="cookie-card__pre cookie-card__pre--result">{{ convertedData }}</pre>
      </div>
    </div>

    <div v-if="errorMsg" class="cookie-card cookie-card--error">
      <div class="cookie-card__error">
        <ErrorIcon class="cookie-card__error-icon" />
        <span>{{ errorMsg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTipText } from '../utils/tipText';
import { useI18n } from '../utils/i18n';
import { loggers } from '../utils/logger';
import ConvertIcon from '../assets/icons/convert.svg';
import ContentCopyIcon from '../assets/icons/content_copy.svg';
import DownloadIcon from '../assets/icons/download.svg';
import CheckCopyIcon from '../assets/icons/check_copy.svg';
import ErrorIcon from '../assets/icons/error.svg';

const props = defineProps<{ value: string }>();
const { t } = useI18n();

const pre = ref<HTMLElement>();
const convertedPre = ref<HTMLElement>();
const { text: convertedCopyText, changeText: changeConvertedCopyText } = useTipText(() => t.value.cookie.copy);
const convertedData = ref('');
const errorMsg = ref('');
const isConverting = ref(false);
const copied = ref(false);

const copy = () => {
  const selection = window.getSelection()!;
  const range = window.document.createRange();
  selection.removeAllRanges();
  range.selectNode(pre.value!);
  selection.addRange(range);
  window.document.execCommand('copy');
  selection.removeAllRanges();
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1200);
};

const copyConverted = () => {
  const selection = window.getSelection()!;
  const range = window.document.createRange();
  selection.removeAllRanges();
  range.selectNode(convertedPre.value!);
  selection.addRange(range);
  window.document.execCommand('copy');
  selection.removeAllRanges();
  changeConvertedCopyText(t.value.cookie.copied);
};

const downloadConverted = () => {
  if (!convertedData.value) return;
  const blob = new Blob([convertedData.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date()
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14);
  a.href = url;
  a.download = `bilibili-cookie-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

const isValidCookie = (cookie: string): boolean => {
  // 简单检查是否包含常见的必要cookie
  return cookie.includes('SESSDATA') && cookie.includes('bili_jct') && cookie.includes('DedeUserID');
};

const convert = async () => {
  errorMsg.value = '';

  // 检查cookie格式
  if (!isValidCookie(props.value)) {
    errorMsg.value = t.value.cookie.formatError;
    return;
  }

  isConverting.value = true;

  try {
    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cookies: props.value }),
    });

    if (!response.ok) {
      throw new Error(`${t.value.cookie.serverError} (${response.status})`);
    }

    const result = await response.json();
    convertedData.value = JSON.stringify(result, null, 2);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : t.value.cookie.unknownError;
    errorMsg.value = `${t.value.cookie.convertError}: ${errorMessage}`;

    loggers.cookie.error('Cookie转换失败', error);
  } finally {
    isConverting.value = false;
  }
};
</script>

<style lang="less" scoped>
.cookie-converter {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.cookie-card {
  width: 100%;
  border-radius: var(--radius-lg);
  background-color: var(--card-background);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--divider);
  transition: all 0.2s ease;

  &--result {
    // 移除左边框，保持简洁风格
  }

  &--error {
    border-left: 3px solid var(--error);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background-color: var(--background);
    border-bottom: 1px solid var(--divider);
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  &__content {
    position: relative;
  }

  &__copy-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--card-background);
    color: var(--text-primary);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--divider);
    box-shadow: var(--shadow-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    z-index: 10;

    &--visible {
      opacity: 1;
      visibility: visible;
    }
  }

  &__copy-icon {
    color: var(--success);
    width: 16px;
    height: 16px;
    flex-shrink: 0;

    svg {
      width: 16px;
      height: 16px;
      display: block;
    }
  }

  &__pre {
    margin: 0;
    padding: var(--spacing-md);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-primary);
    background-color: var(--card-background);
    text-wrap: wrap;
    word-break: break-all;
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--background);
      border-radius: var(--radius-sm);
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--text-tertiary);
      border-radius: var(--radius-sm);
    }

    &:hover {
      background-color: var(--hover-background);
    }

    &--result {
      background-color: var(--background);
      cursor: text;
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    color: var(--error);
    font-size: 0.95rem;
  }

  &__error-icon {
    color: var(--error);
    width: 20px;
    height: 20px;
    flex-shrink: 0;

    svg {
      width: 20px;
      height: 20px;
      display: block;
    }
  }
}

// 简洁的按钮样式
.cookie-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  background-color: var(--card-background);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: var(--hover-background);
    border-color: var(--text-tertiary);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &--convert {
    color: var(--bilibili-pink);
    border-color: var(--bilibili-pink);

    &:hover:not(:disabled) {
      background-color: var(--bilibili-pink-light);
      border-color: var(--bilibili-pink);
    }
  }

  &--copy {
    color: var(--bilibili-blue);
    border-color: var(--bilibili-blue);

    &:hover {
      background-color: rgba(0, 161, 214, 0.08);
      border-color: var(--bilibili-blue);
    }
  }

  &--download {
    color: var(--success);
    border-color: var(--success);

    &:hover {
      background-color: rgba(68, 194, 133, 0.08);
      border-color: var(--success);
    }
  }

  &__icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;

    svg {
      width: 16px;
      height: 16px;
      display: block;
    }
  }

  &__text {
    flex: 1;
  }
}

// 响应式优化
@media (max-width: 768px) {
  .cookie-card {
    &__header {
      padding: var(--spacing-sm) var(--spacing-md);
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    &__actions {
      width: 100%;
      justify-content: flex-end;
    }

    &__pre {
      padding: var(--spacing-sm) var(--spacing-md);
      max-height: 150px;
      font-size: 0.85rem;
    }
  }

  .cookie-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.85rem;
  }
}

// 简单的过渡动画
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
