<template>
  <div class="container">
    <div class="content-wrapper">
      <div class="header">
        <div class="header__top">
          <LanguageSwitcher />
        </div>
        <h1 class="title">{{ PARAM_MODE ? t.title.login : t.title.cookieTool }}</h1>
        <p class="subtitle">
          {{ PARAM_MODE ? t.subtitle.login : t.subtitle.cookieTool }}
        </p>
      </div>

      <div class="main-content">
        <div class="qrcode-container" :class="{ 'qrcode-container--with-cookie': state.cookie && !PARAM_MODE }">
          <div class="qrcode flex no-select card" :class="{ 'qrcode--scanned': showCheckIcon }">
            <transition name="fade" mode="out-in">
              <QrCode v-if="state.url" :value="state.url" :options="qrCodeOption" />
              <div v-else class="qrcode__placeholder">
                <div class="qrcode__loading-animation"></div>
              </div>
            </transition>
            <div v-if="state.status !== QrStatus.WAIT" class="qrcode__mask flex">
              <LoadingIcon v-if="state.status === QrStatus.LOADING" />
              <div v-else class="qrcode__actions flex">
                <CheckIcon v-if="showCheckIcon" class="icon--success" />
                <RefreshBtn
                  class="icon--refresh"
                  :class="{ 'always-visible': state.status === QrStatus.EXPIRED }"
                  @click="handleRestart"
                />
              </div>
            </div>
          </div>

          <p class="status-text" :class="getStatusClass">{{ getters.statusText }}</p>

          <div class="footer-links">
            <a
              href="https://github.com/WittF/bilibili-qr-login"
              target="_blank"
              rel="noopener noreferrer"
              class="github-link"
              title="查看源码"
            >
              <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
                />
              </svg>
              <span class="github-text">{{ t.common.viewSource }}</span>
            </a>
          </div>
        </div>

        <div v-if="!PARAM_MODE" class="cookie-container">
          <transition name="fade-height" mode="out-in">
            <CookieDisplay v-if="state.cookie" key="cookie-display" :value="state.cookie" />
            <div v-else-if="hasCookieBeforeReset" key="cookie-placeholder" class="cookie-placeholder"></div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QrCode from '@chenfengyuan/vue-qrcode';
import { computed, onBeforeUnmount, ref, onMounted } from 'vue';
import RefreshBtn from './components/RefreshBtn.vue';
import CookieDisplay from './components/CookieDisplay.vue';
import LoadingIcon from './components/LoadingIcon.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import CheckIcon from './components/CheckIcon.vue';
import { useQrSSE, QrStatus } from './utils/qrSSE';
import { useI18n } from './utils/i18n';
import { PARAM_MODE } from './utils/const';
import { themeManager } from './utils/theme';
import type { QRCodeRenderersOptions } from 'qrcode';

const { t, updatePageTitle } = useI18n();

// 初始化页面标题和主题
onMounted(() => {
  updatePageTitle();
  // 确保主题管理器正确初始化
  themeManager.reinitialize();
});

const qrCodeOption: QRCodeRenderersOptions = {
  margin: 0,
  width: 196,
  color: {
    dark: '#18191C',
    light: '#FFFFFF',
  },
};

const { state, getters, restart, stop } = useQrSSE();
const hasCookieBeforeReset = ref(false);

const showCheckIcon = computed(() => state.status === QrStatus.SCANNED || state.status === QrStatus.SUCCESS);

const getStatusClass = computed(() => {
  switch (state.status) {
    case QrStatus.LOADING:
      return 'status-text--loading';
    case QrStatus.WAIT:
      return 'status-text--waiting';
    case QrStatus.SCANNED:
      return 'status-text--scanned';
    case QrStatus.EXPIRED:
      return 'status-text--expired';
    case QrStatus.SUCCESS:
      return 'status-text--success';
    case QrStatus.ERROR:
      return 'status-text--error';
    default:
      return '';
  }
});

const handleRestart = () => {
  if (state.cookie) {
    hasCookieBeforeReset.value = true;
    // 延迟重置，让动画有时间过渡
    setTimeout(() => {
      restart();
      // 延迟清除标记，让动画有时间完成
      setTimeout(() => {
        hasCookieBeforeReset.value = false;
      }, 500);
    }, 100);
  } else {
    restart();
  }
};

onBeforeUnmount(stop);
</script>

<style scoped lang="less">
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  animation: fadeIn 0.5s ease-in-out;
  min-width: 320px;
  overflow: visible;

  /* 当内容较少时才居中 */
  @media (min-height: 800px) {
    justify-content: center;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 650px;
  overflow: visible;
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  width: 100%;
}

.header__top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-md);
  width: 100%;
}

.title {
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: var(--bilibili-pink);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  letter-spacing: -0.5px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: clamp(0.9rem, 3vw, 1.1rem);
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  transition: all 0.3s ease;
  width: 100%;
  max-width: 100%;
  overflow: visible;

  &--with-cookie {
    margin-bottom: var(--spacing-sm);
    transform: scale(0.95);
  }
}

