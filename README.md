# 哔哩哔哩 Cookie 获取工具 🍪

> 直接打开页面扫码登录，即可快速获取哔哩哔哩（B站）的Cookie，并支持将 Cookie 转换为 JSON 格式下载。<br>
> 本项目基于 [Tsuk1ko/bilibili-qr-login](https://github.com/Tsuk1ko/bilibili-qr-login)，感谢原作者[@Tsuk1ko](https://github.com/Tsuk1ko/)的贡献！
> 
## ⭐ 贡献者 

![Contributors](https://contrib.rocks/image?repo=WittF/bilibili-qr-login)

## 在线服务地址 🚀

[https://login.bilibili.bi/](https://login.bilibili.bi/)

---

## 功能介绍

- 🎯 **扫码登录**：扫描二维码快速登录B站账户
- 🍪 **获取Cookie**：自动获取登录后的Cookie信息
- 🔄 **Cookie转换**：支持将Cookie转换为JSON格式
- 📡 **转换API**：提供RESTful API接口，支持程序化调用
- 💾 **一键下载**：快捷下载转换后的JSON文件
- 🌗 **明暗主题**：自动适配系统主题，支持手动切换明暗模式
- 🌐 **多语言支持**：支持简体中文、繁体中文、英文、日文等多种语言
- 🔗 **嵌入模式**：支持iframe和window模式，方便集成到其他网站

---

## 展示截图

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

## 🔌 集成与API

支持嵌入式登录集成和Cookie JSON转换功能：

- **🖼️ 嵌入集成** - 支持iframe/window模式，postMessage通信
- **🔄 JSON转换** - Cookie转换为TinyDB格式，RESTful API调用
- **⚙️ 访问控制** - 支持通过 `TRUST_ORIGIN` 环境变量控制授权域名
- **🔒 安全可靠** - 内置验证和错误处理，嵌入时显示Cookie发送目标

📖 **[Demo示例](./demo/example.html)** | 📚 **[API文档](./demo/API.md)**

## 贡献者 

![Contributors](https://contrib.rocks/image?repo=WittF/bilibili-qr-login)

---
