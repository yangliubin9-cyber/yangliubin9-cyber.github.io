# Lessons

- 2026-04-10: If a visual variant keeps fighting a shared utility class, stop stacking styles and split the variant into its own fully-owned class. A half-shared `.pill + .card-pill` setup is easy to misread and makes repeated badge tweaks slower and riskier.

- 2026-04-10: For category badges, a width cap plus ellipsis is the wrong fallback when the label itself is the meaning. Keep the badge compact by reducing font size and padding first, and only clip when the card itself becomes narrower than the content.

- 2026-04-10: Card badges that should look like pills should not use a shared fixed width. Use a shared class for typography and padding, but let width shrink to content with only a max-width cap. Fixed widths make short labels like Linux look bloated and create the exact "small box too wide" bug users notice first.

- 2026-04-10: When the same badge appears in multiple card templates, do not bind the width rule to one page-specific selector like `.card-post .pill`. Use a shared card badge class such as `.card-pill`, otherwise search cards may look fixed while home and series cards still drift.

- 2026-04-10: If a shared badge style is used by cards, filters, and tag lists, keep the global `.pill` safe but tighten long labels with a local rule like `.card-post .pill`. Fixing the card variant avoids shrinking clickable filter chips.

- 2026-04-10: Astro 页面里的多个内联 `<script>` 共享全局词法作用域。公共布局脚本和页面脚本如果都写顶层 `const root` 这类同名变量，后面的脚本会直接失效，表现出来就是按钮能看到但事件完全不生效。做页面级交互脚本时，优先用 IIFE 或局部块包起来，避免污染全局。
- 2026-04-10: 搜索/筛选类功能不能只看静态 HTML 或文本快照。要同时验证三件事：事件有没有绑定成功、DOM 上 `hidden` 状态有没有变化、计数文案有没有同步更新。headless 工具的快照有时不会直观看出隐藏状态，必要时直接用 DOM 查询确认。
- 2026-04-10: 搜索页如果同时有“关键词”和“标签”两个入口，不能只更新顶部总数。更实用的做法是：标签数字跟着关键词实时变化，结果列表按筛选后的集合分页，筛选条件变化时自动回到第一页。否则用户会感觉“数字变了，但下面内容没跟上”。
- 2026-04-10: 前端筛选里如果用 `hidden` 隐藏结果，一定要检查 `getComputedStyle(...).display`，不要只看元素有没有挂上 `hidden` 属性。这个项目里 `.card { display: grid; }` 会把浏览器默认的 `[hidden]` 隐藏效果覆盖掉，导致“脚本判断已隐藏，但页面视觉上还在”。兜底规则要直接加 `[hidden] { display: none !important; }`。
