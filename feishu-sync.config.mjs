const feishuSyncConfig = {
  timezone: 'Asia/Shanghai',
  defaultCategory: '未分类',
  defaultAccent: 'cyan',
  defaultHeroEyebrow: 'Feishu',
  defaultTags: ['Feishu'],
  sources: [
    {
      enabled: true,
      kind: 'folder',
      url: 'https://my.feishu.cn/drive/folder/LXcvfNKDSlM3pfdPAlPcQQt7ncf',
      locale: 'zh',
      recursive: true,
      slugStrategy: 'title',
      categoryStrategy: 'top-folder',
      category: '未分类',
      tags: ['Feishu', 'Cloud Docs'],
      heroEyebrow: 'Feishu Folder',
      accent: 'cyan',
      featured: false
    }
    // You can still add single-doc sources here with kind: 'document'.
  ]
};

export default feishuSyncConfig;
