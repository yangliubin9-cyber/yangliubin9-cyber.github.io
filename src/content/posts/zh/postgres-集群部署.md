---
pathSlug: "postgres-集群部署"
locale: "zh"
translationKey: "feishu-QCQJdQ1AhoECs5xsJmacimnPnUe"
title: "Postgres 集群部署"
excerpt: "使用 Docker Compose 部署 ⚠️部署前须知⚠️ 文件中所有内容要根据自己的情况修改，比如说 image、/data..."
category: "服务搭建"
publishedAt: "2026-03-30"
updatedAt: "2026-03-31"
featured: false
tags:
  - "Feishu"
  - "Cloud Docs"
accent: "cyan"
heroEyebrow: "Feishu Folder"
sourcePlatform: "feishu"
sourceUrl: "https://my.feishu.cn/docx/QCQJdQ1AhoECs5xsJmacimnPnUe"
sourceDocToken: "QCQJdQ1AhoECs5xsJmacimnPnUe"
---

使用 Docker-Compose 部署
⚠️部署前须知⚠️
文件中所有内容要根据自己的情况修改，比如说 image、/data地址、端口号、networks、硬件资源等；

主库环境准备
创建所需要的目录

# 在主库上执行

# 创建主库目录并进入
sudo su -
mkdir -p /data/workspace/install-postgres && cd /data/workspace/install-postgres

# 创建完整目录结构并统一设置权限（PostgreSQL 容器内 UID/GID 为 999）
mkdir -p /data/workspace/install-postgres/{data,archive,scripts,config} && chown -R 999:999 /data/workspace/install-postgres && chmod -R 750 /data/workspace/install-postgres

创建初始化脚本

cat > /data/workspace/install-postgres/scripts/init-primary.sh << 'EOF'
#!/bin/bash
set -e

# 等待PostgreSQL就绪
until pg_isready -U postgres -d postgres; do sleep 2; done

# 创建复制用户和插槽
psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" <<-EOSQL
    CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator_password';
    SELECT * FROM pg_create_physical_replication_slot('replication_slot_standby_1');
EOSQL

echo ">>> 主库初始化成功"
EOF

chmod +x /data/workspace/install-postgres/scripts/init-primary.sh

创建pg_hba.conf配置文件

cat > /data/workspace/install-postgres/config/pg_hba.conf << 'EOF'
# PostgreSQL认证配置
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
# 允许从库网段连接
host    replication     replicator      10.14.0.0/16            scram-sha-256
host    all             pg_monitor      10.14.0.0/16            scram-sha-256
# 允许所有IP连接普通数据库(根据需求可收缩)
host    all             all             0.0.0.0/0               scram-sha-256
EOF

sudo chown 999:999 /data/workspace/install-postgres/config/pg_hba.conf
chmod 600 /data/workspace/install-postgres/config/pg_hba.conf

准备主库 Docker-Compose 文件

cat > /data/workspace/install-postgres/docker-compose.yml << 'EOF'
services:
  pg-primary:
    # 修改为你的私有镜像
    image: 10.14.0.37/postgres/postgres-18:V1
    container_name: pg-primary
    restart: unless-stopped
    
    ports:
      - "5432:5432"
    
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 'postgres@!QAZxsw2'
      POSTGRES_DB: postgres
      PGDATA: /var/lib/postgresql/data/pg18
    
    volumes:
      - /data/workspace/install-postgres/data:/var/lib/postgresql/data
      - /data/workspace/install-postgres/archive:/var/lib/postgresql/archive
      - /data/workspace/install-postgres/scripts/init-primary.sh:/docker-entrypoint-initdb.d/init-primary.sh
      - /data/workspace/install-postgres/config/pg_hba.conf:/etc/postgresql/pg_hba.conf:ro
    
    command: >
      postgres
      -c max_connections=5000
      -c shared_buffers=2GB
      -c effective_cache_size=6GB
      -c work_mem=8MB
      -c maintenance_work_mem=512MB
      -c wal_buffers=16MB
      -c checkpoint_timeout=10min
      -c max_wal_size=4GB
      -c wal_level=replica
      -c max_wal_senders=10
      -c max_replication_slots=10
      -c hot_standby=on
      -c archive_mode=on
      -c archive_command='test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
      -c listen_addresses='*'
      -c synchronous_commit=off
      -c hba_file='/etc/postgresql/pg_hba.conf'
      -c password_encryption=scram-sha-256
      -c log_min_duration_statement=1000
      -c log_connections=on
      -c log_disconnections=on
      -c track_commit_timestamp=on
    
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d postgres"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 30s

