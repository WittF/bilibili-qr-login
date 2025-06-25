<template>
  <div class="cookie-converter">
    <!-- 原始Cookie卡片 -->
    <div class="cookie-card">
      <div class="cookie-card__header">
        <h3 class="cookie-card__title">{{ t.cookie.info }}</h3>
        <button class="action-btn action-btn--primary" :disabled="isConverting" @click="convert">
          <ConvertIcon class="action-btn__icon" />
          <span class="action-btn__text">
            {{ isConverting ? t.cookie.converting : t.cookie.convert }}
          </span>
        </button>
      </div>

      <div class="cookie-card__content">
        <pre ref="pre" class="cookie-display" @click="copy">{{ value }}</pre>

        <transition name="fade-bounce">
          <div v-if="copied" class="copy-tooltip">
            <CheckCopyIcon class="copy-tooltip__icon" />
            <span>{{ t.cookie.copied }}</span>
          </div>
        </transition>
      </div>
    </div>

    <!-- 转换结果卡片 -->
    <transition name="slide-up">
      <div v-if="convertedData" class="result-card">
        <div class="result-card__header">
          <div class="result-indicator">
            <div class="result-indicator__dot"></div>
            <h3 class="result-indicator__title">{{ t.cookie.result }}</h3>
          </div>

          <div class="result-actions">
            <button class="action-btn action-btn--secondary" @click="copyConverted">
              <ContentCopyIcon class="action-btn__icon" />
              <span class="action-btn__text">{{ convertedCopyText }}</span>
            </button>
            <button class="action-btn action-btn--success" @click="downloadConverted">
              <DownloadIcon class="action-btn__icon" />
              <span class="action-btn__text">{{ t.cookie.download }}</span>
            </button>
          </div>
        </div>

        <div class="result-card__content">
          <div class="json-preview">
            <pre ref="convertedPre" class="json-display">{{ convertedData }}</pre>
          </div>
        </div>
      </div>
    </transition>

    <!-- 错误提示 -->
    <transition name="slide-up">
      <div v-if="errorMsg" class="error-card">
        <div class="error-content">
          <ErrorIcon class="error-content__icon" />
          <div class="error-content__message">
            <h4 class="error-content__title">转换失败</h4>
            <p class="error-content__text">{{ errorMsg }}</p>
          </div>
        </div>
      </div>
    </transition>
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
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cookies: props.value }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // 根据HTTP状态码提供更详细的错误信息
      switch (response.status) {
        case 400:
          throw new Error('Cookie数据格式错误');
        case 403:
          throw new Error('请求被服务器拒绝');
        case 429:
          throw new Error('请求过于频繁，请稍后重试');
        case 500:
          throw new Error('服务器内部错误');
        case 502:
        case 503:
        case 504:
          throw new Error('服务器暂时不可用');
        default:
          throw new Error(`${t.value.cookie.serverError} (${response.status})`);
      }
    }

    const result = await response.json();
    convertedData.value = JSON.stringify(result, null, 2);
  } catch (error) {
    let userErrorMsg = '';

    if (error instanceof Error) {
      switch (error.name) {
        case 'AbortError':
          userErrorMsg = '请求超时，请检查网络连接';
          break;
        case 'TypeError':
          // TypeError 通常表示网络连接问题
          userErrorMsg = '网络连接失败，请检查网络状态';
          break;
        case 'NetworkError':
          userErrorMsg = '网络连接失败，请检查网络状态';
          break;
        default:
          // 检查是否是fetch相关的网络错误
          if (
            error.message.includes('Failed to fetch') ||
            error.message.includes('Network request failed') ||
            error.message.includes('fetch')
          ) {
            userErrorMsg = '网络连接失败，请检查网络状态';
          } else {
            userErrorMsg = error.message;
          }
      }
      errorMsg.value = `${t.value.cookie.convertError}: ${userErrorMsg}`;
    } else {
      errorMsg.value = `${t.value.cookie.convertError}: ${t.value.cookie.unknownError}`;
    }

    // 记录详细错误信息
    loggers.cookie.error('Cookie转换失败', {
      errorType: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      isOnline: navigator.onLine,
    });
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
  gap: var(--spacing-lg);
}

