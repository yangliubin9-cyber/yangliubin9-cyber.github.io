---
locale: en
translationKey: postgres-cluster-deployment
pathSlug: postgres-cluster-deployment
title: "Postgres Cluster Deployment"
summary: "Customize all values according to your environment, including image, /data path, port, networks, and hardware resources."
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 5
series: services
seriesOrder: 5
featured: false
tags: []
translationSourceHash: de3bc509f769988c2254924986f155e17db97e896381ed96c8189ab40d6d0c60
translationStatus: ai-generated
translationModel: kimi-k2.5
translationUpdatedAt: 2026-04-17
---

## Deploying with Docker Compose

### ⚠️ Pre-deployment Notes ⚠️

Customize all configurations based on your environment, including image, `/data` paths, ports, networks, hardware resources, etc.;

---

## Primary Node Setup

### Create Required Directories

```
# Execute on the primary node

# Create primary directory and enter it
sudo su -
mkdir -p /data/workspace/install-postgres && cd /data/workspace/install-postgres

# Create full directory structure and set permissions (PostgreSQL container UID/GID is 999)
mkdir -p /data/workspace/install-postgres/{data,archive,scripts,config} && chown -R 999:999 /data/workspace/install-postgres && chmod -R 750 /data/workspace/install-postgres
```

---

### Create Initialization Script

```
cat > /data/workspace/install-postgres/scripts/init-primary.sh << 'EOF'
#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U postgres -d postgres; do sleep 2; done

# Create replication user and slot
psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" <<-EOSQL
    CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator_password';
    SELECT * FROM pg_create_physical_replication_slot('replication_slot_standby_1');
EOSQL

echo ">>> Primary node initialization successful"
EOF

chmod +x /data/workspace/install-postgres/scripts/init-primary.sh
```

---

### Create pg_hba.conf Configuration

```
cat > /data/workspace/install-postgres/config/pg_hba.conf << 'EOF'
# PostgreSQL Authentication Configuration
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
# Allow standby subnet connections
host    replication     replicator      10.14.0.0/16            scram-sha-256
host    all             pg_monitor      10.14.0.0/16            scram-sha-256
# Allow all IPs to connect to regular databases (restrict as needed)
host    all             all             0.0.0.0/0               scram-sha-256
EOF

sudo chown 999:999 /data/workspace/install-postgres/config/pg_hba.conf
chmod 600 /data/workspace/install-postgres/config/pg_hba.conf
```

---

### Prepare Primary Docker Compose File

```
cat > /data/workspace/install-postgres/docker-compose.yml << 'EOF'
services:
  pg-primary:
    # Change to your private image
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
```

---

### Start Primary Node

```
# Execute on primary node
docker compose up -d

# Wait 30 seconds, check logs
sleep 30; docker logs pg-primary --tail 20

# Verify health status
docker exec pg-primary pg_isready -U postgres -d postgres
```

---

## Standby Node Setup

### Create Required Directories

```
# Execute on the standby node
# Create standby directory and enter it
sudo su -
mkdir -p /data/workspace/install-postgres/data && cd /data/workspace/install-postgres

# Change directory permissions
chown -R 999:999 /data/workspace/install-postgres && chmod -R 750 /data/workspace/install-postgres
```

---

### Prepare Standby Docker Compose File

```
cat > docker-compose.yml << 'EOF'
# version: '3.8'

services:
  pg-standby:
    # Change to your private image
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
        
        # Wait for primary to be ready (points to primary IP 10.14.0.31)
        echo ">>> Waiting for primary 10.14.0.31..."
        until pg_isready -h 10.14.0.31 -p 5432 -U replicator; do sleep 2; done
        
        # If data directory is empty, perform full backup
        if [ -z "$$(ls -A $$DATA 2>/dev/null)" ]; then
          echo ">>> Starting backup from primary..."
          export PGPASSWORD=replicator_password
          
          # Must use -R (--write-recovery-conf) to auto-generate standby.signal
          pg_basebackup \
            -h 10.14.0.31 \
            -p 5432 \
            -U replicator \
            -D "$$DATA" \
            -Fp -Xs -P -v -R \
            --slot=replication_slot_standby_1
            
          echo ">>> Backup complete, fixing permissions..."
          chown -R postgres:postgres "$$DATA"
          chmod 700 "$$DATA"
        fi
        
        echo ">>> Starting database..."
        # Start standby
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
```

---

### Start the Standby

```
# Start the standby using the docker-compose.yaml provided above
docker compose up -d

# Check logs to confirm successful execution
docker ps
docker logs -f postgres-standby
```

---

## Verify Cluster Status

```
# Execute on the primary
# Check replication status (critical verification)
docker exec -it pg-primary psql -U postgres -c "
SELECT 
    client_addr, 
    usename, 
    state, 
    sync_state,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)) as lag
FROM pg_stat_replication;
"

# Expected output:
#  client_addr |   usename   |   state   | sync_state |   lag
# -------------+-------------+-----------+------------+---------
#  10.14.0.31| replicator  | streaming | async      | 0 bytes

# Test data synchronization
docker exec -it pg-primary psql -U postgres -c "
CREATE TABLE test_sync(id serial, data text);
INSERT INTO test_sync(data) VALUES('Test primary-standby replication');
SELECT * FROM test_sync;
"

# Execute on the standby
# Standby query verification, read operation
docker exec -it pg-standby psql -U postgres -c "SELECT * FROM test_sync;"

# Verify standby is read-only, cannot perform write/delete/insert operations
docker exec -it pg-standby psql -U postgres -c "INSERT INTO test_sync(data) VALUES('This should fail');"
# Expected error: cannot execute INSERT in a read-only transaction
```
