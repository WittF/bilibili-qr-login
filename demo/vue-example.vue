<template>
  <div class="bili-login-vue">
    <h2>🔗 Vue 3 集成示例</h2>

    <!-- 控制按钮 -->
    <div class="controls">
      <button class="btn" @click="toggleIframe">{{ showIframe ? '关闭' : '打开' }}iframe登录</button>
      <button class="btn" @click="openWindow">打开窗口登录</button>
      <button class="btn secondary" @click="clearCookie">清除结果</button>
    </div>

    <!-- iframe容器 -->
    <div v-if="showIframe" class="iframe-container">
      <iframe
        src="https://login.bilibili.bi/?mode=iframe"
        width="380"
        height="340"
        style="border: none; border-radius: 8px"
        title="B站登录"
      />
    </div>

    <!-- 状态显示 -->
    <div v-if="status" class="status" :class="statusType">
      {{ status }}
    </div>

    <!-- 结果显示 -->
    <div v-if="cookie" class="result success">
      <h3>✅ 登录成功！</h3>
      <p><strong>模式:</strong> {{ loginMode }}</p>
      <p><strong>Cookie长度:</strong> {{ cookie.length }} 字符</p>
      <p><strong>获取时间:</strong> {{ loginTime }}</p>
      <details>
        <summary><strong>Cookie预览</strong></summary>
        <div class="cookie-preview">{{ cookie.substring(0, 200) }}...</div>
      </details>
    </div>

    <!-- 使用说明 -->
    <div class="usage">
      <h3>📋 使用方法</h3>
      <ol>
        <li>点击"打开iframe登录"或"打开窗口登录"</li>
        <li>在登录界面扫描二维码</li>
        <li>登录成功后自动获取Cookie</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 响应式数据
const showIframe = ref(false);
const cookie = ref('');
const loginMode = ref('');
const loginTime = ref('');
const status = ref('');
const statusType = ref('info');

// 消息处理函数
const handleMessage = event => {
  // 安全检查
  if (event.origin !== 'https://login.bilibili.bi') {
    console.warn('收到来自未信任源的消息，已忽略:', event.origin);
    return;
  }

  const { type, mode, data } = event.data;

  if (type === 'success') {
    console.log(`${mode}模式登录成功`, data);

    // 更新状态
    cookie.value = data;
    loginMode.value = mode.toUpperCase();
    loginTime.value = new Date().toLocaleString();
    status.value = `${mode.toUpperCase()}模式登录成功！`;
    statusType.value = 'success';

    // 如果是iframe模式，2秒后自动关闭
    if (mode === 'iframe') {
      setTimeout(() => {
        showIframe.value = false;
      }, 2000);
    }

    // 清除状态提示
    setTimeout(() => {
      status.value = '';
    }, 5000);

    // 触发自定义事件（可选）
    window.dispatchEvent(
      new CustomEvent('biliLoginSuccess', {
        detail: { cookie: data, mode, timestamp: Date.now() },
      }),
    );
  }
};

// 切换iframe
const toggleIframe = () => {
  showIframe.value = !showIframe.value;
  if (showIframe.value) {
    status.value = 'iframe登录已打开';
    statusType.value = 'info';
    setTimeout(() => (status.value = ''), 3000);
  } else {
    status.value = 'iframe已关闭';
    statusType.value = 'info';
    setTimeout(() => (status.value = ''), 3000);
  }
};

// 打开窗口
const openWindow = () => {
  const width = 380;
  const height = 340;
  const left = Math.round((window.screen.width - width) / 2);
  const top = Math.round((window.screen.height - height) / 2);

  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=no',
    'scrollbars=no',
    'status=no',
    'toolbar=no',
    'menubar=no',
    'location=no',
  ].join(',');

  const popup = window.open('https://login.bilibili.bi/?mode=window', 'bili_login', features);

  if (!popup) {
    status.value = '弹窗被阻止，请允许弹窗后重试';
    statusType.value = 'error';
    setTimeout(() => (status.value = ''), 5000);
    return;
  }

  status.value = '登录窗口已打开';
  statusType.value = 'info';
  setTimeout(() => (status.value = ''), 3000);
};

// 清除Cookie
const clearCookie = () => {
  cookie.value = '';
  loginMode.value = '';
  loginTime.value = '';
  status.value = '结果已清除';
  statusType.value = 'info';
  setTimeout(() => (status.value = ''), 3000);
};

// 生命周期
onMounted(() => {
  window.addEventListener('message', handleMessage);
  console.log('Vue组件已挂载，消息监听器已注册');
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
  console.log('Vue组件已卸载，消息监听器已移除');
});
</script>

<style scoped>
.bili-login-vue {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.controls {
  margin: 20px 0;
}

.btn {
  display: inline-block;
  padding: 10px 16px;
  margin: 5px;
  background: #00a1d6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.btn:hover {
  background: #0084b3;
}

.btn.secondary {
  background: #6c757d;
}

.btn.secondary:hover {
  background: #5a6268;
}

.iframe-container {
  margin: 20px 0;
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.status {
  padding: 12px;
  margin: 15px 0;
  border-radius: 6px;
  border-left: 4px solid;
}

.status.success {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.status.info {
  background: #d1ecf1;
  border-color: #17a2b8;
  color: #0c5460;
}

.status.error {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.result {
  margin: 20px 0;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.result.success {
  background: #d4edda;
  border-color: #c3e6cb;
}

.cookie-preview {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f1f3f4;
  padding: 10px;
  border-radius: 4px;
  word-break: break-all;
  max-height: 100px;
  overflow-y: auto;
  margin-top: 10px;
}

.usage {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.usage h3 {
  margin-top: 0;
  color: #007bff;
}

.usage ol {
  margin: 10px 0;
  padding-left: 20px;
}

.usage li {
  margin: 5px 0;
}
</style>
