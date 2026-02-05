# 🍪 哔哩哔哩 Cookie 获取工具 - 更新日志

所有重要的项目变更都会记录在此文件中。

版本格式遵循 [语义化版本](https://semver.org/lang/zh-CN/)，更新日志格式基于 [约定式提交](https://conventionalcommits.org/zh-hans/)。


## [1.12.1](https://github.com/WittF/bilibili-qr-login/compare/v1.12.0...v1.12.1) (2026-02-05)


### 🐛 Bug修复

* **qrcode:** 添加边距确保二维码可被正确识别 ([86b1e9b](https://github.com/WittF/bilibili-qr-login/commit/86b1e9b7bd3e9d973f1875f73304f57423b706bc))


### 📚 文档更新

* **readme:** 更新截图并添加TV端登录文档 ([f239136](https://github.com/WittF/bilibili-qr-login/commit/f2391363f3443480ae685af9417a9ddf8a5327f3))

## [1.12.0](https://github.com/WittF/bilibili-qr-login/compare/v1.11.3...v1.12.0) (2025-10-12)


### ✨ 功能更新

* **iframe:** 添加targetOrigin参数并修复安全策略 ([5bb9a8d](https://github.com/WittF/bilibili-qr-login/commit/5bb9a8dbc3915a5c2256ae2431468afb1aa56924))

## [1.11.3](https://github.com/WittF/bilibili-qr-login/compare/v1.11.2...v1.11.3) (2025-10-11)


### 🐛 Bug修复

* **build:** 将TV端sign模块改为静态导入，避免ncc生成额外chunk ([11df5b8](https://github.com/WittF/bilibili-qr-login/commit/11df5b8aa45b55bdb22af83e58807e1b2e58cc74))


### 👷 CI/CD

* **release:** 使用官方推荐的successComment配置 ([0868b73](https://github.com/WittF/bilibili-qr-login/commit/0868b73b5c269046c09f853d4589ad752d10b9ad))

## [1.11.2](https://github.com/WittF/bilibili-qr-login/compare/v1.11.1...v1.11.2) (2025-10-11)


### 🐛 Bug修复

* **deps:** 添加terser依赖以修复Vite构建 ([70d3d3c](https://github.com/WittF/bilibili-qr-login/commit/70d3d3cb3ce04883c69552d88fd3f025f30e6982))

## [1.11.1](https://github.com/WittF/bilibili-qr-login/compare/v1.11.0...v1.11.1) (2025-10-11)


### 🐛 Bug修复

* **build:** 移除ClientSelector中未使用的watch导入 ([d60d6aa](https://github.com/WittF/bilibili-qr-login/commit/d60d6aa5360541d5d31d6f6a7925cdd20d71b332))

## [1.11.0](https://github.com/WittF/bilibili-qr-login/compare/v1.10.1...v1.11.0) (2025-10-10)


### ✨ 功能更新

* **login:** 实现TV端QR码登录与双端切换 ([393ba27](https://github.com/WittF/bilibili-qr-login/commit/393ba27ee48325bb684fd443add6ffa98da6822c))


### 🐛 Bug修复

* **qrSSE:** 增强SSE类型安全与容错，避免异常数据崩溃 ([f262417](https://github.com/WittF/bilibili-qr-login/commit/f26241754969e418155d29463fb6d1ebc3aff416))


### 💄 样式优化

* **icon:** 更新语言切换器图标为国际化样式 ([76cf92e](https://github.com/WittF/bilibili-qr-login/commit/76cf92ee1ffcf60a35406c264e30a5e489381da4))
* **layout:** 优化客户端选择器与二维码布局间距 ([9f5b1f1](https://github.com/WittF/bilibili-qr-login/commit/9f5b1f1e1cf471234ea0066b9d410161fd59e9cb))


### ⚡ 性能优化

* **app:** 修复防抖函数内存泄漏 ([9b81701](https://github.com/WittF/bilibili-qr-login/commit/9b817011a9b7c76547f6e59dc7c86b44893ae50d))


### 📦 构建

* **vite:** 拆分代码与压缩优化，减小构建体积 ([d7323ed](https://github.com/WittF/bilibili-qr-login/commit/d7323ed4c0233021353023740828c349022df9fd))

## [1.10.1](https://github.com/WittF/bilibili-qr-login/compare/v1.10.0...v1.10.1) (2025-09-24)


### 🐛 Bug修复

* **seo:** 修改HTML文件中的初始标题，解决链接预览显示Loading问题 ([dee41bd](https://github.com/WittF/bilibili-qr-login/commit/dee41bd6d05d5900264551abab14bd64a8dd18f5))


### 💄 样式优化

* **LanguageSwitcher:** 高度≥800px时向上展开，高度<800px时向下展开 ([5c497f5](https://github.com/WittF/bilibili-qr-login/commit/5c497f58f28b80274cead43bf192cb969a9bc19f))

## [1.10.0](https://github.com/WittF/bilibili-qr-login/compare/v1.9.0...v1.10.0) (2025-07-29)


### ✨ 功能更新

* **structured-data:** 添加结构化数据（JSON-LD）以增强SEO和应用信息 ([d161309](https://github.com/WittF/bilibili-qr-login/commit/d161309b4f350a90cc6500f85e07b12e31602178))


### 🐛 Bug修复

* **security:** 修复Referer检查兼容域名和完整origin配置 ([1d63d80](https://github.com/WittF/bilibili-qr-login/commit/1d63d80505339d1ac87da468e9e75dbfa6c64235))

## [1.9.0](https://github.com/WittF/bilibili-qr-login/compare/v1.8.2...v1.9.0) (2025-07-04)


### ✨ 功能更新

* **security:** 增强Referer检查支持TRUST_ORIGIN环境变量配置 ([6796700](https://github.com/WittF/bilibili-qr-login/commit/6796700ed3c0ff3a8f304e70e0a58e4ada20ecbc))

## [1.8.2](https://github.com/WittF/bilibili-qr-login/compare/v1.8.1...v1.8.2) (2025-06-25)


### 🐛 Bug修复

* **ui:** 调整语言选择器宽度确保文字完整显示 ([aadff66](https://github.com/WittF/bilibili-qr-login/commit/aadff660e9a5b56ba7701b2918684b8ee4a32102))


### 💄 样式优化

* **ui:** 优化语言选择器布局，图标和文字居中对齐 ([bcf3535](https://github.com/WittF/bilibili-qr-login/commit/bcf353570493ee8837a4f334a447a9ac7d5b45f4))

## [1.8.1](https://github.com/WittF/bilibili-qr-login/compare/v1.8.0...v1.8.1) (2025-06-25)


### 🐛 Bug修复

* **ui:** 修复语言选择器在768px断点时的尺寸协调问题 ([10b1d4a](https://github.com/WittF/bilibili-qr-login/commit/10b1d4a8cb2a084a2ed9b0f33fbfd99296039bb2))


### 💄 样式优化

* **ui:** 优化语言选择器按钮紧凑性，减少文字右侧空白 ([7659389](https://github.com/WittF/bilibili-qr-login/commit/765938929ddced2d9f3fabbcaa39f585bee2c95a))
* **ui:** 移除语言选择器按钮与下拉菜单间距，使其更贴近 ([6b7c798](https://github.com/WittF/bilibili-qr-login/commit/6b7c798ceb0635038f8fea4bbfe3af69ea081db3))


### 🔧 其他更改

* **releaserc:** 修改功能更新部分的标题为“✨ 功能更新” ([cadf27e](https://github.com/WittF/bilibili-qr-login/commit/cadf27e7a86a8db992f36f2c11057356c3645c38))

## [1.8.0](https://github.com/WittF/bilibili-qr-login/compare/v1.7.0...v1.8.0) (2025-06-25)


### ✨ 新功能

* **demo:** 自动检测环境使用对应API服务 ([31e00d2](https://github.com/WittF/bilibili-qr-login/commit/31e00d28956b97b6287c37799c4de64a4afd5946))
* **ui:** 小屏幕语言切换器向上展开 ([7ce1952](https://github.com/WittF/bilibili-qr-login/commit/7ce1952229bf7b3acb09459c62bfd6ab279f8cc0))


### 🐛 Bug修复

* **cors:** 修复Access-Control-Allow-Origin与Credentials冲突 ([60b21e4](https://github.com/WittF/bilibili-qr-login/commit/60b21e45c4706f1b4a5988a15adba0e6156fbc90))
* **server:** 修复CORS预检请求204状态码错误 ([92325ee](https://github.com/WittF/bilibili-qr-login/commit/92325ee849a8f01895160a8b9c2d536f743fbea3))


### ♻️ 代码重构

* **config:** 统一代码风格和TypeScript配置 ([7541b4c](https://github.com/WittF/bilibili-qr-login/commit/7541b4c8fb6bfab5ae914a3e4232bc67827f5336))

## [1.7.0](https://github.com/WittF/bilibili-qr-login/compare/v1.6.0...v1.7.0) (2025-06-25)


### ✨ 新功能

* **security:** 增强跨域消息处理和本地环境支持 ([56984d1](https://github.com/WittF/bilibili-qr-login/commit/56984d18d639a7120fcbd6fb2fab4a8bee91a07b))


### 🐛 Bug修复

* 修复嵌入模式跨域问题 ([7cbb077](https://github.com/WittF/bilibili-qr-login/commit/7cbb077b6125e97fa5dcb8bf691235b931dea980))
* 支持file协议CORS访问 ([0618377](https://github.com/WittF/bilibili-qr-login/commit/06183777251e83f028724970b99522cfb7554ef3))


### 📚 文档更新

* 完善API文档URL参数说明，简化README结构 ([ab6a0ba](https://github.com/WittF/bilibili-qr-login/commit/ab6a0badb6eb60f5335eb5ead39b5d73dfc850a3))

## [1.6.0](https://github.com/WittF/bilibili-qr-login/compare/v1.5.0...v1.6.0) (2025-06-25)


### ✨ 新功能

* **demo:** 精简并优化demo示例页面 ([e44803b](https://github.com/WittF/bilibili-qr-login/commit/e44803b8f6ba33aa0fcdda452d88d50250c0cea6))
* **security:** 增强跨域安全机制和用户隐私保护 ([8bf3678](https://github.com/WittF/bilibili-qr-login/commit/8bf367897b6393dcda6d1ee33717b0d76fc6453b))


### 📚 文档更新

* 简化README安全配置说明，详细信息移至API文档 ([dc5af9b](https://github.com/WittF/bilibili-qr-login/commit/dc5af9b4c05e5f8c86b2570d81d1ac276ef03f5e))

## [1.5.0](https://github.com/WittF/bilibili-qr-login/compare/v1.4.4...v1.5.0) (2025-06-25)


### ✨ 新功能

* **ui:** 优化二维码响应式缩放，实现丝滑尺寸变化动画 ([7ac804a](https://github.com/WittF/bilibili-qr-login/commit/7ac804abc6717b96ef4105172d6cfe8ed1227198))
* **ui:** 添加响应式二维码尺寸和配置，优化窗口大小变化处理 ([6891c80](https://github.com/WittF/bilibili-qr-login/commit/6891c803466cb39317ede6b6332c306d310e54ac))


### 🐛 Bug修复

* **ci:** 修复Docker构建条件判断和添加调试信息 ([8010db0](https://github.com/WittF/bilibili-qr-login/commit/8010db0adaf2909c3f06c0b76cac07f2d56d5284))
* **ui:** 小屏幕下二维码遮罩边框问题 ([ab3b0bc](https://github.com/WittF/bilibili-qr-login/commit/ab3b0bce213b31e7ad0e15bd6c2c652921d60dd4))


### 📚 文档更新

* **api:** 完善JSON转换API文档说明和演示页面 ([64754a5](https://github.com/WittF/bilibili-qr-login/commit/64754a5c69953445ecb1ab06570a48109d3f4068))


### ♻️ 代码重构

* **app:** 优化获取真实客户端IP的逻辑，增强错误处理和环境适配性 ([67f0f8b](https://github.com/WittF/bilibili-qr-login/commit/67f0f8b8e3047b2fbc6d378c660f1784a9f6dcdc))

## [1.4.4](https://github.com/WittF/bilibili-qr-login/compare/v1.4.3...v1.4.4) (2025-06-25)


### 🐛 Bug修复

* **ci:** 修复semantic-release workflow，添加发布条件检查和结果反馈 ([61bf66c](https://github.com/WittF/bilibili-qr-login/commit/61bf66ce28dd754aa4404d123c455a81da9a9c1c))
* **ci:** 修复semantic-release自动触发Docker构建问题 ([3b64d02](https://github.com/WittF/bilibili-qr-login/commit/3b64d023fde6a1c8cdbe15a3185bf96e7de1fbcd))
* **ci:** 修复webhook健康检查404错误，改进错误处理和状态反馈 ([53c9e43](https://github.com/WittF/bilibili-qr-login/commit/53c9e4377dbe276fe5e42b364822bb2ea702ce45))


### ♻️ 代码重构

* **ci:** 大幅简化Docker构建流程，仅保留正式发版功能 ([aea0829](https://github.com/WittF/bilibili-qr-login/commit/aea082925bfedd19bee8ae66955d126b9386b5c4))


### 🔧 其他更改

* **release:** 发布版本 v1.4.3 ([cd62b70](https://github.com/WittF/bilibili-qr-login/commit/cd62b70df49737c407e9234d96124d8d18b0b9ef))

## [1.4.3](https://github.com/WittF/bilibili-qr-login/compare/v1.4.2...v1.4.3) (2025-06-25)


### ♻️ 代码重构

* **ci:** 重构workflow为清晰的构建-发布-触发三阶段流程 ([8002a07](https://github.com/WittF/bilibili-qr-login/commit/8002a07394be60b98d1dc84f804a884a2e52f205))

## [1.4.2](https://github.com/WittF/bilibili-qr-login/compare/v1.4.1...v1.4.2) (2025-06-25)


### 🐛 Bug修复

* **ci:** 修复Docker构建workflow中的标签配置和依赖问题 ([23ceb2a](https://github.com/WittF/bilibili-qr-login/commit/23ceb2a3af9dbdb3f65c925dd18ad9fd4244270a))

## [1.4.1](https://github.com/WittF/bilibili-qr-login/compare/v1.4.0...v1.4.1) (2025-06-25)


### 🐛 Bug修复

* **ci:** 修复Dependabot提交时无法访问secrets导致的Docker发布失败问题 ([9cd15a8](https://github.com/WittF/bilibili-qr-login/commit/9cd15a84e9ca177ddef0830939367cdfaad00440))


### 📚 文档更新

* **ci:** 添加Dependabot无法访问secrets问题的详细说明文档 ([1caeaca](https://github.com/WittF/bilibili-qr-login/commit/1caeacaaddd1e1677e6c22b2f73a00f00b47263d))

## [1.4.0](https://github.com/WittF/bilibili-qr-login/compare/v1.3.0...v1.4.0) (2025-06-25)


### ✨ 新功能

* **demo:** 创建集成示例demo文件并精简文档 ([e807686](https://github.com/WittF/bilibili-qr-login/commit/e8076866ac296debcd9da8cc93aedf2cb5f4e6b8))


### 🐛 Bug修复

* **ci:** 修复webhook触发条件，确保开发和生产环境都能自动更新 ([949a1e4](https://github.com/WittF/bilibili-qr-login/commit/949a1e447243f35e392562823930c9fac732b704))


### 📚 文档更新

* **readme:** 移除README文档中的多余内容 ([6ad9772](https://github.com/WittF/bilibili-qr-login/commit/6ad97726f4e0ace212fa8c3de9e295b7d6a04add))
* **readme:** 重构README文档结构，新增独立集成指南 ([d7932be](https://github.com/WittF/bilibili-qr-login/commit/d7932be620227031954e14cb2f35bb9855c8a09a))

## [1.3.0](https://github.com/WittF/bilibili-qr-login/compare/v1.2.0...v1.3.0) (2025-06-25)


### ✨ 新功能

* **ci:** 优化Docker构建流程支持版本号传递和多平台构建 ([9661600](https://github.com/WittF/bilibili-qr-login/commit/9661600c718dc49fb1ae553ec14112ad8481b564))

## [1.2.0](https://github.com/WittF/bilibili-qr-login/compare/v1.1.1...v1.2.0) (2025-06-25)


### ✨ 新功能

* **ui:** 添加版本号显示并修复语言切换器样式问题 ([6077263](https://github.com/WittF/bilibili-qr-login/commit/607726363e7e4c26f03fc86405cfe642c2bce9fd))


### 👷 CI/CD

* 优化发版工作流，仅在main分支触发，支持dev分支开发 ([7aa8fd0](https://github.com/WittF/bilibili-qr-login/commit/7aa8fd0585a03050cbc0141c604f27487ad59a8b))

## [1.1.1](https://github.com/WittF/bilibili-qr-login/compare/v1.1.0...v1.1.1) (2025-06-25)


### 👷 CI/CD

* 优化发版工作流，仅在main分支触发，支持dev分支开发 ([46aff84](https://github.com/WittF/bilibili-qr-login/commit/46aff84232e5149d0615238a74bf439033710f99))

## [1.1.0](https://github.com/WittF/bilibili-qr-login/compare/v1.0.1...v1.1.0) (2025-06-25)


### ✨ 新功能

* **icons:** 优化成功图标清晰度，添加暗色主题自适应 ([2a34f8a](https://github.com/WittF/bilibili-qr-login/commit/2a34f8a20e4b6a3f2fd6da2399571b5636536be4))
* **icons:** 添加白色刷新图标，支持暗色主题自适应 ([84737a8](https://github.com/WittF/bilibili-qr-login/commit/84737a859378bb7ceb84f2e43a01e4aecd28d259))
* **iframe-window:** 完善iframe/window模式日志系统 ([ceafc46](https://github.com/WittF/bilibili-qr-login/commit/ceafc46eafeb8b2b935b77be10d86b638fdc3698))
* **logger:** 使用系统时间并优化i18n按钮可访问性 ([ab7ac17](https://github.com/WittF/bilibili-qr-login/commit/ab7ac1784864b2f11c72788814c4a1d465eb6eb0))
* **logger:** 统一前端日志系统 ([3d60abc](https://github.com/WittF/bilibili-qr-login/commit/3d60abc0fd6ec4ef83757e7d38e3405790ea31ec))
* **qr-sse:** 优化SSE重连机制和超时处理 ([adc0abd](https://github.com/WittF/bilibili-qr-login/commit/adc0abdbe6b9a71a27887404f6bf818a62642c0f))
* **server:** 添加在线客户端统计系统 ([b796bef](https://github.com/WittF/bilibili-qr-login/commit/b796bef4bbca2f6a9d880d7fb8c910a88048ad20))
* **theme:** 实现自动明暗主题切换系统 ([992ee0e](https://github.com/WittF/bilibili-qr-login/commit/992ee0efc5ff4942ac2218fd10fb5e27f23f95c9))
* **theme:** 添加URL参数支持和简化i18n按钮样式 ([2ba1519](https://github.com/WittF/bilibili-qr-login/commit/2ba151987add95137d98d2a6216687d3791bb02b))
* **ui:** 为所有文本切换添加平滑过渡动画 ([3b5d9cb](https://github.com/WittF/bilibili-qr-login/commit/3b5d9cbd6abaa747bd74eabb4a00ddfa07ea310f))
* **ui:** 为按钮添加固定宽度和平滑过渡动画防止布局跳动 ([b7d6ed0](https://github.com/WittF/bilibili-qr-login/commit/b7d6ed0b58aeb5bad09f2dd4c6312fc938bc91c9))
* **ui:** 为按钮添加自适应宽度和平滑过渡动画 ([93719c7](https://github.com/WittF/bilibili-qr-login/commit/93719c7a0a9f6b47903416f4ec9608b8c5ef9ddc))
* **ui:** 优化QR码动画效果和过期模糊度 ([b2ecc3c](https://github.com/WittF/bilibili-qr-login/commit/b2ecc3cf89e58cc5e4d88cf82d8f96c381a486e6))
* **ui:** 优化全局聚焦效果，实现渐入渐出动画 ([f06e8f8](https://github.com/WittF/bilibili-qr-login/commit/f06e8f80810f1816548a98d54b45c73a47fd6a76))
* **ui:** 增强边框图标阴影的平滑过渡效果 ([042d3c7](https://github.com/WittF/bilibili-qr-login/commit/042d3c7c6884d677755689fd6a706e8ea0de3007))
* **ui:** 极致丝滑聚焦体验优化，智能残留状态清除 ([e600a48](https://github.com/WittF/bilibili-qr-login/commit/e600a48d6952f019804b8f301b5a6fe35f49b2ae))
* **ui:** 添加文本切换动画防止布局跳动 ([cb156f8](https://github.com/WittF/bilibili-qr-login/commit/cb156f834299d66e5a117dfe268e3cf9409363c6))
* **ui:** 重构转换结果卡片，增强视觉效果和用户体验 ([af9994c](https://github.com/WittF/bilibili-qr-login/commit/af9994cc02374bea534297cbcb5dbf9478ddd0e7))
* 触发semantic-release自动发版 ([f96538b](https://github.com/WittF/bilibili-qr-login/commit/f96538b2429fe6d7146517481e45c40e05f8b837))


### 🐛 Bug修复

* **css:** 修复过期状态刷新按钮CSS语法错误 ([a7122e6](https://github.com/WittF/bilibili-qr-login/commit/a7122e6ce58fd45ce981d2115820a1bd5976661f))
* **css:** 移除多余的CSS括号，修复语法错误 ([16653b3](https://github.com/WittF/bilibili-qr-login/commit/16653b34e1a6cc4d91efe705db42939cb0aaa95e))
* **logger:** 前端日志系统解耦开发模式和调试模式 ([79544fd](https://github.com/WittF/bilibili-qr-login/commit/79544fd3c5d49b0d87206380ffef2be8d615d038))
* **logger:** 移除重复日志，保留Cookie验证特殊样式 ([1483f74](https://github.com/WittF/bilibili-qr-login/commit/1483f7414cdcee606d0ee894aad50d2f8ec2dd0b))
* **log:** 统一日志风格和网络错误检测 ([dee6705](https://github.com/WittF/bilibili-qr-login/commit/dee67050aaed3b7abb0d2ccf0a09f338f4f205b2))
* **network:** 优化网络错误处理和日志 ([ae25dcf](https://github.com/WittF/bilibili-qr-login/commit/ae25dcf69d28ae70c61e4bd4423e1c8e69baa98e))
* **qr:** 恢复QR码硬编码颜色，确保扫描兼容性 ([3ee1e48](https://github.com/WittF/bilibili-qr-login/commit/3ee1e48e9e0a3d19f5b168eee56c6233aa4a234d))
* **server:** 优化IP获取和会话ID显示格式 ([740d3c5](https://github.com/WittF/bilibili-qr-login/commit/740d3c5a71de1916b1797c031e8869ec83f24601))
* **theme:** 修复URL参数主题切换并添加调试工具 ([7c577eb](https://github.com/WittF/bilibili-qr-login/commit/7c577eb14cb10a73fcc47836e8413dea9ae893b7))
* **ui:** 优化载入动画，删除强制滚动条，避免页面跳动 ([572a968](https://github.com/WittF/bilibili-qr-login/commit/572a9687964057c0ee9f7c805a2c413bc31fc473))
* **ui:** 使用flex居中完全解决SVG图标垂直对齐问题 ([31f5cfb](https://github.com/WittF/bilibili-qr-login/commit/31f5cfbc5c6984cd0e147d20d68cb1771d41faf4))
* **ui:** 使用vertical-align:middle正确修复SVG图标垂直居中问题 ([61cb614](https://github.com/WittF/bilibili-qr-login/commit/61cb6149d9622eb993ea9e9f4c5b56f035b6d6e1))
* **ui:** 修复CheckIcon定位问题，防止左上角显示调试信息 ([0fd9210](https://github.com/WittF/bilibili-qr-login/commit/0fd9210b4c16a67e2ab1f98f90f2e5a38b2df589))
* **ui:** 修复SVG图标垂直对齐问题，确保与文本完美水平对齐 ([4ca9fc9](https://github.com/WittF/bilibili-qr-login/commit/4ca9fc90f257dc580429ccb44df66a927e043f16))
* **ui:** 修复SVG图标垂直居中问题 ([6e503e2](https://github.com/WittF/bilibili-qr-login/commit/6e503e218d8ae3dad02f3421bdd7ec8182c5df19))
* **ui:** 修复SVG图标垂直居中问题 - 使用flex布局和固定高度消除基线影响 ([b1010c9](https://github.com/WittF/bilibili-qr-login/commit/b1010c99230f25fd433e179989a2db6d8c9dcac7))
* **ui:** 修复SVG图标缩放问题，正确显示check图标内容 ([00c84ca](https://github.com/WittF/bilibili-qr-login/commit/00c84cac2f87db9f28adba1e6ec134e9a260d753))
* **ui:** 修复成功图标显示位置，从左上角移至居中 ([ca2845e](https://github.com/WittF/bilibili-qr-login/commit/ca2845e0d9e6b2db474cf59bfd324b073eb9e864))
* **ui:** 修复暗色模式下刷新按钮配色问题 ([84b58d1](https://github.com/WittF/bilibili-qr-login/commit/84b58d10867c87d4e40a495781c986c0acfd6678))
* **ui:** 修复查看源码按钮和语言切换器聚焦效果 ([57c1eda](https://github.com/WittF/bilibili-qr-login/commit/57c1eda08ea30456146da9719e15af241e30b148))
* **ui:** 修复简体中文激活状态下tab聚焦框不显示问题 ([92d400d](https://github.com/WittF/bilibili-qr-login/commit/92d400d0f9e8f0a700fb48f46ff9154bd556f6b5))
* **ui:** 修复聚焦模糊和边框溢出问题，优化聚焦清晰度 ([645f30d](https://github.com/WittF/bilibili-qr-login/commit/645f30d95c7a3ce0338dba8819e195b745282340))
* **ui:** 删除无用蓝色加载动画并修复i18n按钮暗色模式配色 ([93a33dd](https://github.com/WittF/bilibili-qr-login/commit/93a33dd48a4e6e87d430e8f8fecb44ce39f9be1e))
* **ui:** 增强QR码过期模糊效果，优化刷新按钮暗色主题配色 ([ce37d56](https://github.com/WittF/bilibili-qr-login/commit/ce37d56c5e512da66409f3972bdbb4f8d7971dc7))
* **ui:** 完全统一GitHub按钮与I18n按钮的配色体系 ([4b31549](https://github.com/WittF/bilibili-qr-login/commit/4b315499dcf22436284391aec1fe6fbc35ae7574))
* **ui:** 完善RefreshBtn统一配色系统 ([ac67b42](https://github.com/WittF/bilibili-qr-login/commit/ac67b420fd6fc4b61e5d81572c71f8c2b367b2d6))
* **ui:** 完善暗色主题下GitHub按钮边框显示 ([d26d717](https://github.com/WittF/bilibili-qr-login/commit/d26d71703337477e74a383f50fd4f59c0c2b1e6d))
* **ui:** 强制修复成功图标居中定位，使用!important确保样式优先级 ([13d5bc1](https://github.com/WittF/bilibili-qr-login/commit/13d5bc15cd047ac7522529dde56a8cb43eaee12b))
* **ui:** 强制显示垂直滚动条，避免页面跳动 ([945c463](https://github.com/WittF/bilibili-qr-login/commit/945c463cdbd6381d6fd0b7298eef41520ee588ee))
* **ui:** 彻底修复成功图标居中显示问题 ([8516453](https://github.com/WittF/bilibili-qr-login/commit/851645357fc3837b33e3e18203896d367e692d81))
* **ui:** 恢复GitHub按钮的边框和背景样式 ([7dda699](https://github.com/WittF/bilibili-qr-login/commit/7dda6993eedf8f03aaabb57f6b9dbd646a8b4b65))
* **ui:** 恢复语言切换按钮半透明样式 ([ebe140a](https://github.com/WittF/bilibili-qr-login/commit/ebe140a33281d2a29165f31f8cd040918098e409))
* **ui:** 正确修复SVG图标尺寸和对齐问题，使用容器+内部svg双重控制 ([68102ae](https://github.com/WittF/bilibili-qr-login/commit/68102ae2981f546ddcefe311e9b655c7ba7bdc38))
* **ui:** 移除RefreshBtn重复样式，统一使用CSS变量 ([88288c1](https://github.com/WittF/bilibili-qr-login/commit/88288c1ea0f26b8ddc72f4ff949bcf53f3be7586))
* **ui:** 简化载入动画为淡入效果，彻底解决滚动条跳动 ([86d140e](https://github.com/WittF/bilibili-qr-login/commit/86d140e68f74841ea0ecc5656cde590555ea1084))
* **ui:** 统一GitHub按钮暗色主题配色，与I18n按钮保持一致 ([1023041](https://github.com/WittF/bilibili-qr-login/commit/10230415e0c28a0ba0342b17f555f3ab2f6c491f))
* **ui:** 补充修复CookieDisplay中copy-icon的垂直居中 ([5e0101d](https://github.com/WittF/bilibili-qr-login/commit/5e0101d89cfa98ab075d65bd9eb09441c11f8ea3))
* **ui:** 过期状态时刷新按钮始终可见，无需悬停 ([780589d](https://github.com/WittF/bilibili-qr-login/commit/780589d68e34f7abe7ee76d248c6a4c678e4ca13))
* **ui:** 重构成功图标定位，使用flex布局完美居中 ([900c048](https://github.com/WittF/bilibili-qr-login/commit/900c048edbb994f16c882940654dbf243d829d7f))
* 修复所有ESLint警告和代码规范问题 ([99d8f13](https://github.com/WittF/bilibili-qr-login/commit/99d8f1325841014d337b9acbb1f06a56a5141842))
* 修复日志系统 - info级别日志应该始终显示 ([8a3355d](https://github.com/WittF/bilibili-qr-login/commit/8a3355de1f14f404eab5f04334a6af4a5f6d8bff))
* 修复日志级别配置 - 将重要日志从debug改为info级别 ([29044aa](https://github.com/WittF/bilibili-qr-login/commit/29044aaac748a75645aff1ada1e9b8dc8b7579e6))
* 修复日志输出undefined问题 - 只在有数据时才传递给console ([20d6345](https://github.com/WittF/bilibili-qr-login/commit/20d6345a456f1aa7adeb57a58f0947ab4e5b4627))
* 修复构建错误 - 添加缺失的logger.warn方法和修正国际化键 ([39e855f](https://github.com/WittF/bilibili-qr-login/commit/39e855fe726adf921a1c95db751f32b43a022689))


### 💄 样式优化

* **cookie:** 优化卡片圆角和背景样式 ([44e24a9](https://github.com/WittF/bilibili-qr-login/commit/44e24a9e3f80ecc2b1d7a7eeb489b9427fd86fd2))
* **ui:** 恢复GitHub按钮粉色配色，符合品牌调性 ([e007cbc](https://github.com/WittF/bilibili-qr-login/commit/e007cbc597719f3c6b6a98b2df838afc42d7ac57))
* **ui:** 暗色模式下提亮Github链接颜色显示 ([86c52cc](https://github.com/WittF/bilibili-qr-login/commit/86c52ccf27ec4d7989004a3a65d15a7fb6d17439))
* **ui:** 移除cookie结果卡片的绿色左边框 ([1c045f5](https://github.com/WittF/bilibili-qr-login/commit/1c045f5f757d23243b09e9cd74a2e6bd424479c7))


### ♻️ 代码重构

* **css:** 移除冗余的成功图标样式，由CheckIcon组件自管理 ([d79f74e](https://github.com/WittF/bilibili-qr-login/commit/d79f74e3fd0de49b000e4468dedc87a4f9a04cd2))
* **theme:** 删除调试工具并优化日志输出 ([8b77dfe](https://github.com/WittF/bilibili-qr-login/commit/8b77dfe17c523cd1838b7589f5790188822e3ba7))
* **ui:** 简化动画效果 ([48b8423](https://github.com/WittF/bilibili-qr-login/commit/48b8423e5e008de9c9a1df43fc6e9b6d61da22c3))
* **ui:** 重构cookie转换卡片和按钮，采用简洁清晰的设计风格 ([c29bdd4](https://github.com/WittF/bilibili-qr-login/commit/c29bdd408d230ad4843747f54d8cde3ce9fec229))
* **ui:** 重构Cookie转换结果卡片，优化UI设计和交互体验 ([df753dc](https://github.com/WittF/bilibili-qr-login/commit/df753dcf2ce19870e12ea422d2b2a96fb2c833e6))
* 简化项目复杂度，移除过度设计 ([be263f4](https://github.com/WittF/bilibili-qr-login/commit/be263f43d96f75cf0b77b1ae4f9634de9cc05921))


### 👷 CI/CD

* 修复semantic-release触发条件，支持main分支push触发 ([3f10f46](https://github.com/WittF/bilibili-qr-login/commit/3f10f4641717ddd9ee7e1c51786b8a5554d00842))


### 🔧 其他更改

* **ci:** 更新 GitHub Actions 工作流，替换传统的 changelog 生成步骤为 semantic-release，优化版本管理和发布流程 ([0fc4dee](https://github.com/WittF/bilibili-qr-login/commit/0fc4deeac30852656bdeea3d4470389a9e015d25))
* 撤销版本号更新，回滚至1.1.0 ([998b021](https://github.com/WittF/bilibili-qr-login/commit/998b021bf06193685071a16c6ea39842ab898dd0))
* 更新版本号至1.1.1 ([26c2f39](https://github.com/WittF/bilibili-qr-login/commit/26c2f39180f8d0800c5a8dcea2d11d58ce12ecae))
* 更新版本号至1.1.1 ([2aa87e0](https://github.com/WittF/bilibili-qr-login/commit/2aa87e0c52494dc911a7b8bf4b61b34bfab174b9))
* 更新版本号至1.1.2 ([9f135d3](https://github.com/WittF/bilibili-qr-login/commit/9f135d35069888aa098669229f9a3da3af06ff5c))
* 重置版本号为semantic-release全自动管理 ([c1839a0](https://github.com/WittF/bilibili-qr-login/commit/c1839a0eeeb31c32df8e5b976a22346e1ec1bb2d))
* 重置版本号为semantic-release管理 ([18c3a10](https://github.com/WittF/bilibili-qr-login/commit/18c3a10cf9ceb468d2c4efbe488e27a468741d08))

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