EOF

启动主库

# 在主库执行
docker compose up -d

# 等待30秒，查看日志
sleep 30; docker logs pg-primary --tail 20

# 验证健康状态
docker exec pg-primary pg_isready -U postgres -d postgres

从库环境准备
创建所需要的目录

# 在从库上执行
# 创建从库目录 并进入目录
sudo su -
mkdir -p /data/workspace/install-postgres/data && cd /data/workspace/install-postgres

# 修改目录权限
chown -R 999:999 /data/workspace/install-postgres && chmod -R 750 /data/workspace/install-postgres

准备从库 Docker-Compose 文件

cat > docker-compose.yml << 'EOF'
# version: '3.8'

services:
  pg-standby:
    # 修改为你的私有镜像
    image: 10.14.0.37/postgres/postgres-18:V1
    container_name: pg-standby
    restart: unless-stopped
    
    ports:
      - "5432:5432"
    
    environment:
      POSTGRES_PASSWORD: 'postgres@!QAZxsw2'
      TZ: Asia/Shanghai
      PGDATA: /var/lib/postgresql/data/pg18
    
    volumes:
      - /data/workspace/install-postgres/data:/var/lib/postgresql/data
    
    command: |
      bash -euc '
        DATA=/var/lib/postgresql/data/pg18
        
        # 等待主库就绪 (指向主库IP 10.14.0.31)
        echo ">>> 等待主库 10.14.0.31..."
        until pg_isready -h 10.14.0.31 -p 5432 -U replicator; do sleep 2; done
        
        # 如果数据目录为空，执行全量备份
        if [ -z "$$(ls -A $$DATA 2>/dev/null)" ]; then
          echo ">>> 开始从主库备份..."
          export PGPASSWORD=replicator_password
          
          # 必须使用 -R (--write-recovery-conf) 自动生成 standby.signal
          pg_basebackup \
            -h 10.14.0.31 \
            -p 5432 \
            -U replicator \
            -D "$$DATA" \
            -Fp -Xs -P -v -R \
            --slot=replication_slot_standby_1
            
          echo ">>> 备份完成，修复权限..."
          chown -R postgres:postgres "$$DATA"
          chmod 700 "$$DATA"
        fi
        
        echo ">>> 启动数据库..."
        # 启动从库
        exec docker-entrypoint.sh postgres \
          -c max_connections=5000 \
          -c shared_buffers=2GB \
          -c hot_standby=on \
          -c hot_standby_feedback=on \
          -c max_standby_streaming_delay=30s
      '
    
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 60s

EOF

启动从库

# 根据以上提供的 docker-compose.yaml 文件启动从库
docker compose up -d

# 查看日志确认是否执行成功
docker ps
docker logs -f postgres-standby

验证集群状态

# 在主库执行
# 检查复制状态（关键验证）
docker exec -it pg-primary psql -U postgres -c "
SELECT 
    client_addr, 
    usename, 
    state, 
    sync_state,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)) as lag
FROM pg_stat_replication;
"

# 预期输出：
#  client_addr |   usename   |   state   | sync_state |   lag
# -------------+-------------+-----------+------------+---------
#  10.14.0.31| replicator  | streaming | async      | 0 bytes

# 测试数据同步
docker exec -it pg-primary psql -U postgres -c "
CREATE TABLE test_sync(id serial, data text);
INSERT INTO test_sync(data) VALUES('测试主从同步');
SELECT * FROM test_sync;
"

# 在从库执行
# 从库查询验证，读操作
docker exec -it pg-standby psql -U postgres -c "SELECT * FROM test_sync;"

# 验证从库只读，无法写删除插入操作
docker exec -it pg-standby psql -U postgres -c "INSERT INTO test_sync(data) VALUES('这应失败');"
# 预期错误：cannot execute INSERT in a read-only transaction
