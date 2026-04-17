---
locale: en
translationKey: kubernetes-single-node
pathSlug: kubernetes-single-node
title: "Single-Node Kubernetes"
summary: "Single-Node Kubernetes"
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 13
series: k8s
seriesOrder: 4
featured: false
tags: []
translationSourceHash: f985740be424566e2f6ffe6ce80f181e0f2d665e5480a2f94932467000c2500e
translationStatus: ai-generated
translationModel: kimi-k2.5
translationUpdatedAt: 2026-04-17
---

## Deploying Kubernetes (Single Node)

### Initial Environment Configuration

<div class="feishu-table-wrap"><table><thead><tr><th><strong>IP</strong></th><th><strong>Hostname</strong></th><th><strong>Node</strong></th><th><strong>OS</strong></th></tr></thead><tbody><tr><td><strong>10.211.55.11</strong></td><td><strong>ubuntu-1</strong></td><td><strong>k8s-master-01</strong></td><td><strong>Ubuntu-24.04-server</strong></td></tr><tr><td><strong>10.211.55.12</strong></td><td><strong>ubuntu-2</strong></td><td><strong>k8s-worker-01</strong></td><td><strong>Ubuntu-24.04-server</strong></td></tr><tr><td><strong>10.211.55.13</strong></td><td><strong>ubuntu-3</strong></td><td><strong>k8s-worker-02</strong></td><td><strong>Ubuntu-24.04-server</strong></td></tr></tbody></table></div>

### Pre-deployment Configuration (All Nodes)

```
# Switch to root (run on all nodes)
sudo su -

# Create working directory (run on all nodes)
mkdir -p /data/workspace/install-k8s && cd /data/workspace/install-k8s

# Set hostname
# k8s-master-01
hostnamectl set-hostname k8s-master-01

# Reload shell
bash

# k8s-worker-01
hostnamectl set-hostname k8s-worker-01

# Reload shell
bash

# k8s-worker-02
hostnamectl set-hostname k8s-worker-02

# Reload shell
bash

# Add hostname-to-IP mappings (customize with your hostnames/IPs)
# k8s-master-01
cat >> /etc/hosts << EOF
10.211.55.11 k8s-master-01
10.211.55.12 k8s-worker-01
10.211.55.13 k8s-worker-02
EOF

# Verify entries were added
cat /etc/hosts

# k8s-worker-01
cat >> /etc/hosts << EOF
10.211.55.11 k8s-master-01
10.211.55.12 k8s-worker-01
10.211.55.13 k8s-worker-02
EOF

# Verify entries were added
cat /etc/hosts

# k8s-worker-02
cat >> /etc/hosts << EOF
10.211.55.11 k8s-master-01
10.211.55.12 k8s-worker-01
10.211.55.13 k8s-worker-02
EOF

# Verify entries were added
cat /etc/hosts

# Configure time synchronization (run on all nodes)
# Install chrony
apt install -y chrony

# Backup configuration file (recommended) (run on all nodes)
cp /etc/chrony/chrony.conf /etc/chrony/chrony.conf.bak

# Replace NTP servers using sed (run on all nodes)
sed -i '/^\(pool\|server\)/cserver cn.pool.ntp.org iburst\nserver ntp.tencent.com iburst' /etc/chrony/chrony.conf

# Restart chrony service (run on all nodes)
systemctl restart chrony

# Set timezone to Asia/Shanghai (CST) (run on all nodes)
timedatectl set-timezone Asia/Shanghai

# Verify synchronization using date (run on all nodes)
date

# Configure kernel forwarding and bridge filtering (run on all nodes)
cat << EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

# Load kernel modules (run on all nodes)
modprobe overlay && modprobe br_netfilter

# Verify modules are loaded (run on all nodes)
lsmod | egrep "overlay" && lsmod | egrep "br_netfilter"

# Append bridge filtering and IP forwarding settings to k8s.conf (run on all nodes)
cat << EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

# Apply sysctl settings (run on all nodes)
sysctl --system

# Verify IP forwarding is enabled (run on all nodes)
sysctl -a | grep ip_forward

# Install ipset and ipvsadm (run on all nodes)
apt-get install ipset ipvsadm -y

# Configure ipvsadm module loading (run on all nodes)
cat << EOF | tee /etc/modules-load.d/ipvs.conf
ip_vs
ip_vs_rr
ip_vs_wrr
ip_vs_sh
nf_conntrack
EOF

# The above configuration persists after reboot; load modules immediately via script (run on all nodes)
cat << EOF | tee ipvs.sh
#!/bin/sh
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack
EOF

# Run the script (run on all nodes)
bash ipvs.sh

# Check if modules are loaded (run on all nodes)
lsmod | grep ip_vs

# Disable SWAP (run on all nodes)
# Temporarily disable
swapoff -a

# Backup /etc/fstab before permanent disable (strongly recommended) (run on all nodes)
cp /etc/fstab /etc/fstab.bak

# Permanently disable (run on all nodes)
sed -i '/swap/s/^/#/' /etc/fstab

# Verify swap entries are commented out with # (run on all nodes)
cat /etc/fstab

# Verify SWAP is disabled (should show 0) (run on all nodes)
free -m
```

