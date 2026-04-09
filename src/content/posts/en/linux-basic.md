---
locale: en
translationKey: linux-basic
pathSlug: linux-basic
title: "Linux Basics: Files, Directories, and Common Commands"
summary: Build a practical mental model for Linux by mastering paths, directories, and daily commands first.
publishedAt: 2026-04-01
updatedAt: 2026-04-09
readingMinutes: 8
series: linux
seriesOrder: 1
featured: true
tags:
  - shell
  - filesystem
  - beginner
---

Linux becomes much easier once you stop treating commands as isolated tricks. The real foundation is knowing where you are, what file a command is acting on, and whether the current user is allowed to touch it.

## Start with a path mental model

The filesystem is easiest to picture as an upside-down tree:

- `/` is the root
- `/home` usually holds user directories
- `/etc` stores configuration
- `/var` stores logs, caches, and runtime data
- `/usr` contains programs and shared resources

Before blaming a command, check two things:

1. Which directory am I in right now?
2. Is this path relative or absolute?

These three commands are the fastest way to regain context:

```bash
pwd
ls -la
cd /path/to/target
```

`pwd` tells you where you are, `ls -la` shows what is actually in that directory, and `cd` moves you into the right context. A huge percentage of “file not found” errors are really “wrong directory” errors.

## Six commands worth practicing first

If I had to pick one small set of commands for beginners, I would start here:

```bash
pwd
ls -la
cd
mkdir -p demo/logs
touch demo/readme.txt
cp demo/readme.txt demo/readme.bak
mv demo/readme.bak demo/archive.txt
rm demo/archive.txt
```

This set covers four core behaviors:

- locate: `pwd`, `ls`
- move around: `cd`
- create: `mkdir`, `touch`
- modify: `cp`, `mv`, `rm`

Once these feel natural, permissions, processes, and networking become much easier to learn.

## Permissions are not abstract

Permission issues usually appear in practical ways:

- you can see a file but cannot edit it
- a program starts but cannot read its config
- a service can write locally but not to the intended target directory

The first command to run is usually:

```bash
ls -l
```

An output like this:

```text
-rw-r--r-- 1 root root 128 Apr  9 app.conf
```

already tells you a lot:

- the first block is file type plus permission bits
- the first `root` is the owner
- the second `root` is the group

You do not need to memorize every `chmod` mode on day one, but you do need the habit of checking ownership and permissions before changing anything.

## A reliable troubleshooting sequence

When a script or command fails on a server, this order works surprisingly well:

1. `pwd` to confirm location
2. `ls -la` to confirm the file exists
3. `cat` or `less` to verify the contents
4. `whoami` to confirm the current user
5. `ls -l` to inspect permissions

This sequence is simple, but it prevents a lot of wasted time. Linux is rarely mysterious. Most problems come from assumptions like “I should be in the right directory” or “this should be the newest file.” The shell is often telling you the opposite.

## Stability beats speed at the beginning

The goal of Linux basics is not memorizing the largest possible command list. The goal is to build a stable operating sequence: locate the directory, verify the file, inspect permissions, then make the change. That habit will keep paying off once you move into Docker, Kubernetes, and CI workflows.
