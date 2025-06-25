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
            <div class="cookie-card__btn-text">
              <transition name="text-fade" mode="out-in">
                <span :key="isConverting ? 'converting' : 'convert'">
                  {{ isConverting ? t.cookie.converting : t.cookie.convert }}
                </span>
              </transition>
            </div>
          </button>
        </div>
      </div>

      <div class="cookie-card__content">
        <pre ref="pre" class="cookie-card__pre" @click="copy">{{ value }}</pre>

        <div class="cookie-card__copy-indicator" :class="{ 'cookie-card__copy-indicator--visible': copied }">
          <CheckCopyIcon class="cookie-card__copy-icon" />
          <transition name="text-fade" mode="out-in">
            <span :key="t.cookie.copied">{{ t.cookie.copied }}</span>
          </transition>
        </div>
      </div>
    </div>

    <transition name="fade-slide">
      <div v-if="convertedData" class="result-card">
        <!-- 成功状态指示器 -->
        <div class="result-card__status">
          <div class="result-card__success-indicator">
            <CheckCopyIcon class="result-card__success-icon" />
            <span class="result-card__success-text">转换成功</span>
          </div>
          <div class="result-card__timestamp">
            {{ new Date().toLocaleTimeString('zh-CN', { hour12: false }) }}
          </div>
        </div>

        <!-- 结果统计信息 -->
        <div class="result-card__stats">
          <div class="result-card__stat">
            <span class="result-card__stat-label">数据大小</span>
            <span class="result-card__stat-value">{{ getDataSize(convertedData) }}</span>
          </div>
          <div class="result-card__stat">
            <span class="result-card__stat-label">格式</span>
            <span class="result-card__stat-value">JSON</span>
          </div>
          <div class="result-card__stat">
            <span class="result-card__stat-label">字段数</span>
            <span class="result-card__stat-value">{{ getFieldCount(convertedData) }}</span>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="result-card__main">
          <div class="result-card__header">
            <div class="result-card__title">
              <transition name="text-fade" mode="out-in">
                <span :key="t.cookie.result">{{ t.cookie.result }}</span>
              </transition>
            </div>
            <div class="result-card__actions">
              <button class="result-card__btn result-card__btn--copy" @click="copyConverted">
                <ContentCopyIcon class="result-card__icon" />
                <div class="result-card__btn-text">
                  <transition name="text-fade" mode="out-in">
                    <span :key="convertedCopyText">{{ convertedCopyText }}</span>
                  </transition>
                </div>
              </button>
              <button class="result-card__btn result-card__btn--download" @click="downloadConverted">
                <DownloadIcon class="result-card__icon" />
                <div class="result-card__btn-text">
                  <transition name="text-fade" mode="out-in">
                    <span :key="t.cookie.download">{{ t.cookie.download }}</span>
                  </transition>
                </div>
              </button>
            </div>
          </div>

          <div class="result-card__content">
            <div class="result-card__content-header">
              <span class="result-card__content-label">转换结果</span>
              <div class="result-card__content-meta">
                <span class="result-card__content-type">application/json</span>
              </div>
            </div>
            <div class="result-card__code-container">
              <pre ref="convertedPre" class="result-card__code">{{ convertedData }}</pre>
              <div class="result-card__code-overlay">
                <div class="result-card__copy-hint">点击复制 JSON 数据</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 装饰性元素 -->
        <div class="result-card__decoration">
          <div class="result-card__glow"></div>
          <div class="result-card__pattern"></div>
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

  // 添加视觉反馈
  if (convertedPre.value) {
    convertedPre.value.style.background = 'var(--bilibili-pink-light)';
    convertedPre.value.style.transform = 'scale(1.02)';
    setTimeout(() => {
      if (convertedPre.value) {
        convertedPre.value.style.background = '';
        convertedPre.value.style.transform = '';
      }
    }, 300);
  }
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

