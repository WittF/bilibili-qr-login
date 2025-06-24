# 🍪 哔哩哔哩 Cookie 获取工具 - 更新日志

所有重要的项目变更都会记录在此文件中。

版本格式遵循 [语义化版本](https://semver.org/lang/zh-CN/)，更新日志格式基于 [约定式提交](https://conventionalcommits.org/zh-hans/)。


## 1.0.0 (2025-06-24)


### ✨ 新功能

* allow retry when scanned or succeeded ([50b3f2e](https://github.com/WittF/bilibili-qr-login/commit/50b3f2e40c0d06cff89dd6ac4c9208eb8d3b2573))
* cookie display ([afc074a](https://github.com/WittF/bilibili-qr-login/commit/afc074a9bf2a00f8ee2554048221f02f19f38b0f))
* get buvid3 from api ([36e431c](https://github.com/WittF/bilibili-qr-login/commit/36e431c14cdffd13248207479908bb257f2f2893)), closes [#1](https://github.com/WittF/bilibili-qr-login/issues/1)
* huggingface ([b272e20](https://github.com/WittF/bilibili-qr-login/commit/b272e201cb5a2cc05cad7d19d302b08fabaa3005))
* iframe / window mode ([55151cc](https://github.com/WittF/bilibili-qr-login/commit/55151cc2a3040964d6fc1f9eefc1d0e3eaa6c097))
* loading animation ([4ba7e27](https://github.com/WittF/bilibili-qr-login/commit/4ba7e27ab9818d2d2446835ce4bd4c27cc135234))
* sse api ([58f6ba5](https://github.com/WittF/bilibili-qr-login/commit/58f6ba58865a2838cfe3872d22fb0ee5ec14502c))
* stream on abort ([2cd55e9](https://github.com/WittF/bilibili-qr-login/commit/2cd55e90e52768bf491d6ca5b7ca43166a899bef))
* ui ([ef2c178](https://github.com/WittF/bilibili-qr-login/commit/ef2c1786de69e0a9b9e1efbef0a89653b47bbebf))
* 优化 cookie 转换接口 ([45bda7a](https://github.com/WittF/bilibili-qr-login/commit/45bda7a53b987e561df1dfe03801fa594915fd73))
* 删除 README 文件，添加 cookie 转换接口，优化 App.vue 和 CookieDisplay.vue 组件样式 ([dd04917](https://github.com/WittF/bilibili-qr-login/commit/dd04917718265519e88ee9179c889daeb17b62db))
* 增强页面 SEO 和多语言支持，优化 meta 标签和动态语言检测功能 ([8c927c1](https://github.com/WittF/bilibili-qr-login/commit/8c927c1eea7e1e311d5f5ec1c21af92c18e32af5))
* 更新 Dockerfile，调整文件复制路径并移动 index.js 文件 ([bbdda03](https://github.com/WittF/bilibili-qr-login/commit/bbdda03b85a29616293b35895fcd1f25125b920d))
* 添加 Cookie 验证功能，优化 IP 获取逻辑，增强日志记录 ([1a7b4d6](https://github.com/WittF/bilibili-qr-login/commit/1a7b4d65dd1a4aee4ec8fee8a6be87fb4b3708f4))
* 添加 Docker 构建和推送工作流，支持多平台构建和标签管理 ([d9064bc](https://github.com/WittF/bilibili-qr-login/commit/d9064bcd444f8d9b0b8bab2737672404b97a58ee))
* 添加 QR 状态码描述工具函数，优化日志输出，更新开发和生产环境启动信息 ([0a71826](https://github.com/WittF/bilibili-qr-login/commit/0a7182657675d89d11b365ee6e91daa1948bf4d5))
* 添加调试日志功能，优化 QR 码生成和轮询逻辑，增强错误处理 ([a0b0947](https://github.com/WittF/bilibili-qr-login/commit/a0b09470e6c03c129e28766ed9a2f4d9927a8409))
* 重构 App.vue 和 CookieDisplay.vue 组件，优化界面布局和样式 ([c7cb4da](https://github.com/WittF/bilibili-qr-login/commit/c7cb4da7b4e4660d8a755b0f5001dfe2c6e2c54c))


### 🐛 Bug修复

* buvid3 ([459c3a0](https://github.com/WittF/bilibili-qr-login/commit/459c3a05fd12f5f04e2e5de3d8baff35605d734c))
* cross-origin ([0153e4e](https://github.com/WittF/bilibili-qr-login/commit/0153e4e83c8ceb23ec00a9c4a928a31bed7a8a84))
* **i18n:** 修正语言包中“bilibili”标题的大小写 ([f3199bf](https://github.com/WittF/bilibili-qr-login/commit/f3199bfcbf9e8d5e2ce2b9eb83c96aef813bb42c))
* referer check ([824b3c5](https://github.com/WittF/bilibili-qr-login/commit/824b3c5fae6f326081cb1d8d67f0fec8465516b9))
* resizable ([0d58335](https://github.com/WittF/bilibili-qr-login/commit/0d58335f7fe0a38692b6102785742a6fd27b942e))
* **ui:** 优化语言切换器布局和英文标题 ([1c23c70](https://github.com/WittF/bilibili-qr-login/commit/1c23c70faa2465d007d51e00cc3fc80692d13e78))
* vercel site ([dbbebc7](https://github.com/WittF/bilibili-qr-login/commit/dbbebc757c22e309e66bd066180c0a42c07cc609))
* workflow ([a984862](https://github.com/WittF/bilibili-qr-login/commit/a98486288a2b79e6b4a65a7c72dd8ccd445a3b42))
* 更新 Docker 工作流，优化镜像名称设置和 Docker Hub 描述的提取方式 ([64d17cc](https://github.com/WittF/bilibili-qr-login/commit/64d17cc4eed4df62a4e2d96416ec536821adbce2))
* 更新 Docker 工作流，修复 Docker Hub 描述更新条件并添加环境变量支持 ([ea6948a](https://github.com/WittF/bilibili-qr-login/commit/ea6948ac102ca4e262bb09d84f1be1b2ae050824))
* 更新 Docker 工作流，将 DOCKER_USERMAIL 替换为 DOCKER_USERNAME，以确保登录信息一致性 ([53e1161](https://github.com/WittF/bilibili-qr-login/commit/53e11617ae67bafb545a7cf97c07eae92f6c7d3e))
* 更新 Docker 工作流，将 DOCKER_USERNAME 环境变量从 secrets 更改为 vars ([d687e3c](https://github.com/WittF/bilibili-qr-login/commit/d687e3c867638154dd7c1db3da67964ff77c8b64))
* 更新 Docker 工作流，将 DOCKER_USERNAME 环境变量替换为 DOCKER_USERMAIL，以确保正确的登录信息 ([a39a7aa](https://github.com/WittF/bilibili-qr-login/commit/a39a7aa436f3392ea38906e278d5f0992ea33d24))
* 更新 Docker 工作流，添加 WEBHOOK_IP 环境变量并优化缓存设置 ([eeb80c4](https://github.com/WittF/bilibili-qr-login/commit/eeb80c4750a55245d0a4e0978ca7f965f5df2ccc))
* 更新 Docker 工作流，添加环境变量支持并优化镜像名称和描述设置 ([1619fad](https://github.com/WittF/bilibili-qr-login/commit/1619fad33abaeef2b0a790419008c4d161689e2e))
* 更新 Dockerfile 和 package.json，添加 semantic-release 相关依赖并优化 Docker 工作流缓存设置 ([8750d77](https://github.com/WittF/bilibili-qr-login/commit/8750d77ccf3019350b0c65cd820fd56759096ec3))


### 📚 文档更新

* update README and docker workflow ([650e511](https://github.com/WittF/bilibili-qr-login/commit/650e51132e52b580c57d76a2bb543d55ab1ce907))


### 💄 样式优化

* **ui:** adjust i18n button position to right ([fd1d80b](https://github.com/WittF/bilibili-qr-login/commit/fd1d80bbb4c7582cc7b7e33361fb47d0c56dc73a))
* **ui:** optimize layout and animations ([17af181](https://github.com/WittF/bilibili-qr-login/commit/17af18170c23bccb2d43160a4339ff55236c7fa1))


### 🔧 其他更改

* config ([e3b6f6d](https://github.com/WittF/bilibili-qr-login/commit/e3b6f6d123a44a557c812108d2952f246fa8dae3))
* docker build arg ([2225300](https://github.com/WittF/bilibili-qr-login/commit/2225300763793294052c3378fd114e44fca43cea))
* favicon ([8f48415](https://github.com/WittF/bilibili-qr-login/commit/8f48415d08165f106d80a1afed986f7914e4c9b5))
* update dependencies ([077d587](https://github.com/WittF/bilibili-qr-login/commit/077d5871e9718d36e18a9b771302427d841eeab3))
* update dependencies ([df88f66](https://github.com/WittF/bilibili-qr-login/commit/df88f666771e3b71772c509b894bf10993fdc343))
* vscode config ([76d16eb](https://github.com/WittF/bilibili-qr-login/commit/76d16ebc216daacc7d4e115cb12dbe9b2a53a082))
* 更新 .gitignore 文件以忽略 release.py，并在工作流中添加 conventional-changelog-conventionalcommits 依赖 ([7669cb4](https://github.com/WittF/bilibili-qr-login/commit/7669cb4a652fc418dbf6f5d17ad12b149fac1c3e))
* 移除 package.json 中不再需要的 semantic-release 相关依赖 ([0e0484f](https://github.com/WittF/bilibili-qr-login/commit/0e0484fcae9ececf78fa720202a89324487fc30d))
