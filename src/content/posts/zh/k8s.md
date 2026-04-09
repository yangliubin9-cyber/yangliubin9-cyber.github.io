---
locale: zh
translationKey: k8s
pathSlug: k8s
title: Kubernetes 集群部署入门
summary: 从控制面、节点和网络出发，建立对 Kubernetes 集群的整体认识。
publishedAt: 2026-04-04
updatedAt: 2026-04-09
readingMinutes: 11
series: k8s
seriesOrder: 1
featured: true
tags:
  - kubernetes
  - cluster
  - beginner
---

学 Kubernetes 时，最容易被 YAML 和术语压住。真正的入门不该从资源清单背诵开始，而应该先回答一个更实际的问题：一个集群到底由谁控制、由谁执行、流量怎么进来、状态怎么被感知。

## 先把集群拆成两层

你可以把 Kubernetes 集群先理解成两层：

- 控制面负责决策
- 工作节点负责执行

控制面更像“大脑”，工作节点更像“执行现场”。当你提交一个 Deployment 时，并不是 Pod 凭空出现，而是控制面先记录期望状态，再由调度和节点组件把这个期望变成真实运行结果。

## 控制面的核心职责

入门阶段，不需要马上把所有组件细节背完，但要先知道控制面到底在做什么：

- 接收 API 请求
- 保存集群状态
- 决定 Pod 应该调度到哪里
- 持续把实际状态拉回到期望状态

这就是为什么 Kubernetes 常被理解为“声明式系统”。你描述你想要什么，系统不断尝试让现实接近那个目标。

## 工作节点不是单纯跑容器

很多人会把节点理解成“装了 Docker 的机器”。这个理解太浅。节点更准确的角色是：

- 接收来自控制面的调度结果
- 启动并维护 Pod
- 汇报节点和容器状态
- 配合网络和存储插件完成实际运行

也就是说，节点不只是启动容器，它还承担了状态回传和资源执行的责任。

## 入门时最该关注的对象

如果你刚开始接触 Kubernetes，我建议先把注意力放在下面几个对象上：

- `Node`
- `Pod`
- `Deployment`
- `Service`
- `Namespace`

原因很简单，这几个对象已经能串起一条最小交付链：

1. 节点提供运行资源
2. Pod 运行应用
3. Deployment 管理副本和升级
4. Service 提供稳定访问入口
5. Namespace 帮你做逻辑隔离

## 一个最基础的观察顺序

初学阶段最有价值的不是写复杂 YAML，而是学会读集群状态。下面这几个命令足够你先搭出观察链路：

```bash
kubectl get nodes
kubectl get pods -A
kubectl get deploy -A
kubectl get svc -A
kubectl describe pod <pod-name>
```

这套组合能回答几个非常核心的问题：

- 集群里有没有可用节点
- 应用有没有创建出 Pod
- 控制器有没有达到期望副本数
- 服务有没有暴露出来
- 某个 Pod 为什么不健康

## 不要把 YAML 当成 Kubernetes 本体

很多教程会让人误以为 Kubernetes 就是写 YAML。其实 YAML 只是声明方式，真正重要的是你是否理解这些资源如何相互作用。你不理解调度、探针、服务发现和状态回收机制，再漂亮的 YAML 也只是配置文本。

## 集群入门的重点是关系，不是数量

Kubernetes 入门最重要的不是一口气记住几十个资源类型，而是先把这条关系链弄明白：

`kubectl apply` 发出期望，控制面记录并协调，节点执行工作负载，Service 暴露访问，系统持续对比实际状态与期望状态。

一旦这条链路在脑子里连起来，后面的 Ingress、ConfigMap、Secret、HPA、StatefulSet 才有地方挂上去。
