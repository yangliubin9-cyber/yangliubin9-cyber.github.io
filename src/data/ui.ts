import type { Locale } from './site';

type LayoutCopy = {
  nav: {
    home: string;
    series: string;
    search: string;
    about: string;
  };
  navAria: string;
  languageLabel: string;
  themeLabel: string;
  footer: string;
  themeNames: {
    light: string;
    dark: string;
  };
};

type RedirectCopy = {
  title: string;
  message: string;
};

type HomeCopy = {
  kicker: string;
  title: string;
  lede: string;
  primaryAction: string;
  secondaryAction: string;
  featuredEyebrow: string;
  featuredTitle: string;
  featuredSummary: string;
  trackCount?: (count: number) => string;
  trackLatestLabel?: string;
  trackEntryAction?: string;
  trackSeriesAction?: string;
  fallbackBadge: string;
};

type AboutCopy = {
  kicker: string;
  title: string;
  lede: string;
  paragraphs: string[];
};

type SearchCopy = {
  kicker: string;
  title: string;
  lede: string;
  label: string;
  placeholder: string;
  clear: string;
  empty: string;
  allFilter: string;
  filtersAria: string;
  allCount: (total: number) => string;
  filteredCount: (visible: number, total: number) => string;
};

type SeriesIndexCopy = {
  kicker: string;
  title: string;
  lede: string;
  count: (count: number) => string;
  startLabel?: string;
  latestLabel?: string;
  previewLabel?: string;
  entryAction?: string;
  overviewAction?: string;
};

type SeriesDetailCopy = {
  kicker: string;
  countLabel: string;
  latestPublishLabel: string;
  overviewEyebrow?: string;
  overviewTitle?: string;
  overviewSummary?: string;
  startLabel?: string;
  latestLabel?: string;
  publishedLabel?: string;
  readingTimeLabel?: string;
  readAction?: string;
  timelineEyebrow?: string;
  timelineTitle?: string;
  timelineSummary?: string;
  stepLabel?: (current: number, total: number) => string;
};

type ArticleCopy = {
  kicker: string;
  overviewEyebrow: string;
  overviewProgress: (current: number, total: number) => string;
  overviewSeriesAction: string;
  overviewBackHomeAction: string;
  progressEyebrow: string;
  progressCount: (current: number, total: number) => string;
  progressAria: string;
  infoEyebrow: string;
  publishedLabel: string;
  readingTimeLabel: string;
  seriesLabel: string;
  tocEyebrow: string;
  tocAria: string;
  tagsEyebrow: string;
  previousLabel: string;
  previousEmptyTitle: string;
  previousEmptyDescription: string;
  seriesOverviewLabel: string;
  seriesOverviewDescription: string;
  nextLabel: string;
  nextEmptyTitle: string;
  nextEmptyDescription: string;
  keepReadingEyebrow: string;
  keepReadingTitle: string;
};

type CommentsCopy = {
  eyebrow: string;
  title: string;
  description: string;
  guideTitle: string;
  repoLabel: string;
  threadLabel: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  loadingLabel: string;
  errorLabel: string;
  hint: string;
  steps: string[];
};

type LocaleUi = {
  layout: LayoutCopy;
  redirect: RedirectCopy;
  home: HomeCopy;
  about: AboutCopy;
  search: SearchCopy;
  seriesIndex: SeriesIndexCopy;
  seriesDetail: SeriesDetailCopy;
  article: ArticleCopy;
  comments: CommentsCopy;
};

