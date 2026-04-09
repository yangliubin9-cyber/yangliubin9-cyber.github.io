---
locale: en
pathSlug: k8s-components
title: Kubernetes Core Components and How They Work
summary: See how the apiserver, scheduler, controller manager, and kubelet fit together.
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

If the first Kubernetes article explains the broad shape of a cluster, this one opens the machine and looks at the main moving parts. There are many component names, but the system becomes much easier once each one is tied to a clear responsibility.

## apiserver: the entry point for everything

`kube-apiserver` is the unified front door of the cluster. Whether you run `kubectl apply`, a controller syncs state, or another platform component queries resources, the path eventually goes through the apiserver.

Its core jobs are:

- receive and validate API requests
- perform authentication, authorization, and admission checks
- write valid state to storage
- expose a consistent view of cluster resources

That is why “the cluster is not responding” often starts with checking whether the apiserver is reachable and healthy.

## etcd: the source of truth for state

Beginners often overlook `etcd`, but it is critical. It is the factual store for cluster state. The desired state of Pods, Deployments, Services, and related resources ultimately lives there.

That leads to two important ideas:

- Kubernetes is state-driven
- etcd health directly affects control plane stability

If etcd is degraded, the issue is not “one component is slow.” It is “the cluster’s memory is in trouble.”

## scheduler: deciding where Pods should go

The scheduler does not launch containers itself. It makes placement decisions. It considers factors such as:

- available node resources
- taints, tolerations, and affinity rules
- other scheduling constraints

When a Pod sits in `Pending` for too long, the scheduler becomes a primary suspect.

## controller-manager: pulling reality back to intent

One of Kubernetes’ strongest ideas is continuous correction. The cluster does not just create resources once and forget them. Much of that correction loop is driven by `controller-manager`.

It hosts multiple controllers, including:

- Deployment controller
- ReplicaSet controller
- Node controller
- Job controller

These controllers constantly compare actual state with desired state and trigger actions when they diverge.

## kubelet: the execution representative on each node

`kubelet` runs on every worker node and forms the key connection between node execution and control plane intent. It:

- receives Pod specifications
- works with the container runtime to start workloads
- reports Pod health and state
- executes probes and some lifecycle behavior

It is useful to think of kubelet as the on-site operator for the node.

## Connect the components into one chain

A typical request path can be simplified like this:

1. you submit a Deployment
2. apiserver accepts it and writes state to etcd
3. a controller notices new desired state
4. the scheduler picks a node for each Pod
5. kubelet starts the workload on that node
6. state is continuously reported back to the control plane

Once that chain is clear in your head, troubleshooting stops being “the YAML looks fine, so I’m out of ideas.”

## Learn components to debug better, not to pass a quiz

The value of core component knowledge is operational. It tells you where to look first. The clearer the boundaries between apiserver, etcd, scheduler, controller-manager, and kubelet, the less likely you are to get lost in Kubernetes vocabulary when the cluster misbehaves.