const getDataSize = (data: string): string => {
  const byteSize = new TextEncoder().encode(data).length;
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = byteSize;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

const getFieldCount = (data: string): number => {
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
  } catch {
    return 0;
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
    transition:
      all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.15s ease;
    justify-content: center;
    overflow: hidden;
    position: relative;
    will-change: width, transform;

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
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
        box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
      }
    }

    &--copy {
      background-color: var(--bilibili-blue);

      &:hover {
        filter: brightness(1.1);
        box-shadow: 0 4px 12px rgba(0, 161, 214, 0.3);
      }
    }

    &--download {
      background-color: var(--success);

      &:hover {
        filter: brightness(1.1);
        box-shadow: 0 4px 12px rgba(68, 194, 133, 0.3);
      }
    }
  }

  &__btn-text {
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    overflow: hidden;
    will-change: width;
    position: relative;

    span {
      display: inline-block;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.15s ease;
    will-change: transform;
    position: relative;

    svg {
      width: 16px !important;
      height: 16px !important;
      display: block;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

// 新的转换结果卡片样式
.result-card {
  position: relative;
  width: 100%;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--card-background) 0%, var(--background) 100%);
  box-shadow:
    var(--shadow-lg),
    0 0 0 1px rgba(251, 114, 153, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--bilibili-pink-border);
  animation: resultCardEnter 0.6s ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 12px 24px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(251, 114, 153, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  // 成功状态指示器
  &__status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(90deg, var(--bilibili-pink-light) 0%, var(--bilibili-blue-light) 100%);
    border-bottom: 1px solid var(--bilibili-pink-border);
  }

  &__success-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  &__success-icon {
    width: 16px;
    height: 16px;
    color: var(--success);
    animation: successBounce 0.6s ease-out 0.3s both;

    svg {
      width: 16px !important;
      height: 16px !important;
    }
  }

  &__success-text {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--success);
    text-shadow: 0 1px 2px rgba(68, 194, 133, 0.3);
  }

  &__timestamp {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    font-weight: 500;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--overlay-light);
    border-radius: var(--radius-sm);
    backdrop-filter: blur(4px);
  }

  // 统计信息区域
  &__stats {
    display: flex;
    justify-content: space-around;
    padding: var(--spacing-md);
    background: var(--overlay-light);
    border-bottom: 1px solid var(--divider);
    gap: var(--spacing-sm);
  }

  &__stat {
    flex: 1;
    text-align: center;
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    background: var(--card-background);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      background: var(--overlay-medium);
      transform: translateY(-1px);
    }
  }

  &__stat-label {
    display: block;
    font-size: 0.7rem;
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-xs);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  &__stat-value {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--bilibili-pink);
    text-shadow: 0 1px 2px rgba(251, 114, 153, 0.3);
  }

  // 主要内容区域
  &__main {
    position: relative;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--card-background);
    border-bottom: 1px solid var(--divider);
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    background: linear-gradient(45deg, var(--bilibili-pink) 0%, var(--bilibili-blue) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    &:hover::before {
      left: 100%;
    }

    &:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: scale(0.98);
    }

    &--copy {
      background: linear-gradient(135deg, var(--bilibili-blue) 0%, #0088cc 100%);
      box-shadow: 0 4px 12px rgba(0, 161, 214, 0.3);

      &:hover {
        box-shadow: 0 6px 20px rgba(0, 161, 214, 0.4);
      }
    }

    &--download {
      background: linear-gradient(135deg, var(--success) 0%, #35a373 100%);
      box-shadow: 0 4px 12px rgba(68, 194, 133, 0.3);

      &:hover {
        box-shadow: 0 6px 20px rgba(68, 194, 133, 0.4);
      }
    }
  }

  &__btn-text {
    transition: all 0.3s ease;
    white-space: nowrap;

    span {
      display: inline-block;
      transition: all 0.3s ease;
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;

    svg {
      width: 16px !important;
      height: 16px !important;
    }
  }

  // 内容区域
  &__content {
    background: var(--card-background);
  }

  &__content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--overlay-light);
    border-bottom: 1px solid var(--divider);
  }

  &__content-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__content-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  &__content-type {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    background: var(--overlay-medium);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  }

  &__code-container {
    position: relative;
    max-height: 280px;
    overflow: hidden;
  }

  &__code {
    margin: 0;
    padding: var(--spacing-md);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--card-background) 0%, var(--overlay-light) 100%);
    white-space: pre-wrap;
    word-break: break-all;
    overflow-y: auto;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    outline: none;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: var(--background);
      border-radius: var(--radius-sm);
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, var(--bilibili-pink) 0%, var(--bilibili-blue) 100%);
      border-radius: var(--radius-sm);

      &:hover {
        background: linear-gradient(180deg, var(--bilibili-blue) 0%, var(--bilibili-pink) 100%);
      }
    }

    &:hover {
      background: var(--overlay-medium);
      box-shadow: inset 0 0 0 1px var(--bilibili-pink-border);
    }
  }

  &__code-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, var(--card-background));
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &__copy-hint {
    text-align: center;
    font-size: 0.8rem;
    color: var(--text-tertiary);
    font-weight: 500;
  }

  &__code-container:hover &__code-overlay {
    opacity: 1;
  }

  // 装饰性元素
  &__decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: -1;
  }

  &__glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(251, 114, 153, 0.1) 0%, transparent 70%);
    animation: glowPulse 4s ease-in-out infinite;
  }

  &__pattern {
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: linear-gradient(45deg, transparent 40%, rgba(251, 114, 153, 0.05) 50%, transparent 60%);
    opacity: 0.3;
  }

  // 响应式设计
  @media (max-width: 768px) {
    &__stats {
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    &__stat {
      padding: var(--spacing-xs);
    }

    &__header {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }

    &__actions {
      justify-content: center;
    }

    &__btn {
      flex: 1;
      justify-content: center;
    }

    &__code {
      font-size: 0.8rem;
      padding: var(--spacing-sm);
    }

    &__code-container {
      max-height: 200px;
    }
  }
}

// 动画定义
@keyframes resultCardEnter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes successBounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
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

// 文本切换动画
.text-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}

.text-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}

.text-fade-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.text-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(1.02);
}

.text-fade-enter-to,
.text-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
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
