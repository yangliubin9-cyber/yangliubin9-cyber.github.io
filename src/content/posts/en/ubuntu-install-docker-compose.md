---
locale: en
translationKey: ubuntu-install-docker-compose
pathSlug: ubuntu-install-docker-compose
title: "Install Docker and Docker Compose on Ubuntu"
summary: "Step-by-step guidance for installing the Docker Engine on Ubuntu using Docker Compose."
publishedAt: 2026-04-13
updatedAt: 2026-04-13
readingMinutes: 4
series: docker
seriesOrder: 4
featured: false
tags: []
translationSourceHash: 3939258fa8d317937f82f0a0fbe6ed2bda9c15d67f3dd296caea676e21a4d933
translationStatus: ai-generated
translationModel: gpt-5.4
translationUpdatedAt: 2026-04-14
---

# How to Install Docker and Docker Compose on Ubuntu 22.04 LTS

Step-by-step instructions for installing the Docker Engine with Docker Compose on Ubuntu.

## Docker Requirements

To install and configure Docker, your system must meet the following minimum requirements:

5. A 64-bit Linux or Windows system

6. If using Linux, the kernel version must be 3.10 or later

7. A user with `sudo` privileges

8. VT (Virtualization Technology) support enabled in your system BIOS

9. Your system should be connected to the internet

## Install Docker on Ubuntu 22.04 LTS

### 1. Update Ubuntu

First, update your Ubuntu system.

Open a terminal and run the following commands one by one:

```
sudo apt update
sudo apt upgrade
sudo apt full-upgrade
```

### 2. Add the Docker Repository

First, install the required certificates and allow the `apt` package manager to use repositories over HTTPS with the following command:

```
sudo apt install apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release
```

Then, run the following command to add Docker's official GPG key:

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

Add the official Docker repository:

```
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Update the Ubuntu source list with the command:

```
sudo apt update
```

### 3. Install Docker

#### Install the latest version

Finally, run the following command to install the latest Docker CE on Ubuntu 22.04 LTS:

```
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

#### Manually install another version

Of course, you can also install another version of Docker. Run the following command to check which Docker versions are available:

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

You can choose any version from the list above to install. For example, to install version `5:20.10.16~3-0~ubuntu-jammy`, run:

```
sudo apt install docker-ce=5:20.10.16~3-0~ubuntu-jammy docker-ce-cli=5:20.10.16~3-0~ubuntu-jammy containerd.io
```

After the installation is complete, run the following command to verify that the Docker service is running:

```
sudo systemctl status docker
```

If it is not running, start the Docker service with the following command:

```
sudo systemctl start docker
```

Enable the Docker service to start automatically on every reboot:

```
sudo systemctl enable docker
```

You can check the installed Docker version with the following command:

```
sudo docker version
```

## Install Docker Compose on Ubuntu 22.04 LTS

Docker Compose is a tool for defining and running multi-container Docker applications. With Compose, you can use a Compose file to configure your application's services. Then, with a single command, you can create and start all services from your configuration.

You can install Docker Compose using any of the following methods.

### Method 1. Install Docker Compose using the binary file

Download the latest Docker Compose from here.

At the time of writing, the latest version is `2.6.1`.

Run the following command to install the latest stable Docker Compose binary:

```
sudo curl -L "https://github.com/docker/compose/releases/download/v2.6.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

If a newer version is available, simply replace `v2.6.1` in the command above with the latest version number. Do not forget the `"v"` before the number.

Finally, make the binary executable with the following command:

```
sudo chmod +x /usr/local/bin/docker-compose
```

Run the following command to check the installed Docker Compose version:

```
sudo docker-compose version
```

### Method 2. Install Docker Compose using pip

Alternatively, you can install Docker Compose using `pip`. `pip` is the Python package manager used to install applications written in Python.

Refer to the following link to install `pip`.

- How to manage Python packages with pip

After installing `pip`, run the following command to install Docker Compose. The following command is the same for all Linux distributions!

```
pip install docker-compose
```

After installing Docker Compose, check the version with the following command:

```
docker-compose --version
```
