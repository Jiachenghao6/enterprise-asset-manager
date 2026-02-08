# --- 构建阶段 ---
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# 这一步会根据你的 vite.config.ts 打包，但会忽略 server.proxy 配置
RUN npm run build

# --- 运行阶段 (Nginx) ---
FROM nginx:alpine

# 1. 复制构建产物 (保持不变)
COPY --from=builder /app/dist /usr/share/nginx/html

# 2. [新增] 复制我们自定义的 Nginx 配置文件
# 这会覆盖 Nginx 默认的配置，启用我们的反向代理
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]