---
locale: zh
translationKey: kubernetes-single-node
pathSlug: kubernetes-single-node
title: "Kubernetes 单节点"
summary: "Kubernetes 单节点"
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 13
series: k8s
seriesOrder: 4
featured: false
tags: []
---

## 部署Kubernetes (单节点)

### 初始环境配置

<div class="feishu-table-wrap"><table><thead><tr><th><strong>IP</strong></th><th><strong>主机名</strong></th><th><strong>节点</strong></th><th><strong>系统</strong></th></tr></thead><tbody><tr><td><strong>10.211.55.11</strong></td><td><strong>ubuntu-1</strong></td><td><strong>k8s-master-01</strong></td><td><strong>Ubuntu-24.04-server</strong></td></tr><tr><td><strong>10.211.55.12</strong></td><td><strong>ubuntu-2</strong></td><td><strong>k8s-worker-01</strong></td><td><strong>Ubuntu-24.04-server</strong></td></tr><tr><td><strong>10.211.55.13</strong></td><td><strong>ubuntu-3</strong></td><td><strong>k8s-worker-02</strong></td><td><strong>Ubuntu-24.04-server</strong></td></tr></tbody></table></div>

### 全部节点进行部署前配置

```
# 切换为 root 用户 (全部节点都要执行)
sudo su -

# 创建项目目录 (全部节点都要执行)
mkdir -p /data/workspace/install-k8s && cd /data/workspace/install-k8s

# 修改主机名
# k8s-master-01
hostnamectl set-hostname k8s-master-01

# 刷新配置
bash

# k8s-worker-01
hostnamectl set-hostname k8s-worker-01

# 刷新配置
bash

# k8s-worker-02
hostnamectl set-hostname k8s-worker-02

# 刷新配置
bash

# 主机名-IP地址解析 (主机名/IP 配置为自己的主机名/IP)
# k8s-master-01
cat >> /etc/hosts << EOF
10.211.55.11 k8s-master-01
10.211.55.12 k8s-worker-01
10.211.55.13 k8s-worker-02
EOF

# 检查是否添加成功
cat /etc/hosts

# k8s-worker-01
cat >> /etc/hosts << EOF
10.211.55.11 k8s-master-01
10.211.55.12 k8s-worker-01
10.211.55.13 k8s-worker-02
EOF

# 检查是否添加成功
cat /etc/hosts

# k8s-worker-02
cat >> /etc/hosts << EOF
10.211.55.11 k8s-master-01
10.211.55.12 k8s-worker-01
10.211.55.13 k8s-worker-02
EOF

# 检查是否添加成功
cat /etc/hosts

# 配置时间同步 (全部节点都要执行)
# 安装 chrony 工具
apt install -y chrony

# 备份配置文件 (推荐) (全部节点都要执行)
cp /etc/chrony/chrony.conf /etc/chrony/chrony.conf.bak

# 使用 sed 替换 NTP 服务器 (全部节点都要执行)
sed -i '/^\(pool\|server\)/cserver cn.pool.ntp.org iburst\nserver ntp.tencent.com iburst' /etc/chrony/chrony.conf

# 重启 chrony 服务 (全部节点都要执行)
systemctl restart chrony

# 设置时区为亚洲/上海 (北京时间) (全部节点都要执行)
timedatectl set-timezone Asia/Shanghai

# 使用 date 命令查看是否同步成功 (全部节点都要执行)
date

# 内核转发、网桥过滤配置 (全部节点都要执行)
cat << EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

# 启用内核转发、网桥过滤配置 (全部节点都要执行)
modprobe overlay && modprobe br_netfilter

# 查看是否成功 (全部节点都要执行)
lsmod | egrep "overlay" && lsmod | egrep "br_netfilter"

# 把网桥过滤和内核转发追加到 k8s.conf 文件中 (全部节点都要执行)
cat << EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

# 加载内核参数 (全部节点都要执行)
sysctl --system

# 查看是否成功打开 (全部节点都要执行)
sysctl -a | grep ip_forward

# 安装 ipset 和 ipvsadm (全部节点都要执行)
apt-get install ipset ipvsadm -y

# 配置 ipvsadm 模块加载 (全部节点都要执行)
cat << EOF | tee /etc/modules-load.d/ipvs.conf
ip_vs
ip_vs_rr
ip_vs_wrr
ip_vs_sh
nf_conntrack
EOF

# 由于上方配置是开机自启动后才会生效，所以将生效命令放到一个脚本文件中，进行本次生效 (全部节点都要执行)
cat << EOF | tee ipvs.sh
#!/bin/sh
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack
EOF

# 启动脚本 (全部节点都要执行)
bash ipvs.sh

# 查看是否已经加载 (全部节点都要执行)
lsmod | grep ip_vs

# 关闭SWAP分区 (全部节点都要执行)
# 临时关闭
swapoff -a

# 在永久关闭之前，备份 /etc/fstab (强烈建议) (全部节点都要执行)
cp /etc/fstab /etc/fstab.bak

# 永久关闭 (全部节点都要执行)
sed -i '/swap/s/^/#/' /etc/fstab

# 使用 cat 命令查看修改后的文件，确认 swap 相关的行是否已被 # 注释掉 (全部节点都要执行)
cat /etc/fstab

# 查看是否关闭成功，swap 为 0 是关闭成功 (全部节点都要执行)
free -m
```

