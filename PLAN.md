# Yang's Blogs V1 Plan

## Status

- Project name: `Yang's Blogs`
- Brand name: `MUZI`
- Workspace: `E:\My Project\Blogs`
- Current phase: planning complete, scaffold not started

## What Already Exists

- Blog workspace exists but is empty.
- Avatar asset exists at `E:\My Project\Avatar.jpg`.
- The author has Feishu Open Platform app permissions.
- The current decision is to avoid direct coding until the implementation plan is stable.

## Product Goal

Build a bilingual personal tech blog focused on AI infrastructure, MLOps, Kubernetes, Docker, and engineering practice.

This site should support:

- public reading for all visitors
- author-only publishing
- Feishu as the source of truth for articles
- bilingual routing from day one
- searchable structured content
- registered and verified users commenting after moderation

## Confirmed Decisions

- Frontend framework: `Astro`
- Search engine: `Pagefind`
- Auth and comments: `Supabase`
- Content source:
  - Feishu Docs for article body
  - Feishu Bitable for metadata and publishing control
- Sync strategy for V1: manual sync only
- Future capability to reserve:
  - auto sync
  - GitHub login
  - GitHub Pages deployment
  - webhook-triggered rebuilds
- Language strategy:
  - Chinese route prefix: `/zh`
  - English route prefix: `/en`
  - root `/` redirects to `/zh`
  - Chinese is the default language
- Translation publishing strategy:
  - Chinese and English publish states are independent
  - Chinese can go live before English
  - English can be added later
- Unpublished translation behavior:
  - language switch remains visible
  - unavailable language is disabled with a hint
  - direct visit to missing English page shows a short notice, then redirects to the Chinese page
- Content taxonomy:
  - one primary series per article
  - multiple tags per article
- Comment rules:
  - user must register first
  - user must complete email verification
  - comment must be approved before public display
  - V1 does not build a custom moderation dashboard
- URL strategy:
  - short slugs
  - slug is manually filled in Feishu Bitable
  - title changes must not change URL

## Route Plan

- Home:
  - `/zh`
  - `/en`
- About:
  - `/zh/about`
  - `/en/about`
- Search:
  - `/zh/search`
  - `/en/search`
- Article:
  - `/zh/[slug]`
  - `/en/[slug]`
- Series index:
  - `/zh/series`
  - `/en/series`
- Series detail:
  - `/zh/series/[series_slug]`
  - `/en/series/[series_slug]`
- Auth:
  - `/zh/auth/login`
  - `/en/auth/login`
  - `/zh/auth/register`
  - `/en/auth/register`

## Initial Series

| slug | zh_name | en_name |
|---|---|---|
| `linux` | Linux 新手入门 | Linux Basics |
| `docker` | Docker 部署与使用 | Docker Deployment |
| `k8s` | Kubernetes 集群部署 | Kubernetes Cluster |

## Initial Article Seeds

| slug | zh_title | en_title | series_slug |
|---|---|---|---|
| `linux-basic` | Linux 新手入门：文件、目录与常用命令 | Linux Basics: Files, Directories, and Common Commands | `linux` |
| `docker-basic` | Docker 入门：安装、镜像与容器基础 | Docker Basics: Installation, Images, and Containers | `docker` |
| `docker-deploy` | Docker 部署实践：从本地运行到服务发布 | Docker Deployment Practice: From Local Run to Service Release | `docker` |
| `k8s` | Kubernetes 集群部署入门 | Getting Started with Kubernetes Cluster Deployment | `k8s` |
| `k8s-components` | Kubernetes 常见组件与工作机制 | Kubernetes Core Components and How They Work | `k8s` |

## Author Profile Copy

### Home Short Intro

`MUZI，专注于 AI 基础设施、MLOps 与开发运维一体化的工程师。这里记录我在 Kubernetes、Docker、深度学习系统部署与云原生实践中的经验、踩坑与思考。`

### About Long Intro

`我是 MUZI，一名专注于 AI 基础设施与开发运维一体化的工程师。在深度学习领域，我既不是纯算法研究者，也不是纯系统管理员，而是站在二者交汇处，关注模型训练、推理部署、平台稳定性与工程落地之间的连接。`

`我的核心工作围绕 AI 开发运维，也就是 MLOps/AIOps 展开。从模型训练环境构建、分布式计算资源调度，到推理服务的高可用部署与监控；从自动化 CI/CD 流水线设计，到利用 AI 方法反哺运维，例如日志分析、异常预测与根因定位，这些都是我长期关注和实践的方向。`

`我相信，可复现、可扩展、可观测，是 AI 系统真正落地的基石。这个博客会持续记录我在模型运维、云原生工具链、深度学习系统调优中的实践、踩坑与思考。`

`技术关键词：Kubernetes、PyTorch、MLflow、Prometheus、Docker、Python、LLM 部署、GPU 调度、CI/CD。`

## Feishu Content Model

### Principle

Keep article body and site structure separate.

- Feishu Docs stores body content.
- Feishu Bitable stores structure, routing, publishing state, and cross-language mapping.

### Bitable Tables

#### 1. `articles`

