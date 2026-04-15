---
locale: zh
translationKey: ubuntu-install-docker-compose
pathSlug: ubuntu-install-docker-compose
title: "Ubuntu 安装 Docker 与 Docker Compose"
summary: "在 Ubuntu 中使用 Docker Compose 安装 Docker 引擎的分步指导。"
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 4
series: docker
seriesOrder: 4
featured: false
tags: []
---

# **如何在 Ubuntu 22.04 LTS 中安装 Docker 和 Docker Compose**

在 Ubuntu 中使用 Docker Compose 安装 Docker 引擎的分步指导。

## **Docker 依赖项**

为了安装并配置 Docker ，你的系统必须满足下列最低要求：

5. 64 位 Linux 或 Windows 系统

6. 如果使用 Linux ，内核版本必须不低于 3.10

7. 能够使用`sudo`权限的用户

8. 在你系统 BIOS 上启用了 VT（虚拟化技术）支持 on your system BIOS

9. 你的系统应该联网

## **在 Ubuntu 22.04 LTS 中安装 Docker**

### **1、更新 Ubuntu**

首先，更新你的 Ubuntu 系统。

打开终端，依次运行下列命令：

```
sudo apt update
sudo apt upgrade
sudo apt full-upgrade
```

### **2、添加 Docker 库**

首先，安装必要的证书并允许 apt 包管理器使用以下命令通过 HTTPS 使用存储库：

```
sudo apt install apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release
```

然后，运行下列命令添加 Docker 的官方 GPG 密钥：

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

添加 Docker 官方库：

```
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

使用命令更新 Ubuntu 源列表：

```
sudo apt update
```

### **3、安装 Docker**

#### **安装最新版本**

最后，运行下列命令在 Ubuntu 22.04 LTS 服务器中安装最新 Docker CE：

```
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

#### **手动安装其他版本**

当然你也可以安装其他版本 Docker 。运行下列命令检查可以安装的 Docker 版本：

```
apt-cache madison docker-ce
```

输出样例：

```
        docker-ce | 5:20.10.17~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages
    docker-ce | 5:20.10.16~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages
    docker-ce | 5:20.10.15~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages
    docker-ce | 5:20.10.14~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages
    docker-ce | 5:20.10.13~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages1.2.3.4.5.
```

你可以挑选上面列表中的任何版本进行安装。例如，安装 **5:20.10.16~ 3-0 ~ubuntu-jammy** 这个版本，运行：

```
sudo apt install docker-ce=5:20.10.16~3-0~ubuntu-jammy docker-ce-cli=5:20.10.16~3-0~ubuntu-jammy containerd.io
```

安装完成后，运行如下命令验证 Docker 服务是否在运行：

```
sudo systemctl status docker
```

如果没有运行，运行以下命令运行 Docker 服务：

```
sudo systemctl start docker
```

使 Docker 服务在每次重启时自动启动：

```
sudo systemctl enable docker
```

可以使用以下命令查看已安装的 Docker 版本：

```
sudo docker version
```

## **在 Ubuntu 22.04 LTS 中安装 Docker Compose**

**Docker Compose** 是一个可用于定义和运行多容器 Docker 应用程序的工具。使用 Compose，你可以使用 Compose 文件来配置应用程序的服务。然后，使用单个命令，你可以从配置中创建和启动所有服务。

下列任何方式都可以安装 Docker Compose 。

### **方式 1、使用二进制文件安装 Docker Compose**

从 这里 下载最新 Docker Compose 。

当我在写这篇文章时，最新版本是 **2.6.1** 。

运行下列命令安装最新稳定的 Docker Compose 文件：

```
sudo curl -L "https://github.com/docker/compose/releases/download/v2.6.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

如果有更新版本，只需要将上述命令中的 **v2.6.1** 替换为最新的版本号即可。请不要忘记数字前的 **"v"** 。

最后，使用下列命令赋予二进制文件可执行权限：

```
sudo chmod +x /usr/local/bin/docker-compose
```

运行下列命令检查安装的 Docker Compose 版本：

```
sudo docker-compose version
```

### **方式 2、使用 pip 安装 Docker Compose**

或许，我们可以使用 **pip** 安装 Docker Compose 。pip 是 Python 包管理器，用来安装使用 Python 编写的应用程序。

参考下列链接安装 pip 。

- 如何使用 pip 管理 Python 包

安装 pip 后，运行以下命令安装 Docker Compose。下列命令对于所有 Linux 发行版都是相同的！

```
pip install docker-compose
```

安装 Docker Compose 后，使用下列命令检查版本：

```
docker-compose --version
```
