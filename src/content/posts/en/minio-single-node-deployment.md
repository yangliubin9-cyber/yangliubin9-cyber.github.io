---
locale: en
translationKey: minio-single-node-deployment
pathSlug: minio-single-node-deployment
title: "MinIO Single-Node Deployment"
summary: "Customize all values in the file based on your environment: hostname, image, `/data` path, ports, networks, and hardware resources. Prepare your own image registry or ensure images are available locally beforehand."
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 2
series: services
seriesOrder: 2
featured: false
tags: []
translationSourceHash: 71be231350845bfef6db49a2c2c192dcf4b10d9fbcf83ae498bb1053562d3895
translationStatus: ai-generated
translationModel: kimi-k2.5
translationUpdatedAt: 2026-04-17
---

## Deploying with Docker Compose

### ⚠️ Pre-deployment Notes ⚠️

All content in the file must be modified according to your specific situation, including hostname, image, /data path, port numbers, networks, hardware resources, etc. You need to prepare your own image repository in advance, or ensure the image is available locally.

### Deployment Environment

<div class="feishu-table-wrap"><table><thead><tr><th><strong>OS</strong></th><th><strong>Node</strong></th><th><strong>IP</strong></th></tr></thead><tbody><tr><td><strong>Ubuntu 24.04</strong></td><td><strong>Minio</strong></td><td><strong>10.14.0.38</strong></td></tr></tbody></table></div>

## Prerequisites

```
# Prepare Docker and Docker Compose services
Install manually

# Modify hostname
hostnamectl set-hostname Minio

# Prepare MinIO image version
minio/minio4:v1  // Here I used an April 2025 image, tagged it, and uploaded to Harbor for use

# Create service directory
mkdir -p /data/workspace/install-minio && cd /data/workspace/install-minio

# Create directories required by MinIO
mkdir data config

# Prepare docker-compose.yaml file
Create network docker network create custom
services:
  minio:
    image: 10.14.0.37/minio/minio4:v1
    container_name: minio
    restart: unless-stopped
    
    # Critical: ensure the startup command is correct
    command: server /data --console-address ":9001"
    
    ports:
      - "9000:9000"    # API port
      - "19001:9001"   # Console port
    
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: minio@!QAZxsw2
    
    volumes:
      - /data/workspace/install-minio/data:/data
    
    networks:
      - custom
    
    # Add health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

networks:
  custom:
    external: true
    driver: bridge
    
# Start services
docker compose up -d

# Verify services
docker compose ps
NAME      IMAGE                        COMMAND                  SERVICE   CREATED      STATUS                PORTS
minio     10.14.0.37/minio/minio4:v1   "/usr/bin/docker-ent…"   minio     2 days ago   Up 2 days (healthy)   0.0.0.0:9000->9000/tcp, [::]:9000->9000/tcp, 0.0.0.0:19001->9001/tcp, [::]:19001->9001/tcp
```
