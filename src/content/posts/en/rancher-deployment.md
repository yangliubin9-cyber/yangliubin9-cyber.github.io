---
locale: en
translationKey: rancher-deployment
pathSlug: rancher-deployment
title: "Rancher Deployment"
summary: "Customize all values in the file according to your environment—hostnames, images, /data paths, ports, networks, and hardware resources. Ensure your images are available in a private registry or locally before proceeding."
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 2
series: services
seriesOrder: 1
featured: false
tags: []
translationSourceHash: 73270ae59e159d65e5c677a9d145ffca7955ec65dbd03df513791c34611c5c44
translationStatus: ai-generated
translationModel: kimi-k2.5
translationUpdatedAt: 2026-04-17
---

## Deploying with Docker Compose

### ⚠️ Pre-deployment Notes ⚠️

Modify all content in the file according to your specific environment, including hostname, image, /data paths, port numbers, networks, hardware resources, etc. You need to prepare your own image registry in advance, or ensure images are available locally.

### Deployment Environment

<div class="feishu-table-wrap"><table><thead><tr><th><strong>OS</strong></th><th><strong>Node</strong></th><th><strong>IP</strong></th></tr></thead><tbody><tr><td><strong>Ubuntu 24.04</strong></td><td><strong>Redis</strong></td><td><strong>10.14.0.38</strong></td></tr></tbody></table></div>

### Prerequisites

```
# Prepare Docker and Docker Compose services
Install manually

# Change hostname
hostnamectl set-hostname Redis

# Prepare MinIO image version
rancher/rancher-2.8.2:v1  // I am using the 2.8.2 image here, tagged and uploaded to Harbor for my own use

# Create service directory
mkdir -p /data/workspace/install-redis && cd /data/workspace/install-redis

# Create directories required for MinIO
mkdir data resolved.conf

# Prepare docker-compose.yaml file
Create network: docker network create bigdata
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
      # Critical: Add server URL to resolve redirect issues
      - CATTLE_SERVER_URL=https://10.14.0.38:1443
    ports:
      - "8080:80"
      - "1443:443"
    networks:
      - bigdata

# Connect to external network
networks:
  bigdata:
    external: true

# Start service
docker compose up -d

# Verify service
docker compose ps
NAME      IMAGE                                 COMMAND           SERVICE   CREATED      STATUS      PORTS
rancher   10.14.0.37/rancher/rancher-2.8.2:v1   "entrypoint.sh"   rancher   2 days ago   Up 2 days   0.0.0.0:8080->80/tcp, [::]:8080->80/tcp, 0.0.0.0:1443->443/tcp, [::]:1443->443/tcp
```
