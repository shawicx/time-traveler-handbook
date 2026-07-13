/**
 * 构建产物类型契约。
 *
 * 本文件定义 graph.json / timeline.json / tech-tree.json / entity-index.json
 * 的 TypeScript 形状。builders 产出这些类型，前端与 wiki-link 插件消费它们。
 *
 * 这些类型与 schema（schemas/）的区别：
 * - schema：描述 frontmatter 输入（用 Zod 校验用户写的 Markdown）。
 * - types：描述构建产物输出（builder 处理后供前端使用的派生数据）。
 */
import type { EntityType, Locale } from './schemas/constants.js';

/** 实体索引中单个条目的路径信息（跨语言）。 */
export interface EntityPaths {
  /** 中文页面 URL，如 "/zh/knowledge/technologies/steam-engine"。 */
  zh?: string;
  /** 英文页面 URL。 */
  en?: string;
}

/**
 * entity-index.json 的单条记录。
 *
 * 按 id 去重后，把同一逻辑实体的各语言路径聚合到一起。
 * wiki-link 插件据此把 `[[id]]` 解析为对应语言的 URL。
 */
export interface EntityIndexEntry {
  /** 跨语言逻辑主键。 */
  id: string;
  /** 实体类型。 */
  type: EntityType;
  /** 显示标题（默认取 zh，缺则取 en）。 */
  title: string;
  /** 各语言页面路径。 */
  paths: EntityPaths;
  /**
   * 起始/结束年份（公元前为负）。
   *
   * 冗余存入索引，供首页文明卡片展示时间区间，避免前端再回查 frontmatter。
   * 大多数实体无年份（undefined），仅在 frontmatter 填写时存在。
   */
  start?: number;
  end?: number;
  /** 是否首页精选（来自 frontmatter featured，未标记则 false）。 */
  featured: boolean;
  /**
   * 文明区域标签（仅 type=civilization 有值）。
   *
   * 放在索引层而非独立 civilizations.json，是因为首页 Civilization Explorer
   * 的数据需求轻量（仅需 region 用于卡片展示），无需再开一条产物管线。
   * 其它实体类型此字段为空数组。
   */
  regions: string[];
}

/** entity-index.json 的完整形状：id → 条目。 */
export type EntityIndex = Record<string, EntityIndexEntry>;

/** 图谱节点。 */
export interface GraphNode {
  id: string;
  type: EntityType;
  title: string;
}

/** 图谱有向边。 */
export interface GraphEdge {
  /** 来源实体 id。 */
  source: string;
  /** 目标实体 id。 */
  target: string;
  /** 关系语义。 */
  type: string;
}

/**
 * 完整知识图谱。
 *
 * - nodes：所有实体节点（按 id 去重，跨语言合并）。
 * - edges：所有有向关系边（含从 connections、dependencies 等推导的边）。
 * - reverseIndex：被引用关系反查表 targetId → [{source, type}]，供"反向链接"展示。
 * - diagnostics：构建期检测到的问题（缺失引用 / 重复 id / 环）。
 */
export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** 反向索引：被哪些实体引用。 */
  reverseIndex: Record<string, Array<{ source: string; type: string }>>;
  /** 构建诊断信息。 */
  diagnostics: GraphDiagnostics;
}

/** 图谱构建诊断。 */
export interface GraphDiagnostics {
  /** 引用了不存在的实体 id。 */
  missingReferences: Array<{ from: string; target: string }>;
  /** 重复的实体 id（不同文件使用了相同 id）。 */
  duplicateIds: string[];
  /** 检测到的循环依赖（主要针对 technology 的 dependencies）。 */
  circularDependencies: string[][];
}

/** timeline.json 的单条记录。 */
export interface TimelineEntry {
  id: string;
  type: EntityType;
  title: string;
  /** 起始年份（公元前为负）。 */
  start?: number;
  /** 结束年份（公元前为负）。 */
  end?: number;
}

/** tech-tree.json 的单个技术节点。 */
export interface TechTreeNode {
  id: string;
  title: string;
  /** 前置技术 id（构建期从该技术的 dependencies 提取）。 */
  dependencies: string[];
  /** 后续技术 id（构建期从其它技术的 dependencies 反推）。 */
  enables: string[];
}

/**
 * 解析后的单个实体（builder 中间数据，非构建产物）。
 *
 * reader 从文件系统读取 Markdown 后产出此结构，供各 builder 消费。
 * 携带文件来源信息（locale、路径），便于构建跨语言索引与诊断定位。
 */
export interface ParsedEntity {
  /** 实体 id（来自 frontmatter，须等于文件名）。 */
  id: string;
  /** 实体类型。 */
  type: EntityType;
  /** 标题。 */
  title: string;
  /** 所属语言。 */
  locale: Locale;
  /** 源文件相对仓库根的路径。 */
  filePath: string;
  /** 页面 URL（按 locale/type/id 生成）。 */
  url: string;
  /** 原始 frontmatter（已校验，类型放宽以便各 builder 按需取字段）。 */
  frontmatter: Record<string, unknown>;
}
