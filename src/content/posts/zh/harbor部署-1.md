---
pathSlug: "harbor部署-1"
locale: "zh"
translationKey: "feishu-WMntdP3wYouazQxNMiqcrLGYn7g"
title: "Harbor部署"
excerpt: "部署安装Harbor 下载软件包 安装docker 安装docker compose 下载harbor离线安装包，或者Githu..."
category: "服务搭建"
publishedAt: "2026-03-30"
updatedAt: "2026-03-30"
featured: false
tags:
  - "Feishu"
  - "Cloud Docs"
accent: "cyan"
heroEyebrow: "Feishu Folder"
sourcePlatform: "feishu"
sourceUrl: "https://my.feishu.cn/docx/WMntdP3wYouazQxNMiqcrLGYn7g"
sourceDocToken: "WMntdP3wYouazQxNMiqcrLGYn7g"
---

部署安装Harbor
下载软件包
安装docker
安装docker-compose
下载harbor离线安装包，或者Github拉取
Github地址：https://github.com/goharbor/harbor/releases

# 拉取软件包
wget https://github.com/goharbor/harbor/releases/download/v2.12.2/harbor-offline-installer-v2.12.2.tgz

# 解压压缩包
tar -xvf harbor-offline-installer-v2.12.2.tgz

修改配置文件
准备配置文件

# 复制配置文件并修改
cp /usr/local/harbor/harbor.yml.tmpl /usr/local/harbor/harbor.yml

# 进入配置文件修改 
vim /usr/local/harbor/harbor.yml

# 修改hostname,修改为自己的IP或域名
hostname: harbor.local.com
http:
  port: 18080 看情况修改端口
harbor_admin_password: Harbor@!QAZxsw2 设置密码
database:
  password: Harbor@!QAZxsw2
  max_idle_conns: 100
  max_open_conns: 900
  conn_max_lifetime: 5m
  conn_max_idle_time: 0
data_volume: /data/workspace/install-harbor/data
# 将https配置文件注释
# https related config
#https:
  # https port for harbor, default is 443
  #port: 443
  # The path of cert and key files for nginx
  #certificate: /your/certificate/path
  #private_key: /your/private/key/path
启动Harbor
进行预检查

root@harbor:/data/workspace/install-harbor/harbor# prepare
执行安装脚本

root@harbor:/data/workspace/install-harbor/harbor# install.sh

root@harbor:/data/workspace/install-harbor/harbor# docker compose up -d

查看容器状态

root@harbor:/data/workspace/install-harbor/harbor# docker compose ps

NAME                IMAGE                                 COMMAND                  SERVICE       CREATED      STATUS                PORTS
harbor-core         goharbor/harbor-core:v2.12.2          "/harbor/entrypoint.…"   core          2 days ago   Up 2 days (healthy)   
harbor-db           goharbor/harbor-db:v2.12.2            "/docker-entrypoint.…"   postgresql    2 days ago   Up 2 days (healthy)   
harbor-jobservice   goharbor/harbor-jobservice:v2.12.2    "/harbor/entrypoint.…"   jobservice    2 days ago   Up 2 days (healthy)   
harbor-log          goharbor/harbor-log:v2.12.2           "/bin/sh -c /usr/loc…"   log           2 days ago   Up 2 days (healthy)   127.0.0.1:1514->10514/tcp
harbor-portal       goharbor/harbor-portal:v2.12.2        "nginx -g 'daemon of…"   portal        2 days ago   Up 2 days (healthy)   
nginx               goharbor/nginx-photon:v2.12.2         "nginx -g 'daemon of…"   proxy         2 days ago   Up 2 days (healthy)   0.0.0.0:80->8080/tcp, [::]:80->8080/tcp
redis               goharbor/redis-photon:v2.12.2         "redis-server /etc/r…"   redis         2 days ago   Up 2 days (healthy)   
registry            goharbor/registry-photon:v2.12.2      "/home/harbor/entryp…"   registry      2 days ago   Up 2 days (healthy)   
registryctl         goharbor/harbor-registryctl:v2.12.2   "/home/harbor/start.…"   registryctl   2 days ago   Up 2 days (healthy) 
访问Harbor
浏览器访问Harbor节点的ip    http://10.14.0.37/
默认账号：admin
默认密码：Harbor12345
image.png

docker配置文件私有仓库配置
daemon.json文件

vim /etc/docker/daemon.json
{
    "registry-mirrors": 
    ["https://docker.hpcloud.cloud",
"https://registry.dockermirror.com",
"https://docker.1panel.live",
"https://docker.m.daocloud.io"
    ],
    "insecure-registries": ["10.14.0.37"]
}

重启Docker服务

systemctl daemon-reload
systemctl restart docker
测试上传下载镜像
master节点操作

登录镜像仓库
两种方式
docker login 10.14.0.37
第二种
docker login -u admin -p Harbor@!QAZxsw2 10.14.0.37
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded

下载镜像

[root@client ~]# docker pull ucbcvr30j13lrb.xuanyuan.run/library/redis:8.4.0
Digest: sha256:5acba83a746c7608ed544dc1533b87c737a0b0fb730301639a0179f9344b1678
Status: Downloaded newer image for busybox:latest
ucbcvr30j13lrb.xuanyuan.run/library/redis:8.4.0
镜像打标签

# 上传镜像首先修改镜像名称
[root@client ~]# docker images
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
10.14.0.37/redis/redis-8.4.0:v1     latest    beae173ccac6   23 months ago   1.24MB

# 修改为Harbor仓库的ip/项目的名称/镜像名称:tag
[root@client ~]# docker tag busybox:latest 10.14.0.37/redis/redis-8.4.0:v1
上传镜像

[root@client ~]# docker push 10.14.0.37/redis/redis-8.4.0:v1
The push refers to repository [10.14.0.37/redis/redis-8.4.0:v1]
01fd6df81c8e: Pushed 
v1: digest: sha256:62ffc2ed7554e4c6d360bce40bbcf196573dd27c4ce080641a2c59867e732dee size: 527

验证
验证方式有两种可以通过web页面访问查看有没有上传的镜像，还可以通过命令行下载刚才上传的镜像，两者二选一即可。
登录浏览器验证
image.png

下载验证

[root@client ~]# docker pull 10.14.0.37/redis/redis-8.4.0:v1
