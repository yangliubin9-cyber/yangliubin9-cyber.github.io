export const SITE = {
  name: 'Yang Liubin',
  origin: 'https://yangliubin9-cyber.github.io',
  repositoryUrl: 'https://github.com/yangliubin9-cyber/yangliubin9-cyber.github.io',
  profileUrl: 'https://github.com/yangliubin9-cyber'
};

export const LOCALES = ['zh', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

const dictionaries = {
  zh: {
    meta: {
      title: 'Yang Liubin',
      tag: '个人博客',
      description: '一个关于工程、设计、写作与个人系统的双语博客。'
    },
    nav: {
      home: '首页',
      essays: '文章',
      manifesto: '设计观',
      system: '系统',
      theme: '切换明暗主题',
      language: '切换语言'
    },
    hero: {
      eyebrow: 'PERSONAL OPERATING SYSTEM',
      title: '把复杂问题，写成更清晰的系统。',
      description:
        '这里是我的个人博客。它聚焦工程、设计、写作与思考方式，并用尽量克制、安静、但仍有科技感的界面来承载内容。',
      primary: '阅读文章',
      secondary: '查看设计观'
    },
    stats: [
      { value: '2', label: '语言维度' },
      { value: '100%', label: '免费技术栈' },
      { value: 'Static', label: 'GitHub Pages 发布' }
    ],
    principles: {
      eyebrow: 'Design Principles',
      title: '设计上，我更在意“秩序感”和“可呼吸的留白”。',
      items: [
        {
          title: '信息先于装饰',
          description: '视觉元素服务于阅读节奏，而不是喧宾夺主。'
        },
        {
          title: '科技感来自结构',
          description: '通过网格、比例、字体和层次制造精密感，而不是堆叠噱头。'
        },
        {
          title: '切换必须自然',
          description: '中英文与明暗主题都需要在同一套系统下看起来完整。'
        }
      ]
    },
    essays: {
      eyebrow: 'Latest Writings',
      title: '最近文章',
      description: '我希望每一篇文章都像一个可迭代的小系统，而不是一次性输出。',
      more: '阅读全文'
    },
    manifesto: {
      eyebrow: 'Manifesto',
      title: '我希望技术产品看起来冷静、精准，但不冷漠。',
      description:
        '好的个人博客不应该只是文章堆叠页，它也应该像一件被认真打磨过的数字作品。界面退后，观点向前，但每个细节都能支撑这种克制。',
      items: [
        '内容组织采用双语静态路由，利于长期维护和检索。',
        '主题切换保留相同的空间结构，避免亮暗模式像两个不同网站。',
        '所有实现均基于免费的开源能力，不绑定任何付费 SaaS。'
      ]
    },
    system: {
      eyebrow: 'Free Stack',
      title: '完全免费的博客基础设施',
      items: [
        'Astro 负责静态生成，保证加载速度和内容体验。',
        'MDX 负责写作内容，让文章既能写文字也能插入组件。',
        'GitHub Actions 自动构建并部署到 GitHub Pages。'
      ]
    },
    article: {
      back: '返回首页',
      published: '发布于',
      updated: '更新于',
      contents: '目录',
      related: '继续阅读',
      viewAll: '查看全部文章'
    },
    footer: {
      title: 'Write systems. Shape clarity.',
      description: '用代码、文字与设计，把复杂感整理成可阅读的秩序。'
    }
  },
  en: {
    meta: {
      title: 'Yang Liubin',
      tag: 'Personal Blog',
      description: 'A bilingual blog about engineering, design, writing, and personal systems.'
    },
    nav: {
      home: 'Home',
      essays: 'Essays',
      manifesto: 'Manifesto',
      system: 'System',
      theme: 'Toggle light and dark theme',
      language: 'Switch language'
    },
    hero: {
      eyebrow: 'PERSONAL OPERATING SYSTEM',
      title: 'Turning complex work into readable systems.',
      description:
        'This is my personal blog about engineering, design, writing, and the way I think. The interface stays calm and minimal so the ideas can carry the weight.',
      primary: 'Read the essays',
      secondary: 'See the manifesto'
    },
    stats: [
      { value: '2', label: 'language layers' },
      { value: '100%', label: 'free stack' },
      { value: 'Static', label: 'published via GitHub Pages' }
    ],
    principles: {
      eyebrow: 'Design Principles',
      title: 'I care about order, restraint, and enough room for content to breathe.',
      items: [
        {
          title: 'Information before ornament',
          description: 'Visual treatment should support reading rhythm, not compete with it.'
        },
        {
          title: 'Tech feel through structure',
          description: 'Precision comes from typography, spacing, and grids more than decoration.'
        },
        {
          title: 'Switches should feel native',
          description: 'Language and theme changes should still feel like the same product.'
        }
      ]
    },
    essays: {
      eyebrow: 'Latest Writings',
      title: 'Recent essays',
      description: 'Each piece is meant to behave like a small system that can evolve over time.',
      more: 'Read essay'
    },
    manifesto: {
      eyebrow: 'Manifesto',
      title: 'I want technology to feel precise and calm, not loud.',
      description:
        'A personal blog should be more than a stack of posts. It can feel like a carefully tuned digital object where the interface steps back, but every detail still carries intention.',
      items: [
        'Bilingual static routes make the site easy to maintain and easy to index.',
        'The same spatial system is preserved across light and dark mode.',
        'Every part of the stack is built on free and open tooling.'
      ]
    },
    system: {
      eyebrow: 'Free Stack',
      title: 'A fully free publishing setup',
      items: [
        'Astro handles static generation for speed and long-term maintainability.',
        'MDX powers the writing layer so posts can mix text and components.',
        'GitHub Actions deploys the site directly to GitHub Pages.'
      ]
    },
    article: {
      back: 'Back to home',
      published: 'Published',
      updated: 'Updated',
      contents: 'Contents',
      related: 'Continue reading',
      viewAll: 'View all essays'
    },
    footer: {
      title: 'Write systems. Shape clarity.',
      description: 'Using code, writing, and design to turn complexity into a clearer surface.'
    }
  }
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getOtherLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'en' : 'zh';
}

export function getHomePath(locale: Locale): string {
  return `/${locale}/`;
}

export function getPostPath(locale: Locale, slug: string): string {
  return `/${locale}/blog/${slug}/`;
}

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