| field | type | purpose |
|---|---|---|
| `slug` | text | short URL slug, manually managed |
| `zh_title` | text | Chinese article title |
| `en_title` | text | English article title |
| `zh_summary` | long text | Chinese summary |
| `en_summary` | long text | English summary |
| `zh_doc_id` | text | Chinese Feishu Doc ID |
| `en_doc_id` | text | English Feishu Doc ID |
| `series_slug` | text | primary series |
| `series_order` | number | order inside the series |
| `category_slug` | text | primary category |
| `tag_slugs` | text | comma-separated or linked tag list |
| `cover_image` | text | cover asset or URL |
| `zh_status` | single select | `draft` / `published` / `archived` |
| `en_status` | single select | `draft` / `published` / `archived` |
| `featured` | checkbox | whether to show on home page |
| `comment_enabled` | checkbox | whether comments are allowed |
| `published_at` | datetime | first publish time |
| `updated_at` | datetime | last update time |
| `seo_title_zh` | text | Chinese SEO title |
| `seo_title_en` | text | English SEO title |
| `seo_description_zh` | long text | Chinese SEO description |
| `seo_description_en` | long text | English SEO description |

#### 2. `series`

| field | type | purpose |
|---|---|---|
| `slug` | text | stable series URL slug |
| `zh_name` | text | Chinese series name |
| `en_name` | text | English series name |
| `zh_description` | long text | Chinese series description |
| `en_description` | long text | English series description |
| `cover_image` | text | cover asset or URL |
| `sort_order` | number | list order |
| `status` | single select | `active` / `archived` |

#### 3. `categories`

| field | type | purpose |
|---|---|---|
| `slug` | text | stable category slug |
| `zh_name` | text | Chinese category name |
| `en_name` | text | English category name |
| `sort_order` | number | display order |
| `status` | single select | `active` / `archived` |

#### 4. `tags`

| field | type | purpose |
|---|---|---|
| `slug` | text | stable tag slug |
| `zh_name` | text | Chinese tag name |
| `en_name` | text | English tag name |
| `status` | single select | `active` / `archived` |

## Feishu Doc Structure

Each article doc should follow a consistent content template:

1. Title
2. Summary
3. Hero image, optional
4. Main content
5. Section headings with consistent hierarchy
6. Code blocks using Feishu code block formatting
7. Inline images as separate assets
8. References
9. Update notes, optional

Do not place routing, tags, publish state, or series order inside article body.

## Site Behavior Rules

### Translation Rules

- If `zh_status = published`, the Chinese article page can go live.
- If `en_status != published`, the English page is considered unavailable.
- Language switch on Chinese page still renders `English`, but disabled.
- Direct visit to unavailable English article shows a short notice, then redirects to the Chinese article.

### Series Rules

- A series page can be published even if only one article in the current language is available.
- Series page should show:
  - total article count
  - currently published count for the active language
  - ordered article list

### Comment Rules

- Only verified users can comment.
- New comments default to `pending`.
- Only `approved` comments appear publicly.
- Comments can be disabled per article.

## Search Rules

Search should support:

- title match
- summary match
- body text match
- heading match
- filter by series
- filter by category
- filter by tags
- sort by relevance
- sort by publish time
- highlight matched terms
- sub-result jump to matching section

## Reserved Integration Boundaries

The codebase should reserve these boundaries from day one:

1. `content source interface`
   - a unified reader for site content
2. `feishu adapter`
   - Feishu auth
   - Bitable fetch
   - Doc fetch
3. `sync entry`
   - manual sync for V1
   - webhook or scheduled sync for future versions
4. `content transformer`
   - transform Feishu data into site content model
5. `auth provider interface`
   - Supabase in V1
   - future GitHub login compatible
6. `comment provider interface`
   - Supabase-backed in V1
   - future moderation UI possible

## High-Level Architecture

```text
Feishu Docs ----\
                 >---- Sync Layer ----> Normalized Content ----> Astro Pages
Feishu Bitable --/                                           \
                                                              +--> Pagefind Index

Supabase Auth ------> Login / Email Verify ------\
                                                   >---- Comment API ----> Moderation State
Supabase Database --> Users / Comments ----------/
```

## V1 Sync Flow

```text
1. Author updates Feishu doc and Bitable record
2. Local manual sync command is triggered
3. Sync layer pulls Bitable metadata
4. Sync layer pulls Feishu article bodies
5. Transformer builds normalized article objects
6. Astro reads normalized content
7. Local build and preview run
```

## V1 Page Checklist

- bilingual home page
- bilingual about page
- bilingual article page
- bilingual series index
- bilingual series detail
- bilingual search page
- bilingual login page
- bilingual register page
- verified comment form
- comment list with moderation filtering
- unavailable translation notice and redirect

## Not In Scope

- online article editor
- browser-based publishing backend
- automatic Feishu webhook sync
- custom moderation dashboard
- multi-author publishing
- likes, favorites, or private messaging
- user profile pages
- advanced notification system

## Implementation Phases

### Phase 1: Project Foundation

- initialize Astro project
- add bilingual routing skeleton
- define shared content and interface contracts

### Phase 2: Feishu Content Pipeline

- define normalized content schema
- implement Feishu adapter boundaries
- support manual sync path

### Phase 3: Public Content Pages

- build home, article, series, about, and search pages
- wire Pagefind indexing

### Phase 4: Auth and Comments

- integrate Supabase auth
- require email verification before comment submit
- store comments with moderation state

### Phase 5: Local Validation

- validate bilingual routing
- validate untranslated article behavior
- validate manual sync result
- validate search behavior
- validate comment flow

### Phase 6: Deployment Preparation

- reserve GitHub Pages build path
- reserve future auto-sync trigger path
- reserve future GitHub login path

## Next Step

The next action should be to convert this plan into:

1. an implementation scaffold plan
2. the actual project skeleton inside `E:\My Project\Blogs`

Do not start coding until the plan above is accepted.
