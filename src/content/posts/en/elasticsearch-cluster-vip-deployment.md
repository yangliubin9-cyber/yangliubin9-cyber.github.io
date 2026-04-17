---
locale: en
translationKey: elasticsearch-cluster-vip-deployment
pathSlug: elasticsearch-cluster-vip-deployment
title: "Elasticsearch Cluster with VIP Deployment"
summary: "Customize all configuration values for your environment, including hostnames, images, /data paths, ports, networks, and hardware resources."
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 7
series: services
seriesOrder: 3
featured: false
tags: []
translationSourceHash: ac74fbccd142749911515f62a727204dc1f3645436ac52195c24f6b658c99340
translationStatus: ai-generated
translationModel: kimi-k2.5
translationUpdatedAt: 2026-04-17
---

## Deploying with Docker-Compose

### ⚠️Pre-deployment Notes⚠️

All content in the files must be modified according to your environment, including hostnames, image, /data paths, port numbers, networks, hardware resources, etc.;

---

### Deployment Environment

<div class="feishu-table-wrap"><table><thead><tr><th><strong>OS</strong></th><th><strong>Node</strong></th><th><strong>IP</strong></th></tr></thead><tbody><tr><td><strong>Ubuntu 24.04</strong></td><td><strong>es-node-01</strong></td><td><strong>10.14.0.33</strong><br /><strong>VIP</strong><br /><strong>10.14.0.42</strong></td></tr><tr><td><strong>Ubuntu 24.04</strong></td><td><strong>es-node-02</strong></td><td><strong>10.14.0.34</strong></td></tr><tr><td><strong>Ubuntu 24.04</strong></td><td><strong>es-node-03</strong></td><td><strong>10.14.0.34</strong></td></tr></tbody></table></div>

---

### Pre-deployment Preparation

```bash
# Set hostname
hostnamectl set-hostname es-node-01
hostnamectl set-hostname es-node-02
hostnamectl set-hostname es-node-03

# System configuration tuning
# Permanently set the maximum number of virtual memory areas, required for running Elasticsearch or certain databases
# Add 'vm.max_map_count=262144' to /etc/sysctl.conf
echo 'vm.max_map_count=262144' >> /etc/sysctl.conf

# Reload new configuration from /etc/sysctl.conf to take effect immediately
sysctl -p

# Set soft limit for max open files to 65536 for all users
echo '* soft nofile 65536' >> /etc/security/limits.conf

# Set hard limit for max open files to 65536 for all users
echo '* hard nofile 65536' >> /etc/security/limits.conf

# Disable swap (optional but recommended)
swapoff -a
```

---

### Installing Keepalived

**es-node-01: Install Service and Configuration File**

```bash
# Install service via apt
apt install -y keepalived

# Enter config directory and create config file
tee /etc/keepalived/keepalived.conf << 'EOF'
! Keepalived Configuration - Master Node
! Configuration File for keepalived
global_defs {
    router_id es-node-01   # Set according to your configuration
    enable_script_security
    script_user root
}

vrrp_script chk_es {
    script "/usr/bin/curl -s -f http://localhost:9200 > /dev/null"  
    interval 2
    weight -50
}

vrrp_instance VI_29 {
    state MASTER       # Designate slave node
    interface ens160    # Bind network interface
    virtual_router_id 51
    priority 100         # Priority
    advert_int 1
    authentication {
        auth_type PASS  
        auth_pass 1111  # Cluster password must match
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

**es-node-02: Install Service and Configuration File**

```bash
# Install service via apt
apt install -y keepalived

# Enter config directory and create config file
tee /etc/keepalived/keepalived.conf << 'EOF'
! Keepalived Configuration - Master Node
! Configuration File for keepalived
global_defs {
    router_id es-node-02   # Set according to your configuration
    enable_script_security
    script_user root
}

vrrp_script chk_es {
    script "/usr/bin/curl -s -f http://localhost:9200 > /dev/null"  
    interval 2
    weight -50
}

