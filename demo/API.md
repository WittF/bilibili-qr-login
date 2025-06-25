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