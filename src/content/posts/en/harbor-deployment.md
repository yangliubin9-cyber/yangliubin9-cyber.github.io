---
locale: en
translationKey: harbor-deployment
pathSlug: harbor-deployment
title: "Harbor Deployment"
summary: "Adjust all configuration values to match your environment, including images, /data paths, port numbers, networks, and hardware resources."
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 4
series: services
seriesOrder: 4
featured: false
tags: []
translationSourceHash: 1e731049c711a93708d98695309555f0e34d674e2cbf4c599d3ecc68de4c885f
translationStatus: ai-generated
translationModel: kimi-k2.5
translationUpdatedAt: 2026-04-17
---

## Deploying with Docker Compose

### ⚠️ Pre-deployment Notes ⚠️

Customize all values in the file according to your environment, such as `image`, `/data` paths, ports, `networks`, hardware resources, etc.

---

## Environment and System Optimization

### Directory Preparation

```
# Create and switch to the project directory
mkdir -p /data/workspace/install-redis/data && cd /data/workspace/install-redis
```

---

### System Optimization

```
# Host kernel parameter optimization (temporary; resets after reboot)
# Allow allocation of all physical memory to prevent Redis from being OOM-killed during snapshots
sysctl -w vm.overcommit_memory=1
# Increase connection backlog to prevent connection drops under high concurrency
sysctl -w net.core.somaxconn=1024

# (Optional) Persist settings across reboots
echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
echo "net.core.somaxconn = 1024" >> /etc/sysctl.conf
sysctl -p
```

---

## Prepare Docker Compose File

```
root@edis:# tee /data/workspace/install-redis/docker-compose.yaml >> "EOF"
# version: '3.8'

services:
  redis:
    # Service name
    container_name: redis-standalone
    # Image version
    image: 10.14.0.37/redis/redis-8.4.0:v1  # Adjust based on your image registry
    restart: always
    # Port mapping: Host 3759 -> Container 6379
    ports:
      - "3759:6379"
    
    # Environment variables (only for client tool auto-authentication, not Redis server config)
    environment:
      - REDISCLI_AUTH=redis@!QAZxsw2
      - TZ=Asia/Shanghai

    # Volume mounts
    volumes:
      - /data/workspace/install-redis/data:/data

    # --- Production environment system limits ---
    # Increase max open files, essential for high concurrency
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    
    # Kernel parameter optimization inside container
    sysctls:
      # Increase connection backlog inside container
      net.core.somaxconn: 1024

    # --- Redis core startup command (enterprise-grade parameters) ---
    command:
      - "redis-server"
      # 1. Basic authentication
      - "--requirepass redis@!QAZxsw2"
      
      # 2. Data persistence strategy (AOF + RDB hybrid mode)
      - "--appendonly yes"                # Enable AOF (better data safety)
      - "--appendfsync everysec"          # Fsync once per second, balancing performance and safety
      - "--save 900 1"                    # Generate RDB snapshot if 1 key changes within 15 minutes
      - "--save 300 10"                   # Generate RDB snapshot if 10 keys change within 5 minutes
      
      # 3. Memory management (very important)
      # Limit max memory to prevent exhausting server RAM. Recommended: ~75% of physical memory
      # Example uses 2gb; adjust according to your machine, e.g., 4gb, 8gb
      - "--maxmemory 2gb"
      # Eviction policy when memory is full: remove least recently used keys (LRU)
      - "--maxmemory-policy allkeys-lru"
      
      # 4. Connections and timeouts
      - "--timeout 300"                   # Disconnect idle clients after 300 seconds (5 minutes)
      - "--tcp-keepalive 300"             # TCP keepalive probes
      - "--databases 16"                  # Default database count
      - "--maxclients 10000"              # Max connected clients

      # 5. Performance optimization
      # Enable multi-threaded I/O (Redis 6.0+), accelerate network reads/writes
      # Recommended: CPU cores - 1, e.g., set to 2 or 3 on a 4-core machine. Set to 1 to disable.
      # - "--io-threads 1" 
      # - "--io-threads-do-reads yes"

    # Healthcheck (must include password)
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redis@!QAZxsw2", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

    # networks:
    #   - default
EOF
```

---

## Startup and Verification

### Start Redis

```
# Navigate to the docker-compose.yaml directory and start
root@edis:/data/workspace/install-redis# docker compose up -d
```

---

### Verify Redis

```
# Check logs for errors (especially Warnings)
docker logs -f redis-standalone

# Verify connection and configuration; enter container for testing.
# No password needed here because environment variables are set in docker-compose.
docker exec -it redis-standalone redis-cli
# At the 127.0.0.1:6379> prompt, enter:
# Test read/write
set hello world
get hello

# Verify current memory configuration is active

127.0.0.1:6379> config get maxmemory
1) "maxmemory"
2) "2147483648"
```