vrrp_instance VI_29 {
    state BACKUP        # Designate slave node
    interface ens160    # Bind network interface
    virtual_router_id 51
    priority 90         # Priority
    advert_int 1
    authentication {
        auth_type PASS  
        auth_pass 1111  # Cluster password must match
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

**es-node-03: Install Service and Configuration File**

```bash
# Install service via apt
apt install -y keepalived

# Enter config directory and create config file
tee /etc/keepalived/keepalived.conf << 'EOF'
! Keepalived Configuration - Master Node
! Configuration File for keepalived
global_defs {
    router_id es-node-03   # Set according to your configuration
    enable_script_security
    script_user root
}

vrrp_script chk_es {
    script "/usr/bin/curl -s -f http://localhost:9200 > /dev/null"  
    interval 2
    weight -50
}

vrrp_instance VI_29 {
    state BACKUP        # Designate slave node
    interface ens160    # Bind network interface
    virtual_router_id 51
    priority 80         # Priority
    advert_int 1
    authentication {
        auth_type PASS  
        auth_pass 1111  # Cluster password must match
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

### Start **Keepalived Service Verification**

```
# es-node-01
systemctl daemon-reload
systemctl start keepalived
systemctl enable keepalived
systemctl status keepalived

# es-node-02
systemctl daemon-reload
systemctl start keepalived
systemctl enable keepalived
systemctl status keepalived

# es-node-03
systemctl daemon-reload
systemctl start keepalived
systemctl enable keepalived
systemctl status keepalived

# Verify IP configuration on the master node
ip addr | grep ens160  # Check the bound network interface based on your configuration; here it is ens160
 ens160: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    inet 10.14.0.33/24 brd 10.14.0.255 scope global ens160
    inet 10.14.0.42/24 scope global secondary ens160

# Verify cluster accessibility; perform this step after ES cluster setup is complete
Verify VIP
curl http://10.14.0.42:9200
# Verify cluster IPs
curl http://10.14.0.33:9200
curl http://10.14.0.34:9200
curl http://10.14.0.35:9200
```

### Create ES Directories and Set Permissions

```
# Create necessary directory structure (adjust for your environment)
mkdir -p /data/workspace/install-elastic/{data,logs,config,certs}

# Change the owner and group of /data/workspace/install-es/es directory and all its contents to user ID 1000 and group ID 1000
# The -R option recursively changes all files and subdirectories to ensure the Elasticsearch process has read/write permissions
chown -R 1000:1000 /data/workspace/install-elastic
```

---

## Prepare Docker-Compose Files

### es-node-01 Configuration File

**'# The following parameters need to be adjusted based on your configuration **

**'# discovery.seed_hosts**
**'# ELASTIC_PASSWORD**
**'# cluster.initial_master_nodes**
**'# network.publish_host**
**'# ES_JAVA_OPTS=-Xms2g -Xmx2g**

```
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

---

### es-node-02 Configuration File

**'# The following parameters need to be adjusted based on your configuration **

**'# discovery.seed_hosts**
**'# ELASTIC_PASSWORD**
**'# cluster.initial_master_nodes**
**'# network.publish_host**
**'# ES_JAVA_OPTS=-Xms2g -Xmx2g**

```
version: '3.8'

services:
  elasticsearch:
    image: 10.14.0.37/elastic/elastic-9.1.7:latest
    container_name: es-node-02
    network_mode: host
    environment:
      - node.name=es-node-02
      - cluster.name=es-cluster
      - discovery.seed_hosts=10.14.0.33:9300,10.14.0.34:9300,10.14.0.35:9300
      - cluster.initial_master_nodes=es-node-01,es-node-02,es-node-03
      - network.host=0.0.0.0
      - transport.host=0.0.0.0
      - network.publish_host=10.14.0.34
      - http.port=9200
      - transport.port=9300
      - node.roles=master,data,ingest
      - xpack.security.enabled=false
      - xpack.security.transport.ssl.enabled=false
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

---

### es-node-03 Configuration File

**'# The following parameters need to be adjusted based on your configuration **

**'# discovery.seed_hosts**
**'# ELASTIC_PASSWORD**
**'# cluster.initial_master_nodes**
**'# network.publish_host**
**'# ES_JAVA_OPTS=-Xms2g -Xmx2g**

```yaml
version: '3.8'

services:
  elasticsearch:
    image: 10.14.0.37/elastic/elastic-9.1.7:latest
    container_name: es-node-03
    network_mode: host
    environment:
      - node.name=es-node-03
      - cluster.name=es-cluster
      - discovery.seed_hosts=10.14.0.33:9300,10.14.0.34:9300,10.14.0.35:9300
      - cluster.initial_master_nodes=es-node-01,es-node-02,es-node-03
      - network.host=0.0.0.0
      - transport.host=0.0.0.0
      - network.publish_host=10.14.0.35
      - http.port=9200
      - transport.port=9300
      - node.roles=master,data,ingest
      - xpack.security.enabled=false
      - xpack.security.transport.ssl.enabled=false
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

---

## Start the Cluster

```
# Start on es-node-01
docker-compose up -d

# Start on es-node-02
docker-compose up -d

# Start on es-node-03
docker-compose up -d
```

---

## Verify the Cluster

### Execute on Any Node

```
Check cluster health
curl http://10.14.0.33:9200/_cluster/health?pretty
{
  "cluster_name" : "es-cluster",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 3,
  "number_of_data_nodes" : 3,
  "active_primary_shards" : 0,
  "active_shards" : 0,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0,
  "unassigned_primary_shards" : 0,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 100.0
}
Check cluster node status (* indicates the current master node)
curl http://10.14.0.33:9200/_cat/nodes?v
ip         heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
10.14.0.33           44          48   0    0.00    0.00     0.00 dim       -      es-node-01
10.14.0.34           17          50   0    0.00    0.01     0.00 dim       *      es-node-02
10.14.0.35           42          44   0    0.01    0.02     0.00 dim       -      es-node-03
```