#### **Install Containerd**

**# Search for Containerd on GitHub**

> [Image omitted from Feishu sync: Image from Feishu (NYdmbpRB9oFnsQxkWkEcLuVWnCg)]

**# Select the first official Containerd repository**

> [Image omitted from Feishu sync: Image from Feishu (LdngbGoh6oCitLx0E0ZcxpGxnff)]

**# Go to Releases**

> [Image omitted from Feishu sync: Image from Feishu (Xs1EbRbm8oE7mGxyfgGczbxjn5U)]

**# Select the latest release, download the version for your OS, and upload to the server**

> [Image omitted from Feishu sync: Image from Feishu (AjuSbj6fXoUBJMxkp1fcLJ8bnYg)]

```
# If you prefer not to search manually, use wget

# Download containerd from GitHub (Execute on all nodes)
wget https://github.com/containerd/containerd/releases/download/v1.7.28/cri-containerd-1.7.28-linux-amd64.tar.gz

# Extract to / (Execute on all nodes)
tar zxvf cri-containerd-1.7.28-linux-amd64.tar.gz -C /

# Check containerd version (Execute on all nodes)
containerd -version

# Generate and modify containerd config (Execute on all nodes)
mkdir /etc/containerd
containerd config default > /etc/containerd/config.toml

(Execute on all nodes)
# This must match your Kubernetes version, so verify compatibility
# Kubernetes (Kubelet) Version   pause Image Version (k8s.gcr.io)   pause Image Version (registry.k8s.io)
# v1.30+                         N/A (Deprecated)                  registry.k8s.io/pause:3.10.1
# v1.27 - v1.29                  k8s.gcr.io/pause:3.9              registry.k8s.io/pause:3.9
# v1.25 - v1.26                  k8s.gcr.io/pause:3.8              registry.k8s.io/pause:3.8
# v1.23 - v1.24                  k8s.gcr.io/pause:3.7              registry.k8s.io/pause:3.7
# v1.22                          k8s.gcr.io/pause:3.6              registry.k8s.io/pause:3.6
# v1.20 - v1.21                  k8s.gcr.io/pause:3.5              registry.k8s.io/pause:3.5
# Update sandbox_image version and registry in /etc/containerd/config.toml
# Default: sandbox_image = "registry.k8s.io/pause:3.8"
# Target: sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.10.1"
sed -i 's|sandbox_image = "registry.k8s.io/pause:3.8"|sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.10.1"|g' /etc/containerd/config.toml

# Set SystemdCgroup to true (Execute on all nodes)
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml

# Verify changes with grep (Execute on all nodes)
echo "--- sandbox_image check ---"
grep "sandbox_image" /etc/containerd/config.toml
echo -e "\n--- SystemdCgroup check ---"
grep "SystemdCgroup" /etc/containerd/config.toml

# Enable and start service after modification (Execute on all nodes)
systemctl enable --now containerd

# Verify successful startup (Execute on all nodes)
systemctl status containerd
```

#### **Install libseccomp**

> [Image omitted from Feishu sync: Image from Feishu (UIKvb3GwdoCCxox9It0cQ7KUnuk)]

**'# Select the first official runc entry**

> [Image omitted from Feishu sync: Image from Feishu (Up0JbWmObohmD6x5RYwcKaWYndg)]

**'# Select Releases**

