/**
 * 实体类型与目录映射 —— 全局唯一真源（single source of truth）。
 *
 * wiki-link 解析、entity-index 路径生成、sidebar 自动生成、frontmatter 校验
 * 全部引用本文件，确保 `type → 目录名 → URL` 三者始终一致。
 *
 * 修改这里的映射，等于修改全站的 URL 结构。
 */

/**
 * 所有受支持的实体类型。
 *
 * 对应 frontmatter 里的 `type` 字段，决定实体归类与 URL 路径。
 */
export const ENTITY_TYPES = [
  'person',
  'event',
  'place',
  'dynasty',
  'organization',
  'technology',
  'invention',
  'book',
  'timeline',
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

/**
 * 受支持的内容分类：实体类 + 指南。
 *
 * 指南（guide）不是实体，没有图谱节点，但同样需要目录映射。
 */
export const CATEGORY_TYPES = [...ENTITY_TYPES, 'guide'] as const;

export type CategoryType = (typeof CATEGORY_TYPES)[number];

/**
 * type → 目录名 映射表。
 *
 * 规则：复数形式（person→people, technology→technologies, dynasty→dynasties）。
 * 这是 URL `/zh/knowledge/<dir>/<id>` 与文件路径的唯一来源。
 *
 * 例如：type=technology → 目录 technologies → URL /zh/knowledge/technologies/steam-engine
 */
export const typeToDirectory: Readonly<Record<CategoryType, string>> = {
  person: 'people',
  event: 'events',
  place: 'places',
  dynasty: 'dynasties',
  organization: 'organizations',
  technology: 'technologies',
  invention: 'inventions',
  book: 'books',
  timeline: 'timelines',
  guide: 'guides',
};

/** 反向映射：目录名 → type。用于从文件路径反推实体类型。 */
export const directoryToType: Readonly<Record<string, CategoryType>> =
  Object.fromEntries(
    Object.entries(typeToDirectory).map(([type, dir]) => [dir, type]),
  ) as Readonly<Record<string, CategoryType>>;

/**
 * 受支持的语言。
 *
 * 与 Starlight 的 locales 配置保持一致；每个语言一个内容目录与 URL 前缀。
 */
export const LOCALES = ['zh', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * 知识库内容根目录名（在 locale 目录下）。
 *
 * 指南（guides）与知识库（knowledge）平级，二者位于 locale 目录之下。
 */
export const KNOWLEDGE_ROOT = 'knowledge';

/**
 * 根据实体类型生成相对路径段（不含 locale 前缀，不含 id）。
 * 例如 type=technology → "knowledge/technologies"
 */
export function categoryPath(type: EntityType): string {
  return `${KNOWLEDGE_ROOT}/${typeToDirectory[type]}`;
}

/**
 * 生成实体的完整 URL 路径。
 * 例如 (technology, 'zh', 'steam-engine') → "/zh/knowledge/technologies/steam-engine"
 */
export function entityUrl(type: EntityType, locale: Locale, id: string): string {
  return `/${locale}/${categoryPath(type)}/${id}`;
}
