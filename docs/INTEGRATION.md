# 🔗 嵌入模式集成指南

本文档介绍如何在您的网站中集成哔哩哔哩登录工具的iframe和window模式。

## 📋 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)  
- [集成模式](#集成模式)
- [JSON转换API](#json转换api)
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
            width="420" height="610" style="border: none;">
    </iframe>
`;

// 3. window模式
window.open(
    'https://login.bilibili.bi/?mode=window',
    'bili_login',
    'width=420,height=610,resizable=no'
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

## JSON转换API

### 📊 功能概述

JSON转换API提供Cookie格式转换服务，将B站Cookie转换为TinyDB格式的JSON数据，方便其他应用程序集成和存储。

**特性：**
- 🔄 支持多种输入格式（字符串/对象数组）
- 🧠 智能域名推测
- 🔐 自动安全属性设置
- 📁 标准TinyDB格式输出
- 🚀 RESTful API设计

### 🔗 接口信息

```
POST /api/convert
Content-Type: application/json
```

### 📥 请求格式

#### 字符串格式输入
```json
{
  "cookies": "SESSDATA=cb06b5c2%2C1641234567%2Cb1a2c*31; bili_jct=abc123; DedeUserID=12345678; buvid3=A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
}
```

#### 对象数组格式输入
```json
{
  "cookies": [
    {
      "name": "SESSDATA",
      "value": "cb06b5c2%2C1641234567%2Cb1a2c*31",
      "domain": ".bilibili.com"
    },
    {
      "name": "bili_jct", 
      "value": "abc123"
    }
  ]
}
```

### 📤 响应格式

成功响应（HTTP 200）：
```json
{
  "_default": {
    "1": {
      "key": "cookie",
      "value": [
        {
          "name": "SESSDATA",
          "value": "cb06b5c2%2C1641234567%2Cb1a2c*31",
          "domain": ".bilibili.com",
          "path": "/",
          "expires": 1672502400,
          "httpOnly": true,
          "secure": true,
          "sameSite": "Lax"
        },
        {
          "name": "bili_jct",
          "value": "abc123",
          "domain": ".bilibili.com", 
          "path": "/",
          "expires": 1672502400,
          "httpOnly": false,
          "secure": false,
          "sameSite": "Lax"
        }
      ]
    }
  }
}
```

错误响应：
```json
{
  "error": "无效的cookie数据"
}
```

### 🛠️ 使用示例

#### JavaScript/Node.js
```javascript
async function convertCookies(cookieString) {
  try {
    const response = await fetch('https://login.bilibili.bi/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cookies: cookieString
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    console.log('转换成功:', jsonData);
    return jsonData;
  } catch (error) {
    console.error('转换失败:', error);
    throw error;
  }
}

// 使用示例
const cookies = "SESSDATA=xxx; bili_jct=yyy; DedeUserID=zzz";
convertCookies(cookies);
```

#### Python
```python
import requests
import json

def convert_cookies(cookie_string, api_url="https://login.bilibili.bi/api/convert"):
    """将Cookie字符串转换为TinyDB格式的JSON"""
    try:
        payload = {"cookies": cookie_string}
        response = requests.post(
            api_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"转换失败: {e}")
        raise

# 使用示例
cookies = "SESSDATA=xxx; bili_jct=yyy; DedeUserID=zzz"
result = convert_cookies(cookies)
print("转换结果:", json.dumps(result, indent=2, ensure_ascii=False))
```

#### cURL
```bash
# 基本使用
curl -X POST https://login.bilibili.bi/api/convert \
  -H "Content-Type: application/json" \
  -d '{"cookies": "SESSDATA=xxx; bili_jct=yyy; DedeUserID=zzz"}'

# 美化输出
curl -X POST https://login.bilibili.bi/api/convert \
  -H "Content-Type: application/json" \
  -d '{"cookies": "SESSDATA=xxx; bili_jct=yyy"}' | jq '.'
```

#### C#
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class CookieConverter
{
    private static readonly HttpClient client = new HttpClient();
    
    public async Task<string> ConvertCookiesAsync(string cookieString)
    {
        var payload = new { cookies = cookieString };
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        try
        {
            var response = await client.PostAsync(
                "https://login.bilibili.bi/api/convert", 
                content
            );
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"转换失败: {ex.Message}");
            throw;
        }
    }
}

// 使用示例
var converter = new CookieConverter();
var result = await converter.ConvertCookiesAsync("SESSDATA=xxx; bili_jct=yyy");
```

### 🧠 智能特性

#### 自动域名推测
API会根据Cookie名称自动推测正确的域名：

| Cookie名称模式 | 自动推测域名 | 说明 |
|---------------|-------------|------|
| `bili_*`, `SESSDATA`, `DedeUserID` | `.bilibili.com` | B站主站Cookie |
| `*comic*` | `.bilicomic.com` | B站漫画相关 |
| `*game*` | `.biligame.com` | B站游戏相关 |
| `HMACCOUNT*`, `Hm_*` | `.hm.baidu.com` | 百度统计相关 |
| 其他 | `.bilibili.com` | 默认B站域名 |

#### 自动安全属性
系统会根据Cookie的重要性自动设置安全属性：

- **SESSDATA**: 自动设为 `httpOnly: true, secure: true`
- **普通Cookie**: 使用较宽松的安全设置
- **跨域Cookie**: 自动设置 `sameSite: "None"`

### 📦 集成到现有系统

#### 1. 配合登录流程使用
```javascript
// 监听登录成功消息
window.addEventListener('message', async (event) => {
    if (event.origin !== 'https://login.bilibili.bi') return;
    
    if (event.data.type === 'success') {
        const cookieString = event.data.data;
        
        // 转换为JSON格式
        const jsonData = await convertCookies(cookieString);
        
        // 保存到本地存储或发送到服务器
        localStorage.setItem('bili_cookies_json', JSON.stringify(jsonData));
        
        // 或者发送到后端
        await saveCookiesToBackend(jsonData);
    }
});
```

#### 2. 批量处理已有Cookie
```javascript
async function batchConvertCookies(cookieList) {
    const results = [];
    
    for (const cookieString of cookieList) {
        try {
            const jsonData = await convertCookies(cookieString);
            results.push({
                original: cookieString,
                converted: jsonData,
                status: 'success'
            });
        } catch (error) {
            results.push({
                original: cookieString,
                error: error.message,
                status: 'failed'
            });
        }
    }
    
    return results;
}
```

#### 3. 结合TinyDB存储
```python
from tinydb import TinyDB
import requests

def save_cookies_to_tinydb(cookie_string, db_path="cookies.json"):
    """将Cookie转换后保存到TinyDB数据库"""
    # 转换Cookie格式
    response = requests.post('https://login.bilibili.bi/api/convert', 
                           json={'cookies': cookie_string})
    json_data = response.json()
    
    # 保存到TinyDB
    db = TinyDB(db_path)
    cookies_table = db.table('cookies')
    
    # 提取Cookie数据
    cookie_data = json_data['_default']['1']['value']
    cookies_table.insert({
        'user_id': extract_user_id(cookie_data),
        'cookies': cookie_data,
        'created_at': time.time()
    })
    
    return json_data
```

### ⚡ 性能优化

- **响应时间**: 通常 < 100ms
- **并发处理**: 支持高并发请求
- **错误恢复**: 自动重试机制
- **缓存策略**: 相同输入可能被缓存

### 🔒 安全考虑

1. **数据传输**: 建议在HTTPS环境下使用
2. **输入验证**: API会验证Cookie格式的有效性
3. **输出清理**: 自动移除敏感或无效的Cookie项
4. **访问控制**: 生产环境建议配置访问限制

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

### Q: JSON转换API返回400错误？

**A:** 检查请求格式：
- Content-Type必须是 `application/json`
- 请求体必须包含 `cookies` 字段
- Cookie数据不能为空或null

### Q: 转换后的JSON格式是否标准？

**A:** 是的，输出格式完全符合TinyDB标准：
- 使用 `_default` 作为默认表名
- 遵循 `{"_default": {"1": {"key": "cookie", "value": [...]}}}` 结构
- 兼容所有支持TinyDB格式的应用

### Q: API有调用频率限制吗？

**A:** 目前没有硬性限制，但建议：
- 避免过于频繁的调用（建议间隔>100ms）
- 大批量处理时考虑分批调用
- 生产环境可能会有速率限制

### Q: 如何验证转换结果的正确性？

**A:** 可以检查以下方面：
- Cookie数量是否匹配
- 关键字段（SESSDATA、bili_jct）是否存在
- 域名设置是否正确
- 过期时间是否合理

---

## 🔗 相关资源

- **📁 [Demo示例](../demo/)** - 完整可运行的代码示例
- **🔄 [JSON转换API演示](../demo/json-convert-example.html)** - 在线测试JSON转换功能
- **🏠 [主项目](https://github.com/WittF/bilibili-qr-login)** - GitHub仓库
- **🌐 [在线演示](https://login.bilibili.bi/)** - 实时体验
- **🐛 [问题反馈](https://github.com/WittF/bilibili-qr-login/issues)** - Issue跟踪

💡 **提示**: 建议优先查看demo目录中的实际代码示例，它们包含了完整的错误处理和最佳实践。 