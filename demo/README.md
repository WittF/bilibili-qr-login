# Demo 示例

这个目录包含了B站登录服务的使用示例和API文档。

## 📁 文件说明

- **`example.html`** - 集成示例，演示嵌入式登录和JSON转换功能
- **`API.md`** - 详细的API接口文档，包含请求响应格式和字段说明
- **`basic.html`** - 基础HTML/JavaScript实现示例
- **`json-convert-example.html`** - JSON转换API专项演示
- **`vue-example.vue`** - Vue 3集成示例
- **`react-example.jsx`** - React集成示例

## 🚀 快速开始

### 本地示例
在项目根目录启动本地服务器后，打开 `example.html` 查看集成效果：

```bash
# 启动本地服务器
yarn dev

# 打开示例页面
open demo/example.html
```

### API文档  
查看 `API.md` 了解详细的接口说明和集成方法。

## 💡 核心功能

1. **嵌入式登录** - 支持iframe和window两种模式
2. **Cookie转换** - 将B站Cookie转换为标准JSON格式
3. **消息通信** - 通过postMessage安全传递登录结果

 