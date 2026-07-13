/**
 * 首页双语字符串字典。
 *
 * 约定：所有首页组件从此模块读取文案，不内联硬编码字符串，
 * 便于未来扩充语言或统一校对。locale 由 index.astro 推断后传入。
 */

export type HomeLocale = 'zh' | 'en';

/** 站点级常量（与 astro.config.mjs 保持一致）。 */
export const SITE = {
  title: '时空旅人手册',
  titleEn: 'Time Traveler Handbook',
  github: 'https://github.com/shawicx/time-traveler-handbook',
} as const;

/** 各 type 的双语显示名，对齐 src/lib/schemas/constants.ts 的 ENTITY_TYPES。 */
export const TYPE_LABELS: Record<HomeLocale, Record<string, string>> = {
  zh: {
    civilization: '文明',
    person: '人物',
    event: '事件',
    place: '地点',
    dynasty: '朝代',
    organization: '组织',
    technology: '技术',
    invention: '发明',
    book: '书籍',
    timeline: '时间线',
  },
  en: {
    civilization: 'Civilizations',
    person: 'People',
    event: 'Events',
    place: 'Places',
    dynasty: 'Dynasties',
    organization: 'Organizations',
    technology: 'Technologies',
    invention: 'Inventions',
    book: 'Books',
    timeline: 'Timelines',
  },
};

/** 首页 UI 文案。 */
export const STRINGS = {
  zh: {
    tagline: '面向时空旅人的开源知识库。',
    description:
      '探索文明、历史、技术与生存策略。以 Markdown 为唯一数据源，构建期生成知识图谱、时间轴与科技树。',
    explore: '探索知识库',
    viewGithub: '查看 GitHub',
    statsTitle: '项目统计',
    civilizationsTitle: '文明',
    civilizationsSubtitle: '从主要历史文明进入知识库。',
    empty: '内容正在建设中，敬请期待。',
    footerDocs: '文档',
    footerContributing: '贡献指南',
    footerLicense: '许可证',
    footerRoadmap: '路线图',
  },
  en: {
    tagline: 'An open-source knowledge base for time travelers.',
    description:
      'Explore civilizations, history, technologies, and survival strategies. Markdown is the single source of truth; the knowledge graph, timeline, and tech tree are generated at build time.',
    explore: 'Explore Knowledge',
    viewGithub: 'View GitHub',
    statsTitle: 'Project Statistics',
    civilizationsTitle: 'Civilizations',
    civilizationsSubtitle: 'Enter the knowledge base through major historical civilizations.',
    empty: 'Content is under construction. Stay tuned.',
    footerDocs: 'Documentation',
    footerContributing: 'Contributing',
    footerLicense: 'License',
    footerRoadmap: 'Roadmap',
  },
} as const;

export type HomeStrings = (typeof STRINGS)[HomeLocale];
