---
locale: en
translationKey: harbor-deployment
pathSlug: harbor-deployment
title: "Harbor Deployment"
summary: "Adjust the image address, data path, ports, passwords, and memory settings to match your environment before bringing the service up with Docker Compose."
publishedAt: 2026-04-13
updatedAt: 2026-04-13
readingMinutes: 4
series: services
seriesOrder: 4
featured: false
tags: []
translationSourceHash: c8726eb7dc118bb56d83f40512b216e0bc2eaf2e5377d4046d4b0fe20766c88c
translationStatus: reviewed
translationModel: manual
translationUpdatedAt: 2026-04-15
---

## Deploy with Docker Compose

### Deployment notes

The synced source content for this article currently contains a Redis standalone deployment example. The English page below follows that source so the bilingual route stays aligned.

---

## Environment and system tuning

### Prepare the working directory

```bash
mkdir -p /data/workspace/install-redis/data && cd /data/workspace/install-redis
```

### System tuning

```bash
# temporary tuning
sysctl -w vm.overcommit_memory=1
sysctl -w net.core.somaxconn=1024

# persist the settings
echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
echo "net.core.somaxconn = 1024" >> /etc/sysctl.conf
sysctl -p
```

---

## Prepare the Docker Compose file

```yaml
services:
  redis:
    container_name: redis-standalone
    image: 10.14.0.37/redis/redis-8.4.0:v1
    restart: always
    ports:
      - "3759:6379"
    environment:
      - REDISCLI_AUTH=redis@!QAZxsw2
      - TZ=Asia/Shanghai
    volumes:
      - /data/workspace/install-redis/data:/data
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    sysctls:
      net.core.somaxconn: 1024
    command:
      - "redis-server"
      - "--requirepass redis@!QAZxsw2"
      - "--appendonly yes"
      - "--appendfsync everysec"
      - "--save 900 1"
      - "--save 300 10"
      - "--maxmemory 2gb"
      - "--maxmemory-policy allkeys-lru"
      - "--timeout 300"
      - "--tcp-keepalive 300"
      - "--databases 16"
      - "--maxclients 10000"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redis@!QAZxsw2", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

---

## Start and verify

### Start Redis

```bash
docker compose up -d
```

### Verify Redis

```bash
docker logs -f redis-standalone

docker exec -it redis-standalone redis-cli
set hello world
get hello

127.0.0.1:6379> config get maxmemory
1) "maxmemory"
2) "2147483648"
```

The main points worth checking are the password, the max memory limit, and whether AOF plus RDB snapshots are both enabled as expected.
