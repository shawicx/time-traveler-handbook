import { z } from 'astro/zod';
import { baseEntitySchema } from './common.js';

/**
 * 各具体实体类型的 schema。
 *
 * 在 baseEntitySchema 基础上按 type 追加专属字段。
 * 通过 discriminated union 按 `type` 字段做联合，实现"按类型校验专属字段"。
 *
 * 注意：technology 的 `dependencies`/`enables` 仍保留在 frontmatter 中，
 * 因为它们表达的是有向语义（A 依赖 B），与 `connections` 的通用无向语义不同。
 * 但 `enables`（A 使能 B）是 `dependencies`（B 依赖 A）的反向边，
 * 构建期会从 `dependencies` 反推 `enables`，因此 frontmatter 中只需写 `dependencies`。
 */

/** 人物：历史人物、发明家、统治者等。 */
export const personSchema = baseEntitySchema.extend({
  type: z.literal('person'),
  /** 出生年份（公元前为负）。 */
  birth: z.number().int().optional(),
  /** 逝世年份（公元前为负）。 */
  death: z.number().int().optional(),
  /** 所属国家/地区 id（指向 place 实体）。 */
  country: z.string().optional(),
  /** 所属朝代 id（指向 dynasty 实体）。 */
  dynasty: z.string().optional(),
});

/** 事件：历史事件、战争、革命等。 */
export const eventSchema = baseEntitySchema.extend({
  type: z.literal('event'),
  /** 发生地点 id（指向 place 实体）。 */
  location: z.string().optional(),
});

/** 地点：城市、地区、国家等。 */
export const placeSchema = baseEntitySchema.extend({
  type: z.literal('place'),
  /** 地理坐标 [纬度, 经度]，用于未来地图视图。 */
  coordinates: z
    .tuple([z.number(), z.number()])
    .optional()
    .describe('[纬度, 经度]'),
});

/** 朝代：历史朝代、王国等。 */
export const dynastySchema = baseEntitySchema.extend({
  type: z.literal('dynasty'),
  /** 所属国家 id。 */
  country: z.string().optional(),
});

/** 组织：机构、公司、学派等。 */
export const organizationSchema = baseEntitySchema.extend({
  type: z.literal('organization'),
  /** 总部地点 id（指向 place 实体）。 */
  headquarters: z.string().optional(),
});

/**
 * 技术：可被依赖、可被发明。
 *
 * `dependencies`/`enables` 表达有向的技术依赖关系（区别于通用 connections）。
 * 构建期约定：frontmatter 只写 `dependencies`（本技术依赖的前置技术 id），
 * `enables`（本技术使能了哪些后续技术）由构建期从其它技术的 dependencies 反推。
 */
export const technologySchema = baseEntitySchema.extend({
  type: z.literal('technology'),
  /** 本技术依赖的前置技术 id 列表。 */
  dependencies: z.array(z.string()).default([]),
  /**
   * 本技术使能的后续技术 id 列表。
   *
   * ⚠️ 通常无需手填：构建期会从其它技术的 dependencies 反推此字段。
   * 仅当依赖关系尚未在对方文档中体现时，可在此显式补充。
   */
  enables: z.array(z.string()).default([]),
  /** 发明者 id（指向 person 实体）。 */
  inventedBy: z.string().optional(),
});

/** 发明：具体发明物（区别于技术门类）。 */
export const inventionSchema = baseEntitySchema.extend({
  type: z.literal('invention'),
  /** 发明者 id（指向 person 实体）。 */
  inventor: z.string().optional(),
  /** 依赖的技术 id 列表。 */
  basedOn: z.array(z.string()).default([]),
});

/** 书籍：历史文献、著作。 */
export const bookSchema = baseEntitySchema.extend({
  type: z.literal('book'),
  /** 作者 id（指向 person 实体）。 */
  author: z.string().optional(),
});

/** 时间线：主题性时间线聚合（本身不参与图谱为节点，按需）。 */
export const timelineSchema = baseEntitySchema.extend({
  type: z.literal('timeline'),
  /** 时间线包含的实体 id 列表。 */
  entries: z.array(z.string()).default([]),
});

/**
 * 按 `type` 字段做 discriminated union。
 *
 * 校验时，Zod 会根据 frontmatter 的 `type` 值选择对应分支并校验专属字段。
 */
export const entitySchema = z.discriminatedUnion('type', [
  personSchema,
  eventSchema,
  placeSchema,
  dynastySchema,
  organizationSchema,
  technologySchema,
  inventionSchema,
  bookSchema,
  timelineSchema,
]);

/** 任意实体（所有具体实体类型的联合）。 */
export type Entity = z.infer<typeof entitySchema>;

/** 人物。 */
export type Person = z.infer<typeof personSchema>;
/** 事件。 */
export type Event = z.infer<typeof eventSchema>;
/** 地点。 */
export type Place = z.infer<typeof placeSchema>;
/** 朝代。 */
export type Dynasty = z.infer<typeof dynastySchema>;
/** 组织。 */
export type Organization = z.infer<typeof organizationSchema>;
/** 技术。 */
export type Technology = z.infer<typeof technologySchema>;
/** 发明。 */
export type Invention = z.infer<typeof inventionSchema>;
/** 书籍。 */
export type Book = z.infer<typeof bookSchema>;
/** 时间线。 */
export type Timeline = z.infer<typeof timelineSchema>;
