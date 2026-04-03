---
pathSlug: "harbor部署"
locale: "zh"
translationKey: "feishu-QldMdVwPeoeZHNxcy8UcVc2On4e"
title: "Harbor部署"
excerpt: "使用 Docker Compose 部署 ⚠️部署前须知⚠️ 文件中所有内容要根据自己的情况修改，比如说 image、/data..."
category: "服务搭建"
publishedAt: "2026-03-30"
updatedAt: "2026-04-03"
featured: false
tags:
  - "Feishu"
  - "Cloud Docs"
accent: "cyan"
heroEyebrow: "Feishu Folder"
sourcePlatform: "feishu"
sourceUrl: "https://my.feishu.cn/docx/QldMdVwPeoeZHNxcy8UcVc2On4e"
sourceDocToken: "QldMdVwPeoeZHNxcy8UcVc2On4e"
---

使用 Docker-Compose 部署
⚠️部署前须知⚠️
文件中所有内容要根据自己的情况修改，比如说 image、/data地址、端口号、networks、硬件资源等；

环境与系统优化
目录准备

# 创建并切换到项目目录
mkdir -p /data/workspace/install-redis/data && cd /data/workspace/install-redis

系统优化

# 宿主机内核参数优化 (临时生效，重启失效)
# 允许分配所有的物理内存，防止 Redis 尝试快照时因内存不足被 Kill
sysctl -w vm.overcommit_memory=1
# 增加连接队列长度，防止高并发下连接被丢弃
sysctl -w net.core.somaxconn=1024

# (可选) 永久生效设置echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
echo "net.core.somaxconn = 1024" >> /etc/sysctl.conf
sysctl -p

准备 Docker Compose 文件

root@edis:# tee /data/workspace/install-redis/docker-compose.yaml >> "EOF"
# version: '3.8'

services:
  redis:
    # 服务名称
    container_name: redis-standalone
    # 镜像版本
    image: 10.14.0.37/redis/redis-8.4.0:v1  #根据自己镜像仓库设置
    restart: always
    # 端口映射：主机 3759 -> 容器 6379
    ports:
      - "3759:6379"
    
    # 环境变量 (仅用于客户端工具的自动认证，不是 Redis 服务端配置)
    environment:
      - REDISCLI_AUTH=redis@!QAZxsw2
      - TZ=Asia/Shanghai

# 数据卷挂载
    volumes:
      - /data/workspace/install-redis/data:/data

# --- 生产环境系统级限制解锁 ---
    # 增加最大文件打开数，高并发必备
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    
    # 容器内的内核参数优化
    sysctls:
      # 增加容器内的连接队列长度
      net.core.somaxconn: 1024

# --- Redis 核心启动命令 (企业级参数配置) ---
    command:
      - "redis-server"
      # 1. 基础认证
      - "--requirepass redis@!QAZxsw2"
      
      # 2. 数据持久化策略 (AOF + RDB 混合模式)
      - "--appendonly yes"                # 开启 AOF (数据更安全)
      - "--appendfsync everysec"          # 每秒刷盘一次，平衡性能与安全
      - "--save 900 1"                    # 15分钟内有1个key变动则生成RDB快照
      - "--save 300 10"                   # 5分钟内有10个key变动则生成RDB快照
      
      # 3. 内存管理 (非常重要)
      # 限制最大内存，防止把服务器内存撑爆。建议设置为物理内存的 75% 左右
      # 这里写了 2gb 作为示例，请根据你机器实际情况修改，如 4gb, 8gb
      - "--maxmemory 2gb"
      # 内存满了之后的策略：移除最近最少使用的 Key (LRU)
      - "--maxmemory-policy allkeys-lru"
      
      # 4. 连接与超时
      - "--timeout 300"                   # 客户端闲置 300秒(5分钟) 后断开连接
      - "--tcp-keepalive 300"             # TCP 保活探测
      - "--databases 16"                  # 默认数据库数量
      - "--maxclients 10000"              # 最大连接客户端数

# 5. 性能优化
      # 开启多线程 IO (Redis 6.0+ 特性)，加速网络读写
      # 建议设置为 CPU 核心数 - 1，例如 4核机器设为 2 或 3。设为 1 表示禁用。
      # - "--io-threads 1" 
      # - "--io-threads-do-reads yes"

# 健康检查 (必须带上密码)
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redis@!QAZxsw2", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

# networks:
    #   - default
EOF

启动与验证
启动 Redis

# 进入 docker-compose.yaml 目录启动
root@edis:/data/workspace/install-redis# docker compose up -d

验证 Redis

# 查看日志 检查是否有报错（特别是 Warning 警告）
docker logs -f redis-standalone

# 验证连接与配置，进入容器内部测试,不需要密码，在dockercompose中设置有环境变量
docker exec -it redis-standalone redis-cli
# 在 127.0.0.1:6379> 提示符下输入：
# 测试存取
set hello world
get hello

# 查看当前内存配置是否生效

127.0.0.1:6379> config get maxmemory
1) "maxmemory"
2) "2147483648"