#### **安装Containerd**

**‘# 在GitHub上搜索Containerd**

> [Image omitted from Feishu sync: Image from Feishu (NYdmbpRB9oFnsQxkWkEcLuVWnCg)]

**‘# 选择第一个官方的Containerd进入**

> [Image omitted from Feishu sync: Image from Feishu (LdngbGoh6oCitLx0E0ZcxpGxnff)]

**‘# 进入以后选择Releasses进入**

> [Image omitted from Feishu sync: Image from Feishu (Xs1EbRbm8oE7mGxyfgGczbxjn5U)]

**‘# 选择最新的找到自己的操作系统的containerd下载并上传至服务器**

> [Image omitted from Feishu sync: Image from Feishu (AjuSbj6fXoUBJMxkp1fcLJ8bnYg)]

```
# 如果不想自己那样去搜，可以用wget命令

# 在github拉取containerd (全部节点都要执行)
wget https://github.com/containerd/containerd/releases/download/v1.7.28/cri-containerd-1.7.28-linux-amd64.tar.gz

# 解压并放到 / 下 (全部节点都要执行)
tar zxvf cri-containerd-1.7.28-linux-amd64.tar.gz -C /

# 查看containerd的版本号 (全部节点都要执行)
containerd -version

# 生成containerd的配置文件并修改 (全部节点都要执行)
mkdir /etc/containerd
containerd config default > /etc/containerd/config.toml

(全部节点都要执行)
# 这个后续要搭配Kubernetes版本的，所以要对照好
# Kubernetes (Kubelet) 版本     pause 镜像版本 (k8s.gcr.io)     pause 镜像版本 (registry.k8s.io)
# v1.30+                        N/A (已弃用)                     registry.k8s.io/pause:3.10.1
# v1.27 - v1.29                 k8s.gcr.io/pause:3.9            registry.k8s.io/pause:3.9
# v1.25 - v1.26                 k8s.gcr.io/pause:3.8            registry.k8s.io/pause:3.8
# v1.23 - v1.24                 k8s.gcr.io/pause:3.7            registry.k8s.io/pause:3.7
# v1.22                         k8s.gcr.io/pause:3.6            registry.k8s.io/pause:3.6
# v1.20 - v1.21                 k8s.gcr.io/pause:3.5            registry.k8s.io/pause:3.5
# 配置文件(/etc/containerd/config.toml)需要将 sandbox_image 的版本号改一下版本号和镜像地址
# 默认值：sandbox_image = "registry.k8s.io/pause:3.8"
# 目标值：sandbox_image = “registry.aliyuncs.com/google_containers/pause:3.10.1”
sed -i 's|sandbox_image = "registry.k8s.io/pause:3.8"|sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.10.1"|g' /etc/containerd/config.toml

# 将SystemdCgroup改为true (全部节点都要执行)
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml

# 使用 grep 命令检查修改是否成功 (全部节点都要执行)
echo "--- sandbox_image 检查 ---"
grep "sandbox_image" /etc/containerd/config.toml
echo -e "\n--- SystemdCgroup 检查 ---"
grep "SystemdCgroup" /etc/containerd/config.toml

# 修改完后设置开机自启并启动 (全部节点都要执行)
systemctl enable --now containerd

# 验证一下是否成功启动 (全部节点都要执行)
systemctl status containerd
```

#### **安装 libseccomp**

> [Image omitted from Feishu sync: Image from Feishu (UIKvb3GwdoCCxox9It0cQ7KUnuk)]

**‘# 选择第一个官方的runc进入**

> [Image omitted from Feishu sync: Image from Feishu (Up0JbWmObohmD6x5RYwcKaWYndg)]

**‘# 选择Releases进入**

> [Image omitted from Feishu sync: Image from Feishu (Lfplbf5kBohMk1xt9k5caie1nrc)]

**‘# 找到适合自己系统的libseccomp并上传到服务器上**

