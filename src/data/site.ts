export const siteMeta = {
  title: "Yang's Blogs",
  brand: 'MUZI',
  url: 'https://yangliubin9-cyber.github.io',
  socialImage: '/social-card.svg',
  author: {
    name: 'Yang Liubin',
    github: 'https://github.com/yangliubin9-cyber'
  },
  repositories: {
    site: 'https://github.com/yangliubin9-cyber/yangliubin9-cyber.github.io',
    comments: 'https://github.com/yangliubin9-cyber/Blogs-Comment'
  },
  description: {
    zh: '记录 AI 基础设施、MLOps、Kubernetes、Docker 与工程实践的双语技术博客。',
    en: 'A bilingual engineering blog about AI infrastructure, MLOps, Kubernetes, Docker, and practical delivery.'
  }
};

export const commentsConfig = {
  provider: 'utterances',
  repo: 'yangliubin9-cyber/Blogs-Comment',
  issueTermPrefix: 'blog-post'
} as const;

export const defaultLocale = 'zh';
export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

export const seriesSlugs = ['linux', 'docker', 'k8s', 'services'] as const;
export type SeriesSlug = (typeof seriesSlugs)[number];
export const homeFeaturedSeriesSlugs = ['linux', 'docker', 'k8s'] as const satisfies readonly SeriesSlug[];
const homeFeaturedSeriesSlugSet = new Set<SeriesSlug>(homeFeaturedSeriesSlugs);

export type Series = {
  slug: SeriesSlug;
  zhName: string;
  enName: string;
  zhDescription: string;
  enDescription: string;
};

export const series: Series[] = [
  {
    slug: 'linux',
    zhName: 'Linux 新手入门',
    enName: 'Linux Basics',
    zhDescription: '从目录结构、权限和常用命令开始，把 Linux 基础打牢。',
    enDescription: 'Start from files, permissions, and shell habits to build strong Linux fundamentals.'
  },
  {
    slug: 'docker',
    zhName: 'Docker 部署与使用',
    enName: 'Docker Deployment',
    zhDescription: '从镜像、容器到服务发布，搭起容器化交付的主线。',
    enDescription: 'Move from images and containers to real service release workflows.'
  },
  {
    slug: 'k8s',
    zhName: 'Kubernetes 集群部署',
    enName: 'Kubernetes Cluster',
    zhDescription: '聚焦集群搭建、核心组件和云原生运维实践。',
    enDescription: 'Focus on cluster setup, core components, and production-oriented cloud native practice.'
  }
  ,
  {
    slug: 'services',
    zhName: '服务搭建',
    enName: 'Service Setup',
    zhDescription: '围绕常见基础服务的单机、集群与可用性部署，沉淀更贴近真实环境的搭建笔记。',
    enDescription:
      'Deployment notes for practical infrastructure services, from single-node setup to cluster-oriented rollout.'
  }
];

export function getSeriesName(locale: Locale, item: Series) {
  return locale === 'zh' ? item.zhName : item.enName;
}

export function isHomeFeaturedSeries(slug: SeriesSlug) {
  return homeFeaturedSeriesSlugSet.has(slug);
}

export function getSeriesDescription(locale: Locale, item: Series) {
  return locale === 'zh' ? item.zhDescription : item.enDescription;
}

export function getSeriesBySlug(slug: string) {
  return series.find((item) => item.slug === slug);
}