const zhUi: LocaleUi = {
  layout: {
    nav: {
      home: '首页',
      series: '系列',
      search: '搜索',
      about: '关于'
    },
    navAria: '主导航',
    languageLabel: '语言',
    themeLabel: '主题',
    footer:
      '这是一套已经上线的双语工程博客，包含精选文章、系列导航、站内搜索和 GitHub 讨论。',
    themeNames: {
      light: '明亮',
      dark: '暗黑'
    }
  },
  redirect: {
    title: '返回首页',
    message: '当前页面不可用，正在返回首页：'
  },
  home: {
    kicker: '双语工程笔记',
    title: '把 AI 基础设施、容器交付和云原生实践写成可复用的工程笔记',
    lede:
      '首页只承担品牌介绍和阅读入口的作用，用精选文章把读者直接带入 Linux、Docker、Kubernetes 与工程交付这几条主线。',
    primaryAction: '开始阅读',
    secondaryAction: '关于作者',
    featuredEyebrow: '精选文章',
    featuredTitle: '先读这些，最快进入站点主线',
    featuredSummary: '首页保留少量精选入口，其他内容分别收进系列页、搜索页和文章页。',
    fallbackBadge: '文章'
  },
  about: {
    kicker: '关于',
    title: '在 AI、平台与运维交界处写工程博客',
    lede:
      '这里关注的不是零散的工具清单，而是训练、推理、平台稳定性和工程交付如何真正接上。',
    paragraphs: [
      '我是 MUZI，一名专注于 AI 基础设施与工程交付的工程师。这里长期记录 Kubernetes、Docker、MLOps、CI/CD、GPU 调度和云原生系统里的实践判断。',
      '站点本身已经是一套完整的双语内容系统：有清晰的系列主线、轻量站内搜索、文章级 GitHub 讨论，以及面向长期写作的稳定静态发布路径。'
    ]
  },
  search: {
    kicker: '站内搜索',
    title: '用关键词和系列筛选，快速定位站内文章',
    lede:
      '这里直接提供顺手的站内搜索体验，支持关键词匹配、系列筛选、结果计数和一键清空，适合在当前文章规模下快速定位内容。',
    label: '输入关键词',
    placeholder: '例如：docker、权限、deployment',
    clear: '清空',
    empty: '暂时没有匹配文章，换一个关键词或系列试试。',
    allFilter: '全部',
    filtersAria: '系列筛选',
    allCount: (total) => `当前展示全部 ${total} 篇文章。`,
    filteredCount: (visible, total) => `筛选结果：${visible} / ${total} 篇文章。`
  },
  seriesIndex: {
    kicker: '系列',
    title: '按主线组织内容，直接进入你关心的主题',
    lede:
      '当前内容围绕 Linux、Docker 和 Kubernetes 三条主线组织。每篇文章只归属一个系列，阅读顺序更清楚，归档结构也更稳定。',
    count: (count) => `${count} 篇文章`
  },
  seriesDetail: {
    kicker: '系列详情',
    countLabel: '篇文章',
    latestPublishLabel: '最近发布时间'
  },
  article: {
    kicker: '实践笔记',
    overviewEyebrow: '阅读路径',
    overviewProgress: (current, total) => `当前是本系列第 ${current} 篇，共 ${total} 篇。按顺序阅读会更顺手。`,
    overviewSeriesAction: '查看系列',
    overviewBackHomeAction: '回到首页',
    progressEyebrow: '系列进度',
    progressCount: (current, total) => `第 ${current} / ${total} 篇`,
    progressAria: '系列文章顺序',
    infoEyebrow: '文章信息',
    publishedLabel: '发布时间',
    readingTimeLabel: '阅读时间',
    seriesLabel: '所属系列',
    tocEyebrow: '目录',
    tocAria: '文章目录',
    tagsEyebrow: '标签',
    previousLabel: '上一篇',
    previousEmptyTitle: '已经是系列起点',
    previousEmptyDescription: '从这里继续往后读，就在主线上。',
    seriesOverviewLabel: '系列总览',
    seriesOverviewDescription: '回到系列页，按顺序查看这条主线下的全部文章。',
    nextLabel: '下一篇',
    nextEmptyTitle: '已经读到系列末尾',
    nextEmptyDescription: '可以回到系列页，也可以直接去评论区补充你的经验。',
    keepReadingEyebrow: '继续阅读',
    keepReadingTitle: '同系列更多文章'
  },
  comments: {
    eyebrow: '交流讨论',
    title: '评论区',
    description:
      '可以登录账户在下面对本篇文章提出见解。',
    guideTitle: '参与方式',
    repoLabel: '评论仓库',
    threadLabel: '讨论标识',
    primaryActionLabel: '打开评论话题',
    secondaryActionLabel: '查看仓库',
    loadingLabel: '正在加载评论组件...',
    errorLabel: '评论组件加载失败，可以先打开 GitHub Issues 直接参与讨论。',
    hint:
      '如果评论框没有出现，先确认 Blogs-Comment 仓库已启用 Issues，并且 utterances app 已经安装到该仓库。',
    steps: [
      '先用 GitHub 账号登录，这样才能在文章下留言。',
      '首次留言时，系统会把这篇文章绑定到对应的 Issue 话题。',
      '如果想直接在 GitHub 里管理讨论，可以从下面的仓库入口跳转。'
    ]
  }
};

