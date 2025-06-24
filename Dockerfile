FROM node:20-alpine AS build

ARG TRUST_ORIGIN

WORKDIR /app

# 先复制package.json和yarn.lock以利用Docker层缓存
COPY package.json yarn.lock ./

# 安装依赖（使用yarn缓存挂载优化）
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile --production=false

# 再复制源代码
COPY . .

# 构建应用
RUN TRUST_ORIGIN=$TRUST_ORIGIN yarn build

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 只复制构建产物
COPY --from=build /app/dist ./dist

# 移动主文件
RUN mv ./dist/index.js ./index.js

# 设置权限
RUN chmod -R 777 /app

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "index.js"]
