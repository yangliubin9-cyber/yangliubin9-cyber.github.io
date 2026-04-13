---
locale: en
translationKey: linux-permissions
pathSlug: linux-permissions
title: "Linux Permissions and Users: Understand chmod, chown, and Permission Denied"
summary: "Put users, groups, permission bits, and the basic troubleshooting order into one model so `Permission denied` stops being guesswork."
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
translationSourceHash: 0594e04c781496c0343b16af8f57041b7e0d7001dc198e9613870d8d62870a0d
translationStatus: reviewed
translationModel: manual
translationUpdatedAt: 2026-04-13
---

Many people get stuck on Linux not because the command is unfamiliar, but because the command is clear and the result is still `Permission denied`. If you debug that by guessing, the system usually gets messier. The useful model is smaller: who is acting, who owns the target, and which permission column applies to the current user.

## Separate the three identities first

Linux file access normally revolves around three identities:

- owner
- group
- others

And three common permission bits:

- `r`: read
- `w`: write
- `x`: execute

So a permission issue is really one question: which identity does the current user fall into, and is that column allowed to do the action?

## Learn to read `ls -l`

Do not start by changing permissions. Start by reading them:

```bash
ls -l deploy.sh
```

You may see something like:

```text
-rwxr-x--- 1 app app 824 Apr  9 10:00 deploy.sh
```

Break it down like this:

- the first character `-` means a regular file, while `d` would mean a directory
- `rwx` is the owner permission set
- `r-x` is the group permission set
- `---` is the others permission set
- `app app` means owner `app`, group `app`

If your current user is not `app` and is not in the `app` group, then you fall into the `others` column. In this example, that column has no access at all.

## Use a fixed troubleshooting order

When access is denied, do not jump to `chmod 777`. A safer order is:

1. check who the current user is
2. check who owns the target
3. check whether the permission bits match that identity

```bash
whoami
id
ls -l deploy.sh
```

- `whoami` shows the current user
- `id` shows the groups that user belongs to
- `ls -l` shows the target owner, group, and permission bits

If the problem involves a directory path, add:

```bash
ls -ld /opt/app
```

That matters because a file may look fine while the real problem is that the parent directory is not traversable.

## `chmod` changes permissions, `chown` changes ownership

These two commands solve different problems.

If ownership is already correct and the script only lacks execute permission:

```bash
chmod u+x deploy.sh
```

If the file should actually belong to the `app` user and group:

```bash
sudo chown app:app deploy.sh
```

For directories, recursive changes are common:

```bash
sudo chown -R app:app /opt/app
sudo chmod -R u+rwX /opt/app
```

The important part is not memorizing flags. It is classifying the problem correctly:

- wrong identity: think about `chown`
- missing permission bits: think about `chmod`
- inaccessible path: inspect directory execute permission

## Why `777` is usually the wrong answer

`chmod 777` is not wrong because the syntax is invalid. It is wrong because it skips the reasoning and opens the target to everyone. That causes two longer-term problems:

- you still do not know which permission was actually missing
- service directories, scripts, and shared paths gradually lose their boundaries

For engineering work such as app deployment, CI artifacts, or runtime directories, the safer pattern is usually:

- make the correct user own the path
- use the correct group for shared access
- grant only the required permissions to those identities

That scales much better than making everything world-writable.

## A very common operational case

Suppose build artifacts were uploaded by your own login user, but the actual systemd service runs as `app`. You may then see this pattern:

- the files do exist
- manual commands sometimes work
- the service still cannot read config, logs, or scripts

That usually means the program is fine but the runtime identity and file ownership do not line up. A stable check sequence looks like this:

```bash
systemctl cat your-service
ps -ef | grep your-service
ls -ld /opt/your-app
ls -l /opt/your-app
```

First confirm which user the service runs as. Then confirm whether the directory and files are aligned with that user or its group.

## Keep one mental model

Permission problems stop feeling random once you keep asking the same three questions:

1. who am I right now
2. who owns this file or directory
3. which permission column applies to my current identity

`chmod` and `chown` are only tools. The real value is holding users, groups, permission bits, and directory layers in one frame. Once that model is clear, the same logic applies to shell scripts, deployment directories, and mounted paths inside containers.
