---
locale: zh
translationKey: docker-basic
pathSlug: docker-basic
title: Docker 入门：安装、镜像与容器基础
summary: 理解镜像与容器的边界，建立本地开发到交付的容器化基础。
publishedAt: 2026-04-02
updatedAt: 2026-04-09
readingMinutes: 10
series: docker
seriesOrder: 1
featured: true
tags:
  - docker
  - containers
  - beginner
---

很多人学 Docker 时，会把“镜像”“容器”“仓库”“运行时”混成一团。真正的入门，不是先把命令背下来，而是先把这些概念拆开。

## 先分清镜像和容器

可以先用一个不那么严谨但很有用的类比：

- 镜像像是应用模板
- 容器像是根据模板启动出来的运行实例

镜像是静态的，容器是动态的。你删除一个容器，不代表镜像没了；你更新镜像，也不会自动替换已经在跑的容器。

最常见的两个查看命令分别是：

```bash
docker images
docker ps -a
```

前者看机器上有哪些镜像，后者看机器上有哪些容器。把这两个列表分清楚，是学习 Docker 的第一步。

## 一个最小运行流程

从“什么都没有”到“把一个容器跑起来”，最小链路可以压缩成下面三步：

```bash
docker pull nginx:stable
docker run -d --name web-demo -p 8080:80 nginx:stable
docker logs web-demo
```

这三步分别在做什么：

1. 拉镜像到本地
2. 根据镜像启动一个容器
3. 看这个容器有没有正常工作

只要你能把这三步的因果关系说清楚，就已经比“只会复制命令”更进了一步。

## Dockerfile 的价值是什么

手动 `docker run` 适合理解概念，但真正交付应用时，核心在于 `Dockerfile`。它解决的是“如何把应用和运行环境打包成可重复构建的镜像”。

下面是一个很基础的 Node 服务镜像示例：

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

这个文件的意义不在于语法多复杂，而在于它把“依赖安装、代码复制、启动命令”写成了一个稳定配方。团队里任何人拿到这份配方，都能构建出同一种镜像。

## 新手最容易忽略的边界

Docker 很容易让人产生一种错觉：只要进了容器，一切环境问题就自动消失。实际上边界还在：

- 宿主机的磁盘、网络、权限仍然影响容器
- 容器内文件默认是临时的，重建后可能消失
- 端口不映射，服务对外就不可见
- 环境变量不传进去，程序仍然启动不起来

也就是说，Docker 解决的是“运行环境一致性”，不是“所有部署问题”。

## 日常排查可以从哪几步开始

一个容器跑不起来时，先不要急着重建镜像，可以先按下面顺序看：

```bash
docker ps -a
docker logs <container>
docker inspect <container>
docker exec -it <container> sh
```

- `ps -a` 看状态
- `logs` 看程序报错
- `inspect` 看挂载、端口、环境变量
- `exec` 进入容器看真实文件和进程情况

这条链路会比反复删容器、重跑命令更有效。

## 入门阶段最重要的输出

Docker 入门最重要的结果，不是“我会写很多命令”，而是你开始能区分：

- 什么属于镜像问题
- 什么属于容器运行问题
- 什么属于宿主机环境问题

这三层分开之后，容器化交付才真正开始变得可控。
