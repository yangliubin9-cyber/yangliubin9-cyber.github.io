---
locale: en
translationKey: postgres-cluster-deployment
pathSlug: postgres-cluster-deployment
title: "Postgres Cluster Deployment"
summary: "Prepare the primary and standby directories, replication user, pg_hba rules, and Docker Compose files first, then validate replication from both sides."
publishedAt: 2026-04-13
updatedAt: 2026-04-13
readingMinutes: 5
series: services
seriesOrder: 5
featured: false
tags: []
translationSourceHash: 495774d64640a909cffe6d2ca5d234c357b7e80057568cae223c449721af50c2
translationStatus: reviewed
translationModel: manual
translationUpdatedAt: 2026-04-15
---

## Deploy with Docker Compose

### Deployment notes

Adjust all values to your own environment before you deploy, especially image addresses, data paths, ports, passwords, CIDR ranges, and resource limits.

---

## Primary node preparation

### Create the required directories

```bash
sudo su -
mkdir -p /data/workspace/install-postgres && cd /data/workspace/install-postgres
mkdir -p /data/workspace/install-postgres/{data,archive,scripts,config} && chown -R 999:999 /data/workspace/install-postgres && chmod -R 750 /data/workspace/install-postgres
```

### Create the initialization script

```bash
cat > /data/workspace/install-postgres/scripts/init-primary.sh << 'EOF'
#!/bin/bash
set -e

until pg_isready -U postgres -d postgres; do sleep 2; done

psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" <<-EOSQL
    CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator_password';
    SELECT * FROM pg_create_physical_replication_slot('replication_slot_standby_1');
EOSQL

echo ">>> primary initialization completed"
EOF

chmod +x /data/workspace/install-postgres/scripts/init-primary.sh
```

### Create `pg_hba.conf`

```bash
cat > /data/workspace/install-postgres/config/pg_hba.conf << 'EOF'
local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
host    replication     replicator      10.14.0.0/16            scram-sha-256
host    all             pg_monitor      10.14.0.0/16            scram-sha-256
host    all             all             0.0.0.0/0               scram-sha-256
EOF

sudo chown 999:999 /data/workspace/install-postgres/config/pg_hba.conf
chmod 600 /data/workspace/install-postgres/config/pg_hba.conf
```

### Primary Docker Compose

```yaml
services:
  pg-primary:
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
```

### Start the primary

```bash
docker compose up -d
sleep 30; docker logs pg-primary --tail 20
docker exec pg-primary pg_isready -U postgres -d postgres
```

---

## Standby node preparation

### Create the required directories

```bash
sudo su -
mkdir -p /data/workspace/install-postgres/data && cd /data/workspace/install-postgres
chown -R 999:999 /data/workspace/install-postgres && chmod -R 750 /data/workspace/install-postgres
```

### Standby Docker Compose

```yaml
services:
  pg-standby:
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
        echo ">>> waiting for primary 10.14.0.31..."
        until pg_isready -h 10.14.0.31 -p 5432 -U replicator; do sleep 2; done

        if [ -z "$$(ls -A $$DATA 2>/dev/null)" ]; then
          echo ">>> starting base backup..."
          export PGPASSWORD=replicator_password
          pg_basebackup \
            -h 10.14.0.31 \
            -p 5432 \
            -U replicator \
            -D "$$DATA" \
            -Fp -Xs -P -v -R \
            --slot=replication_slot_standby_1

          chown -R postgres:postgres "$$DATA"
          chmod 700 "$$DATA"
        fi

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
```

### Start the standby

```bash
docker compose up -d
docker ps
docker logs -f postgres-standby
```

---

## Verify replication

```bash
# on the primary
docker exec -it pg-primary psql -U postgres -c "
SELECT
    client_addr,
    usename,
    state,
    sync_state,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)) as lag
FROM pg_stat_replication;
"

# expected output
#  client_addr |   usename   |   state   | sync_state |   lag
# -------------+-------------+-----------+------------+---------
#  10.14.0.31  | replicator  | streaming | async      | 0 bytes

# test data sync
docker exec -it pg-primary psql -U postgres -c "
CREATE TABLE test_sync(id serial, data text);
INSERT INTO test_sync(data) VALUES('test primary-standby sync');
SELECT * FROM test_sync;
"

# on the standby
docker exec -it pg-standby psql -U postgres -c "SELECT * FROM test_sync;"

# verify read-only behavior
docker exec -it pg-standby psql -U postgres -c "INSERT INTO test_sync(data) VALUES('this should fail');"
# expected: cannot execute INSERT in a read-only transaction
```
