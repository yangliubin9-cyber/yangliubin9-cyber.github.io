export const siteMeta = {
  title: "Yang's Blogs",
  brand: 'MUZI',
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

export type Series = {
  slug: string;
  zhName: string;
  enName: string;
  zhDescription: string;
  enDescription: string;
};

export type Article = {
  slug: string;
  seriesSlug: string;
  featured: boolean;
  publishedAt: string;
  readingMinutes: number;
  zhTitle: string;
  enTitle: string;
  zhSummary: string;
  enSummary: string;
};

export const series: Series[] = [
  {
    slug: 'linux',
    zhName: 'Linux 新手入门',
    enName: 'Linux Basics',
    zhDescription: '从目录结构、权限和常用命令开始，打牢 Linux 基础。',
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
];

export const articles: Article[] = [
  {
    slug: 'linux-basic',
    seriesSlug: 'linux',
    featured: true,
    publishedAt: '2026-04-01',
    readingMinutes: 8,
    zhTitle: 'Linux 新手入门：文件、目录与常用命令',
    enTitle: 'Linux Basics: Files, Directories, and Common Commands',
    zhSummary: '用最短路径建立 Linux 基础心智模型，先把目录、路径和常用命令跑通。',
    enSummary: 'Build a practical mental model for Linux by mastering paths, directories, and daily commands first.'
  },
  {
    slug: 'docker-basic',
    seriesSlug: 'docker',
    featured: true,
    publishedAt: '2026-04-02',
    readingMinutes: 10,
    zhTitle: 'Docker 入门：安装、镜像与容器基础',
    enTitle: 'Docker Basics: Installation, Images, and Containers',
    zhSummary: '理解镜像与容器的边界，建立本地开发到交付的容器化基础。',
    enSummary: 'Understand the boundary between images and containers to support real delivery work.'
  },
  {
    slug: 'docker-deploy',
    seriesSlug: 'docker',
    featured: false,
    publishedAt: '2026-04-03',
    readingMinutes: 12,
    zhTitle: 'Docker 部署实践：从本地运行到服务发布',
    enTitle: 'Docker Deployment Practice: From Local Run to Service Release',
    zhSummary: '把本地运行、镜像发布与服务启动串成一条完整的部署链路。',
    enSummary: 'Connect local runtime, image publishing, and service startup into one release path.'
  },
  {
    slug: 'k8s',
    seriesSlug: 'k8s',
    featured: true,
    publishedAt: '2026-04-04',
    readingMinutes: 11,
    zhTitle: 'Kubernetes 集群部署入门',
    enTitle: 'Getting Started with Kubernetes Cluster Deployment',
    zhSummary: '从控制面、节点和网络出发，建立对 Kubernetes 集群的整体认识。',
    enSummary: 'Understand Kubernetes clusters by starting from the control plane, nodes, and networking.'
  },
  {
    slug: 'k8s-components',
    seriesSlug: 'k8s',
    featured: false,
    publishedAt: '2026-04-05',
    readingMinutes: 9,
    zhTitle: 'Kubernetes 常见组件与工作机制',
    enTitle: 'Kubernetes Core Components and How They Work',
    zhSummary: '把 apiserver、scheduler、controller-manager 和 kubelet 放回各自职责里理解。',
    enSummary: 'See how the apiserver, scheduler, controller manager, and kubelet fit together.'
  }
];

export function getSeriesName(locale: Locale, item: Series) {
  return locale === 'zh' ? item.zhName : item.enName;
}

export function getSeriesDescription(locale: Locale, item: Series) {
  return locale === 'zh' ? item.zhDescription : item.enDescription;
}

export function getArticleTitle(locale: Locale, item: Article) {
  return locale === 'zh' ? item.zhTitle : item.enTitle;
}

export function getArticleSummary(locale: Locale, item: Article) {
  return locale === 'zh' ? item.zhSummary : item.enSummary;
}

export function getArticlesBySeries(seriesSlug: string) {
  return articles.filter((item) => item.seriesSlug === seriesSlug);
}

export function getSeriesBySlug(slug: string) {
  return series.find((item) => item.slug === slug);
}
