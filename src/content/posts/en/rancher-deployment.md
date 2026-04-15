---
locale: en
translationKey: rancher-deployment
pathSlug: rancher-deployment
title: "Rancher Deployment"
summary: "Adjust hostnames, image addresses, data paths, ports, networks, and bootstrap credentials to match your own environment before deploying Rancher."
publishedAt: 2026-04-13
updatedAt: 2026-04-13
readingMinutes: 2
series: services
seriesOrder: 1
featured: false
tags: []
translationSourceHash: 58bc8bc09dab2548cb3e8d735de57c06ebf30f7e7908f83bd09c5a68d74f9ca7
translationStatus: reviewed
translationModel: manual
translationUpdatedAt: 2026-04-15
---

## Deploy with Docker Compose

### Deployment notes

Every value in the example below should be adjusted to your own environment, especially the hostname, image registry address, data path, ports, network name, and resource sizing. Prepare the required image in advance, either in your private registry or on the target host.

### Deployment environment

- OS: Ubuntu 24.04
- Node: Rancher
- IP: `10.14.0.38`

### Preparation

```bash
# install Docker and Docker Compose first

# set the hostname
hostnamectl set-hostname Rancher

# prepare the image tag
rancher/rancher-2.8.2:v1

# create the working directory
mkdir -p /data/workspace/install-rancher && cd /data/workspace/install-rancher

# create the directories and files used by Rancher
mkdir data resolved.conf

# create the external network
docker network create bigdata

# prepare docker-compose.yaml
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
      - CATTLE_SERVER_URL=https://10.14.0.38:1443
    ports:
      - "8080:80"
      - "1443:443"
    networks:
      - bigdata

networks:
  bigdata:
    external: true

# start the service
docker compose up -d

# verify the service
docker compose ps
NAME      IMAGE                                 COMMAND           SERVICE   CREATED      STATUS      PORTS
rancher   10.14.0.37/rancher/rancher-2.8.2:v1   "entrypoint.sh"   rancher   2 days ago   Up 2 days   0.0.0.0:8080->80/tcp, [::]:8080->80/tcp, 0.0.0.0:1443->443/tcp, [::]:1443->443/tcp
```

The critical setting here is `CATTLE_SERVER_URL`. If it does not match the URL users actually open, Rancher can redirect incorrectly after login or bootstrap.
