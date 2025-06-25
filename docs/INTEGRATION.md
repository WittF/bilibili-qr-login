# 🔗 嵌入模式集成指南

本文档介绍如何在您的网站中集成哔哩哔哩登录工具的iframe和window模式。

## 📋 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)  
- [集成模式](#集成模式)
- [高级配置](#高级配置)
- [安全注意事项](#安全注意事项)
- [API参考](#api参考)
- [常见问题](#常见问题)

## 功能特性

- 🪟 **Window模式**：在新窗口中打开登录页面，适合桌面端
- 🖼️ **iframe模式**：在当前页面内嵌iframe登录，适合无缝集成
- 📡 **postMessage通信**：通过标准的postMessage API传递登录结果
- 🔒 **安全防护**：内置origin验证，防止跨域攻击
- 🌐 **多语言支持**：支持中文/英文界面切换
- 🌗 **主题适配**：自动适配明暗主题

## 快速开始

### 🎯 在线体验

访问 [demo/basic.html](../demo/basic.html) 查看完整的在线演示，包含iframe和window两种模式的交互式示例。

### ⚡ 核心代码

```javascript
// 1. 监听登录结果
window.addEventListener('message', (event) => {
    if (event.origin !== 'https://login.bilibili.bi') return;
    
    const { type, mode, data } = event.data;
    if (type === 'success') {
        console.log(`${mode}登录成功:`, data);
        // 处理Cookie数据
    }
});

// 2. iframe模式
document.getElementById('container').innerHTML = `
    <iframe src="https://login.bilibili.bi/?mode=iframe" 
            width="380" height="340" style="border: none;">
    </iframe>
`;

// 3. window模式
window.open(
    'https://login.bilibili.bi/?mode=window',
    'bili_login',
    'width=380,height=340,resizable=no'
);
```

## 集成模式

### 🖼️ iframe模式

在当前页面内嵌登录界面，提供无缝的用户体验。

**特点：**
- ✅ 无需弹窗权限
- ✅ 集成度高，用户体验好  
- ✅ 支持响应式布局
- ❌ 占用页面空间

**完整示例：** 查看 [demo/basic.html](../demo/basic.html) 中的iframe模式实现

### 🪟 Window模式

在新窗口打开登录页面，登录完成后自动关闭。

**特点：**
- ✅ 不占用主页面空间
- ✅ 原生体验，界面独立
- ✅ 支持键盘快捷键
- ❌ 需要弹窗权限

**完整示例：** 查看 [demo/basic.html](../demo/basic.html) 中的window模式实现

### 🔧 框架集成

#### Vue 3 组件
```vue
<template>
  <BiliLogin />
</template>
```
**完整代码：** [demo/vue-example.vue](../demo/vue-example.vue)

#### React 组件  
```jsx
import BiliLogin from './components/BiliLogin';

function App() {
  return <BiliLogin />;
}
```
**完整代码：** [demo/react-example.jsx](../demo/react-example.jsx)

更多框架集成示例请查看 [demo目录](../demo/)。

## 高级配置

### URL参数配置

| 参数 | 说明 | 可选值 | 默认值 |
|------|------|--------|--------|
| `mode` | 运行模式 | `iframe`, `window` | 无（标准模式） |
| `lang` | 界面语言 | `zh-CN`, `en` | `zh-CN` |  
| `theme` | 主题模式 | `light`, `dark`, `auto` | `auto` |

示例：
```
https://login.bilibili.bi/?mode=iframe&lang=en&theme=dark
```

### 自定义域名配置

Docker部署时可配置信任的源域名：

```bash
# 配置特定域名
docker run -d -p 3000:3000 \
  -e TRUST_ORIGIN="https://yourdomain.com" \
  wittf/bilibili-qr-login:latest

# 开发环境允许所有域名
docker run -d -p 3000:3000 \
  -e TRUST_ORIGIN="*" \
  wittf/bilibili-qr-login:latest
```

### 内容安全策略(CSP)

如果网站使用CSP，需要添加以下配置：

```
frame-src https://login.bilibili.bi;
connect-src https://login.bilibili.bi;
```

## 安全注意事项

### 🔒 消息来源验证

**⚠️ 重要：** 务必验证`event.origin`以防止安全漏洞：

```javascript
window.addEventListener('message', (event) => {
    // ✅ 正确：验证消息来源
    if (event.origin !== 'https://login.bilibili.bi') {
        console.warn('拒绝来自未信任源的消息:', event.origin);
        return;
    }
    // 处理消息...
});
```

### 🔐 Cookie安全处理

```javascript
function handleLoginSuccess(cookie) {
    // ✅ 立即发送到后端处理
    fetch('/api/auth/bili-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookie })
    });
    
    // ✅ 前端不要长期存储Cookie
}
```

### 🌐 HTTPS协议

- 生产环境务必使用HTTPS协议
- 确保所有接口调用都是HTTPS
- 避免在HTTP环境下使用

## API参考

### 消息格式

```typescript
interface LoginSuccessMessage {
    type: 'success';           // 固定为'success'
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

### Cookie字段说明

返回的Cookie字符串包含以下关键字段：
- `SESSDATA`: 会话标识
- `bili_jct`: CSRF令牌
- `DedeUserID`: 用户ID

## 常见问题

### Q: 为什么收不到postMessage消息？

**A:** 检查以下几点：
1. 消息监听器是否在iframe/window打开前注册
2. Origin验证逻辑是否正确
3. 浏览器控制台是否有跨域错误

### Q: iframe模式页面空白？

**A:** 可能原因：
- 网络连接问题
- CSP策略阻止iframe加载
- 浏览器安全设置过严

### Q: 弹窗被浏览器阻止？

**A:** Window模式需要：
- 在用户交互事件中调用（如点击）
- 用户手动允许弹窗权限
- 检查浏览器弹窗拦截设置

### Q: 支持移动端吗？

**A:** 完全支持！建议：
- 移动端优先使用iframe模式
- 设置响应式iframe尺寸
- 适配触屏操作

### Q: 如何处理登录失败？

**A:** 目前仅在成功时发送消息，失败情况：
- 用户取消：关闭iframe/window即可
- 网络错误：检查控制台错误信息
- 二维码过期：用户可刷新重试

---

## 🔗 相关资源

- **📁 [Demo示例](../demo/)** - 完整可运行的代码示例
- **🏠 [主项目](https://github.com/WittF/bilibili-qr-login)** - GitHub仓库
- **🌐 [在线演示](https://login.bilibili.bi/)** - 实时体验
- **🐛 [问题反馈](https://github.com/WittF/bilibili-qr-login/issues)** - Issue跟踪

💡 **提示**: 建议优先查看demo目录中的实际代码示例，它们包含了完整的错误处理和最佳实践。 