> [Image omitted from Feishu sync: Image from Feishu (Lfplbf5kBohMk1xt9k5caie1nrc)]

**'# Find the libseccomp suitable for your system and upload to server**

> [Image omitted from Feishu sync: Image from Feishu (BKH5bLfPQoMp0ZxPd8vc0QUxnVg)]

```
# If you prefer not to search manually, use wget

# Download to server (Execute on all nodes)
wget https://github.com/opencontainers/runc/releases/download/v1.4.0-rc.1/libseccomp-2.5.6.tar.gz

# Install build dependencies (Execute on all nodes)
apt update
apt install -y build-essential meson ninja-build pkg-config libtool autoconf automake make gcc gperf

# Extract libseccomp package (Execute on all nodes)
tar zxvf libseccomp-2.5.6.tar.gz

# Enter directory and install (Execute on all nodes)
cd libseccomp-2.5.6
chmod +x configure
./configure
make && make install
```

#### **Install runc**

> [Image omitted from Feishu sync: Image from Feishu (BfezbzeIMonMNhxG32qcXsTpnYe)]

**'# Select the first official runc entry**

> [Image omitted from Feishu sync: Image from Feishu (PsyAbaG2eoof80xlrSMcJaIGnwf)]

**'# Select Releases**

> [Image omitted from Feishu sync: Image from Feishu (EwGmbIzCZoMFrhxZwDPc688fnBg)]

**'# Find the runc suitable for your system and upload to server**

> [Image omitted from Feishu sync: Image from Feishu (KRUWbKJjeoeYZgxkn7UcOkx9ngf)]

```
# If you prefer not to search manually, use wget to download to server (Execute on all nodes)
wget https://github.com/opencontainers/runc/releases/download/v1.4.0-rc.1/runc.amd64

# Switch to project directory (Execute on all nodes)
cd /data/workspace/install-k8s

# Remove existing runc and install new one (Execute on all nodes)
rm -rf /usr/local/sbin/runc
chmod +x runc.amd64
mv runc.amd64 /usr/local/sbin/runc

# Verify runc (Execute on all nodes)
runc --version
```

### Install Kubernetes Cluster Tools

```
# Ensure package sources are up to date (execute on all nodes)
apt update && apt upgrade -y

# Install required tools (execute on all nodes)
apt install -y apt-transport-https ca-certificates curl gpg

# Create keyrings directory (execute on all nodes)
mkdir -p -m 755 /etc/apt/keyrings

# Download the public signing key for the Kubernetes package repositories (execute on all nodes)
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key | \
sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg && \
sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# Add the Kubernetes apt repository (execute on all nodes)
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /' \
| sudo tee /etc/apt/sources.list.d/kubernetes.list

# Install kubeadm, kubelet, and kubectl (execute on all nodes)
sudo apt update && \
sudo apt install -y kubelet kubectl kubeadm && \
sudo apt-mark hold kubelet kubeadm kubectl
```

### Initialize Kubernetes Master

```
# Pull images for the master node initialization (execute only on Master)
kubeadm config images pull \
--kubernetes-version=v1.34.1 \
--cri-socket=unix:///run/containerd/containerd.sock \
--image-repository=registry.aliyuncs.com/google_containers \
--v=5

# Initialize the cluster master node (execute only on Master)
kubeadm init \
--apiserver-advertise-address=10.211.55.11 \
--control-plane-endpoint=k8s-master-01 \
--kubernetes-version=v1.34.1 \
--service-cidr=192.168.0.0/16 \
--pod-network-cidr=10.200.0.0/16 \
--cri-socket=unix:///run/containerd/containerd.sock \
--image-repository=registry.aliyuncs.com/google_containers \
--v=5

# Configuration details and troubleshooting
# Configuration details:
# apiserver-advertise-address: IP address of the master node
# control-plane-endpoint: the master node's address or hostname (as configured in /etc/hosts)
# kubernetes-version: self-explanatory
# service-cidr: the network CIDR for Service load balancing (the unified external access point for containers)
# pod-network-cidr: the CIDR for Pod networking
# cri-socket: specifies the container runtime interface socket
# Troubleshooting:
# If init fails due to inability to connect to the api-server, check kubelet logs with:
# journalctl -u kubelet -xe

# After initialization, prepare the kubectl configuration file
# Execute the following commands (execute only on Master)
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### Join Worker Nodes to Master

```
# Generate the worker node join command on the Master (execute only on Master)
kubeadm token create --print-join-command