.qrcode {
  position: relative;
  width: 228px;
  height: 228px;
  padding: var(--spacing-md);
  transition: all 0.3s ease;

  &--scanned {
    box-shadow:
      0 0 0 2px var(--success),
      var(--shadow-md);
  }

  &__mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--qr-mask-bg);
    border-radius: var(--radius-lg);
    backdrop-filter: blur(4px);
    transition: all 0.3s ease;
    animation: fadeIn 0.3s ease;
  }

  &__placeholder {
    width: 196px;
    height: 196px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--qr-placeholder-bg);
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  &__loading-animation {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid var(--loading-bg);
    border-top-color: var(--bilibili-blue);
    animation: spin 1s linear infinite;
    transition: border-color 0.3s ease;
  }

  &__actions {
    position: relative;
    width: 100%;
    height: 100%;
    flex-direction: column;
    transition: all 0.3s ease;

    .icon--success {
      position: absolute;
      transition:
        transform 0.3s ease,
        opacity 0.3s ease;
    }

    .icon--refresh {
      position: absolute;
      bottom: 20px;
      opacity: 0;
      transform: translateY(10px);
      transition:
        transform 0.3s ease,
        opacity 0.3s ease;
    }

    &:hover {
      .icon--success {
        transform: translateY(-30px);
      }

      .icon--refresh {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
}

// 过期状态时，刷新按钮始终可见
.icon--refresh.always-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.cookie-container {
  width: 100%;
  margin-top: var(--spacing-sm);
  transition: all 0.3s ease;
}

.cookie-placeholder {
  width: 100%;
  height: 180px;
  border-radius: var(--radius-lg);
  background-color: transparent;
}

.icon {
  &--refresh {
    width: 42px;
    height: 42px;
  }
}

// 高度过渡动画
.fade-height-enter-active,
.fade-height-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  transform-origin: top center;
}

.fade-height-enter-from,
.fade-height-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式布局优化
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }

  .header {
    margin-bottom: var(--spacing-lg);
  }

  .footer-links {
    margin-top: var(--spacing-sm);
  }

  .github-link {
    font-size: 0.8rem;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .qrcode {
    width: 196px;
    height: 196px;
    padding: var(--spacing-sm);

    &__placeholder {
      width: 180px;
      height: 180px;
    }
  }

  .cookie-placeholder {
    height: 160px;
  }

  .icon--refresh {
    width: 36px;
    height: 36px;
  }
}

// 小屏幕设备优化
@media (max-width: 480px) {
  .container {
    padding: var(--spacing-sm);
  }

  .qrcode-container {
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .footer-links {
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs) 0;
  }

  .github-link {
    font-size: 0.8rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
  }

  .github-icon {
    width: 14px;
    height: 14px;
  }

  .github-text {
    letter-spacing: 0.3px;
  }

  .status-text {
    font-size: 0.9rem;
  }

  .qrcode {
    width: 180px;
    height: 180px;

    &__placeholder {
      width: 164px;
      height: 164px;
    }
  }
}

// 高度较小的设备优化
@media (max-height: 700px) {
  .container {
    justify-content: flex-start !important;
    padding-top: var(--spacing-md);
    padding-bottom: var(--spacing-md);
  }

  .header {
    margin-bottom: var(--spacing-md);
  }

  .qrcode-container {
    gap: var(--spacing-sm);
  }

  .footer-links {
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs) 0;
  }

  .github-link {
    font-size: 0.8rem;
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .qrcode-container--with-cookie {
    transform: scale(0.9);
    margin-bottom: var(--spacing-xs);
  }

  .cookie-container {
    margin-top: var(--spacing-xs);
  }
}

// 非常小的设备优化
@media (max-height: 600px) {
  .container {
    padding-top: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
  }

  .header {
    margin-bottom: var(--spacing-sm);
  }

  .title {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-xs);
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .footer-links {
    margin-top: 0;
    padding: var(--spacing-xs) 0;
  }

  .github-link {
    font-size: 0.75rem;
    padding: var(--spacing-xs);
  }

  .github-icon {
    width: 12px;
    height: 12px;
  }
}

.status-text {
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 1.5rem;
  margin: 0;
  color: var(--text-secondary);

  &--loading {
    color: var(--text-tertiary);
  }

  &--waiting {
    color: var(--text-secondary);
  }

  &--scanned {
    color: var(--bilibili-blue);
  }

  &--expired {
    color: var(--error);
  }

  &--success {
    color: var(--success);
  }

  &--error {
    color: var(--error);
  }
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  width: 100%;
  min-height: auto;
  overflow: visible;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid var(--divider);
  background-color: var(--card-background);
  box-shadow: var(--shadow-sm);

  &:hover {
    color: var(--bilibili-pink);
    background-color: var(--overlay-light);
    border-color: var(--bilibili-pink-border);
    transform: translateY(-1px);
    box-shadow: var(--bilibili-pink-medium);
  }
}

.github-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.github-text {
  letter-spacing: 0.5px;
}

// 暗色主题下的github链接
[data-theme='dark'] {
  .github-link {
    border-color: var(--divider);

    &:hover {
      color: var(--bilibili-pink);
      background-color: var(--overlay-dark);
      border-color: var(--bilibili-pink-border);
      box-shadow: var(--bilibili-pink-medium);
    }
  }
}
</style>
