<template>
  <div class="cookie-converter">
    <div class="cookie-card">
      <div class="cookie-card__header">
        <div class="cookie-card__title">
          <span>{{ t.cookie.info }}</span>
        </div>
        <div class="cookie-card__actions">
          <button class="cookie-card__btn cookie-card__btn--convert" :disabled="isConverting" @click="convert">
            <ConvertIcon class="cookie-card__icon" />
            <span v-if="isConverting">{{ t.cookie.converting }}</span>
            <span v-else>{{ t.cookie.convert }}</span>
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

    <transition name="fade-slide">
      <div v-if="convertedData" class="cookie-card cookie-card--result">
        <div class="cookie-card__header">
          <div class="cookie-card__title">
            <span>{{ t.cookie.result }}</span>
          </div>
          <div class="cookie-card__actions">
            <button class="cookie-card__btn cookie-card__btn--copy" @click="copyConverted">
              <ContentCopyIcon class="cookie-card__icon" />
              <span>{{ convertedCopyText }}</span>
            </button>
            <button class="cookie-card__btn cookie-card__btn--download" @click="downloadConverted">
              <DownloadIcon class="cookie-card__icon" />
              <span>{{ t.cookie.download }}</span>
            </button>
          </div>
        </div>

        <div class="cookie-card__content">
          <pre ref="convertedPre" class="cookie-card__pre cookie-card__pre--result">{{ convertedData }}</pre>
        </div>
      </div>
    </transition>

    <transition name="fade-slide">
      <div v-if="errorMsg" class="cookie-card cookie-card--error">
        <div class="cookie-card__error">
          <ErrorIcon class="cookie-card__error-icon" />
          <span>{{ errorMsg }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTipText } from '../utils/tipText';
import { useI18n } from '../utils/i18n';
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
  // 不立即清空convertedData，避免跳动

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
      throw new Error(t.value.cookie.serverError);
    }

    const result = await response.json();
    convertedData.value = JSON.stringify(result, null, 2);
  } catch (error) {
    errorMsg.value = `${t.value.cookie.convertError}: ${error instanceof Error ? error.message : t.value.cookie.unknownError}`;
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
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--divider);

  &--result {
    border-left: 3px solid var(--bilibili-blue);
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

  &__btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-md);
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 64px;
    justify-content: center;

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.98);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    &--convert {
      background-color: var(--bilibili-pink);

      &:hover {
        filter: brightness(1.1);
      }
    }

    &--copy {
      background-color: var(--bilibili-blue);

      &:hover {
        filter: brightness(1.1);
      }
    }

    &--download {
      background-color: var(--success);

      &:hover {
        filter: brightness(1.1);
      }
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 16px !important;
      height: 16px !important;
      display: block;
    }
  }

  &__copy-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--loading-bg);
    color: var(--text-primary);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-md);
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
      animation: fadeInOut 1.2s ease-in-out;
    }
  }

  &__copy-icon {
    color: var(--text-primary);
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 16px !important;
      height: 16px !important;
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
    transition: background 0.2s ease;

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
      background: var(--overlay-mask);
    }

    &--result {
      background-color: var(--bilibili-pink-light);
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
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 20px !important;
      height: 20px !important;
      display: block;
    }
  }
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

// 淡入滑动动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .cookie-card {
    &__header {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    &__pre {
      padding: var(--spacing-sm) var(--spacing-md);
      max-height: 150px;
      font-size: 0.85rem;
    }

    &__btn {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: 0.85rem;
    }
  }
}
</style>
