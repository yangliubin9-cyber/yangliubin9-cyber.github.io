---
locale: en
translationKey: docker-basic
pathSlug: docker-basic
title: "Docker Basics: Installation, Images, and Containers"
summary: "Understand the boundary between images and containers to support real delivery work."
publishedAt: 2026-04-02
updatedAt: 2026-04-09
readingMinutes: 10
series: docker
seriesOrder: 1
featured: true
tags:
  - docker
  - containers
  - beginner
translationSourceHash: 2cfdcc6498641d33f0396f1d7d6cd812c5c7b3f41625d7f05ec079e4b32418b3
translationStatus: reviewed
translationModel: manual
translationUpdatedAt: 2026-04-13
---

Many Docker beginners blur images, containers, registries, and runtime behavior into one big concept. A better starting point is to separate those layers before collecting more commands.

## Separate images from containers first

A simple working analogy helps:

- an image is a template
- a container is a running instance created from that template

Images are static. Containers are dynamic. Deleting a container does not delete the image, and updating an image does not magically replace a running container.

These two commands show that distinction clearly:

```bash
docker images
docker ps -a
```

The first shows stored images. The second shows existing containers. Learning to read those two lists separately is one of the fastest ways to reduce confusion.

## A minimal run path

From a blank machine to a working container, the shortest useful path looks like this:

```bash
docker pull nginx:stable
docker run -d --name web-demo -p 8080:80 nginx:stable
docker logs web-demo
```

That sequence means:

1. download an image
2. create and start a container from it
3. inspect whether the process is healthy

If you can explain those three steps in plain language, you already understand more than someone who only copies commands from tutorials.

## Why Dockerfiles matter

Manual `docker run` is good for learning. Delivery work starts once you make builds reproducible, and that is where `Dockerfile` becomes useful.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

The power of this file is not complexity. It is repeatability. It turns “install dependencies, copy code, expose ports, start the app” into a stable recipe that anyone on the team can rebuild.

## Boundaries Docker does not remove

Docker solves environment consistency, but it does not remove system boundaries:

- host disk, network, and permissions still matter
- files inside the container may disappear after rebuilds
- no published port means no outside traffic
- missing environment variables still break the app

That is why “it runs in Docker” is not the same thing as “it is production ready.”

## A practical debugging sequence

When a container fails, do not immediately rebuild everything. Start with:

```bash
docker ps -a
docker logs <container>
docker inspect <container>
docker exec -it <container> sh
```

- `ps -a` shows status
- `logs` shows the application error
- `inspect` shows mounts, ports, and env vars
- `exec` lets you verify the actual filesystem and runtime state

This sequence gives you much better signal than constantly deleting and recreating containers.

## What a beginner should actually leave with

The key result of Docker basics is not memorizing dozens of flags. It is learning to separate:

- image problems
- container runtime problems
- host machine problems

Once those layers stop collapsing into one mental blob, container-based delivery becomes much more manageable.