// 基础卡片样式
.cookie-card {
  background: var(--card-background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--divider);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, var(--background) 0%, var(--card-background) 100%);
    border-bottom: 1px solid var(--divider);
  }

  &__title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__content {
    position: relative;
    padding: var(--spacing-lg);
  }
}

// 转换结果卡片
.result-card {
  background: var(--card-background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--bilibili-blue);
  box-shadow:
    var(--shadow-md),
    0 0 0 1px rgba(0, 161, 214, 0.1);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--bilibili-blue) 0%, var(--bilibili-pink) 100%);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, var(--bilibili-blue-light) 0%, transparent 100%);
    background-color: var(--background);
    border-bottom: 1px solid var(--divider);
  }

  &__content {
    padding: var(--spacing-lg);
  }
}

// 结果指示器
.result-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  &__dot {
    width: 8px;
    height: 8px;
    background: var(--success);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  &__title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
}

// 操作按钮组
.result-actions {
  display: flex;
  gap: var(--spacing-sm);
}

// 统一的按钮样式
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }

  &--primary {
    background: var(--bilibili-pink);
    color: white;
    box-shadow: 0 2px 8px rgba(251, 114, 153, 0.3);

    &:not(:disabled):hover {
      background: #ff5a8a;
      box-shadow: 0 4px 16px rgba(251, 114, 153, 0.4);
    }
  }

  &--secondary {
    background: var(--bilibili-blue);
    color: white;
    box-shadow: 0 2px 8px rgba(0, 161, 214, 0.3);

    &:not(:disabled):hover {
      background: #0090c7;
      box-shadow: 0 4px 16px rgba(0, 161, 214, 0.4);
    }
  }

  &--success {
    background: var(--success);
    color: white;
    box-shadow: 0 2px 8px rgba(68, 194, 133, 0.3);

    &:not(:disabled):hover {
      background: #39b876;
      box-shadow: 0 4px 16px rgba(68, 194, 133, 0.4);
    }
  }

  &__icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__text {
    font-weight: 500;
  }
}

// 数据显示区域
.cookie-display,
.json-display {
  width: 100%;
  margin: 0;
  padding: var(--spacing-md);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--background);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  white-space: pre-wrap;
  word-break: break-all;
  overflow: auto;
  transition: all 0.3s ease;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--background);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--text-tertiary);
    border-radius: 3px;
  }
}

.cookie-display {
  max-height: 120px;
  cursor: pointer;

  &:hover {
    background: var(--hover-background);
    border-color: var(--bilibili-blue);
  }
}

.json-preview {
  position: relative;
}

.json-display {
  max-height: 240px;
  background: var(--bilibili-pink-light);
  border-color: var(--bilibili-pink-border);
}

// 复制提示
.copy-tooltip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--success);
  color: white;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  z-index: 10;

  &__icon {
    width: 16px;
    height: 16px;

    svg {
      width: 100%;
      height: 100%;
    }
  }
}

// 错误卡片
.error-card {
  background: var(--card-background);
  border: 1px solid var(--error);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    var(--shadow-sm),
    0 0 0 1px rgba(247, 98, 96, 0.1);
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);

  &__icon {
    width: 20px;
    height: 20px;
    color: var(--error);
    flex-shrink: 0;
    margin-top: 2px;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__message {
    flex: 1;
  }

  &__title {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--error);
  }

  &__text {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-secondary);
  }
}

// 动画
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-bounce-enter-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fade-bounce-leave-active {
  transition: all 0.2s ease-out;
}

.fade-bounce-enter-from,
.fade-bounce-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

// 响应式设计
@media (max-width: 768px) {
  .cookie-card__header,
  .result-card__header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .result-actions {
    justify-content: center;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .cookie-display,
  .json-display {
    font-size: 0.8rem;
  }

  .error-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .cookie-converter {
    gap: var(--spacing-md);
  }

  .cookie-card__content,
  .result-card__content {
    padding: var(--spacing-md);
  }

  .cookie-card__header,
  .result-card__header {
    padding: var(--spacing-md);
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>
