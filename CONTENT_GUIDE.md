# 内容写作规范

这份文档用来固定博客文章的内容模型，避免后面内容一多以后字段混乱、系列顺序失控、双语版本对不上。

## 当前规则

- `zh` 是主稿，可以先单独存在。
- `en` 是由 `zh` 派生出来的翻译稿，可以后补。
- 不能先有 `en` 而没有 `zh`。
- 一组双语文章必须共用同一个 `translationKey`。
- 如果 `en` 已经存在，必须和 `zh` 共用同一个 `pathSlug`。
- 如果 `en` 已经存在，必须和 `zh` 使用相同的 `series` 和 `seriesOrder`。
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
  标签列表。建议 2 到 4 个，避免泛化。

## 英文翻译 metadata

以下字段只给 `en` 文章使用：

- `translationSourceHash`
  记录当前中文源稿快照的 hash，用来判断英文是否已经同步。
- `translationStatus`
  当前约定使用 `ai-generated` 或 `reviewed`，并保留 `needs-update` 作为后续扩展。
- `translationModel`
  记录最近一次机器翻译使用的模型。
- `translationUpdatedAt`
  记录最近一次机器同步日期。

## 推荐写作流程

1. 先决定 `translationKey`、`series`、`seriesOrder`
2. 先写 `zh` 主稿
3. 需要英文时，用翻译命令生成或更新 `en`
4. 人工过一遍英文内容，确认语气、术语和 Markdown 结构没问题
5. 用 `npm run translate:review -- --key your-key` 把该篇 `en` 标记为 `reviewed`
6. 最后再跑 `npm run translate:check`、`npm run check` 和 `npm run build`

## 双文同步命令

```bash
npm run translate:one -- --key linux-basic
npm run translate:changed
npm run translate:check
npm run translate:review -- --key linux-basic
npm run translate:review -- --all
```

## 模板位置

- `src/content/templates/post.zh.template.md`
- `src/content/templates/post.en.template.md`

## 建议约束

- `title` 不要写成教程大全式口号，尽量让读者一眼知道范围
- `summary` 只写一句，说明问题和收益，不写空话
- 一个系列内优先保持稳定顺序，不要频繁插队
- 如果某篇 `zh` 文章已经发布但 `en` 还没同步，语言切换应该保持不可跳转状态，不要把读者直接送到 404
- 不要让机器翻译默认覆盖已经人工修过的英文稿，除非明确使用强制参数
