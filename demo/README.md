# 🚀 集成示例 Demo

这个目录包含了使用B站登录服务的实际代码示例，包括原生JavaScript、Vue 3和React等不同框架的实现。

## 📁 文件说明

- **`basic.html`** - 原生HTML/JavaScript实现，包含iframe和window两种模式
- **`vue-example.vue`** - Vue 3单文件组件示例
- **`react-example.jsx`** - React函数组件示例
- **`README.md`** - 本说明文件

## 🎯 快速开始

### 1. 原生HTML测试
```bash
# 直接在浏览器中打开
open demo/basic.html
```

### 2. Vue 3项目集成
```bash
# 复制组件到你的Vue项目
cp demo/vue-example.vue src/components/BiliLogin.vue

# 在父组件中使用
<template>
  <BiliLogin />
</template>
```

### 3. React项目集成
```bash
# 复制组件到你的React项目
cp demo/react-example.jsx src/components/BiliLogin.jsx

# 在父组件中使用
import BiliLogin from './components/BiliLogin';

function App() {
  return <BiliLogin />;
}
```

## 🔧 核心代码说明

### 消息监听器
所有示例都包含安全的消息监听器：

```javascript
function handleMessage(event) {
  // 安全检查：验证消息来源
  if (event.origin !== 'https://login.bilibili.bi') {
    console.warn('收到来自未信任源的消息，已忽略:', event.origin);
    return;
  }

  const { type, mode, data } = event.data;
  
  if (type === 'success') {
    console.log(`${mode}模式登录成功`, data);
    // 处理Cookie数据
  }
}

window.addEventListener('message', handleMessage);
```

### iframe模式集成
```javascript
// 创建iframe
const iframe = document.createElement('iframe');
iframe.src = 'https://login.bilibili.bi/?mode=iframe';
iframe.width = '380';
iframe.height = '340';
container.appendChild(iframe);
```

### Window模式集成
```javascript
// 打开登录窗口
const popup = window.open(
  'https://login.bilibili.bi/?mode=window',
  'bili_login',
  'width=380,height=340,resizable=no'
);
```

## 🎨 自定义样式

### 主题配置
通过URL参数自定义外观：
```javascript
const url = 'https://login.bilibili.bi/?mode=iframe&theme=dark&lang=en';
```

支持的参数：
- `theme`: `light` | `dark` (默认: `light`)
- `lang`: `zh-CN` | `en` (默认: `zh-CN`)
- `mode`: `iframe` | `window` (必需)

### CSS样式覆盖
```css
/* 自定义iframe容器样式 */
.iframe-container {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 自定义按钮样式 */
.bili-login-btn {
  background: linear-gradient(135deg, #00a1d6, #0084b3);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
```

## 🔒 安全注意事项

### 1. 消息来源验证
```javascript
// ✅ 正确：验证消息来源
if (event.origin === 'https://login.bilibili.bi') {
  // 处理消息
}

// ❌ 错误：不验证来源
// 直接处理 event.data 是不安全的
```

### 2. CSP配置
如果使用Content Security Policy，需要添加：
```
frame-src https://login.bilibili.bi;
connect-src https://login.bilibili.bi;
```

### 3. Cookie处理
```javascript
// ✅ 安全：使用HTTPS和secure标志
document.cookie = `${cookieData}; Secure; SameSite=Strict`;

// ✅ 推荐：存储到localStorage（如果需要持久化）
localStorage.setItem('bili_session', cookieData);
```

## 🐛 常见问题

### Q: iframe不显示或加载失败
A: 检查CSP配置，确保允许加载来自 `https://login.bilibili.bi` 的iframe。

### Q: 弹窗被浏览器阻止
A: 确保在用户交互（如点击事件）中调用 `window.open()`。

### Q: 没有收到登录成功消息
A: 检查消息监听器是否正确注册，确保 `event.origin` 验证逻辑正确。

### Q: Cookie格式不正确
A: 确保正确解析返回的Cookie字符串，包含 `SESSDATA` 和 `bili_jct` 等关键字段。

## 📊 性能优化

### 1. 延迟加载
```javascript
// 只有在需要时才创建iframe
const createIframe = () => {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.src = 'https://login.bilibili.bi/?mode=iframe';
    // ... 其他配置
  }
  return iframe;
};
```

### 2. 预连接
```html
<!-- 在HTML头部添加预连接 -->
<link rel="preconnect" href="https://login.bilibili.bi">
<link rel="dns-prefetch" href="https://login.bilibili.bi">
```

### 3. 资源清理
```javascript
// 组件卸载时清理监听器
useEffect(() => {
  window.addEventListener('message', handleMessage);
  
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);
```

## 📞 技术支持

如果你在集成过程中遇到问题：

1. 查看 [集成文档](../docs/INTEGRATION.md)
2. 检查浏览器控制台的错误信息
3. 确认网络连接和CSP配置
4. 提交Issue到项目仓库

---

💡 **提示**: 这些示例代码都经过测试，可以直接复制到你的项目中使用。建议根据实际需求进行适当的修改和优化。 