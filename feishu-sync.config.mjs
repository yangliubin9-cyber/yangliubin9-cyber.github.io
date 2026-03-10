const feishuSyncConfig = {
  timezone: 'Asia/Shanghai',
  defaultCategory: 'Feishu Sync',
  defaultAccent: 'cyan',
  defaultHeroEyebrow: 'Feishu',
  defaultTags: ['Feishu'],
  sources: [
    // Example:
    // {
    //   enabled: true,
    //   url: 'https://your-team.feishu.cn/docx/XXXXXXXXXXXX',
    //   locale: 'zh',
    //   pathSlug: 'my-feishu-post',
    //   translationKey: 'my-feishu-post',
    //   category: 'Engineering Practice',
    //   tags: ['Feishu', 'Automation'],
    //   heroEyebrow: 'Feishu Sync',
    //   featured: false,
    //   publishedAt: '2026-03-10',
    //   title: 'Optional title override',
    //   excerpt: 'Optional excerpt override',
    //   documentToken: 'Optional when the URL itself is not a /docx/ link'
    // }
  ]
};

export default feishuSyncConfig;