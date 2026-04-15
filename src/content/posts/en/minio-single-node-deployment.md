---
locale: en
translationKey: minio-single-node-deployment
pathSlug: minio-single-node-deployment
title: "MinIO Single-Node Deployment"
summary: "Prepare the image, working directory, ports, and health checks first, then bring up a single-node MinIO instance with Docker Compose."
publishedAt: 2026-04-13
updatedAt: 2026-04-13
readingMinutes: 2
series: services
seriesOrder: 2
featured: false
tags: []
translationSourceHash: 3abbb29e06cd082d08661de5c2d0c457502aae3794a304e929507a69ca3c547b
translationStatus: reviewed
translationModel: manual
translationUpdatedAt: 2026-04-15
---

## Deploy with Docker Compose

### Deployment notes

Adjust all values to your own environment before you run the service, including the hostname, image address, storage path, ports, networks, and credentials. Prepare the image in your registry or on the host in advance.

### Deployment environment

- OS: Ubuntu 24.04
- Node: MinIO
- IP: `10.14.0.38`

## Preparation

```bash
# install Docker and Docker Compose first

# set the hostname
hostnamectl set-hostname Minio

# prepare the image tag
minio/minio4:v1

# create the working directory
mkdir -p /data/workspace/install-minio && cd /data/workspace/install-minio

# create the required directories
mkdir data config

# create the external network
docker network create custom

# prepare docker-compose.yaml
services:
  minio:
    image: 10.14.0.37/minio/minio4:v1
    container_name: minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "19001:9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: minio@!QAZxsw2
    volumes:
      - /data/workspace/install-minio/data:/data
    networks:
      - custom
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

networks:
  custom:
    external: true
    driver: bridge

# start the service
docker compose up -d

# verify the service
docker compose ps
NAME      IMAGE                        COMMAND                  SERVICE   CREATED      STATUS                PORTS
minio     10.14.0.37/minio/minio4:v1   "/usr/bin/docker-ent…"   minio     2 days ago   Up 2 days (healthy)   0.0.0.0:9000->9000/tcp, [::]:9000->9000/tcp, 0.0.0.0:19001->9001/tcp, [::]:19001->9001/tcp
```

The two values worth checking first are the startup command and the console port. If either of those is wrong, the MinIO container may start but the web console or API will not behave as expected.
