---
locale: zh
translationKey: rancher-deployment
pathSlug: rancher-deployment
title: "Rancher部署"
summary: "文件中所有内容要根据自己的情况修改，列主机名、 image、/data地址、端口号、networks、硬件资源等；需要提前准备好自己的镜像仓库，或镜像在本地。"
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 2
series: services
seriesOrder: 1
featured: false
tags: []
---

## 使用 Docker-Compose 部署

### ⚠️部署前须知⚠️

文件中所有内容要根据自己的情况修改，列主机名、 image、/data地址、端口号、networks、硬件资源等；需要提前准备好自己的镜像仓库，或镜像在本地。

### 部署环境

<div class="feishu-table-wrap"><table><thead><tr><th><strong>系统</strong></th><th><strong>节点</strong></th><th><strong>IP</strong></th></tr></thead><tbody><tr><td><strong>Ubuntu24.04</strong></td><td><strong>Redis</strong></td><td><strong>10.14.0.38</strong></td></tr></tbody></table></div>

### 前提准备

```
# 准备好Docker与Docker compose服务
自主安装

# 修改主机名
hostnamectl set-hostname Redis

# 准备minio镜像版本
rancher/rancher-2.8.2:v1  //我这里使用的镜像为2.8.2的镜像，打的自己的标签上传harbor使用

# 创建服务目录
mkdir -p /data/workspace/install-redis && cd /data/workspace/install-redis

# 创建minio创建需要的目录
mkdir data  resolved.conf

# 准备docker-compose.yaml文件
创建网络 docker network create bigdata
services:
  rancher:
    restart: always
    privileged: true
    image: 10.14.0.37/rancher/rancher-2.8.2:v1
    container_name: rancher
    volumes:
      - /data/workspace/install-rancher/data:/var/lib/rancher
      - /data/workspace/install-rancher/resolved.conf:/etc/resolved.conf
    environment:
      - TZ=Asia/Shanghai
      - CATTLE_BOOTSTRAP_PASSWORD=rancher@!QAZxsw2
      # 关键：添加服务器URL，解决重定向问题
      - CATTLE_SERVER_URL=https://10.14.0.38:1443
    ports:
      - "8080:80"
      - "1443:443"
    networks:
      - bigdata

# 连接外部网络
networks:
  bigdata:
    external: true

# 启动服务
docker compose up -d

# 验证服务
docker compose ps
NAME      IMAGE                                 COMMAND           SERVICE   CREATED      STATUS      PORTS
rancher   10.14.0.37/rancher/rancher-2.8.2:v1   "entrypoint.sh"   rancher   2 days ago   Up 2 days   0.0.0.0:8080->80/tcp, [::]:8080->80/tcp, 0.0.0.0:1443->443/tcp, [::]:1443->443/tcp
```
