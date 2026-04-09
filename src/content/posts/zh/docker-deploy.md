---
locale: zh
translationKey: docker-deploy
pathSlug: docker-deploy
title: Docker 部署实战：从本地运行到服务发布
summary: 把本地运行、镜像发布与服务启动串成一条完整的部署链路。
publishedAt: 2026-04-03
updatedAt: 2026-04-09
readingMinutes: 12
series: docker
seriesOrder: 2
featured: false
tags:
  - docker
  - deployment
  - registry
---

会写 `Dockerfile` 只是开始。真正的部署实践，关键在于把“本地开发”“构建镜像”“推送仓库”“线上启动”连成一条稳定链路，而不是每次上线都临时拼命令。

## 先把部署链路说完整

一个最小可维护的 Docker 发布路径，通常包含四段：

1. 本地验证服务能跑
2. 构建镜像
3. 推送到镜像仓库
4. 目标环境拉取并重启服务

如果这四段里有一段只靠人脑记忆，后面就容易出问题。你可能会遇到：

- 代码改了，但忘了重新 build
- build 了新镜像，但没 push
- push 了，但服务器还在跑旧 tag
- 服务重启了，但环境变量和挂载没有同步

所以部署不是“把容器跑起来”，而是让整条链路可重复。

## 镜像 tag 要能表达版本

很多团队早期都喜欢直接用 `latest`。这能跑，但排查回滚很痛苦。更稳的做法是：

- 发布时带上明确版本号或 Git SHA
- 保留可读标签，例如 `2026-04-09-1`
- 线上部署指向具体 tag，而不是模糊 tag

例如：

```bash
docker build -t registry.example.com/blog-api:2026-04-09-1 .
docker push registry.example.com/blog-api:2026-04-09-1
```

这样你在服务器看到容器镜像时，就知道它到底是哪一版，而不是猜“这次 latest 到底是不是新的”。

## 服务配置不要写死在镜像里

镜像应该更多表达“应用代码 + 运行依赖”，而不是把环境差异也打包进去。部署时更推荐把这些内容留在运行层：

- 环境变量
- 挂载目录
- 网络配置
- 端口映射
- 重启策略

如果这些东西被你直接写死进镜像，开发、测试、生产的差异就会越来越难管理。

## 用 Compose 管理比手工命令稳定

当服务开始有多个组件，例如应用本身、数据库、缓存、反向代理时，单纯靠手敲 `docker run` 就很容易乱。哪怕是小项目，也建议尽早用 `docker compose` 把运行定义下来。

```yaml
services:
  blog:
    image: registry.example.com/blog-api:2026-04-09-1
    ports:
      - "8080:3000"
    env_file:
      - .env.production
    restart: unless-stopped
```

它的价值不只是方便，而是把“怎么启动这个服务”变成可审阅、可回滚、可复现的配置。

## 线上排查不要只看容器状态

很多部署问题不是“容器没起来”，而是“容器起来了，但服务不可用”。排查时建议至少看这几层：

1. 容器状态是否健康
2. 应用日志有没有报错
3. 端口是否对外暴露
4. 上游网关或反向代理是否转发正确
5. 配置、密钥、挂载目录是否齐全

一个常见误区是 `docker ps` 显示容器在跑，就以为部署成功。实际上，程序内部可能在启动后立刻报错，只是主进程没有退出。

## 把发布流程写成固定动作

如果这个项目会被重复部署，最值得做的事情不是继续熟悉更多参数，而是把动作沉淀成固定流程，例如：

```text
git pull
docker build
docker push
docker compose pull
docker compose up -d
docker compose logs --tail=100
```

哪怕暂时还没有 CI/CD，也先让手工发布标准化。等后面接 GitHub Actions、镜像仓库自动发布时，你迁移的是“流程”，不是“临场记忆”。

## 实战里最重要的是可回滚

一次可维护的部署，不只是“能发布”，还要“出问题时能退回上一版”。因此在 Docker 部署实践里，版本标签、启动配置和日志检查必须成套出现。没有回滚能力的发布，成功时看起来很顺，失败时成本就会被放大。
