---
pathSlug: "es集群-vip搭建"
locale: "zh"
translationKey: "feishu-M7zAd8ZkaoT8DTx0bJPcdmLanDh"
title: "ES集群+VIP搭建"
excerpt: "使用 Docker Compose 部署 ⚠️部署前须知⚠️ 文件中所有内容要根据自己的情况修改，列主机名、 image、/da..."
category: "服务搭建"
publishedAt: "2026-03-30"
updatedAt: "2026-04-08"
featured: false
tags:
  - "Feishu"
  - "Cloud Docs"
accent: "cyan"
heroEyebrow: "Feishu Folder"
sourcePlatform: "feishu"
sourceUrl: "https://my.feishu.cn/docx/M7zAd8ZkaoT8DTx0bJPcdmLanDh"
sourceDocToken: "M7zAd8ZkaoT8DTx0bJPcdmLanDh"
---

使用 Docker-Compose 部署
⚠️部署前须知⚠️
文件中所有内容要根据自己的情况修改，列主机名、 image、/data地址、端口号、networks、硬件资源等；

部署环境

系统

节点

IP

Ubuntu24.04

es-node-01

10.14.0.33
                VIP
          10.14.0.42

Ubuntu24.04

es-node-02

10.14.0.34

Ubuntu24.04

es-node-03

10.14.0.34

部署前置准备

#修改主机名
hostnamectl set-hostname es-node-01
hostnamectl set-hostname es-node-02
hostnamectl set-hostname es-node-03

# 系统配置调整
# 永久设置虚拟内存区域的最大数量，这是运行 ElasticSearch 或某些数据库所必需的
# 将 'vm.max_map_count=262144' 添加到 /etc/sysctl.conf 文件中。
echo 'vm.max_map_count=262144' >> /etc/sysctl.conf

# 重新加载 /etc/sysctl.conf 文件中的新配置，使其立即生效
sysctl -p

# 设置所有用户的最大文件打开软限制为65536
echo '* soft nofile 65536' >> /etc/security/limits.conf

# 设置所有用户的最大文件打开硬限制为65536
echo '* hard nofile 65536' >> /etc/security/limits.conf

# 禁用交换分区（可选，但推荐）
swapoff -a

安装keepalived
es-node-01安装服务及配置文件

# apt安装服务
apt install -y keepalived

# 进入配置文件目录，创建配置文件
tee /etc/keepalived/keepalived.conf << 'EOF'
! Keepalived配置 - 主节点
! Configuration File for keepalived
global_defs {
    router_id es-node-01   #根据自身配置设置
    enable_script_security
    script_user root
}

vrrp_script chk_es {
    script "/usr/bin/curl -s -f http://localhost:9200 > /dev/null"  
    interval 2
    weight -50
}

vrrp_instance VI_29 {
    state MASTER       #指定从节点
    interface ens160    #绑定网卡
    virtual_router_id 51
    priority 100         #优先级
    advert_int 1
    authentication {
        auth_type PASS  
        auth_pass 1111  #集群密码要一致
    }
    virtual_ipaddress {
        10.14.0.42/24
    }
    track_script {
        chk_es
    }
}
EOF
es-node-02安装服务及配置文件

# apt安装服务
apt install -y keepalived

# 进入配置文件目录，创建配置文件
tee /etc/keepalived/keepalived.conf << 'EOF'
! Keepalived配置 - 主节点
! Configuration File for keepalived
global_defs {
    router_id es-node-02   #根据自身配置设置
    enable_script_security
    script_user root
}

vrrp_script chk_es {
    script "/usr/bin/curl -s -f http://localhost:9200 > /dev/null"  
    interval 2
    weight -50
}

vrrp_instance VI_29 {
    state BACKUP        #指定从节点
    interface ens160    #绑定网卡
    virtual_router_id 51
    priority 90         #优先级
    advert_int 1
    authentication {
        auth_type PASS  
        auth_pass 1111  #集群密码要一致
    }
    virtual_ipaddress {
        10.14.0.42/24
    }
    track_script {
        chk_es
    }
}
EOF
es-node-03安装服务及配置文件

# apt安装服务
apt install -y keepalived

# 进入配置文件目录，创建配置文件
tee /etc/keepalived/keepalived.conf << 'EOF'
! Keepalived配置 - 主节点
! Configuration File for keepalived
global_defs {
    router_id es-node-03   #根据自身配置设置
    enable_script_security
    script_user root
}

vrrp_script chk_es {
    script "/usr/bin/curl -s -f http://localhost:9200 > /dev/null"  
    interval 2
    weight -50
}

vrrp_instance VI_29 {
    state BACKUP        #指定从节点
    interface ens160    #绑定网卡
    virtual_router_id 51
    priority 80         #优先级
    advert_int 1
    authentication {
        auth_type PASS  
        auth_pass 1111  #集群密码要一致
    }
    virtual_ipaddress {
        10.14.0.42/24
    }
    track_script {
        chk_es
    }
}
EOF
启动keepalived服务验证

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

# 主节点查看IP是否成功配置
ip addr | grep ens160  #查看自己配置的绑定网卡位置，我这边配置的是ens160
 ens160: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    inet 10.14.0.33/24 brd 10.14.0.255 scope global ens160
    inet 10.14.0.42/24 scope global secondary ens160

# 验证是否可以访问集群，这一步需要在es集群搭建完成后测试
验证VIP
curl http://10.14.0.42:9200
# 验证集群IP
curl http://10.14.0.33:9200
curl http://10.14.0.34:9200
curl http://10.14.0.35:9200
创建ES存放目录并授权

# 创建必要的目录结构(根据自身环境创建)
mkdir -p /data/workspace/install-elastic/{data,logs,config,certs}

# 将 /data/workspace/install-es/es 目录及其所有内容的属主和属组都更改为用户 ID 1000 和组 ID 1000
# -R 选项表示递归地更改目录下的所有文件和子目录，确保 ElasticSearch 进程有权限读写该目录
chown -R 1000:1000 /data/workspace/install-elastic

准备 Docker-Compose 文件
es-node-01 配置文件
'# 需要根据自己配置进行调整以下参数 
'# discovery.seed_hosts
'# ELASTIC_PASSWORD
'# cluster.initial_master_nodes
'# network.publish_host
'# ES_JAVA_OPTS=-Xms2g -Xmx2g

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

es-node-02 配置文件
'# 需要根据自己配置进行调整以下参数 
'# discovery.seed_hosts
'# ELASTIC_PASSWORD
'# cluster.initial_master_nodes
'# network.publish_host
'# ES_JAVA_OPTS=-Xms2g -Xmx2g

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

es-node-03 配置文件
'# 需要根据自己配置进行调整以下参数 
'# discovery.seed_hosts
'# ELASTIC_PASSWORD
'# cluster.initial_master_nodes
'# network.publish_host
'# ES_JAVA_OPTS=-Xms2g -Xmx2g

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

开始启动集群

# 在 es-node-01 上启动
docker-compose up -d

# 在 es-node-02 上启动
docker-compose up -d

# 在 es-node-03 上启动
docker-compose up -d

验证集群
任意节点执行

查看集群健康状态
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
查看集群节点状态（*为当前主节点）
curl http://10.14.0.33:9200/_cat/nodes?v
ip         heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
10.14.0.33           44          48   0    0.00    0.00     0.00 dim       -      es-node-01
10.14.0.34           17          50   0    0.00    0.01     0.00 dim       *      es-node-02
10.14.0.35           42          44   0    0.01    0.02     0.00 dim       -      es-node-03
