# 哔哩哔哩 Cookie 获取工具 🍪

> 直接打开页面扫码登录，即可快速获取哔哩哔哩（B站）的Cookie，并支持将 Cookie 转换为 JSON 格式下载。<br>
> 本项目基于 [Tsuk1ko/bilibili-qr-login](https://github.com/Tsuk1ko/bilibili-qr-login)，感谢原作者[@Tsuk1ko](https://github.com/Tsuk1ko/)的贡献！

---

## 🚀 在线服务地址

[https://login.bilibili.bi/](https://login.bilibili.bi/)

---

## 功能介绍

- 🎯 **扫码登录**：扫描二维码快速登录B站账户
- 🍪 **获取Cookie**：自动获取登录后的Cookie信息
- 🔄 **Cookie转换**：支持将Cookie转换为JSON格式
- 💾 **一键下载**：快捷下载转换后的JSON文件
- 🌗 **明暗主题**：自动适配系统主题，支持手动切换明暗模式
- 🌐 **多语言支持**：支持简体中文、繁体中文、英文、日文等多种语言
- 🔗 **嵌入模式**：支持iframe和window模式，方便集成到其他网站

---

## 使用截图

<div style="display: flex; justify-content: center; gap: 20px;">
  <img src="https://github.com/user-attachments/assets/6557a39a-6190-4960-bc6b-b9a691e65851" width="49%" />
  <img src="https://github.com/user-attachments/assets/ecc415ff-dd7a-4e06-98b3-62414127a9de" width="49%" />
</div>

---

## 快速开始

> 默认服务将运行在 localhost:3000，你可以根据需要自行修改端口映射

### 在本地部署

```bash
# 克隆仓库
git clone https://github.com/WittF/bilibili-qr-login.git

# 进入项目目录
cd bilibili-qr-login

# 运行项目（根据项目实际运行方式调整）
yarn install
yarn start
```

### 在 Docker 部署

```bash
# 拉取镜像
docker pull wittf/bilibili-qr-login:latest

# 运行容器
docker run -d \
  --name bili-qrlogin \
  -p 3000:3000 \
  wittf/bili-qrlogin:latest
```

### 在 Vercel 部署

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/WittF/bilibili-qr-login)

---

## 🔗 嵌入模式集成

本工具支持通过iframe或弹窗的方式嵌入到其他网站中，实现无缝的登录体验。

### 功能特性

- 🪟 **Window模式**：在新窗口中打开登录页面
- 🖼️ **iframe模式**：在当前页面内嵌iframe登录
- 📡 **postMessage通信**：通过标准的postMessage API传递登录结果
- 🔒 **安全防护**：内置origin验证，防止跨域攻击

### 快速开始

#### iframe模式

```html
<iframe 
  src="https://login.bilibili.bi/?mode=iframe" 
  width="380" 
  height="340" 
  style="border: none;">
</iframe>

<script>
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://login.bilibili.bi') return;
  
  const { type, mode, data } = event.data;
  if (type === 'success' && mode === 'iframe') {
    console.log('登录成功，Cookie:', data);
    // 处理登录成功逻辑
  }
});
</script>
```

#### Window模式

```javascript
function openLoginWindow() {
  const popup = window.open(
    'https://login.bilibili.bi/?mode=window',
    '_blank',
    'width=380,height=340'
  );
}

window.addEventListener('message', (event) => {
  if (event.origin !== 'https://login.bilibili.bi') return;
  
  const { type, mode, data } = event.data;
  if (type === 'success' && mode === 'window') {
    console.log('登录成功，Cookie:', data);
    // 处理登录成功逻辑
  }
});
```

### 详细文档

完整的集成指南、Vue/React示例、安全配置等，请查看：

📖 **[嵌入模式集成指南](./docs/INTEGRATION.md)**

---

