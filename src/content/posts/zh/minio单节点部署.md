---
pathSlug: "minio单节点部署"
locale: "zh"
translationKey: "feishu-AwpXdCS3Co7v2rxbToKcM1RonDc"
title: "Minio单节点部署"
excerpt: "使用 Docker Compose 部署 ⚠️部署前须知⚠️ 文件中所有内容要根据自己的情况修改，列主机名、 image、/da..."
category: "服务搭建"
publishedAt: "2026-03-30"
updatedAt: "2026-03-31"
featured: false
tags:
  - "Feishu"
  - "Cloud Docs"
accent: "cyan"
heroEyebrow: "Feishu Folder"
sourcePlatform: "feishu"
sourceUrl: "https://my.feishu.cn/docx/AwpXdCS3Co7v2rxbToKcM1RonDc"
sourceDocToken: "AwpXdCS3Co7v2rxbToKcM1RonDc"
---

使用 Docker-Compose 部署
⚠️部署前须知⚠️
文件中所有内容要根据自己的情况修改，列主机名、 image、/data地址、端口号、networks、硬件资源等；需要提前准备好自己的镜像仓库，或镜像在本地。
部署环境

系统

节点

IP

Ubuntu24.04

Minio

10.14.0.38
前提准备

# 准备好Docker与Docker compose服务
自主安装

# 修改主机名
hostnamectl set-hostname Minio

# 准备minio镜像版本
minio/minio4:v1  //我这里使用的镜像为2025年4月份的镜像，打的自己的标签上传harbor使用

# 创建服务目录
mkdir -p /data/workspace/install-minio && cd /data/workspace/install-minio

# 创建minio创建需要的目录
mkdir data config

# 准备docker-compose.yaml文件
创建网络 docker network create custom
services:
  minio:
    image: 10.14.0.37/minio/minio4:v1
    container_name: minio
    restart: unless-stopped
    
    # 关键：启动命令要正确
    command: server /data --console-address ":9001"
    
    ports:
      - "9000:9000"    # API 端口
      - "19001:9001"   # 控制台端口
    
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: minio@!QAZxsw2
    
    volumes:
      - /data/workspace/install-minio/data:/data
    
    networks:
      - custom
    
    # 添加健康检查
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

networks:
  custom:
    external: true
    driver: bridge
    
# 启动服务
docker compose up -d

# 验证服务
docker compose ps
NAME      IMAGE                        COMMAND                  SERVICE   CREATED      STATUS                PORTS
minio     10.14.0.37/minio/minio4:v1   "/usr/bin/docker-ent…"   minio     2 days ago   Up 2 days (healthy)   0.0.0.0:9000->9000/tcp, [::]:9000->9000/tcp, 0.0.0.0:19001->9001/tcp, [::]:19001->9001/tcp
