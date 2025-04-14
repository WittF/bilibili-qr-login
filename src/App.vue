<template>
  <div class="container">
    <div class="header">
      <h1 class="title">{{ PARAM_MODE ? '哔哩哔哩登录' : '哔哩哔哩 Cookie 获取工具' }}</h1>
      <p class="subtitle">
        {{ PARAM_MODE ? '请使用哔哩哔哩手机 APP 扫码登录' : '使用手机 APP 扫码登录后即可获取 cookie' }}
      </p>
    </div>

    <div class="qrcode-container">
      <div class="qrcode flex no-select">
        <QrCode v-if="state.url" :value="state.url" :options="qrCodeOption" />
        <div v-if="state.status !== QrStatus.WAIT" class="qrcode__mask flex">
          <LoadingIcon v-if="state.status === QrStatus.LOADING" />
          <template v-else>
            <CheckIcon v-if="showCheckIcon" class="icon--no-size" />
            <RefreshBtn class="icon--no-size" :class="{ 'icon--hide': showCheckIcon }" @click="restart" />
          </template>
        </div>
      </div>
      <p class="status-text">{{ getters.statusText }}</p>
    </div>

    <div v-if="!PARAM_MODE" class="cookie-box">
      <CookieDisplay v-if="state.cookie" :value="state.cookie" />
    </div>
  </div>
</template>

<script setup lang="ts">
import QrCode from '@chenfengyuan/vue-qrcode';
import { computed, onBeforeUnmount } from 'vue';
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
};

const { state, getters, restart, stop } = useQrSSE();

const showCheckIcon = computed(() => state.status === QrStatus.SCANNED || state.status === QrStatus.SUCCESS);

onBeforeUnmount(stop);
</script>

<style scoped lang="less">
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  color: #1b81f6;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.qrcode {
  position: relative;
  min-width: 196px;
  min-height: 196px;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &__mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 12px;
  }
}

.status-text {
  color: #666;
  font-size: 1rem;
}

.cookie-box {
  min-height: 180px;
  width: 100%;
  margin-top: 2rem;
}

.icon {
  &--no-size {
    margin: -16px;
  }
  &--hide {
    opacity: 0;
    transition: opacity 0.2s;
  }
}

.qrcode:hover {
  .icon--hide {
    opacity: 1;
  }
}
</style>
