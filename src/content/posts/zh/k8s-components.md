---
locale: zh
pathSlug: k8s-components
title: Kubernetes 核心组件与工作机制
summary: 把 apiserver、scheduler、controller-manager 和 kubelet 放回各自职责里理解。
publishedAt: 2026-04-05
updatedAt: 2026-04-09
readingMinutes: 9
series: k8s
featured: false
tags:
  - kubernetes
  - control-plane
  - operations
---

如果说 Kubernetes 入门篇解决的是“集群大概怎么运转”，那理解核心组件就是把这台机器拆开，看每个齿轮到底负责什么。组件名字很多，但只要抓住职责边界，整体并不难。

## apiserver：所有请求的入口

`kube-apiserver` 是集群的统一入口。无论你是执行 `kubectl apply`、控制器在同步状态，还是平台组件在查询资源，最终都绕不开 apiserver。

它主要负责：

- 接收和校验 API 请求
- 做认证、鉴权和准入控制
- 把合法状态写入存储层
- 对外提供统一资源视图

所以当你感觉“集群没反应”时，很多问题都值得先怀疑 apiserver 是否可达。

## etcd：状态的事实来源

很多初学者会忽略 `etcd`，但它非常关键。你可以把它理解成集群状态的事实来源。Pod、Deployment、Service 等资源的期望状态，本质上都落在这里。

这意味着两个很重要的结论：

- 集群是状态驱动的
- etcd 的健康直接影响控制面稳定性

如果 etcd 出问题，控制面不是“少一个组件”，而是“状态记忆本身出了问题”。

## scheduler：决定 Pod 去哪里

调度器不负责真正启动容器，它负责做出放置决策。它会综合考虑：

- 节点资源是否足够
- 是否有污点、容忍、亲和性等限制
- 是否满足调度约束

当一个 Pod 长时间 `Pending` 时，调度器通常就是重点观察对象。

## controller-manager：让现实回到期望

Kubernetes 的强大之处，不在于一次创建成功，而在于它会不断纠偏。这个“纠偏”很多时候由 `controller-manager` 驱动。

它里面包含多类控制器，例如：

- Deployment controller
- ReplicaSet controller
- Node controller
- Job controller

这些控制器会不断比较“现在是什么样”和“应该是什么样”，如果不一致，就发起修正动作。

## kubelet：节点上的执行代表

`kubelet` 运行在每个工作节点上，是节点与控制面的关键连接点。它会：

- 接收 Pod 规格
- 调用容器运行时启动工作负载
- 采集并回报 Pod 状态
- 执行探针和部分生命周期动作

你可以把 kubelet 理解成“节点上的现场负责人”。

## 把组件连成一条链

一条典型链路可以简化成这样：

1. 你提交 Deployment
2. apiserver 接收请求并写入 etcd
3. controller 发现新的期望状态
4. scheduler 为 Pod 选择节点
5. kubelet 在目标节点启动容器
6. 状态持续回报给控制面

如果你脑子里能把这条链串起来，排查问题就不会只停留在“这个 YAML 看起来没问题”。

## 学核心组件不是为了考试

理解这些组件，不是为了背名词，而是为了知道问题应该从哪一层开始查。apiserver、etcd、scheduler、controller-manager、kubelet，各自负责的边界越清楚，你遇到的 Kubernetes 问题就越不容易被一团术语包住。
