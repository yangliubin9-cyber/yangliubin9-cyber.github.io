const feishuSyncConfig = {
  timezone: 'Asia/Shanghai',
  defaultCategory: 'Feishu Sync',
  defaultAccent: 'cyan',
  defaultHeroEyebrow: 'Feishu',
  defaultTags: ['Feishu'],
  sources: [
    {
      enabled: true,
      kind: 'folder',
      url: 'https://my.feishu.cn/drive/folder/IfgPfdnzdlNvAQdXwgncHtVRnP0',
      locale: 'zh',
      recursive: true,
      slugStrategy: 'title',
      category: 'Feishu Sync',
      tags: ['Feishu', 'Cloud Docs'],
      heroEyebrow: 'Feishu Folder',
      accent: 'cyan',
      featured: false
    }
    // You can still add single-doc sources here with kind: 'document'.
  ]
};

export default feishuSyncConfig;