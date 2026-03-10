export const SITE = {
  origin: 'https://yangliubin9-cyber.github.io',
  repositoryUrl: 'https://github.com/yangliubin9-cyber/yangliubin9-cyber.github.io',
  commentsRepositoryUrl: 'https://github.com/yangliubin9-cyber/Blogs-Comment',
  profileUrl: 'https://github.com/yangliubin9-cyber',
  email: 'yangliubin9-cyber@users.noreply.github.com',
  defaultOgImage: '/og-card.svg',
  giscus: {
    repo: import.meta.env.PUBLIC_GISCUS_REPO || 'yangliubin9-cyber/Blogs-Comment',
    repoId: import.meta.env.PUBLIC_GISCUS_REPO_ID || 'R_kgDORi4F6A',
    category: import.meta.env.PUBLIC_GISCUS_CATEGORY || 'General',
    categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDORi4F6M4C4Duo',
    availableCategories: ['General', 'Ideas', 'Q&A', 'Showcase'],
    mapping: 'pathname',
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'bottom'
  },
  ai: {
    envFile: '.env.local',
    scriptPath: 'scripts/translate-post.mjs',
    defaultStyle: 'anthropic'
  }
} as const;

export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export type NavKey = 'home' | 'blog' | 'about' | 'projects' | 'uses' | 'contact';

export const NAV_ITEMS: NavKey[] = ['home', 'blog', 'about', 'projects', 'uses', 'contact'];

export const PROFILE = {
  avatar: '/Avatar.jpg',
  avatarFallback: '/avatar-sponge.svg',
  name: {
    zh: '杨刘彬 (Bin)',
    en: 'Yang Liubin (Bin)'
  },
  tagline: {
    zh: '全栈开发者 · 设计爱好者 · 云计算运维工程师 · 用代码讲故事',
    en: 'Full-stack dev · Design enthusiast · Cloud Ops engineer · Telling stories with code'
  }
} as const;