> [Image omitted from Feishu sync: Image from Feishu (BKH5bLfPQoMp0ZxPd8vc0QUxnVg)]

```
# 如果不想自己那样去搜，可以用wget命令

# 也可以用wget上传至服务器中 (全部节点都要执行)
wget https://github.com/opencontainers/runc/releases/download/v1.4.0-rc.1/libseccomp-2.5.6.tar.gz

# 下载gcc gperf (全部节点都要执行)
apt update
apt install -y build-essential meson ninja-build pkg-config libtool autoconf automake make gcc gperf

# 解压libseccomp包 (全部节点都要执行)
tar zxvf libseccomp-2.5.6.tar.gz

# 进入解压后的目录进行安装 (全部节点都要执行)
cd libseccomp-2.5.6
chmod +x configure
./configure
make && make install
```

#### **安装runc**

> [Image omitted from Feishu sync: Image from Feishu (BfezbzeIMonMNhxG32qcXsTpnYe)]

**‘# 选择第一个官方的runc进入**

> [Image omitted from Feishu sync: Image from Feishu (PsyAbaG2eoof80xlrSMcJaIGnwf)]

**‘# 选择Releases进入**

> [Image omitted from Feishu sync: Image from Feishu (EwGmbIzCZoMFrhxZwDPc688fnBg)]

**‘# 找到适合自己系统的runc并上传到服务器上**

> [Image omitted from Feishu sync: Image from Feishu (KRUWbKJjeoeYZgxkn7UcOkx9ngf)]

```
# 如果不想自己那样去搜，也可以用wget上传至服务器中 (全部节点都要执行)
wget https://github.com/opencontainers/runc/releases/download/v1.4.0-rc.1/runc.amd64

# 切换到项目目录 (全部节点都要执行)
cd /data/workspace/install-k8s

# 删除系统原有的runc进行安装新runc (全部节点都要执行)
rm -rf /usr/local/sbin/runc
chmod +x runc.amd64
mv runc.amd64 /usr/local/sbin/runc

# 验证runc (全部节点都要执行)
runc --version
```

### 安装Kubernetes 集群工具

```
# 保证源是新的 (全部节点都要执行)
apt update && apt upgrade -y

# 安装必要工具 (全部节点都要执行)
apt install -y apt-transport-https ca-certificates curl gpg

# 创建 keyrings 目录 (全部节点都要执行)
mkdir -p -m 755 /etc/apt/keyrings

# 下载 k8s 包仓库的公共签名密钥 (全部节点都要执行)
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key | \
sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg && \
sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# 添加 k8s 的apt仓库 (全部节点都要执行)
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /' \
| sudo tee /etc/apt/sources.list.d/kubernetes.list

# 安装 kubeadm、kubelet、kubectl (全部节点都要执行)
sudo apt update && \
sudo apt install -y kubelet kubectl kubeadm && \
sudo apt-mark hold kubelet kubeadm kubectl
```

### 初始化Kubernetes-Master

```
# 初始化主节点 (只在Master上执行)
kubeadm config images pull \
--kubernetes-version=v1.34.1 \
--cri-socket=unix:///run/containerd/containerd.sock \
--image-repository=registry.aliyuncs.com/google_containers \
--v=5

# 初始化集群主节点 (只在Master上执行)
kubeadm init \
--apiserver-advertise-address=10.211.55.11 \
--control-plane-endpoint=k8s-master-01 \
--kubernetes-version=v1.34.1 \
--service-cidr=192.168.0.0/16 \
--pod-network-cidr=10.200.0.0/16 \
--cri-socket=unix:///run/containerd/containerd.sock \
--image-repository=registry.aliyuncs.com/google_containers \
--v=5

# 配置介绍及处理办法
# 配置介绍：
# apiserver-advertise-address 填主节点的IP地址
# control-plane-endpoint ，还记得我们在 /etc/hosts 文件中配置的映射关系吗，填主节点的地址或者主机名
# kubernetes-version 版本不多说
# service-cidr 这是 Service 负载均衡的网络，就是你运行了一堆容器后有一个将它们统一对外暴露的地址，并且将对它们的请求统一收集并负载均衡的网络节点，得为它配置一个网段
# pod-network-cidr 每个 Pod 所在的网段
# cri-socket 指定容器化环境
# 报错处理办法：
# 如果 init 失败，而且失败的原因是没有连接上 api-server 的话，使用命令查看 kubelet 的日志：
# journalctl -u kubelet -xe

# 初始化结束后，准备kubectl配置文件
# 执行以下命令 (只在Master上执行)
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 工作节点加入Master

```
# 在 Master 上生成工作节点 join 命令 (只在Master上执行)
kubeadm token create --print-join-command

