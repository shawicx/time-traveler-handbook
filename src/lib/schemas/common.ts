import { z } from 'astro/zod';
import { ENTITY_TYPES, type EntityType } from './constants.js';

/**
 * 通用实体 schema —— 所有实体类型共享的字段。
 *
 * 设计决策：
 * - `id` 为跨语言逻辑主键，全局唯一、不可变、用作文件名。
 * - `title` 为当前语言下的标题字符串（每种语言各自维护，不再用 {zh,en} 双写）。
 * - `start`/`end` 支持负数（公元前，如秦始皇 birth=-259）。
 * - 关系统一通过 `connections` 表达；enables 等反向边由构建期反推，不在此手填。
 */

/** 一条实体间连接：target 是另一个实体的 id，type 描述关系语义。 */
export const connectionSchema = z.object({
  target: z
    .string()
    .min(1)
    .describe('目标实体的全局唯一 id'),
  type: z
    .string()
    .min(1)
    .describe('关系语义，例如 invented_by / ruler_of / participant'),
  label: z
    .string()
    .optional()
    .describe('可选的人类可读关系标签，用于图谱展示'),
});

export type Connection = z.infer<typeof connectionSchema>;

/** 年份字段：整数，可为负（公元前）。 */
const yearField = z
  .number()
  .int()
  .describe('年份，公元前用负数（如 -259 表示公元前 259 年）');

/**
 * 所有实体共有的基础字段。
 *
 * 各具体实体 schema 在此基础上用 `.extend(...)` 追加专属字段。
 */
export const baseEntitySchema = z.object({
  /** 跨语言逻辑主键，全局唯一、不可变，必须等于文件名（不含扩展名）。 */
  id: z.string().min(1),

  /** 实体类型，决定归类与 URL。 */
  type: z.enum(ENTITY_TYPES),

  /** 当前语言下的标题。 */
  title: z.string().min(1),

  /** 别名列表，用于搜索与消歧。 */
  aliases: z.array(z.string()).default([]),

  /** 标签列表。 */
  tags: z.array(z.string()).default([]),

  /** 概述。 */
  summary: z.string().optional(),

  /**
   * 是否在首页展示为精选实体。
   *
   * 这是首页 Featured Entities / Featured Guides 的唯一筛选开关：
   * 构建期无需额外脚本，前端按 `featured === true` 过滤即可。
   * 不填（undefined）即不精选，向后兼容已有文档。
   */
  featured: z.boolean().optional(),

  /** 起始年份（公元前为负）。 */
  start: yearField.optional(),

  /** 结束年份（公元前为负）。 */
  end: yearField.optional(),

  /**
   * 实体间连接列表。
   *
   * 这是表达关系的唯一渠道；`enables` 等反向边由构建期从正向边反推生成，
   * 不应在 frontmatter 中重复填写。
   */
  connections: z.array(connectionSchema).default([]),

  /** 参考来源列表（URL 或引用标识）。 */
  sources: z.array(z.string()).default([]),
});

/** 基础实体的 TS 类型（不含具体实体追加的字段）。 */
export type BaseEntity = z.infer<typeof baseEntitySchema>;

/** 类型守卫：判断字符串是否为受支持的实体类型。 */
export function isEntityType(value: string): value is EntityType {
  return (ENTITY_TYPES as readonly string[]).includes(value);
}
