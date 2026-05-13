# 部署与配置说明

本文档列出服务端可配置的环境变量及其作用，面向自托管和反向代理部署场景。

## 🧭 环境变量速查

| 变量名 | 默认值 | 作用域 | 简述 |
|--------|--------|--------|------|
| `PORT` | `3000` | 运行期 | 服务监听端口 |
| `NODE_ENV` | 未设置 | 运行期 | 设为 `development` 时启用开发模式行为 |
| `DEBUG` | 未设置 | 运行期 | 设为 `1` 或 `true` 时输出详细日志 |
| `TRUST_ORIGIN` | 开发模式为 `*`，其他环境为空 | 运行期 / 构建期 | 控制 CORS、Referer 校验和前端 `postMessage` 白名单 |
| `TRUSTED_PROXIES` | 空 | 运行期 | 可信反向代理来源 IP，支持 `*`、精确 IP、IPv4 CIDR |
| `TRUSTED_PROXY_HEADERS` | `X-Forwarded-For,Forwarded` | 运行期 | 配置可信代理转发的客户端 IP 头，大小写不敏感 |
| `https_proxy` / `HTTPS_PROXY` | 空 | 运行期 | 服务端访问 HTTPS 目标时使用的出站代理 |
| `http_proxy` / `HTTP_PROXY` | 空 | 运行期 | 服务端访问 HTTP 目标时使用的出站代理，也可作为 HTTPS fallback |
| `all_proxy` / `ALL_PROXY` | 空 | 运行期 | HTTP/HTTPS 都未命中专用代理时的 fallback |
| `no_proxy` / `NO_PROXY` | 空 | 运行期 | 指定不走出站代理的主机规则 |
| `APP_VERSION` | Git tag 或 `package.json` 版本 | 构建期 | 注入前端版本号，并作为 Docker 镜像标签元数据 |
| `APP_BUILD_DATE` | 构建当天日期 | 构建期 | 注入 sitemap 和 HTML 模板中的构建日期 |

## 🚪 服务运行

- `PORT` 控制 HTTP 服务监听端口，默认 `3000`。
- `NODE_ENV=development` 会启用开发模式：`TRUST_ORIGIN` 默认变为 `*`，`/api/qr` 跳过生产环境 Referer 校验，`isValidIP` 在生产模式会拒绝 RFC1918 与 `127.0.0.0/8`，在开发模式不过滤这些 IPv4 地址。
- `DEBUG=1` 或 `DEBUG=true` 会开启详细日志；未设置时只输出重要日志。

## 🌐 跨域与来源校验：TRUST_ORIGIN

`TRUST_ORIGIN` 使用英文逗号分隔多个来源，支持 `*` 通配：

```bash
TRUST_ORIGIN="https://example.com,https://app.example.com"
```

它会影响三处服务端行为：

- CORS 响应头：只有匹配的 `Origin` 会收到 `Access-Control-Allow-Origin`。
- 预检 `OPTIONS`：不匹配的跨域预检请求返回 `403`。
- 生产模式的 `/api/qr` Referer 校验：同源访问会放行；跨源访问需要 Referer 匹配 `TRUST_ORIGIN`。

匹配规则需要区分：

- CORS 按完整 `Origin` 精确匹配，例如 `https://example.com`。
- `/api/qr` 的 Referer 校验同时支持完整 origin 和 host，例如 `https://example.com` 或 `example.com`。
- 生产环境未配置 `TRUST_ORIGIN` 时，不允许跨域 CORS/预检；同源访问仍可通过 Referer 校验。

`TRUST_ORIGIN` 还会在构建期注入到前端，用于登录成功后的 `postMessage` 目标白名单。Docker 运行期只设置 `-e TRUST_ORIGIN=...` 会改变服务端行为，但不会改写已经构建好的前端资源；如果需要前端白名单同步生效，需要在构建镜像时传入相同的构建参数。

```bash
docker build \
  --build-arg TRUST_ORIGIN="https://example.com" \
  -t bili-qrlogin .
```

## 🛡️ 反向代理与客户端 IP

客户端 IP 解析由两个变量控制：

- `TRUSTED_PROXIES`：可信代理来源 IP，默认空表示兼容旧行为；支持 `*`、精确 IP、IPv4 CIDR，多个值用英文逗号分隔。
- `TRUSTED_PROXY_HEADERS`：允许读取的代理 IP 头，默认 `X-Forwarded-For,Forwarded`，大小写不敏感。

行为说明：

- 未配置 `TRUSTED_PROXIES` 时，会保持旧版本兼容行为，无条件读取常见代理头，包括 `CF-Connecting-IP`、`True-Client-IP`、`X-Real-IP`、`X-Forwarded-For`、`Forwarded` 等。
- 配置 `TRUSTED_PROXIES` 后，只有直连来源 IP 落在白名单内，才会读取 `TRUSTED_PROXY_HEADERS` 中列出的头；不在白名单时直接使用 socket IP，避免公网直连伪造代理头。
- `X-Forwarded-For` 和 `Forwarded` 包含多级链路时，会从右往左寻找第一个不在 `TRUSTED_PROXIES` 内的公网 IP 作为真实客户端 IP。
- 生产环境会过滤常见 IPv4 内网地址；开发模式不会过滤内网 IP。

典型配置：

