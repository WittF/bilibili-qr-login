<template>
  <div class="container">
    <div class="content-wrapper">
      <div class="header">
        <div class="header__top">
          <LanguageSwitcher />
        </div>
        <div class="title-container">
          <transition name="text-fade" mode="out-in">
            <h1 :key="PARAM_MODE ? t.title.login : t.title.cookieTool" class="title">
              {{ PARAM_MODE ? t.title.login : t.title.cookieTool }}
            </h1>
          </transition>
        </div>
        <div class="subtitle-container">
          <transition name="text-fade" mode="out-in">
            <p :key="PARAM_MODE ? t.subtitle.login : t.subtitle.cookieTool" class="subtitle">
              {{ PARAM_MODE ? t.subtitle.login : t.subtitle.cookieTool }}
            </p>
          </transition>
        </div>

        <!-- 嵌入源安全提示 -->
        <div v-if="PARAM_MODE && embedOrigin" class="embed-notice">
          <div class="embed-notice__content">
            <span class="embed-notice__icon">🔒</span>
            <span class="embed-notice__text">
              {{ t.security.embedNotice }}: <strong>{{ embedOrigin }}</strong>
            </span>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="qrcode-container" :class="{ 'qrcode-container--with-cookie': state.cookie && !PARAM_MODE }">
          <div class="qrcode-wrapper">
            <ClientSelector @change="handleClientChange" />
            <div class="qrcode flex no-select card" :class="{ 'qrcode--scanned': showCheckIcon }">
              <transition name="fade" mode="out-in">
                <QrCode
                  v-if="state.url"
                  :value="state.url"
                  :options="qrCodeOption"
                  :style="{ transform: `scale(${qrCodeScale})`, transformOrigin: 'center center' }"
                  class="qrcode__content"
                />
                <div
                  v-else
                  class="qrcode__placeholder"
                  :style="{ transform: `scale(${qrCodeScale})`, transformOrigin: 'center center' }"
                ></div>
              </transition>
              <div v-if="state.status !== QrStatus.WAIT" class="qrcode__mask flex">
                <LoadingIcon v-if="state.status === QrStatus.LOADING" />
                <div v-else class="qrcode__actions">
                  <CheckIcon v-if="showCheckIcon" class="icon--success" />
                  <RefreshBtn
                    class="icon--refresh"
                    :class="{ 'always-visible': state.status === QrStatus.EXPIRED }"
                    @click="handleRestart"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="status-text-container">
            <transition name="text-fade" mode="out-in">
              <p :key="getters.statusText" class="status-text" :class="getStatusClass">{{ getters.statusText }}</p>
            </transition>
          </div>

          <div class="footer-links">
            <a
              href="https://github.com/WittF/bilibili-qr-login"
              target="_blank"
              rel="noopener noreferrer"
              class="github-link"
              title="查看源码"
            >
              <GithubIcon class="github-icon" />
              <div class="github-text-container">
                <transition name="text-fade" mode="out-in">
                  <span :key="t.common.viewSource" class="github-text">{{ t.common.viewSource }}</span>
                </transition>
              </div>
            </a>
          </div>

          <div class="version-info">
            <span class="version-text">v{{ APP_VERSION }}</span>
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
import ClientSelector from './components/ClientSelector.vue';
import { useQrSSE, QrStatus } from './utils/qrSSE';
import { useI18n } from './utils/i18n';
import { PARAM_MODE, APP_VERSION } from './utils/const';
import { themeManager } from './utils/theme';

import GithubIcon from './assets/icons/github.svg';
import type { QRCodeRenderersOptions } from 'qrcode';
import type { ClientType } from './components/ClientSelector.vue';

const { t, updatePageTitle } = useI18n();

// 检测嵌入源
const embedOrigin = computed(() => {
  if (!PARAM_MODE) return null;

  try {
    // iframe模式：检查是否被嵌入
    if (PARAM_MODE === 'iframe' && window.parent !== window) {
      if (document.referrer) {
        const referrerOrigin = new URL(document.referrer).origin;
        return referrerOrigin;
      }
      // 尝试获取父窗口的origin（可能因跨域限制失败）
      try {
        return window.parent.location.origin;
      } catch {
        return '未知来源';
      }
    }
    // window模式：检查opener
    if (PARAM_MODE === 'window' && window.opener) {
      try {
        return window.opener.location.origin;
      } catch {
        // 跨域限制时，尝试从referrer获取
        if (document.referrer) {
          return new URL(document.referrer).origin;
        }
        return '未知来源';
      }
    }
  } catch (error) {
    // 跨域访问限制时返回referrer
    if (document.referrer) {
      try {
        return new URL(document.referrer).origin;
      } catch {
        return '未知来源';
      }
    }
    return '未知来源';
  }

  return null;
});

