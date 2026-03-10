export const SITE = {
  origin: 'https://yangliubin9-cyber.github.io',
  repositoryUrl: 'https://github.com/yangliubin9-cyber/yangliubin9-cyber.github.io',
  profileUrl: 'https://github.com/yangliubin9-cyber',
  email: 'yangliubin9-cyber@users.noreply.github.com',
  defaultOgImage: '/og-card.svg',
  giscus: {
    repo: 'yangliubin9-cyber/yangliubin9-cyber.github.io',
    repoId: '',
    category: 'General',
    categoryId: '',
    mapping: 'pathname',
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top'
  }
} as const;

export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export type NavKey = 'home' | 'blog' | 'about' | 'projects' | 'uses' | 'contact';

export const NAV_ITEMS: NavKey[] = ['home', 'blog', 'about', 'projects', 'uses', 'contact'];

export const PROFILE = {
  avatar: '/avatar-sponge.svg',
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
      theme: '切换明暗主题',
      language: '切换语言'
    },
    home: {
      eyebrow: 'YANG LIUBIN · JOURNAL',
      heroTitle: '让技术写作像产品一样被认真设计。',
      heroDescription:
        '这是一个双语个人博客系统，记录工程、设计、云计算、生活观察与长期主义。界面借鉴 Apple 的克制与 Linear 的秩序感，让内容成为真正的主角。',
      primary: '进入博客',
      secondary: '了解我',
      introTitle: '你好，我是杨刘彬 (Bin)',
      introBody:
        '我在全栈开发、设计表达与云计算运维之间穿梭，喜欢把复杂系统整理成清晰、耐看的体验。',
      latestTitle: '最新文章',
      latestDescription: '从工程实践到生活思考，每一篇文章都服务于“更高信噪比”的阅读体验。',
      spotlightTitle: '这不是模板博客，而是一个持续成长的个人操作系统。',
      spotlightItems: [
        '首页聚焦最新文章、头像与一句话简介，让访客在第一屏就认识你。',
        '博客列表支持本地静态搜索、分类和标签筛选，保持完全免费。',
        'About / Projects / Uses / Contact 让它更像一张可持续更新的个人名片。'
      ]
    },
    blog: {
      eyebrow: 'INDEX / SEARCH',
      title: '博客',
      description: '支持分类、标签和本地静态搜索，帮助读者快速定位文章。',
      searchPlaceholder: '搜索标题、摘要、标签或分类',
      searchLabel: '搜索',
      categoryLabel: '分类',
      tagLabel: '标签',
      allCategories: '全部分类',
      allTags: '全部标签',
      resultLabel: '篇文章',
      emptyTitle: '没有匹配的文章',
      emptyBody: '可以尝试清空搜索词，或切换分类 / 标签。'
    },
    about: {
      eyebrow: 'ABOUT / PROFILE',
      title: '关于我',
      description:
        '我希望把开发、设计和运维之间的经验，转化成更容易被理解和使用的数字产品。',
      sections: {
        background: '背景',
        skills: '技能',
        interests: '兴趣',
        contact: '联系方式'
      },
      background: [
        '全栈开发者，同时对界面设计和内容表达有很强兴趣。',
        '长期关注云计算、自动化运维、工程效率与产品体验。',
        '相信“讲清楚复杂系统”本身，就是一种重要能力。'
      ],
      skills: ['TypeScript / JavaScript', 'Astro / React / Node.js', 'Cloud Ops / Automation', 'Design systems', 'Technical writing'],
      interests: ['开发者工具', '个人知识系统', '静态网站', '可读性驱动的 UI 设计']
    },
    projects: {
      eyebrow: 'PROJECTS / WORK',
      title: '项目',
      description: '这里展示能代表你工程能力、设计判断和系统化思维的作品。',
      items: [
        {
          name: 'Yang’s Log',
          type: 'Personal Platform',
          description: '这个博客系统本身就是一个项目：双语、主题切换、静态搜索、评论系统与 GitHub Pages 自动部署。'
        },
        {
          name: 'Cloud Automation Toolkit',
          type: 'Ops / Internal Tools',
          description: '适合替换成你日常在云环境、运维自动化或脚本平台上的真实项目。'
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
      description: '开发者通常也喜欢看“你平时用什么工作”，这页会自然拉近距离。',
      groups: [
        {
          name: '软件',
          items: ['VS Code / Cursor 类编辑器', 'GitHub', 'Raycast / PowerToys', 'Chrome / Arc 类浏览器']
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
      description: '这是一个静态站点，所以我选择完全免费的联系方式：GitHub、邮箱和 Discussions。',
      items: [
        { label: 'GitHub', value: 'github.com/yangliubin9-cyber', href: 'https://github.com/yangliubin9-cyber' },
        { label: 'Email', value: 'yangliubin9-cyber@users.noreply.github.com', href: 'mailto:yangliubin9-cyber@users.noreply.github.com' },
        { label: 'Discussions', value: '在文章页评论区交流', href: 'https://github.com/yangliubin9-cyber/yangliubin9-cyber.github.io/discussions' }
      ]
    },
    post: {
      backToBlog: '返回博客',
      published: '发布于',
      updated: '更新于',
      category: '分类',
      tags: '标签',
      contents: '目录',
      related: '继续阅读',
      comments: '评论',
      commentsHint: '启用 GitHub Discussions 并填写 giscus 配置后，这里会自动出现评论区。'
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
      theme: 'Toggle light and dark theme',
      language: 'Switch language'
    },
    home: {
      eyebrow: 'YANG LIUBIN · JOURNAL',
      heroTitle: 'A personal blog designed with the same care as a product.',
      heroDescription:
        'This bilingual site covers engineering, design, cloud operations, and everyday thinking. The interface borrows restraint from Apple and structure from Linear so the writing stays in focus.',
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
        'The blog index offers free local search plus category and tag filtering.',
        'About / Projects / Uses / Contact turn the site into a complete public profile.'
      ]
    },
    blog: {
      eyebrow: 'INDEX / SEARCH',
      title: 'Blog',
      description: 'Browse posts with category filters, tag filters, and static local search.',
      searchPlaceholder: 'Search title, excerpt, tags, or category',
      searchLabel: 'Search',
      categoryLabel: 'Category',
      tagLabel: 'Tag',
      allCategories: 'All categories',
      allTags: 'All tags',
      resultLabel: 'posts',
      emptyTitle: 'No matching posts',
      emptyBody: 'Try clearing the query or switching the selected category or tag.'
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
          description: 'The blog itself is a project: bilingual routing, theme switching, static search, comments, and automated GitHub Pages deployment.'
        },
        {
          name: 'Cloud Automation Toolkit',
          type: 'Ops / Internal Tools',
          description: 'A great placeholder for your real cloud, scripting, automation, or operational tooling work.'
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
          items: ['VS Code / Cursor style editor', 'GitHub', 'Raycast / PowerToys', 'Chrome / Arc style browser']
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
      description: 'This is a static site, so I keep contact completely free: GitHub, email, and Discussions.',
      items: [
        { label: 'GitHub', value: 'github.com/yangliubin9-cyber', href: 'https://github.com/yangliubin9-cyber' },
        { label: 'Email', value: 'yangliubin9-cyber@users.noreply.github.com', href: 'mailto:yangliubin9-cyber@users.noreply.github.com' },
        { label: 'Discussions', value: 'Talk in the post comments area', href: 'https://github.com/yangliubin9-cyber/yangliubin9-cyber.github.io/discussions' }
      ]
    },
    post: {
      backToBlog: 'Back to blog',
      published: 'Published',
      updated: 'Updated',
      category: 'Category',
      tags: 'Tags',
      contents: 'Contents',
      related: 'Continue reading',
      comments: 'Comments',
      commentsHint: 'Enable GitHub Discussions and fill in the giscus configuration to activate comments here.'
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

export function getLanguagePaths(path = ''): Record<Locale, string> {
  return {
    zh: getLocalizedPath('zh', path),
    en: getLocalizedPath('en', path)
  };
}