```bash
# 单机直连 / 本地测试：不配置即可

# 内网部署 + nginx 反代
TRUSTED_PROXIES="127.0.0.1,10.0.0.0/8"
TRUSTED_PROXY_HEADERS="X-Forwarded-For,X-Real-IP"

# Cloudflare：建议填写 Cloudflare 官方完整 IPv4 CIDR 列表，并只读取 CF-Connecting-IP
# https://www.cloudflare.com/ips-v4/
TRUSTED_PROXIES="<Cloudflare 官方 IPv4 CIDR 列表，多个值用英文逗号分隔>"
TRUSTED_PROXY_HEADERS="CF-Connecting-IP"

# 无法维护代理 IP 段时的宽松配置
TRUSTED_PROXIES="*"
TRUSTED_PROXY_HEADERS="CF-Connecting-IP"
```

只有确认反向代理会覆盖写入某个客户端 IP 头时，才应把它加入 `TRUSTED_PROXY_HEADERS`。

当前 `TRUSTED_PROXIES` 支持精确 IPv6 地址，但 CIDR 判断由 `isIPv4InCidr` 实现，只支持 IPv4 CIDR。若入口可能收到 Cloudflare IPv6 代理来源，可以在上游限制来源、使用 IPv4 入口，或选择 `TRUSTED_PROXIES="*"` 的宽松配置；如需 IPv6 CIDR 支持，可以按现有解析逻辑扩展实现。

## 🌍 出站代理访问 B 站

服务请求 B 站时支持走出站代理，使用标准环境变量。该配置仅影响服务端访问 B 站接口，不影响入站客户端 IP 判断。

```bash
# HTTP 代理（可带凭证）
https_proxy=http://user:pass@127.0.0.1:7890 yarn preview

# SOCKS5 代理
https_proxy=socks5://127.0.0.1:1080 yarn preview

# all_proxy 作为最末 fallback
all_proxy=socks5://127.0.0.1:1080 yarn preview

# 排除特定主机直连，逗号分隔；支持 *、host、.suffix、host:port、[ipv6]
no_proxy=localhost,127.0.0.1,.internal yarn preview
```

说明：

- 小写变量优先于大写变量，例如同时设置 `https_proxy` 和 `HTTPS_PROXY` 时使用 `https_proxy`。
- HTTPS 请求选择顺序：`https_proxy` / `HTTPS_PROXY` → `http_proxy` / `HTTP_PROXY` → `all_proxy` / `ALL_PROXY` → 直连。
- HTTP 请求选择顺序：`http_proxy` / `HTTP_PROXY` → `all_proxy` / `ALL_PROXY` → 直连。
- `no_proxy` / `NO_PROXY` 支持 `*`、精确主机、域名后缀、端口匹配和 IPv6 字面量。
- 本项目中 `socks5://` 与 `socks5h://` 行为一致，域名都交给代理端解析。
- 代理 URL 会在启动日志中脱敏，不会打印用户名和密码。

## 🐳 部署示例

```bash
docker run -d \
  --name bili-qrlogin \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e TRUST_ORIGIN="https://example.com" \
  -e TRUSTED_PROXIES="127.0.0.1,10.0.0.0/8" \
  -e TRUSTED_PROXY_HEADERS="X-Forwarded-For,X-Real-IP" \
  -e DEBUG=0 \
  wittf/bili-qrlogin:latest
```

如果需要调整前端 `postMessage` 白名单，请使用匹配的 `TRUST_ORIGIN` 重新构建镜像，而不是只在 `docker run` 时设置运行期环境变量。

## 🏷️ 构建版本信息

`APP_VERSION` 和 `APP_BUILD_DATE` 是构建期变量，用于前端展示版本号、HTML 模板和 sitemap 元数据：

- `APP_VERSION` 优先使用环境变量，其次使用最近的 Git tag，最后回退到 `package.json` 的 `version`。
- `APP_BUILD_DATE` 优先使用环境变量，未设置时使用构建当天日期，格式为 `YYYY-MM-DD`。
- Dockerfile 声明了 `APP_VERSION` build arg，会同步更新镜像内的 `package.json` 版本、OCI label，并在运行镜像中生成 `version.json`。
- 当前 Dockerfile 未声明 `APP_BUILD_DATE` build arg；如需固定 Docker 构建日期，需要先在 Dockerfile 中声明并传入该变量。

```bash
APP_VERSION=1.2.3 APP_BUILD_DATE=2026-05-13 yarn build

docker build \
  --build-arg APP_VERSION=1.2.3 \
  --build-arg TRUST_ORIGIN="https://example.com" \
  -t bili-qrlogin:1.2.3 .
```

## 🔧 nginx 反向代理片段

```nginx
server {
    listen 443 ssl;
    server_name login.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

搭配运行期配置：

```bash
TRUST_ORIGIN="https://login.example.com"
TRUSTED_PROXIES="127.0.0.1"
TRUSTED_PROXY_HEADERS="X-Forwarded-For,X-Real-IP"
```

## 📌 开发 vs 生产端口

- `yarn dev`：前端开发服务器运行在 `5173`，API 服务运行在 `3000`，Vite 会把 `/api/*` 代理到 `http://127.0.0.1:3000`。
- `yarn preview` / Docker：前后端由同一个服务提供，默认单端口 `3000`。
