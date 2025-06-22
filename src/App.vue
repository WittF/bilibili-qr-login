<template>
  <div class="container">
    <div class="content-wrapper">
      <div class="header">
        <h1 class="title">{{ PARAM_MODE ? '哔哩哔哩登录' : '哔哩哔哩 Cookie 获取工具' }}</h1>
        <p class="subtitle">
          {{ PARAM_MODE ? '请使用哔哩哔哩手机 APP 扫码登录' : '使用手机 APP 扫码登录后即可获取 cookie' }}
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
                <RefreshBtn class="icon--refresh" @click="handleRestart" />
              </div>
            </div>
          </div>
          <p class="status-text" :class="getStatusClass">{{ getters.statusText }}</p>
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
import { computed, onBeforeUnmount, ref } from 'vue';
import RefreshBtn from './components/RefreshBtn.vue';
import CookieDisplay from './components/CookieDisplay.vue';
import LoadingIcon from './components/LoadingIcon.vue';
import CheckIcon from './assets/icons/check_circle.svg';
import { useQrSSE, QrStatus } from './utils/qrSSE';
import { PARAM_MODE } from './utils/const';
import type { QRCodeRenderersOptions } from 'qrcode';

window.document.title = PARAM_MODE ? '登录哔哩哔哩' : '哔哩哔哩 cookie 获取工具';

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

  @media (min-height: 800px) {
    justify-content: center;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 650px;
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  width: 100%;
  position: static; /* 确保标题不会被固定或绝对定位 */
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
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: var(--radius-lg);
    backdrop-filter: blur(2px);
    animation: fadeIn 0.3s ease;
  }

  &__placeholder {
    width: 196px;
    height: 196px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  &__loading-animation {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid #e0e0e0;
    border-top-color: var(--bilibili-blue);
    animation: spin 1s linear infinite;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.status-text {
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 1.5rem;

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
  &--success {
    width: 64px;
    height: 64px;
    color: var(--success);
  }

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

  .icon--success {
    width: 56px;
    height: 56px;
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

  .qrcode {
    width: 190px;
    height: 190px;

    &__placeholder {
      width: 164px;
      height: 164px;
    }
  }

  .status-text {
    font-size: 0.9rem;
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
}
</style>