const enUi: LocaleUi = {
  layout: {
    nav: {
      home: 'Home',
      series: 'Series',
      search: 'Search',
      about: 'About'
    },
    navAria: 'Primary navigation',
    languageLabel: 'Language',
    themeLabel: 'Theme',
    footer:
      'The site is now a bilingual engineering blog with curated entry posts, series navigation, in-page search, and GitHub-backed discussion.',
    themeNames: {
      light: 'Light',
      dark: 'Dark'
    }
  },
  redirect: {
    title: 'Returning Home',
    message: 'This page is unavailable. Returning to the homepage:'
  },
  home: {
    kicker: 'Bilingual Field Notes',
    title: 'A practical engineering blog about infrastructure that has to survive real delivery',
    lede:
      'The home page stays focused on brand and reading direction, then points readers to a small set of strong entry posts across Linux, Docker, Kubernetes, and delivery practice.',
    primaryAction: 'Start reading',
    secondaryAction: 'About the author',
    featuredEyebrow: 'Featured posts',
    featuredTitle: 'Start with the notes that define the main tracks',
    featuredSummary: 'The home page keeps only a small curated entry set. Everything else lives on its own page.',
    trackCount: (count) => `${count} posts`,
    trackLatestLabel: 'Latest update',
    trackEntryAction: 'Read this entry',
    trackSeriesAction: 'View series',
    fallbackBadge: 'Article'
  },
  about: {
    kicker: 'About',
    title: 'Writing at the boundary of AI systems, platforms, and operations',
    lede:
      'The focus here is not isolated tools. It is how training, inference, platform stability, and engineering delivery connect in real systems.',
    paragraphs: [
      'I am MUZI, an engineer focused on AI infrastructure and practical delivery. This blog collects field notes on Kubernetes, Docker, MLOps, CI/CD, GPU scheduling, and cloud-native systems.',
      'The site itself already runs as a complete bilingual publishing system, with structured series navigation, lightweight on-site search, article-level GitHub discussion, and a stable static delivery path for long-term writing.'
    ]
  },
  search: {
    kicker: 'Search',
    title: 'Use keywords and series filters to move through the archive quickly',
    lede:
      'Search is already tuned for the current archive size, with keyword matching, series filters, result counts, and one-click reset to keep navigation fast and direct.',
    label: 'Search posts',
    placeholder: 'Try: docker, permissions, deployment',
    clear: 'Clear',
    empty: 'No matching posts yet. Try another keyword or series.',
    allFilter: 'All',
    filtersAria: 'Series filters',
    allCount: (total) => `Showing all ${total} posts.`,
    filteredCount: (visible, total) => `Showing ${visible} of ${total} posts.`
  },
  seriesIndex: {
    kicker: 'Series',
    title: 'Use learning tracks to structure the archive',
    lede:
      'The archive is organized around Linux, Docker, and Kubernetes. Each post belongs to one primary series, which keeps reading order and navigation clear.',
    count: (count) => `${count} posts`,
    startLabel: 'Best place to start',
    latestLabel: 'Latest update',
    previewLabel: 'Reading order',
    entryAction: 'Start here',
    overviewAction: 'Open series'
  },
  seriesDetail: {
    kicker: 'Series Detail',
    countLabel: 'posts',
    latestPublishLabel: 'latest publish date',
    overviewEyebrow: 'Entry points',
    overviewTitle: 'Start at the door that fits your context',
    overviewSummary:
      'If this is your first pass through the series, start with the opening post. If you are already following along, jump to the newest update.',
    startLabel: 'Starting point',
    latestLabel: 'Latest update',
    publishedLabel: 'Published',
    readingTimeLabel: 'Reading time',
    readAction: 'Open post',
    timelineEyebrow: 'Ordered path',
    timelineTitle: 'Read the series in the intended order',
    timelineSummary:
      'Each post is arranged by seriesOrder so the track reads like a sequence instead of a pile of links.',
    stepLabel: (current, total) => `Post ${current} of ${total}`
  },
  article: {
    kicker: 'Field Note',
    overviewEyebrow: 'Reading Path',
    overviewProgress: (current, total) =>
      `You are on post ${current} of ${total}. This series reads best in order.`,
    overviewSeriesAction: 'View series',
    overviewBackHomeAction: 'Back home',
    progressEyebrow: 'Series Progress',
    progressCount: (current, total) => `Post ${current} of ${total}`,
    progressAria: 'Series order',
    infoEyebrow: 'Post Info',
    publishedLabel: 'Published',
    readingTimeLabel: 'Reading time',
    seriesLabel: 'Series',
    tocEyebrow: 'On This Page',
    tocAria: 'Table of contents',
    tagsEyebrow: 'Tags',
    previousLabel: 'Previous',
    previousEmptyTitle: 'This is the first post in the series',
    previousEmptyDescription: 'Keep moving forward from here to stay on the main track.',
    seriesOverviewLabel: 'Series Overview',
    seriesOverviewDescription: 'Jump back to the series page and scan the full sequence in one place.',
    nextLabel: 'Next',
    nextEmptyTitle: 'You reached the end of this series',
    nextEmptyDescription: 'Head back to the series page or jump into the comments to add your own field notes.',
    keepReadingEyebrow: 'Keep Reading',
    keepReadingTitle: 'More from this series'
  },
  comments: {
    eyebrow: 'Discussion',
    title: 'Join the discussion',
    description:
      'Sign in and share your thoughts on this article below.',
    guideTitle: 'How to participate',
    repoLabel: 'Comment repo',
    threadLabel: 'Thread key',
    primaryActionLabel: 'Open issue threads',
    secondaryActionLabel: 'View repository',
    loadingLabel: 'Loading the comment widget...',
    errorLabel: 'The comment widget could not be loaded. You can still join the discussion directly in GitHub Issues.',
    hint:
      'If the comment frame does not appear, first verify that Issues are enabled on Blogs-Comment and that the utterances app is installed for that repository.',
    steps: [
      'Sign in with your GitHub account before posting a comment.',
      'The first comment on a post is attached to a dedicated issue thread for that article.',
      'If you prefer managing the discussion on GitHub directly, use the repository links below.'
    ]
  }
};

export const languageCodes = {
  zh: 'ZH',
  en: 'EN'
} as const;

const uiText: Record<Locale, LocaleUi> = {
  zh: zhUi,
  en: enUi
};

export function getUiText(locale: Locale) {
  return uiText[locale];
}