// 响应式二维码尺寸和缩放
const getQrCodeScale = () => {
  const width = window.innerWidth;
  if (width >= 768) {
    return 1; // 大屏：196px (基准尺寸)
  } else if (width >= 480) {
    return 188 / 196; // 中屏：188px
  } else {
    return 180 / 196; // 小屏：180px
  }
};

const qrCodeScale = ref(getQrCodeScale());

// 固定的二维码配置，避免重新渲染
const qrCodeOption: QRCodeRenderersOptions = {
  margin: 0,
  width: 196, // 固定为大屏尺寸
  color: {
    dark: '#18191C',
    light: '#FFFFFF',
  },
};

// 监听窗口大小变化（防抖优化）
const handleResize = (() => {
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  return () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(() => {
      const newScale = getQrCodeScale();
      if (Math.abs(newScale - qrCodeScale.value) > 0.001) {
        qrCodeScale.value = newScale;
      }
      resizeTimer = null; // 释放引用
    }, 150); // 150ms防抖延迟
  };
})();

const { state, getters, restart, stop, setClientType } = useQrSSE();
const hasCookieBeforeReset = ref(false);

const handleClientChange = (clientType: ClientType) => {
  if (state.cookie) {
    hasCookieBeforeReset.value = true;
  }
  setClientType(clientType);
  setTimeout(() => {
    if (hasCookieBeforeReset.value) {
      setTimeout(() => {
        hasCookieBeforeReset.value = false;
      }, 500);
    }
  }, 100);
};

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

onMounted(() => {
  window.addEventListener('resize', handleResize);
  updatePageTitle();
  // 确保主题管理器正确初始化
  themeManager.reinitialize();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  stop();
});
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

.title-container {
  margin-bottom: var(--spacing-sm);
}

.title-container {
  width: 100%;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.title {
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: var(--bilibili-pink);
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.5px;
  text-align: center;
  white-space: nowrap;
  max-width: 100%;
}

.subtitle-container {
  width: 100%;
  min-height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.subtitle {
  color: var(--text-secondary);
  font-size: clamp(0.9rem, 3vw, 1.1rem);
  margin: 0;
  text-align: center;
  white-space: nowrap;
  max-width: 100%;
}

.embed-notice {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(251, 114, 153, 0.1);
  border: 1px solid rgba(251, 114, 153, 0.3);
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 400px;
}

.embed-notice__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--text-primary);
}

