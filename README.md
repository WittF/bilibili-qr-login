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

---

## 使用截图

<div style="display: flex; justify-content: center; gap: 20px;">
  <img src="https://github.com/user-attachments/assets/29151f9f-4ffe-4b57-a1d1-4c5d942dfdb7" width="48%" />
  <img src="https://github.com/user-attachments/assets/13b0ce07-5926-4082-ae70-e21c0abae3f6" width="50%" />
</div>

---

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/WittF/bilibili-qr-login.git

# 进入项目目录
cd bilibili-qr-login

# 运行项目（根据项目实际运行方式调整）
yarn install
yarn start
```

## 在 Docker 部署

```bash
# 拉取镜像
docker pull wittf/bili-qrlogin:latest

# 运行容器
docker run -d \
  --name bili-qrlogin \
  -p 3000:3000 \
  wittf/bili-qrlogin:latest
```

## 在 Vercel 部署

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/WittF/bilibili-qr-login)

> 默认服务将运行在 localhost:3000，你可以根据需要修改端口映射
