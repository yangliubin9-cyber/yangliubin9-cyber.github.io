---
locale: zh
translationKey: linux-permissions
pathSlug: linux-permissions
title: Linux 权限与用户入门：看懂 chmod、chown 与 Permission denied
summary: 把用户、用户组、权限位和常见排障顺序放到一张图里，遇到 Permission denied 时知道先查什么。
publishedAt: 2026-04-09
updatedAt: 2026-04-09
readingMinutes: 9
series: linux
seriesOrder: 2
featured: false
tags:
  - linux
  - permissions
  - users
---

很多人第一次在 Linux 上卡住，不是因为命令不会写，而是因为命令能看懂，结果却报 `Permission denied`。这类问题如果只靠猜，容易越改越乱。真正要建立的是一个最小判断模型：当前是谁在操作，目标文件属于谁，三组权限分别开放给谁。

## 先把三个对象分清楚

Linux 文件权限默认围绕三类身份展开：

- owner：文件所有者
- group：文件所属组
- others：既不是所有者，也不在所属组里的其他用户

再加上三个常见权限位：

- `r`：读
- `w`：写
- `x`：执行

所以权限问题本质上是在问一件事：当前用户是以哪种身份访问这个对象，而那一列是否被放行。

## 先学会读 `ls -l`

看权限的第一步不是改，而是先读输出：

```bash
ls -l deploy.sh
```

你可能看到类似结果：

```text
-rwxr-x--- 1 app app 824 Apr  9 10:00 deploy.sh
```

可以这样拆：

- 第 1 位 `-`：普通文件，如果是目录会显示 `d`
- `rwx`：owner 权限
- `r-x`：group 权限
- `---`：others 权限
- `app app`：前一个是 owner，后一个是 group

如果你当前登录用户不是 `app`，也不在 `app` 这个组里，那你只能落到 `others` 这一列，而这里是 `---`，自然就会被拒绝。

## 遇到拒绝时，先按固定顺序排查

权限排障不要一上来就 `chmod 777`。更稳定的顺序是：

1. 先看当前用户是谁
2. 再看文件属于谁
3. 最后才看权限位是否匹配

```bash
whoami
id
ls -l deploy.sh
```

- `whoami` 看当前用户名
- `id` 看当前用户属于哪些组
- `ls -l` 看文件 owner、group 和权限位

如果是目录访问异常，再补一条：

```bash
ls -ld /opt/app
```

因为文件能不能进入，很多时候卡的不是文件本身，而是上层目录没有执行权限。

## `chmod` 是改权限，`chown` 是改归属

这两个命令经常被混在一起，但它们处理的问题不同。

如果文件归属没问题，只是缺少执行权限，可以改权限：

```bash
chmod u+x deploy.sh
```

如果文件本来就该属于 `app` 用户和 `app` 组，那应该改归属：

```bash
sudo chown app:app deploy.sh
```

目录场景里常见递归调整：

```bash
sudo chown -R app:app /opt/app
sudo chmod -R u+rwX /opt/app
```

这里的关键不是背命令，而是先判断问题到底属于哪一类：

- 身份不对：优先看 `chown`
- 权限位不够：优先看 `chmod`
- 路径进不去：检查目录的 `x` 权限

## 为什么不建议直接用 `777`

`chmod 777` 的问题不是“语法不对”，而是它跳过了判断过程，把所有人都放开。短期看像解决了，长期会带来两个副作用：

- 你不知道真正缺的是哪一列权限
- 服务目录、脚本目录和共享目录的边界会越来越乱

对博客、服务部署、CI 产物目录这类工程场景来说，更合理的做法通常是：

- 先让正确的用户拥有目录
- 再把需要协作的人放进正确的组
- 最后只给这两类身份开放必要权限

这比“先全开，跑通再说”更容易维护。

## 一个最常见的工程场景

比如你用普通用户上传了构建产物，但 systemd 服务实际用 `app` 用户启动。此时最容易出现的现象是：

- 文件在磁盘上确实存在
- 手工执行命令有时能成功
- 服务启动时却提示无权访问配置、日志或脚本

这类问题通常不是程序坏了，而是运行身份和文件归属没对齐。检查顺序可以固定成：

```bash
systemctl cat your-service
ps -ef | Select-String your-service
ls -ld /opt/your-app
ls -l /opt/your-app
```

先确认服务用哪个用户启动，再确认目录和文件是不是交给了同一个用户或用户组。

## 留下一个稳定模型

权限问题不要靠记忆碎片处理。只要你能固定问自己这三件事，排障速度就会快很多：

1. 我现在是谁
2. 这个文件或目录属于谁
3. 当前身份落到哪一列权限上

`chmod` 和 `chown` 只是工具。真正有用的是把“用户、组、权限位、目录层级”放到同一个判断框架里。之后不管你是在改脚本权限、部署服务，还是排查容器挂载目录，本质上都还是这套逻辑。
