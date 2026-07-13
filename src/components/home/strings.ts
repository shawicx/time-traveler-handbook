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
    era: '时期',
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
    era: 'Eras',
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
    tagline: '穿越之前，先了解你的目的地。',
    description:
      '选择一个时代——唐朝、罗马共和国、中世纪——查看那个时期的组织、技术、经济与生存策略。以 Markdown 为唯一数据源，构建期生成知识图谱、时间轴与科技树。',
    explore: '浏览知识库',
    viewGithub: '查看 GitHub',
    statsTitle: '项目统计',
    destinationsTitle: '时空目的地',
    destinationsSubtitle: '选择你要穿越到的时代，按文明分组。',
    otherGroup: '其它时期',
    empty: '内容正在建设中，敬请期待。',
    footerDocs: '文档',
    footerContributing: '贡献指南',
    footerLicense: '许可证',
    footerRoadmap: '路线图',
  },
  en: {
    tagline: 'Know your destination before you arrive.',
    description:
      'Pick an era — Tang Dynasty, Roman Republic, the Middle Ages — and explore the organizations, technologies, economy, and survival strategies of that time. Markdown is the single source of truth; the knowledge graph, timeline, and tech tree are generated at build time.',
    explore: 'Browse Knowledge',
    viewGithub: 'View GitHub',
    statsTitle: 'Project Statistics',
    destinationsTitle: 'Time-Space Destinations',
    destinationsSubtitle: 'Choose an era to travel to, grouped by civilization.',
    otherGroup: 'Other Eras',
    empty: 'Content is under construction. Stay tuned.',
    footerDocs: 'Documentation',
    footerContributing: 'Contributing',
    footerLicense: 'License',
    footerRoadmap: 'Roadmap',
  },
} as const;

export type HomeStrings = (typeof STRINGS)[HomeLocale];
