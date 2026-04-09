# 内容写作规范

这份文档用来固定博客文章的内容模型，避免后面内容一多以后字段混乱、系列顺序失控、双语版本对不上。

## 当前规则

- 每篇已发布文章必须同时有 `zh` 和 `en` 两个版本。
- 一组双语文章必须共享同一个 `translationKey`。
- 当前站点要求双语文章共享同一个 `pathSlug`，这样 `ZH/EN` 切换才能稳定工作。
- 同一组双语文章必须使用相同的 `series` 和 `seriesOrder`。
- 系列内顺序以后以 `seriesOrder` 为准，不再隐式依赖 `publishedAt`。

## 必填 frontmatter

- `locale`
  只能是 `zh` 或 `en`。
- `translationKey`
  双语配对键，推荐直接用英文短横线 slug，例如 `linux-basic`。
- `pathSlug`
  当前公开 URL，对外路由使用这个值。
- `title`
  页面标题。
- `summary`
  文章摘要，会出现在文章首屏、首页卡片、搜索结果和 SEO 描述里。
- `publishedAt`
  首次发布日期。
- `updatedAt`
  最近一次明显更新的日期。可选，但建议长期维护的文章都补上。
- `readingMinutes`
  估算阅读时长，正整数。
- `series`
  当前只允许 `linux`、`docker`、`k8s`。
- `seriesOrder`
  该文章在当前系列里的顺序，从 `1` 开始递增。
- `featured`
  是否进入首页精选。
- `tags`
  标签列表。建议 2 到 4 个，避免泛滥。

## 推荐写作流程

1. 先决定 `translationKey`、`series`、`seriesOrder`
2. 同时创建 `zh` 和 `en` 两个文件
3. 先写中文主稿，再补英文对应稿
4. 确认两边的 `translationKey`、`pathSlug`、`series`、`seriesOrder` 完全一致
5. 最后再跑 `npm run check` 和 `npm run build`

## 模板位置

- `src/content/templates/post.zh.template.md`
- `src/content/templates/post.en.template.md`

## 建议约束

- `title` 不要写成教程大全式口号，尽量让读者一眼知道范围
- `summary` 只写一句，说明问题和收益，不写空话
- 一个系列内优先保持稳定顺序，不要频繁插队
- 如果某篇文章尚未完成双语版本，不要先发布到当前站点
