---
locale: en
translationKey: kubernetes-single-node
pathSlug: kubernetes-single-node
title: "Kubernetes Single-Node Deployment"
summary: "Prepare the hosts, install containerd and runtime dependencies, bootstrap Kubernetes with kubeadm, and then bring the cluster network online."
publishedAt: 2026-04-13
updatedAt: 2026-04-13
readingMinutes: 13
series: k8s
seriesOrder: 4
featured: false
tags: []
translationSourceHash: ba42247305630650f96a8c7b93659f8ce0ed9b1cb95e5aa9fcabeba928bbfb49
translationStatus: reviewed
translationModel: manual
translationUpdatedAt: 2026-04-15
---

## Deploy Kubernetes

### Initial environment

| IP | Host | Node | OS |
| --- | --- | --- | --- |
| `10.211.55.11` | `ubuntu-1` | `k8s-master-01` | `Ubuntu 24.04 Server` |
| `10.211.55.12` | `ubuntu-2` | `k8s-worker-01` | `Ubuntu 24.04 Server` |
| `10.211.55.13` | `ubuntu-3` | `k8s-worker-02` | `Ubuntu 24.04 Server` |

### Pre-deployment configuration on all nodes

```bash
sudo su -
mkdir -p /data/workspace/install-k8s && cd /data/workspace/install-k8s

# set hostnames
hostnamectl set-hostname k8s-master-01
hostnamectl set-hostname k8s-worker-01
hostnamectl set-hostname k8s-worker-02

# host resolution
cat >> /etc/hosts << EOF
10.211.55.11 k8s-master-01
10.211.55.12 k8s-worker-01
10.211.55.13 k8s-worker-02
EOF

# time sync
apt install -y chrony
cp /etc/chrony/chrony.conf /etc/chrony/chrony.conf.bak
sed -i '/^\(pool\|server\)/cserver cn.pool.ntp.org iburst\nserver ntp.tencent.com iburst' /etc/chrony/chrony.conf
systemctl restart chrony
timedatectl set-timezone Asia/Shanghai
date

# kernel modules and sysctl
cat << EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay && modprobe br_netfilter

cat << EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

sysctl --system
sysctl -a | grep ip_forward

# ipvs tools
apt-get install ipset ipvsadm -y
cat << EOF | tee /etc/modules-load.d/ipvs.conf
ip_vs
ip_vs_rr
ip_vs_wrr
ip_vs_sh
nf_conntrack
EOF

cat << EOF | tee ipvs.sh
#!/bin/sh
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack
EOF

bash ipvs.sh
lsmod | grep ip_vs

# disable swap
swapoff -a
cp /etc/fstab /etc/fstab.bak
sed -i '/swap/s/^/#/' /etc/fstab
cat /etc/fstab
free -m
```

#### Install Containerd

Choose the latest containerd release that matches your OS, or use the direct download below.

```bash
wget https://github.com/containerd/containerd/releases/download/v1.7.28/cri-containerd-1.7.28-linux-amd64.tar.gz
tar zxvf cri-containerd-1.7.28-linux-amd64.tar.gz -C /
containerd -version

mkdir /etc/containerd
containerd config default > /etc/containerd/config.toml

sed -i 's|sandbox_image = "registry.k8s.io/pause:3.8"|sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.10.1"|g' /etc/containerd/config.toml
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml

grep "sandbox_image" /etc/containerd/config.toml
grep "SystemdCgroup" /etc/containerd/config.toml

systemctl enable --now containerd
systemctl status containerd
```

#### Install `libseccomp`

```bash
wget https://github.com/opencontainers/runc/releases/download/v1.4.0-rc.1/libseccomp-2.5.6.tar.gz
apt update
apt install -y build-essential meson ninja-build pkg-config libtool autoconf automake make gcc gperf
tar zxvf libseccomp-2.5.6.tar.gz
cd libseccomp-2.5.6
chmod +x configure
./configure
make && make install
```

#### Install `runc`

```bash
wget https://github.com/opencontainers/runc/releases/download/v1.4.0-rc.1/runc.amd64
cd /data/workspace/install-k8s
rm -rf /usr/local/sbin/runc
chmod +x runc.amd64
mv runc.amd64 /usr/local/sbin/runc
runc --version
```

### Install Kubernetes tools

```bash
apt update && apt upgrade -y
apt install -y apt-transport-https ca-certificates curl gpg
mkdir -p -m 755 /etc/apt/keyrings

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key | \
sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg && \
sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /' \
| sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update && \
sudo apt install -y kubelet kubectl kubeadm && \
sudo apt-mark hold kubelet kubeadm kubectl
```

### Initialize the master

```bash
kubeadm config images pull \
--kubernetes-version=v1.34.1 \
--cri-socket=unix:///run/containerd/containerd.sock \
--image-repository=registry.aliyuncs.com/google_containers \
--v=5

kubeadm init \
--apiserver-advertise-address=10.211.55.11 \
--control-plane-endpoint=k8s-master-01 \
--kubernetes-version=v1.34.1 \
--service-cidr=192.168.0.0/16 \
--pod-network-cidr=10.200.0.0/16 \
--cri-socket=unix:///run/containerd/containerd.sock \
--image-repository=registry.aliyuncs.com/google_containers \
--v=5

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

If `kubeadm init` fails because it cannot reach the API server, inspect the kubelet logs first:

```bash
journalctl -u kubelet -xe
```

### Join worker nodes

```bash
# generate the join command on the master
kubeadm token create --print-join-command

# run the generated command on each worker
kubeadm join k8s-master-01:6443 --token tj4bwu.te0lcsbhpazw3dvc \
      --discovery-token-ca-cert-hash sha256:31dd5ab19185d190896ed6426bff41691fe1f8115fea87fba0f45631b6d07926

kubectl get nodes
kubectl get nodes
kubectl get pods -A
kubectl describe pod -n [NAMESPACE] [NAME]
```

Expected node state after the cluster is healthy:

```text
k8s-master-01   Ready    control-plane   76m   v1.34.1
k8s-worker-01   Ready    <none>          71m   v1.34.1
k8s-worker-02   Ready    <none>          57m   v1.34.1
```

## Install Helm

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
helm version
```

## Install the Calico network plugin

Useful references:

- `https://projectcalico.docs.tigera.io/getting-started/kubernetes/requirements`
- `https://docs.tigera.io/archive`

This article uses the Helm-based installation path.

```bash
helm repo add projectcalico https://docs.tigera.io/calico/charts
helm repo update

helm install calico projectcalico/tigera-operator \
  --version v3.31.0 \
  --namespace tigera-operator \
  --create-namespace
```

After the operator is installed, create the Calico custom resources:

```yaml
apiVersion: operator.tigera.io/v1
kind: Installation
metadata:
  name: default
spec:
  calicoNetwork:
    ipPools:
    - blockSize: 26
      cidr: 10.244.0.0/16
      encapsulation: VXLANCrossSubnet
      natOutgoing: Enabled
      nodeSelector: all()
  version: v3.31.0
```

Apply it and verify the resulting pods:

```bash
kubectl apply -f calico-custom-resources.yaml
kubectl get pods -n tigera-operator
kubectl get pods -n calico-system
kubectl get nodes
```

Once all nodes become `Ready`, the container runtime, kubeadm bootstrap, and network plugin are all in place.
