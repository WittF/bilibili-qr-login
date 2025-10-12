# B站登录服务 API 文档

## 概述

B站登录服务提供了两种主要功能：
1. **嵌入式登录** - 通过iframe或window模式集成登录功能
2. **Cookie转换API** - 将Cookie字符串转换为TinyDB JSON格式

## 嵌入式登录集成

### 登录页面URL

```
https://login.bilibili.bi/
```

### URL参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| mode | string | 否 | 登录模式，`iframe`或`window` | `?mode=iframe` |
| lang | string | 否 | 界面语言，默认`zh-CN` | `?lang=en` |
| theme | string | 否 | 明暗模式，`light`/`dark`/`auto`，默认`auto` | `?theme=dark` |
| targetOrigin | string | 否 | 手动指定postMessage的目标域名 | `?targetOrigin=https://app.com` |

#### 主题模式说明

- **`light`** - 强制使用浅色主题
- **`dark`** - 强制使用深色主题  
- **`auto`** - 自动跟随系统主题设置（默认）

#### 多参数组合示例

```
# iframe模式 + 英文界面 + 深色主题
https://login.bilibili.bi/?mode=iframe&lang=en&theme=dark

# 弹窗模式 + 浅色主题
https://login.bilibili.bi/?mode=window&theme=light

# iframe模式 + 指定目标域名
https://login.bilibili.bi/?mode=iframe&targetOrigin=https://app.com
```

### 消息通信格式

登录成功后，会通过 `postMessage` 发送消息：

```javascript
// 消息格式
{
  type: 'success',         // 消息类型，固定为 'success'
  mode: 'iframe',          // 登录模式：'iframe' 或 'window'
  data: 'SESSDATA=xxx...'  // Cookie字符串
}
```

### 集成示例

```javascript
// 监听登录消息
window.addEventListener('message', (event) => {
    // 验证消息来源
    if (event.origin !== 'https://login.bilibili.bi') {
        return;
    }
    
    const { type, mode, data } = event.data;
    if (type === 'success') {
        console.log('登录成功，Cookie:', data);
    }
});
```

## Cookie转换API

### 接口地址

```
POST https://login.bilibili.bi/api/convert
```

### 请求格式

#### Headers
```
Content-Type: application/json
```

#### 请求体
```json
{
  "cookies": "SESSDATA=xxx; bili_jct=yyy; DedeUserID=zzz"
}
```

### 请求参数说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cookies | string | 是 | Cookie字符串，支持两种格式：<br>1. 标准格式：`key=value; key2=value2`<br>2. JSON数组格式：`[{"name":"key","value":"value"}]` |

### 响应格式

#### 成功响应 (200)
```json
{
  "_default": {
    "1": {
      "value": [
        {
          "name": "SESSDATA",
          "value": "cb06b5c2%2C1641234567%2Cb1a2c*31",
          "domain": ".bilibili.com",
          "path": "/",
          "expires": 1641234567,
          "httpOnly": true,
          "secure": true,
          "sameSite": "Lax"
        },
        {
          "name": "bili_jct",
          "value": "abc123def456",
          "domain": ".bilibili.com",
          "path": "/",
          "expires": 1641234567,
          "httpOnly": false,
          "secure": true,
          "sameSite": "Lax"
        }
      ]
    }
  }
}
```

#### 错误响应 (400/500)
```json
{
  "error": "Invalid cookie format"
}
```

### Cookie字段说明

每个Cookie对象包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | Cookie名称 |
| value | string | Cookie值 |
| domain | string | Cookie域名，自动推断为`.bilibili.com` |
| path | string | Cookie路径，默认为`/` |
| expires | number | 过期时间戳，从Cookie中解析或设置为30天后 |
| httpOnly | boolean | 是否仅HTTP访问，重要Cookie设为`true` |
| secure | boolean | 是否仅HTTPS传输，默认`true` |
| sameSite | string | 同站限制策略，默认`Lax` |

### 智能特性

1. **自动域名推断** - 根据Cookie名称自动设置正确的域名
2. **安全属性设置** - 自动为敏感Cookie设置httpOnly
3. **过期时间解析** - 从Cookie字符串中解析过期时间

### 使用示例

#### JavaScript/Fetch
```javascript
const response = await fetch('https://login.bilibili.bi/api/convert', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        cookies: 'SESSDATA=xxx; bili_jct=yyy'
    })
});

const result = await response.json();
console.log(result);
```

#### cURL
```bash
curl -X POST https://login.bilibili.bi/api/convert \
  -H "Content-Type: application/json" \
  -d '{"cookies": "SESSDATA=xxx; bili_jct=yyy"}'
```

#### Python
```python
import requests

response = requests.post(
    'https://login.bilibili.bi/api/convert',
    json={'cookies': 'SESSDATA=xxx; bili_jct=yyy'}
)
result = response.json()
```

## 跨域安全配置

### 配置方式

有两种方式配置 postMessage 的目标域名：

#### 1. TRUST_ORIGIN 环境变量（服务端配置）

| 配置 | 说明 |
|------|------|
| `TRUST_ORIGIN="*"` | 允许所有域名（开发环境默认） |
| `TRUST_ORIGIN=""` | 仅允许同域名（生产环境默认） |
| `TRUST_ORIGIN="https://app.com"` | 指定单个信任域名 |
| `TRUST_ORIGIN="https://a.com,https://b.com"` | 多个信任域名，逗号分隔 |

#### 2. targetOrigin URL 参数（客户端指定）

```
https://login.bilibili.bi/?mode=iframe&targetOrigin=https://yourdomain.com
```

**使用示例**：
```javascript
const loginUrl = 'https://login.bilibili.bi/?mode=iframe&targetOrigin=' +
                 encodeURIComponent(window.location.origin);
```

### 安全规则

| TRUST_ORIGIN 配置 | targetOrigin 参数 | 实际行为 |
|-------------------|-------------------|----------|
| `*` | 任意值 | ✅ 允许发送到指定域名 |
| `https://app.com` | `https://app.com` | ✅ 在白名单内，允许 |
| `https://app.com` | `https://evil.com` | ❌ 不在白名单，降级到白名单发送 |
| 未配置 | 任意值 | ✅ 允许 |
| 未配置 | 未指定 | 自动检测父页面域名 |

### 安全建议

- ✅ 生产环境建议配置 `TRUST_ORIGIN` 白名单
- ✅ 客户端可用 `targetOrigin` 参数明确指定域名
- ✅ 白名单配置不会被 URL 参数绕过
- ⚠️ 避免在生产环境使用 `TRUST_ORIGIN="*"`

## 注意事项

1. **跨域限制** - 嵌入式登录需要正确处理跨域消息
2. **HTTPS要求** - 建议在HTTPS环境下使用
3. **Cookie安全** - 妥善保管获取的Cookie，避免泄露
4. **频率限制** - API可能有访问频率限制，请合理使用

## 错误码

| HTTP状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 | 