.embed-notice__icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.embed-notice__text {
  strong {
    color: var(--bilibili-pink);
    font-weight: 600;
  }
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

.qrcode-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-sm);
  justify-content: center;
  transform: translateX(-30px);
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
    backdrop-filter: blur(3px);
    transition: all 0.3s ease;
    animation: maskFadeIn 0.3s ease;
  }

  &__placeholder {
    width: 196px;
    height: 196px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--qr-placeholder-bg);
    border-radius: 4px;
    transition:
      background-color 0.3s ease,
      transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__content {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__actions {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    .icon--success {
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      transition:
        transform 0.3s ease,
        opacity 0.3s ease;
      animation: successSlideIn 0.4s ease-out;
      z-index: 1;
    }

    .icon--refresh {
      position: absolute;
      bottom: 20px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    }

    &:hover {
      .icon--success {
        transform: translate(-50%, -50%) translateY(-30px) !important;
        opacity: 0.7;

        .check-icon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
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
  animation: refreshPulse 1.5s ease-in-out infinite;
}

@keyframes successSlideIn {
  0% {
    transform: translate(-50%, -50%) translateY(20px) !important;
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) !important;
    opacity: 1;
  }
}

@keyframes refreshPulse {
  0%,
  100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-3px);
    opacity: 0.8;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes maskFadeIn {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(3px);
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

// 确保成功图标正确居中的全局样式
.qrcode__actions .icon--success {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 2 !important;

  // 清除任何调试信息或工具提示
  &::before,
  &::after {
    display: none !important;
    content: none !important;
    visibility: hidden !important;
  }
}

// CheckIcon内部保持flex布局以居中SVG
.qrcode__actions .icon--success .check-icon {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  top: 0 !important;
  left: 0 !important;
  transform: none !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 64px !important;
  height: 64px !important;

  // 清除任何伪元素
  &::before,
  &::after {
    display: none !important;
    content: none !important;
    visibility: hidden !important;
  }
}

// 确保SVG元素本身也正确居中和缩放
.qrcode__actions .icon--success .check-icon svg {
  display: block !important;
  margin: 0 auto !important;
  position: relative !important;
  top: 0 !important;
  left: 0 !important;
  transform: scale(2.67) !important; // 从24px缩放到64px (64/24=2.67)
  transform-origin: center center !important;
  width: 24px !important; // 保持原始尺寸
  height: 24px !important; // 保持原始尺寸

  // 确保SVG正确填充和对齐
  object-fit: contain !important;
  object-position: center !important;

  // 清除SVG上的任何调试信息
  &::before,
  &::after {
    display: none !important;
    content: none !important;
    visibility: hidden !important;
  }
}

// 在小屏幕上调整缩放
@media (max-width: 768px) {
  .qrcode__actions .icon--success .check-icon svg {
    transform: scale(2.33) !important; // 从24px缩放到56px (56/24=2.33)
  }
}

// 全局清除可能的调试样式
.qrcode__actions .icon--success *,
.qrcode__actions .icon--success *::before,
.qrcode__actions .icon--success *::after {
  &::before,
  &::after {
    display: none !important;
    content: none !important;
    visibility: hidden !important;
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

// 淡入淡出动画 - QR码切换效果
.fade-enter-active {
  transition: all 0.4s ease;
}

.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

// 中屏设备优化 (768px以下但480px以上)
@media (max-width: 768px) and (min-width: 481px) {
  .qrcode {
    width: 220px;
    height: 220px;
    padding: var(--spacing-md);

    &__placeholder {
      width: 196px;
      height: 196px;
    }
  }
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

  .version-info {
    padding: 0 var(--spacing-xs) var(--spacing-xs);
    margin-top: 0;
  }

  .version-text {
    font-size: 0.7rem;
  }

  .github-link {
    font-size: 0.8rem;
    padding: var(--spacing-sm) var(--spacing-md);
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

  .title-container {
    min-height: 2.5rem;
  }

  .subtitle-container {
    min-height: 1.8rem;
  }

  .qrcode-container {
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .qrcode-wrapper {
    gap: var(--spacing-sm);
  }

  .footer-links {
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs) 0 0;
  }

  .version-info {
    padding: 0 0 var(--spacing-xs);
    margin-top: 0;
  }

  .version-text {
    font-size: 0.65rem;
  }

  .github-link {
    font-size: 0.8rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
  }

  .github-icon {
    width: 14px;
    height: 14px;

    svg {
      width: 14px !important;
      height: 14px !important;
    }
  }

  .github-text {
    letter-spacing: 0.3px;
  }

  .status-text {
    font-size: 0.9rem;
  }

  .status-text-container {
    min-height: 2.2rem;
  }

  .qrcode {
    width: 207px;
    height: 207px;

    &__placeholder {
      width: 196px;
      height: 196px;
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
    padding: var(--spacing-xs) 0 0;
  }

  .version-info {
    padding: 0 0 var(--spacing-xs);
    margin-top: 0;
  }

  .version-text {
    font-size: 0.65rem;
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
    padding: var(--spacing-xs) 0 0;
  }

  .version-info {
    padding: 0 0 var(--spacing-xs);
    margin-top: 0;
  }

  .version-text {
    font-size: 0.6rem;
  }

  .github-link {
    font-size: 0.75rem;
    padding: var(--spacing-xs);
  }

  .github-icon {
    width: 12px;
    height: 12px;

    svg {
      width: 12px !important;
      height: 12px !important;
    }
  }
}

.status-text-container {
  width: 100%;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.status-text {
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  margin: 0;
  color: var(--text-secondary);
  white-space: nowrap;
  max-width: 100%;
  line-height: 1.5;

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

// 文本切换动画
.text-fade-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.05s;
}

.text-fade-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.6, 1);
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

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-sm) 0;
  width: 100%;
  min-height: auto;
  overflow: visible;
}

.version-info {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 var(--spacing-sm) var(--spacing-sm);
  margin-top: 0;
}

.version-text {
  font-size: 0.75rem;
  color: var(--text-quaternary);
  font-weight: 400;
  letter-spacing: 0.5px;
  opacity: 0.6;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition:
    all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.15s ease;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid var(--divider);
  background-color: var(--card-background);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  will-change: width, transform, border-color;

  &:hover {
    color: var(--bilibili-pink);
    background-color: var(--overlay-light);
    border-color: var(--bilibili-pink-border);
    transform: translateY(-1px);
    box-shadow: var(--bilibili-pink-medium);
  }

  // 专门的聚焦效果
  &:focus-visible {
    outline: none !important;
    color: var(--bilibili-pink);
    background-color: var(--overlay-light);
    border-color: var(--bilibili-pink-border);
    transform: translateY(-1px) scale(1.02);
    box-shadow: var(--focus-ring-shadow), var(--bilibili-pink-medium);
    z-index: 1;
    position: relative;
  }
}

.github-icon {
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

.github-text-container {
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
}

.github-text {
  letter-spacing: 0.5px;
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// 暗色主题下的github链接
[data-theme='dark'] {
  .github-link {
    color: #9499a0; // 提亮基础颜色
    border-color: var(--divider);

    &:hover {
      color: var(--bilibili-pink);
      background-color: var(--overlay-dark);
      border-color: var(--bilibili-pink-border);
      box-shadow: var(--bilibili-pink-medium);
    }

    &:focus-visible {
      color: var(--bilibili-pink);
      background-color: var(--overlay-dark);
      border-color: var(--bilibili-pink-border);
      box-shadow: var(--focus-ring-shadow), var(--bilibili-pink-medium);
    }
  }
}
</style>
