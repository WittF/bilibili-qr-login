FROM node:20-alpine AS build

ARG TRUST_ORIGIN
ARG APP_VERSION

WORKDIR /app

# 先复制package.json和yarn.lock以利用Docker层缓存
COPY package.json yarn.lock ./

# 安装依赖（使用yarn缓存挂载优化）
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile --production=false

# 再复制源代码
COPY . .

# 如果提供了APP_VERSION，则更新package.json中的版本号
RUN if [ -n "$APP_VERSION" ]; then \
      node -e "const pkg=require('./package.json'); pkg.version='$APP_VERSION'; require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2))"; \
      echo "Updated package.json version to: $APP_VERSION"; \
    fi

# 构建应用
RUN TRUST_ORIGIN=$TRUST_ORIGIN yarn build

# 生产阶段
FROM node:20-alpine

# 添加标签
ARG APP_VERSION
LABEL org.opencontainers.image.version="${APP_VERSION}"
LABEL org.opencontainers.image.title="bilibili-qr-login"
LABEL org.opencontainers.image.description="哔哩哔哩登录工具"

WORKDIR /app

# 只复制构建产物
COPY --from=build /app/dist ./dist

# 移动主文件
RUN mv ./dist/index.js ./index.js

# 创建版本信息文件（可选，用于运行时查看）
RUN if [ -n "$APP_VERSION" ]; then \
      echo "{\"version\":\"$APP_VERSION\",\"buildTime\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > ./version.json; \
    fi

# 设置权限
RUN chmod -R 777 /app

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "index.js"]
