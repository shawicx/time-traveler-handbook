# ============================================================
# @description time-traveler-handbook Dockerfile（多阶段：bun 装依赖 → 构建 → nginx 托管）
# 与 scx-terminal 同部署模式：镜像推送 ACR → ECS --network host 运行，监听 1046
# ============================================================

# ---------- 阶段 1：构建静态站点 ----------
# node 基底保证 astro 等工具链以 node 运行（兼容性最稳）；
# bun 二进制取自官方镜像，仅用于依赖安装（bun.lock）。
# 必须用 alpine 变体：oven/bun:1 是 Debian/glibc 动态链接，拷进 musl 环境无法执行
FROM node:22-alpine AS build
COPY --from=oven/bun:alpine /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

# 先只拷依赖清单，命中 Docker 层缓存
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 再拷源码执行构建（prebuild 自动跑 bun run gen 生成 entity-index.json）
COPY . .
RUN bun run build

# ---------- 阶段 2：nginx 托管静态产物 ----------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 1046

CMD ["nginx", "-g", "daemon off;"]
