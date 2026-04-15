---
locale: en
translationKey: elasticsearch-cluster-vip-deployment
pathSlug: elasticsearch-cluster-vip-deployment
title: "Elasticsearch Cluster and VIP Setup"
summary: "Prepare the hosts, kernel parameters, Keepalived VIP, and per-node Docker Compose files first, then start and verify the Elasticsearch cluster."
publishedAt: 2026-04-13
updatedAt: 2026-04-13
readingMinutes: 6
series: services
seriesOrder: 3
featured: false
tags: []
translationSourceHash: 9f0654676cd3f744e339f5faadf4b0163f90f2189dec2c4c1087767b1a7c994b
translationStatus: reviewed
translationModel: manual
translationUpdatedAt: 2026-04-15
---

## Deploy with Docker Compose

### Deployment notes

Adjust the hostnames, image addresses, data paths, ports, network interfaces, and Java heap size to match your environment before you deploy the cluster.

### Deployment environment

- OS: Ubuntu 24.04
- `es-node-01`: `10.14.0.33`
- `es-node-02`: `10.14.0.34`
- `es-node-03`: `10.14.0.35`
- VIP: `10.14.0.42`

### Pre-deployment preparation

```bash
# set hostnames
hostnamectl set-hostname es-node-01
hostnamectl set-hostname es-node-02
hostnamectl set-hostname es-node-03

# required kernel tuning for Elasticsearch
echo 'vm.max_map_count=262144' >> /etc/sysctl.conf
sysctl -p

# file descriptor limits
echo '* soft nofile 65536' >> /etc/security/limits.conf
echo '* hard nofile 65536' >> /etc/security/limits.conf

# optional but recommended
swapoff -a
```

### Install Keepalived

Install and configure Keepalived on all three nodes. The examples below use the VIP `10.14.0.42/24` and check local Elasticsearch health on port `9200`.

`es-node-01`

```bash
apt install -y keepalived

tee /etc/keepalived/keepalived.conf << 'EOF'
global_defs {
    router_id es-node-01
    enable_script_security
    script_user root
}

vrrp_script chk_es {
    script "/usr/bin/curl -s -f http://localhost:9200 > /dev/null"
    interval 2
    weight -50
}

vrrp_instance VI_29 {
    state MASTER
    interface ens160
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        10.14.0.42/24
    }
    track_script {
        chk_es
    }
}
EOF
```

`es-node-02`

```bash
apt install -y keepalived

tee /etc/keepalived/keepalived.conf << 'EOF'
global_defs {
    router_id es-node-02
    enable_script_security
    script_user root
}

vrrp_script chk_es {
    script "/usr/bin/curl -s -f http://localhost:9200 > /dev/null"
    interval 2
    weight -50
}

vrrp_instance VI_29 {
    state BACKUP
    interface ens160
    virtual_router_id 51
    priority 90
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        10.14.0.42/24
    }
    track_script {
        chk_es
    }
}
EOF
```

`es-node-03`

```bash
apt install -y keepalived

tee /etc/keepalived/keepalived.conf << 'EOF'
global_defs {
    router_id es-node-03
    enable_script_security
    script_user root
}

vrrp_script chk_es {
    script "/usr/bin/curl -s -f http://localhost:9200 > /dev/null"
    interval 2
    weight -50
}

vrrp_instance VI_29 {
    state BACKUP
    interface ens160
    virtual_router_id 51
    priority 80
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        10.14.0.42/24
    }
    track_script {
        chk_es
    }
}
EOF
```

### Start and verify Keepalived

```bash
systemctl daemon-reload
systemctl start keepalived
systemctl enable keepalived
systemctl status keepalived

# verify that the VIP is active on the expected master
ip addr

# after Elasticsearch is up, test the VIP directly
curl http://10.14.0.42:9200
```

### Create Elasticsearch data directories

```bash
mkdir -p /data/workspace/install-elastic/{data,logs,config,certs}
chown -R 1000:1000 /data/workspace/install-elastic
```

## Prepare Docker Compose files

Update these values for your own environment before you start:

- `discovery.seed_hosts`
- `cluster.initial_master_nodes`
- `network.publish_host`
- `ES_JAVA_OPTS`

`es-node-01`

```yaml
version: '3.8'

services:
  elasticsearch:
    image: 10.14.0.37/elastic/elastic-9.1.7:latest
    container_name: es-node-01
    network_mode: host
    environment:
      - node.name=es-node-01
      - cluster.name=es-cluster
      - discovery.seed_hosts=10.14.0.33:9300,10.14.0.34:9300,10.14.0.35:9300
      - cluster.initial_master_nodes=es-node-01,es-node-02,es-node-03
      - network.host=0.0.0.0
      - transport.host=0.0.0.0
      - network.publish_host=10.14.0.33
      - http.port=9200
      - transport.port=9300
      - node.roles=master,data,ingest
      - xpack.security.enabled=false
      - xpack.security.transport.ssl.enabled=false
      - xpack.security.http.ssl.enabled=false
      - action.destructive_requires_name=false
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms8g -Xmx8g"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - /data/workspace/install-elastic/data:/usr/share/elasticsearch/data
      - /data/workspace/install-elastic/logs:/usr/share/elasticsearch/logs
    ports:
      - "9200:9200"
      - "9300:9300"
    restart: unless-stopped
```

`es-node-02` and `es-node-03` use the same layout. Only change `container_name`, `node.name`, and `network.publish_host` to `10.14.0.34` and `10.14.0.35`.

## Start the cluster

```bash
# on es-node-01
docker-compose up -d

# on es-node-02
docker-compose up -d

# on es-node-03
docker-compose up -d
```

## Verify the cluster

```bash
curl http://10.14.0.33:9200/_cluster/health?pretty

curl http://10.14.0.33:9200/_cat/nodes?v
ip         heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
10.14.0.33           44          48   0    0.00    0.00     0.00 dim       -      es-node-01
10.14.0.34           17          50   0    0.00    0.01     0.00 dim       *      es-node-02
10.14.0.35           42          44   0    0.01    0.02     0.00 dim       -      es-node-03
```

If `_cluster/health` does not return `green`, check the Keepalived VIP first, then check whether all three nodes can reach each other on `9300`.