# Copy and paste the generated join command on the Worker (execute only on worker)
# ⬇️⬇️⬇️ Example command ⬇️⬇️⬇️
kubeadm join k8s-master-01:6443 --token tj4bwu.te0lcsbhpazw3dvc \
      --discovery-token-ca-cert-hash sha256:31dd5ab19185d190896ed6426bff41691fe1f8115fea87fba0f45631b6d07926
      
# Check node status (execute only on Master)
kubectl get nodes

# Wait 1-2 minutes and run again to check if status is Ready (execute only on Master)
kubectl get nodes

# If not in Ready state, refer to the Calico network plugin installation below

# If all three show Ready, everything is working correctly
k8s-master-01   Ready    control-plane   76m   v1.34.1
k8s-worker-01   Ready    <none>          71m   v1.34.1
k8s-worker-02   Ready    <none>          57m   v1.34.1

# Check if all pods are running normally
kubectl get pods -A

# If a pod is not in Running state, check its details
kubectl describe pod -n [NAMESPACE] [NAME]
# Example below👇
```

> [Image omitted from Feishu sync: Image from Feishu (VxhlbutWloJF0PxgS6jcn7X2nEc)]

## Helm Installation

```
# Helm installation reference: https://helm.sh/zh/docs/intro/install
# Using the script installation method here

# Install Helm (execute only on Master)
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh

# Check Helm version to verify successful installation
helm version
```

## Calico Network Plugin Installation (Master)

```
# Check Calico-supported Kubernetes versions
https://projectcalico.docs.tigera.io/getting-started/kubernetes/requirements
# View archived Calico versions
https://docs.tigera.io/archive

# Supported installation methods
# Operator installation
# Manifest installation
# Helm installation
# Reference link: https://www.cnblogs.com/lldhsds/p/18278830

# This guide uses Helm installation
# Use helm version to check if installed
# If not installed, refer to the Helm installation section above
```

```
# Install Calico

# Add Helm repository
helm repo add projectcalico https://docs.tigera.io/calico/charts
helm repo update

# Install tigera calico operator and create CRD resources
helm install calico projectcalico/tigera-operator \
  --version v3.31.0 \
  --namespace tigera-operator \
  --create-namespace

# Verify related pods are running
kubectl -n calico-system get pods

[Notes]
[1. The tigera-operator installed via Helm is only the Calico Operator. It requires reading the Calico Custom Resource (CR) configuration before creating core components (e.g., calico-node, calico-kube-controllers) in the calico-system namespace. Currently, only the Operator is deployed without CR configuration, so having no resources in calico-system is expected.
2. Create a Calico custom resource configuration file (e.g., Installation or CalicoNetwork CR) for the tigera-operator to recognize and deploy the complete Calico network components. First, create the core Calico configuration file on the k8s-master-01 node (adapted for your cluster's 10.244.0.0/16 CIDR):

cat > calico-custom-resources.yaml << EOF
apiVersion: operator.tigera.io/v1
kind: Installation
metadata:
  name: default
spec:
  # Adapted for the pod-network-cidr used during cluster initialization (10.244.0.0/16)
  calicoNetwork:
    ipPools:
    - blockSize: 26
      cidr: 10.244.0.0/16
      encapsulation: VXLANCrossSubnet
      natOutgoing: Enabled
      nodeSelector: all()
  # Specify Calico version to match operator (v3.31.0)
  version: v3.31.0
EOF

3. Execute the following command to apply the configuration and let tigera-operator deploy the complete Calico components:
kubectl apply -f calico-custom-resources.yaml
4. Check tigera-operator running status (ensure Operator is healthy):
kubectl get pods -n tigera-operator
Expected output should show tigera-operator container status as Running.
5. Check Calico core components (wait 1-2 minutes for resources to be generated in calico-system):
kubectl get pods -n calico-system
Expected output shows calico-node (one per node), calico-kube-controllers, and other Pods with Running status.
6. Verify cluster node status:
kubectl get nodes
All nodes (including k8s-master-01) should show Ready status, indicating the network plugin deployment is successful.]
```
