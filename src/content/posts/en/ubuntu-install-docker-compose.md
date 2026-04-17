---
locale: en
translationKey: ubuntu-install-docker-compose
pathSlug: ubuntu-install-docker-compose
title: "Install Docker and Docker Compose on Ubuntu"
summary: "Step-by-step guide to installing Docker Engine and Docker Compose on Ubuntu."
publishedAt: 2026-04-13
updatedAt: 2026-04-15
readingMinutes: 4
series: docker
seriesOrder: 4
featured: false
tags: []
translationSourceHash: 2c8e7fcb4b55f292537e6f9c5105caac37c115b64270e9083ab35f0b3aa99c47
translationStatus: ai-generated
translationModel: kimi-k2.5
translationUpdatedAt: 2026-04-17
---

# **How to Install Docker and Docker Compose on Ubuntu 22.04 LTS**

Step-by-step guide to installing the Docker Engine using Docker Compose on Ubuntu.

## **Docker Prerequisites**

To install and configure Docker, your system must meet the following minimum requirements:

5. 64-bit Linux or Windows system

6. If using Linux, kernel version must be 3.10 or higher

7. User with `sudo` privileges

8. VT (Virtualization Technology) support enabled in your system BIOS

9. Your system should be connected to the internet

## **Installing Docker on Ubuntu 22.04 LTS**

### **1. Update Ubuntu**

First, update your Ubuntu system.

Open a terminal and run the following commands in sequence:

```
sudo apt update
sudo apt upgrade
sudo apt full-upgrade
```

### **2. Add the Docker Repository**

First, install the necessary certificates and allow the apt package manager to use repositories over HTTPS using the following command:

```
sudo apt install apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release
```

Then, run the following command to add the official Docker GPG key:

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

Add the official Docker repository:

```
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Update the Ubuntu package list using the command:

```
sudo apt update
```

### **3. Install Docker**

#### **Install the Latest Version**

Finally, run the following command to install the latest Docker CE on your Ubuntu 22.04 LTS server:

```
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

#### **Manually Install a Specific Version**

Of course, you can also install other versions of Docker. Run the following command to check available Docker versions:

```
apt-cache madison docker-ce
```

Sample output:

```
        docker-ce | 5:20.10.17~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages
    docker-ce | 5:20.10.16~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages
    docker-ce | 5:20.10.15~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages
    docker-ce | 5:20.10.14~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages
    docker-ce | 5:20.10.13~3-0~ubuntu-jammy | https://download.docker.com/linux/ubuntu jammy/stable amd64 Packages1.2.3.4.5.
```

You can choose any version from the list above to install. For example, to install version **5:20.10.16~ 3-0 ~ubuntu-jammy**, run:

```
sudo apt install docker-ce=5:20.10.16~3-0~ubuntu-jammy docker-ce-cli=5:20.10.16~3-0~ubuntu-jammy containerd.io
```

After installation, run the following command to verify that the Docker service is running:

```
sudo systemctl status docker
```

If it is not running, run the following command to start the Docker service:

```
sudo systemctl start docker
```

Enable the Docker service to start automatically on each reboot:

```
sudo systemctl enable docker
```

You can check the installed Docker version using the following command:

```
sudo docker version
```

## **Installing Docker Compose on Ubuntu 22.04 LTS**

**Docker Compose** is a tool for defining and running multi-container Docker applications. With Compose, you use a Compose file to configure your application's services. Then, with a single command, you create and start all the services from your configuration.

You can install Docker Compose using any of the following methods.

### **Method 1: Install Docker Compose Using the Binary**

Download the latest Docker Compose from here.

At the time of writing, the latest version is **2.6.1**.

Run the following command to install the latest stable Docker Compose binary:

```
sudo curl -L "https://github.com/docker/compose/releases/download/v2.6.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

If a newer version is available, simply replace **v2.6.1** in the above command with the latest version number. Do not forget the **"v"** preceding the number.

Finally, grant executable permissions to the binary using the following command:

```
sudo chmod +x /usr/local/bin/docker-compose
```

Run the following command to check the installed Docker Compose version:

```
sudo docker-compose version
```

### **Method 2: Install Docker Compose Using pip**

Alternatively, we can install Docker Compose using **pip**. pip is a Python package manager used to install applications written in Python.

Refer to the following link to install pip.

- How to manage Python packages using pip

After installing pip, run the following command to install Docker Compose. This command is the same for all Linux distributions!

```
pip install docker-compose
```

After installing Docker Compose, use the following command to check the version:

```
docker-compose --version
```
