<template>
  <button class="test-btn" @click="openWindow">打开新窗口</button>
  <button class="test-btn" @click="toggleIframe">{{ showIframe ? '关闭' : '打开' }} iframe</button>
  <iframe v-if="showIframe" src="/?mode=iframe" width="420" height="610" style="border: none" />
  <div class="cookie-box">
    <CookieDisplay v-if="cookieResult" :value="cookieResult" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import CookieDisplay from '../../src/components/CookieDisplay.vue';
import { openQrWindow } from './utils/openWindow';

// 为开发模式添加简单的日志系统
const createDevLogger = (module: string) => ({
  debug: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${module}] DEBUG: ${message}`, data || '');
  },
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${module}] INFO: ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [${module}] WARN: ${message}`, data || '');
  },
  error: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${module}] ERROR: ${message}`, data || '');
  },
});

const logger = createDevLogger('DEV-APP');

const cookieResult = ref('');
const showIframe = ref(false);

const openWindow = () => {
  logger.info('用户点击打开窗口按钮');
  cookieResult.value = '';

  try {
    const newWindow = openQrWindow('/?mode=window');
    if (newWindow) {
      logger.info('窗口模式启动成功', {
        targetUrl: '/?mode=window',
        windowReference: !!newWindow,
      });
    } else {
      logger.error('窗口模式启动失败，可能被弹窗阻止');
    }
  } catch (error) {
    logger.error('窗口模式启动异常', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const toggleIframe = () => {
  const newState = !showIframe.value;
  logger.info(`用户${newState ? '打开' : '关闭'}iframe`, {
    previousState: showIframe.value,
    newState,
  });

  cookieResult.value = '';
  showIframe.value = newState;

  if (newState) {
    logger.info('iframe模式启动', { targetUrl: '/?mode=iframe' });
  } else {
    logger.info('iframe模式已关闭');
  }
};

interface QrMessage {
  type: 'success';
  mode: 'window' | 'iframe';
  data: string;
}

const handleMessage = (e: MessageEvent<QrMessage>) => {
  logger.debug('收到postMessage消息', {
    origin: e.origin,
    currentOrigin: window.location.origin,
    messageType: e.data?.type,
    messageMode: e.data?.mode,
    hasData: !!e.data?.data,
    dataLength: e.data?.data?.length || 0,
  });

  // 【重要】校验 message 来自扫码窗口/iframe
  if (e.origin !== window.location.origin) {
    logger.error('收到来自不信任源的消息，已忽略', {
      receivedOrigin: e.origin,
      expectedOrigin: window.location.origin,
      messageData: e.data,
    });
    return;
  }

  const { type, data, mode } = e.data;

  if (type === 'success') {
    logger.info('收到登录成功消息', {
      mode,
      cookieLength: data?.length || 0,
      cookiePreview: data?.substring(0, 50) + '...',
    });

    cookieResult.value = data;

    if (mode === 'window') {
      logger.info('关闭登录窗口');
      (e.source as Window | null)?.close();
    } else if (mode === 'iframe') {
      logger.info('关闭登录iframe');
      showIframe.value = false;
    }

    logger.info('登录流程完成', {
      mode,
      finalCookieLength: cookieResult.value.length,
    });
  } else {
    logger.warn('收到未知类型的消息', {
      messageType: type,
      mode,
      data: e.data,
    });
  }
};

logger.info('开发页面初始化完成', {
  currentUrl: window.location.href,
  userAgent: navigator.userAgent.substring(0, 100),
});

window.addEventListener('message', handleMessage);

onBeforeUnmount(() => {
  logger.info('开发页面即将卸载，清理消息监听器');
  window.removeEventListener('message', handleMessage);
});
</script>

<style scoped lang="less">
.test-btn {
  margin-bottom: 16px;
}

.cookie-box {
  min-height: 180px;
}
</style>