const dictionaries = {
  zh: {
    branding: {
      title: '杨刘彬·言',
      subtitle: '探索技术与生活的交叉点'
    },
    nav: {
      home: '首页',
      blog: '博客',
      about: '关于',
      projects: '项目',
      uses: '装备',
      contact: '联系',
      studio: '工作台',
      theme: '切换亮暗主题',
      language: '切换语言'
    },
    home: {
      eyebrow: 'YANG LIUBIN / JOURNAL',
      heroTitle: '让技术写作像产品一样被认真设计。',
      heroDescription:
        '这里记录工程、设计、云计算运维与生活观察。视觉上借鉴 Apple 的克制和 Linear 的秩序感，让内容、结构与个人气质自然融合。',
      primary: '进入博客',
      secondary: '了解我',
      introTitle: '你好，我是杨刘彬 (Bin)',
      introBody:
        '我在全栈开发、设计表达与云计算运维之间穿梭，喜欢把复杂系统整理成清晰、耐看、可持续演进的体验。',
      latestTitle: '最新文章',
      latestDescription: '从工程实践到生活思考，每一篇文章都服务于更高信噪比的阅读体验。',
      spotlightTitle: '这不是模板博客，而是一个持续成长的个人操作系统。',
      spotlightItems: [
        '首页聚焦最新文章、头像和一句话简介，让访客在第一屏就快速认识你。',
        '博客列表支持跨中英文统一搜索、分类和标签筛选，保持完全免费的静态方案。',
        'About / Projects / Uses / Contact 让它更像一张可以持续更新的个人名片。'
      ]
    },
    blog: {
      eyebrow: 'INDEX / SEARCH',
      title: '博客',
      description: '跨中英文统一搜索，支持分类、标签与本地静态搜索。',
      searchPlaceholder: '搜索标题、摘要、标签、分类或语言',
      searchLabel: '搜索',
      categoryLabel: '分类',
      tagLabel: '标签',
      allCategories: '全部分类',
      allTags: '全部标签',
      resultLabel: '篇结果',
      emptyTitle: '没有匹配的文章',
      emptyBody: '可以尝试清空搜索词，或切换分类 / 标签。',
      studioAction: '打开可视化工作台',
      commentsAction: '评论仓库'
    },
    about: {
      eyebrow: 'ABOUT / PROFILE',
      title: '关于我',
      description:
        '我希望把开发、设计和运维之间的经验，转化成更容易被理解、使用和信任的数字产品。',
      sections: {
        background: '背景',
        skills: '技能',
        interests: '兴趣',
        contact: '联系方式'
      },
      background: [
        '全栈开发者，同时对界面设计和内容表达有很强兴趣。',
        '长期关注云计算、自动化运维、工程效率与产品体验。',
        '我相信“讲清楚复杂系统”本身，就是一种重要能力。'
      ],
      skills: ['TypeScript / JavaScript', 'Astro / React / Node.js', 'Cloud Ops / Automation', 'Design systems', 'Technical writing'],
      interests: ['开发者工具', '个人知识系统', '静态网站', '可读性驱动的 UI 设计']
    },
    projects: {
      eyebrow: 'PROJECTS / WORK',
      title: '项目',
      description: '这里展示能体现你的工程能力、设计判断和系统化思维的作品。',
      items: [
        {
          name: 'Yang’s Log',
          type: 'Personal Platform',
          description: '这个博客系统本身就是一个项目：双语路由、主题切换、跨语言搜索、评论系统与 GitHub Pages 自动部署。'
        },
        {
          name: 'Cloud Automation Toolkit',
          type: 'Ops / Internal Tools',
          description: '适合替换成你在云环境、运维自动化或脚本平台上的真实项目。'
        },
        {
          name: 'Design + Code Experiments',
          type: 'UI Engineering',
          description: '适合放你在界面设计、前端交互或体验优化上的作品集与实验。'
        }
      ]
    },
    uses: {
      eyebrow: 'USES / STACK',
      title: '装备',
      description: '开发者也会关心你平时用什么工作，这一页天然能拉近距离。',
      groups: [
        {
          name: '软件',
          items: ['VS Code / Cursor 类编辑器', 'GitHub', 'PowerToys', 'Chrome / Arc 类浏览器']
        },
        {
          name: '开发',
          items: ['Astro / React / TypeScript', 'Node.js', 'GitHub Actions', 'Markdown / MDX 工作流']
        },
        {
          name: '偏好',
          items: ['轻量静态站点', '可维护的组件系统', '高密度但不吵闹的 UI', '长期主义的内容资产']
        }
      ]
    },
    contact: {
      eyebrow: 'CONTACT / LINKS',
      title: '联系',
      description: '这个站点坚持免费基础设施，所以联系层也保持轻量：GitHub、邮箱和 Discussions。',
      items: [
        { label: 'GitHub', value: 'github.com/yangliubin9-cyber', href: 'https://github.com/yangliubin9-cyber' },
        { label: 'Email', value: 'yangliubin9-cyber@users.noreply.github.com', href: 'mailto:yangliubin9-cyber@users.noreply.github.com' },
        { label: 'Discussions', value: 'github.com/yangliubin9-cyber/Blogs-Comment/discussions', href: 'https://github.com/yangliubin9-cyber/Blogs-Comment/discussions' }
      ]
    },
    studio: {
      eyebrow: 'STUDIO / EDITOR',
      title: '可视化写作工作台',
      description: '这里提供富文本编辑、实时生成 Markdown / MDX、草稿本地保存以及导出能力，适合像 Notion 一样边写边看。',
      meta: {
        locale: '语言',
        pathSlug: '文章路径',
        translationKey: '双语关联键',
        title: '标题',
        excerpt: '摘要',
        category: '分类',
        tags: '标签',
        accent: '强调色',
        heroEyebrow: '眉标',
        featured: '首页精选'
      },
      actions: {
        copy: '复制 MDX',
        download: '下载文件',
        clear: '清空草稿',
        save: '保存草稿'
      },
      tabs: {
        editor: '可视化编辑',
        output: 'MDX 输出'
      },
      notes: {
        autosave: '草稿会自动保存到浏览器本地。',
        translation: '想生成英文版本时，可结合 scripts/translate-post.mjs 和 .env.local 里的模型配置。'
      },
      toolbar: {
        h2: '二级标题',
        h3: '三级标题',
        paragraph: '正文',
        list: '列表',
        quote: '引用',
        code: '代码块',
        note: '提示块',
        bold: '加粗'
      }
    },
    post: {
      backToBlog: '返回博客',
      published: '发布于',
      updated: '更新于',
      category: '分类',
      tags: '标签',
      contents: '目录',
      noContents: '当前文章没有自动生成目录。',
      related: '继续阅读',
      comments: '评论',
      commentsHint: '启用 Blogs-Comment 仓库的 GitHub Discussions 并补全 giscus 配置后，这里会自动出现评论区。',
      legacyRedirect: '旧链接正在跳转到新的文章地址。'
    },
    localeLabel: {
      zh: '简中',
      en: 'EN'
    },
    footer: {
      title: '杨刘彬·言',
      description: '探索技术与生活的交叉点。'
    },
    giscusLang: 'zh-CN'
  },
  en: {
    branding: {
      title: 'Yang’s Log',
      subtitle: 'Where code meets life'
    },
    nav: {
      home: 'Home',
      blog: 'Blog',
      about: 'About',
      projects: 'Projects',
      uses: 'Uses',
      contact: 'Contact',
      studio: 'Studio',
      theme: 'Toggle light and dark theme',
      language: 'Switch language'
    },
    home: {
      eyebrow: 'YANG LIUBIN / JOURNAL',
      heroTitle: 'A personal blog designed with the same care as a product.',
      heroDescription:
        'This site covers engineering, design, cloud operations, and everyday thinking. The interface borrows restraint from Apple and structure from Linear so the writing stays in focus.',
      primary: 'Open the blog',
      secondary: 'Meet the author',
      introTitle: 'Hi, I’m Yang Liubin (Bin)',
      introBody:
        'I move across full-stack development, design expression, and cloud operations, and I enjoy turning complex systems into experiences that feel clear and composed.',
      latestTitle: 'Latest posts',
      latestDescription: 'From engineering practice to reflections on life, each post is built for a higher signal-to-noise reading experience.',
      spotlightTitle: 'This is not a generic template blog. It is a growing personal operating system.',
      spotlightItems: [
        'The home page introduces you instantly with your avatar, short bio, and latest writing.',
        'The blog index offers cross-language search plus category and tag filtering.',
        'About / Projects / Uses / Contact turn the site into a complete public profile.'
      ]
    },
    blog: {
      eyebrow: 'INDEX / SEARCH',
      title: 'Blog',
      description: 'Search across Chinese and English posts with category, tag, and static local search.',
      searchPlaceholder: 'Search title, excerpt, tags, category, or language',
      searchLabel: 'Search',
      categoryLabel: 'Category',
      tagLabel: 'Tag',
      allCategories: 'All categories',
      allTags: 'All tags',
      resultLabel: 'results',
      emptyTitle: 'No matching posts',
      emptyBody: 'Try clearing the query or switching the selected category or tag.',
      studioAction: 'Open visual studio',
      commentsAction: 'Comments repo'
    },
    about: {
      eyebrow: 'ABOUT / PROFILE',
      title: 'About',
      description:
        'I enjoy translating experience across development, design, and operations into digital products that feel easier to understand and trust.',
      sections: {
        background: 'Background',
        skills: 'Skills',
        interests: 'Interests',
        contact: 'Contact'
      },
      background: [
        'A full-stack developer with a strong interest in interface design and editorial expression.',
        'Focused on cloud operations, automation, engineering efficiency, and product experience.',
        'I believe that making complex systems legible is a valuable skill by itself.'
      ],
      skills: ['TypeScript / JavaScript', 'Astro / React / Node.js', 'Cloud Ops / Automation', 'Design systems', 'Technical writing'],
      interests: ['Developer tools', 'Personal knowledge systems', 'Static sites', 'Readability-driven UI design']
    },
    projects: {
      eyebrow: 'PROJECTS / WORK',
      title: 'Projects',
      description: 'Use this page to show the work that best represents your engineering and design taste.',
      items: [
        {
          name: 'Yang’s Log',
          type: 'Personal Platform',
          description: 'The blog itself is a project: bilingual routes, theme switching, cross-language search, comments, and automated GitHub Pages deployment.'
        },
        {
          name: 'Cloud Automation Toolkit',
          type: 'Ops / Internal Tools',
          description: 'A good placeholder for your real cloud, scripting, automation, or operational tooling work.'
        },
        {
          name: 'Design + Code Experiments',
          type: 'UI Engineering',
          description: 'A place for your frontend interaction work, design systems, and interface experiments.'
        }
      ]
    },
    uses: {
      eyebrow: 'USES / STACK',
      title: 'Uses',
      description: 'Developer gear pages are simple, practical, and surprisingly good at building affinity.',
      groups: [
        {
          name: 'Software',
          items: ['VS Code / Cursor style editor', 'GitHub', 'PowerToys', 'Chrome / Arc style browser']
        },
        {
          name: 'Development',
          items: ['Astro / React / TypeScript', 'Node.js', 'GitHub Actions', 'Markdown / MDX workflow']
        },
        {
          name: 'Preferences',
          items: ['Lightweight static sites', 'Maintainable component systems', 'Dense but calm UI', 'Long-term content assets']
        }
      ]
    },
    contact: {
      eyebrow: 'CONTACT / LINKS',
      title: 'Contact',
      description: 'The stack stays free, so the contact layer stays light too: GitHub, email, and Discussions.',
      items: [
        { label: 'GitHub', value: 'github.com/yangliubin9-cyber', href: 'https://github.com/yangliubin9-cyber' },
        { label: 'Email', value: 'yangliubin9-cyber@users.noreply.github.com', href: 'mailto:yangliubin9-cyber@users.noreply.github.com' },
        { label: 'Discussions', value: 'github.com/yangliubin9-cyber/Blogs-Comment/discussions', href: 'https://github.com/yangliubin9-cyber/Blogs-Comment/discussions' }
      ]
    },
    studio: {
      eyebrow: 'STUDIO / EDITOR',
      title: 'Visual writing studio',
      description: 'A local visual editor with rich text editing, real-time Markdown / MDX output, draft autosave, and export tools.',
      meta: {
        locale: 'Locale',
        pathSlug: 'Path slug',
        translationKey: 'Translation key',
        title: 'Title',
        excerpt: 'Excerpt',
        category: 'Category',
        tags: 'Tags',
        accent: 'Accent',
        heroEyebrow: 'Eyebrow',
        featured: 'Featured'
      },
      actions: {
        copy: 'Copy MDX',
        download: 'Download file',
        clear: 'Clear draft',
        save: 'Save draft'
      },
      tabs: {
        editor: 'Visual editor',
        output: 'MDX output'
      },
      notes: {
        autosave: 'Drafts are stored in browser localStorage automatically.',
        translation: 'For English generation later, pair this with scripts/translate-post.mjs and the model settings in .env.local.'
      },
      toolbar: {
        h2: 'Heading 2',
        h3: 'Heading 3',
        paragraph: 'Paragraph',
        list: 'List',
        quote: 'Quote',
        code: 'Code block',
        note: 'Note block',
        bold: 'Bold'
      }
    },
    post: {
      backToBlog: 'Back to blog',
      published: 'Published',
      updated: 'Updated',
      category: 'Category',
      tags: 'Tags',
      contents: 'Contents',
      noContents: 'This post has no generated table of contents.',
      related: 'Continue reading',
      comments: 'Comments',
      commentsHint: 'Enable GitHub Discussions on the Blogs-Comment repository and fill in the giscus config to activate comments here.',
      legacyRedirect: 'Redirecting from the legacy article URL.'
    },
    localeLabel: {
      zh: 'ZH',
      en: 'EN'
    },
    footer: {
      title: 'Yang’s Log',
      description: 'Where code meets life.'
    },
    giscusLang: 'en'
  }
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getOtherLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'en' : 'zh';
}

export function getLocalizedPath(locale: Locale, path = ''): string {
  const normalized = path.replace(/^\/+|\/+$/g, '');
  return normalized ? `/${locale}/${normalized}/` : `/${locale}/`;
}

export function getBlogPath(locale: Locale): string {
  return getLocalizedPath(locale, 'blog');
}

export function getPostPath(locale: Locale, slug: string): string {
  return getLocalizedPath(locale, slug);
}

export function getLanguagePaths(path = ''): Record<Locale, string> {
  return {
    zh: getLocalizedPath('zh', path),
    en: getLocalizedPath('en', path)
  };
}



