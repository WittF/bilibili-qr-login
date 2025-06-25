# 🔗 嵌入模式集成指南

本文档详细介绍如何在您的网站中集成哔哩哔哩登录工具的iframe和window模式。

## 📋 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [iframe模式详解](#iframe模式详解)
- [Window模式详解](#window模式详解)
- [高级配置](#高级配置)
- [安全注意事项](#安全注意事项)
- [常见问题](#常见问题)
- [API参考](#api参考)

## 功能特性

- 🪟 **Window模式**：在新窗口中打开登录页面
- 🖼️ **iframe模式**：在当前页面内嵌iframe登录
- 📡 **postMessage通信**：通过标准的postMessage API传递登录结果
- 🔒 **安全防护**：内置origin验证，防止跨域攻击
- ⚙️ **可配置域名**：支持配置信任的源域名
- 🌐 **多语言支持**：支持中文、英文、日文等多种语言
- 🌗 **主题适配**：自动适配明暗主题

## 快速开始

### 基本用法

```html
<!DOCTYPE html>
<html>
<head>
    <title>B站登录集成</title>
</head>
<body>
    <button onclick="openIframe()">iframe登录</button>
    <button onclick="openWindow()">窗口登录</button>
    
    <div id="iframe-container"></div>
    <div id="result">等待登录...</div>
    
    <script>
        // 监听登录结果
        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://login.bilibili.bi') return;
            
            const { type, mode, data } = event.data;
            if (type === 'success') {
                console.log(`${mode}登录成功:`, data);
                document.getElementById('result').innerHTML = 
                    `✅ 登录成功！Cookie长度: ${data.length}`;
            }
        });
        
        function openIframe() {
            document.getElementById('iframe-container').innerHTML = `
                <iframe src="https://login.bilibili.bi/?mode=iframe" 
                        width="380" height="340" style="border: none;">
                </iframe>
            `;
        }
        
        function openWindow() {
            const width = 380, height = 340;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;
            
            window.open(
                'https://login.bilibili.bi/?mode=window',
                '_blank',
                `width=${width},height=${height},left=${left},top=${top}`
            );
        }
    </script>
</body>
</html>
```

## iframe模式详解

### Vue 3 示例

```vue
<template>
  <div>
    <button @click="toggleIframe">
      {{ showIframe ? '关闭' : '打开' }}登录
    </button>
    
    <iframe 
      v-if="showIframe"
      src="https://login.bilibili.bi/?mode=iframe" 
      width="380" 
      height="340" 
      style="border: none;"
    />
    
    <div v-if="cookie">
      登录成功！Cookie长度: {{ cookie.length }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showIframe = ref(false)
const cookie = ref('')

const handleMessage = (event) => {
  if (event.origin !== 'https://login.bilibili.bi') return
  
  const { type, mode, data } = event.data
  if (type === 'success' && mode === 'iframe') {
    cookie.value = data
    showIframe.value = false
  }
}

const toggleIframe = () => {
  showIframe.value = !showIframe.value
  if (showIframe.value) cookie.value = ''
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>
```

### React 示例

```jsx
import React, { useState, useEffect } from 'react';

function BiliLogin() {
  const [showIframe, setShowIframe] = useState(false);
  const [cookie, setCookie] = useState('');

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'https://login.bilibili.bi') return;
      
      const { type, mode, data } = event.data;
      if (type === 'success' && mode === 'iframe') {
        setCookie(data);
        setShowIframe(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div>
      <button onClick={() => setShowIframe(!showIframe)}>
        {showIframe ? '关闭' : '打开'}登录
      </button>
      
      {showIframe && (
        <iframe 
          src="https://login.bilibili.bi/?mode=iframe"
          width="380"
          height="340"
          style={{ border: 'none' }}
        />
      )}
      
      {cookie && (
        <div>登录成功！Cookie长度: {cookie.length}</div>
      )}
    </div>
  );
}

export default BiliLogin;
```

## Window模式详解

### 基本用法

```javascript
function openLoginWindow() {
    const width = 380;
    const height = 340;
    
    // 计算居中位置
    const left = Math.round((screen.width - width) / 2);
    const top = Math.round((screen.height - height) / 2);
    
    // 打开窗口
    const popup = window.open(
        'https://login.bilibili.bi/?mode=window',
        'bili_login',
        `width=${width},height=${height},left=${left},top=${top},resizable=no`
    );
    
    if (!popup) {
        alert('弹窗被阻止，请允许弹窗后重试');
        return;
    }
    
    // 监听窗口关闭
    const checkClosed = setInterval(() => {
        if (popup.closed) {
            clearInterval(checkClosed);
            console.log('登录窗口已关闭');
        }
    }, 1000);
}

// 监听登录结果
window.addEventListener('message', (event) => {
    if (event.origin !== 'https://login.bilibili.bi') return;
    
    const { type, mode, data } = event.data;
    if (type === 'success' && mode === 'window') {
        console.log('window登录成功:', data);
        // 窗口会自动关闭
    }
});
```

## 高级配置

### 自定义域名信任

如果您在自己的域名下部署服务，需要配置信任的源域名：

```bash
# Docker部署时配置信任域名
docker run -d \
  --name bili-qrlogin \
  -p 3000:3000 \
  -e TRUST_ORIGIN="https://yourdomain.com,https://sub.yourdomain.com" \
  wittf/bilibili-qr-login:latest

# 允许所有域名（开发环境使用，生产环境不推荐）
docker run -d \
  --name bili-qrlogin \
  -p 3000:3000 \
  -e TRUST_ORIGIN="*" \
  wittf/bilibili-qr-login:latest
```

### URL参数配置

| 参数 | 说明 | 可选值 | 默认值 |
|------|------|--------|--------|
| `mode` | 运行模式 | `iframe`, `window` | 无（标准模式） |
| `lang` | 界面语言 | `zh-CN`, `zh-TW`, `en`, `jp` | `zh-CN` |
| `theme` | 主题模式 | `light`, `dark`, `auto` | `auto` |

示例：
```
https://login.bilibili.bi/?mode=iframe&lang=en&theme=dark
```

## 安全注意事项

### 1. Origin验证

**⚠️ 重要：** 务必验证`event.origin`：

```javascript
window.addEventListener('message', (event) => {
    if (event.origin !== 'https://login.bilibili.bi') {
        console.warn('拒绝来自未信任源的消息:', event.origin);
        return;
    }
    // 处理消息...
});
```

### 2. HTTPS协议

生产环境务必使用HTTPS协议。

### 3. Cookie安全处理

```javascript
function handleCookie(cookie) {
    // ✅ 立即发送到后端
    fetch('/api/auth/bili-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookie })
    });
    
    // ✅ 处理完成后清除
    cookie = null;
}
```

## 常见问题

### Q: 为什么收不到postMessage消息？

**A:** 检查以下几点：
- 消息监听器是否在iframe/window打开前注册
- Origin验证是否正确
- 浏览器控制台是否有错误

### Q: iframe模式下页面空白？

**A:** 可能原因：
- 网络连接问题
- 浏览器安全策略限制
- 需要添加CSP允许iframe

### Q: 支持移动端吗？

**A:** 完全支持！建议移动端使用iframe模式，并设置响应式样式。

## API参考

### 消息格式

```typescript
interface LoginSuccessMessage {
    type: 'success';           // 消息类型
    mode: 'iframe' | 'window'; // 登录模式
    data: string;              // B站Cookie字符串
}
```

### 消息示例

```javascript
{
    type: "success",
    mode: "iframe", 
    data: "SESSDATA=cb06b5c2%2C1641234567%2Cb1a2c*31; bili_jct=abc123; ..."
}
```

---

## 🔗 相关链接

- [主项目仓库](https://github.com/WittF/bilibili-qr-login)
- [在线演示](https://login.bilibili.bi/)
- [问题反馈](https://github.com/WittF/bilibili-qr-login/issues) 