---
locale: en
pathSlug: k8s
title: Getting Started with Kubernetes Cluster Deployment
summary: Understand Kubernetes clusters by starting from the control plane, nodes, and networking.
publishedAt: 2026-04-04
updatedAt: 2026-04-09
readingMinutes: 11
series: k8s
featured: true
tags:
  - kubernetes
  - cluster
  - beginner
---

Kubernetes feels intimidating when you meet it through YAML and jargon first. A better starting point is a systems question: who makes decisions in a cluster, who executes them, how does traffic reach workloads, and how does the platform know whether reality still matches intent?

## Split the cluster into two layers

At the highest level, a cluster has two roles:

- the control plane makes decisions
- worker nodes execute those decisions

The control plane acts like a coordinating brain. Worker nodes are the execution layer. When you create a Deployment, Pods do not appear by magic. The control plane stores desired state, then scheduling and node components turn that desired state into running workloads.

## What the control plane is really doing

You do not need to memorize every internal component on day one. But you do need to understand the control plane’s job:

- receive API requests
- store cluster state
- decide where workloads should run
- continuously drive actual state back toward desired state

This is why Kubernetes is called declarative. You describe what you want, and the system keeps working to make reality match that intent.

## Worker nodes do more than run containers

It is tempting to think of a node as “a machine with Docker installed.” That is too shallow. A worker node:

- receives scheduling decisions from the control plane
- starts and maintains Pods
- reports node and workload health back upstream
- cooperates with networking and storage plugins

So the node is not merely launching containers. It is part of the feedback loop that keeps the cluster converging.

## The objects worth focusing on first

If you are just starting, focus on a small set of resources:

- `Node`
- `Pod`
- `Deployment`
- `Service`
- `Namespace`

Those five are enough to explain a useful delivery path:

1. nodes provide runtime capacity
2. pods run the app
3. deployments manage replicas and rollout behavior
4. services expose stable access
5. namespaces provide logical isolation

## A basic observation sequence

Early on, reading the cluster matters more than writing large YAML files. These commands are enough to build a first mental map:

```bash
kubectl get nodes
kubectl get pods -A
kubectl get deploy -A
kubectl get svc -A
kubectl describe pod <pod-name>
```

Together they answer core questions:

- are nodes available?
- were pods created at all?
- did the controller reach the desired replica count?
- is the service exposed?
- why is a particular pod unhealthy?

## YAML is not the platform

Many tutorials accidentally teach that Kubernetes is “writing YAML.” YAML is only the declaration format. The real value comes from understanding how scheduling, health checks, service discovery, and reconciliation interact. Without that model, configuration files stay decorative instead of explanatory.

## Relationships matter more than quantity

The goal of Kubernetes basics is not memorizing dozens of resource types. It is understanding this chain:

`kubectl apply` declares intent, the control plane records and coordinates it, nodes execute workloads, Services provide stable access, and the system continually compares actual state against desired state.

Once that chain is clear, later concepts like Ingress, ConfigMap, Secret, HPA, and StatefulSet have somewhere meaningful to attach.