# 在 Worker 上把生成的 join 命令复制粘贴 (只在worker上执行)
# ⬇️⬇️⬇️ 示例命令 ⬇️⬇️⬇️
kubeadm join k8s-master-01:6443 --token tj4bwu.te0lcsbhpazw3dvc \
      --discovery-token-ca-cert-hash sha256:31dd5ab19185d190896ed6426bff41691fe1f8115fea87fba0f45631b6d07926
      
# 查看nodes状态 (只在Master上执行)
kubectl get nodes

# 等待1-2分钟再次执行，查看是否是 Ready (只在Master上执行)
kubectl get nodes

# 如果不是为 Ready 状态，参考以下 Calico网络插件 安装

# 如果三台都显示 Ready 那么说明没有问题
k8s-master-01   Ready    control-plane   76m   v1.34.1
k8s-worker-01   Ready    <none>          71m   v1.34.1
k8s-worker-02   Ready    <none>          57m   v1.34.1

# 查看pod节点是否都正常运行
kubectl get pods -A

# 如果出现一个 pod 没有显示 Running 的状态，我们可以查看他的信息详情
kubectl describe pod -n [NAMESPACE] [NAME]
# 参考如下👇
```

> [Image omitted from Feishu sync: Image from Feishu (VxhlbutWloJF0PxgS6jcn7X2nEc)]

## Helm 安装

```
# Helm 安装链接参考：https://helm.sh/zh/docs/intro/install
# 我这里采用脚本安装方式

# 安装Helm (只在Master上执行)
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh

# 查看一下Helm版本信息，确定安装成功
helm version
```

## Calico网络插件安装（Master）

```
# Calico 支持 Kubernetes 版本查看
https://projectcalico.docs.tigera.io/getting-started/kubernetes/requirements
# Calico 归档版本查看
https://docs.tigera.io/archive

# 支持安装方式
# Operator方式安装
# Manifest方式安装
# helm方式安装
# 参考链接地址：https://www.cnblogs.com/lldhsds/p/18278830

# 本文采用 helm 方式安装
# 使用 helm version 查看是否安装
# 如果没安装请参考上面 helm 进行安装
```

```
# 开始安装Calico

# 添加 Helm 仓库
helm repo add projectcalico https://docs.tigera.io/calico/charts
helm repo update

# 安装 tigera calico operator ，创建crd资源
helm install calico projectcalico/tigera-operator \
  --version v3.31.0 \
  --namespace tigera-operator \
  --create-namespace

# 确认相关 pod 运行正常
kubectl -n calico-system get pods

【说明】
【1、通过 Helm 安装的 tigera-operator 可能只是 Calico 的操作器（Operator），它需要读取 Calico 的
自定义资源（CR）配置后，才会在 calico-system 命名空间中创建核心组件（如 calico-node、calico-kube-controllers 等），
当前仅部署了 Operator 但未配置 CR，因此 calico-system 无资源是正常的。
2、需创建 Calico 的自定义资源配置文件（如 Installation 或 CalicoNetwork CR），
让 tigera-operator 识别并部署完整的 Calico 网络组件，才能完成 Calico 插件的部署。
首先在 k8s-master-01 节点创建 Calico 的核心配置文件（适配你集群的 10.244.0.0/16 网段）：

cat > calico-custom-resources.yaml << EOF
apiVersion: operator.tigera.io/v1
kind: Installation
metadata:
  name: default
spec:
  # 适配集群初始化时的 pod-network-cidr（10.244.0.0/16）
  calicoNetwork:
    ipPools:
    - blockSize: 26
      cidr: 10.244.0.0/16
      encapsulation: VXLANCrossSubnet
      natOutgoing: Enabled
      nodeSelector: all()
  # 指定 Calico 版本与 operator 匹配（v3.31.0）
  version: v3.31.0
EOF

3、执行以下命令应用配置，让 tigera-operator 部署完整的 Calico 组件：
kubectl apply -f calico-custom-resources.yaml
4、检查 tigera-operator 运行状态（确保 Operator 正常）：
kubectl get pods -n tigera-operator
正常输出应显示 tigera-operator 容器状态为 Running。
5、检查 Calico 核心组件（等待 1-2 分钟，calico-system 会生成资源）：
kubectl get pods -n calico-system
正常输出会看到 calico-node（每个节点一个）、calico-kube-controllers 等 Pod 状态为 Running。
6、验证集群节点状态：
kubectl get nodes
所有节点（包括 k8s-master-01）状态应变为 Ready，说明网络插件部署成功。】
```
