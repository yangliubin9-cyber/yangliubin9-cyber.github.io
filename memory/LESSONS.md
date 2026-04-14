# Lessons

- 2026-04-14: If a repo's "OpenAI key" actually belongs to an OpenAI-compatible relay, translation code must not hardcode `https://api.openai.com/v1/responses`. Make the base URL configurable, normalize `.../v1` to `.../v1/responses`, and pass the same env through local scripts and GitHub Actions.

- 2026-04-14: If the requirement is "Chinese updates should automatically translate to English and sync out", a nightly-only workflow is not enough even when the scripts already exist. Keep the Feishu pull workflow separate, and add a push-triggered workflow scoped to `src/content/posts/zh/**` so zh commits generate en updates immediately without creating a bot-trigger loop.

- 2026-04-14: Home featured content on this blog should be curated, not automatically expanded by every new series. Keep the homepage pinned to the core editorial tracks and let newly added series or imported articles live on their own series/article pages until you intentionally promote them.

- 2026-04-14: If a series page promises an explicit reading path, `seriesOrder` must be unique within each locale + series, not just present. Otherwise the site still builds and sorts by publish date as a tiebreaker, but the editorial sequence stops being deterministic.

- 2026-04-14: Feishu automation that reads folders or Docx blocks must paginate both collection endpoints and child-block endpoints. A one-page implementation can look fine in dry runs with a small dataset, then silently miss older docs or leave stale tail content behind once the folder or document grows.

- 2026-04-14: When resuming Feishu blog-sync work, validate the pipeline in layers instead of jumping straight to the full nightly job. First run `node ./scripts/feishu-sync.mjs --help` or `npm run sync:feishu -- --dry-run --locale zh` to verify Feishu auth and folder parsing, then run `node ./scripts/feishu-publish-en.mjs --dry-run` to verify English doc publishing, and only after that run `ASTRO_TELEMETRY_DISABLED=1 npm run check` plus `npm run build` to confirm the synced content still builds cleanly.

- 2026-04-13: Feishu Drive folder children under `drive/explorer/v2/folder/.../children` may come back in `data.children` keyed by token rather than a flat `items` array. Folder sync code needs to normalize both response shapes before deciding the folder is empty.

- 2026-04-13: When syncing Feishu folders without Bitable metadata, title matching alone is too fragile. Keep a small doc-token override map for stable `slug`, `series`, and `seriesOrder`, then let folder sync create missing local Markdown files instead of forcing the current site titles to match the Feishu doc titles exactly.

- 2026-04-13: If a Feishu content source lives under `my.feishu.cn/drive/folder/...`, app-only auth with `tenant_access_token/internal` can authenticate successfully but still fail with Drive `forbidden`. Treat that as an access-boundary problem first, not a parsing bug: the app usually needs the folder moved/shared into an app-readable space or the integration must switch to user-access-token auth.

- 2026-04-13: For a static Astro blog that treats Feishu as the upstream source, the safest V1 integration is a manual sync script that writes normalized Markdown into the existing `src/content/posts/<locale>/` folders. This keeps the site build path unchanged, preserves local Markdown as the fallback when sync is not run, and avoids mixing live Feishu credentials into frontend code.

- 2026-04-13: If the site wants Chinese-first bilingual publishing, do not hard-require every `translationKey` to have both `zh` and `en` at build time. Let `zh` publish first, treat `en` as derived content, and gate the language switch by whether the translated page actually exists.

- 2026-04-13: About 页如果同时承担“作者介绍”和“站点说明”，不能只放标题加两段正文。至少要把内容范围、站点模块、适合读者这三层信息拆开，不然读者会觉得页面很空，也看不懂这个模块到底有什么用。
- 2026-04-13: 如果 About 页是正式对外页面，不要只写抽象定位。至少要有真人身份介绍、当前写作方向和明确联系方式，不然页面再有结构，也还是会像半成品。
- 2026-04-13: About 页如果已经有真人介绍和联系方式，就不要再堆额外的小模块去解释站点逻辑。对这种页面来说，少而准比“内容很全”更重要，模块太多反而会把人的存在感冲淡。
- 2026-04-13: 个人页如果顶部已经有“关于”这种一级标题，下面的正文模块不要再用“关于我”这种近义标题硬叠一层，容易显得打架。更顺的做法是保留顶层“关于”，把正文入口改成更像引导语的名字，比如“了解我”。

- 2026-04-10: If a filter button needs centered text plus a count badge, do not center the text and badge as one flex row. Keep the button text centered and absolutely position the count bubble to the right, otherwise chips with different labels will look visually different even when the outer width is the same.

- 2026-04-10: Search filter chips are a different UI problem from article badges. If the requirement is "all tags the same size", use a grid plus fixed-width count bubbles on `.search-filters` and `.filter-chip`, not repeated tweaks on the article `.card-pill`.

- 2026-04-10: If a visual variant keeps fighting a shared utility class, stop stacking styles and split the variant into its own fully-owned class. A half-shared `.pill + .card-pill` setup is easy to misread and makes repeated badge tweaks slower and riskier.

- 2026-04-10: For category badges, a width cap plus ellipsis is the wrong fallback when the label itself is the meaning. Keep the badge compact by reducing font size and padding first, and only clip when the card itself becomes narrower than the content.

- 2026-04-10: Card badges that should look like pills should not use a shared fixed width. Use a shared class for typography and padding, but let width shrink to content with only a max-width cap. Fixed widths make short labels like Linux look bloated and create the exact "small box too wide" bug users notice first.

- 2026-04-10: When the same badge appears in multiple card templates, do not bind the width rule to one page-specific selector like `.card-post .pill`. Use a shared card badge class such as `.card-pill`, otherwise search cards may look fixed while home and series cards still drift.

- 2026-04-10: If a shared badge style is used by cards, filters, and tag lists, keep the global `.pill` safe but tighten long labels with a local rule like `.card-post .pill`. Fixing the card variant avoids shrinking clickable filter chips.

- 2026-04-10: If the user explicitly wants equal-height and equal-width article badges across search, home, and series cards, let `.card-pill` fully own that template with fixed width/height and centered flex alignment. Do not mix in `.filter-chip` rules or content-width badge sizing for that case.

- 2026-04-10: If a filter chip contains both a text label span and a count badge span, never style it with a broad selector like `.filter-chip span`. Target the count node explicitly with `[data-filter-count]`, or the label will get turned into the badge by accident.

- 2026-04-10: If an article comments area is meant to feel like “comment directly below”, do not stack extra helper cards like participation steps and repo metadata above the widget. Keep a single intro card plus the comment frame, otherwise the support UI becomes visually heavier than the discussion itself.

- 2026-04-10: If the homepage hero needs a right-side illustration across multiple locales, add a shared hero media slot in both locale index templates and serve the image from `public/`. Do not hardcode one locale-only layout or place the asset outside the published static directory.

- 2026-04-10: Astro 页面里的多个内联 `<script>` 共享全局词法作用域。公共布局脚本和页面脚本如果都写顶层 `const root` 这类同名变量，后面的脚本会直接失效，表现出来就是按钮能看到但事件完全不生效。做页面级交互脚本时，优先用 IIFE 或局部块包起来，避免污染全局。
- 2026-04-10: 搜索/筛选类功能不能只看静态 HTML 或文本快照。要同时验证三件事：事件有没有绑定成功、DOM 上 `hidden` 状态有没有变化、计数文案有没有同步更新。headless 工具的快照有时不会直观看出隐藏状态，必要时直接用 DOM 查询确认。
- 2026-04-10: 搜索页如果同时有“关键词”和“标签”两个入口，不能只更新顶部总数。更实用的做法是：标签数字跟着关键词实时变化，结果列表按筛选后的集合分页，筛选条件变化时自动回到第一页。否则用户会感觉“数字变了，但下面内容没跟上”。
- 2026-04-10: 前端筛选里如果用 `hidden` 隐藏结果，一定要检查 `getComputedStyle(...).display`，不要只看元素有没有挂上 `hidden` 属性。这个项目里 `.card { display: grid; }` 会把浏览器默认的 `[hidden]` 隐藏效果覆盖掉，导致“脚本判断已隐藏，但页面视觉上还在”。兜底规则要直接加 `[hidden] { display: none !important; }`。
- 2026-04-10: 如果用户明确说“模板不要动，只删掉某几句文案”，优先把文案放回 `ui` 数据层处理；确实需要兼容空文案时，用最小样式如 `.lede:empty { display: none; }` 吃掉空占位，不要顺手再改系列页或搜索页模板结构。
- 2026-04-10: 共享 `.hero-editorial` 的页面如果只想调整系列页、搜索页这类内页标题对齐，不要直接改公共 hero 布局。给目标页面单独加一个类，比如 `.hero-page`，再覆盖成单列和左对齐，这样不会把首页带图片的 hero 一起改坏。
