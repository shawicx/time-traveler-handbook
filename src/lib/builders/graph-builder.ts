import type {
  GraphEdge,
  GraphNode,
  KnowledgeGraph,
  ParsedEntity,
} from '../types.js';

/**
 * 构建知识图谱：nodes + edges + reverseIndex + diagnostics。
 *
 * 职责（按设计文档 Graph Builder Responsibilities）：
 *  - 生成节点列表（按 id 去重，跨语言合并）。
 *  - 生成边列表（从 connections / dependencies / enables 等推导）。
 *  - 生成反向索引（target → 被谁引用）。
 *  - 检测缺失引用、重复 id、循环依赖。
 *
 * 节点的 title：跨语言合并时优先 zh，缺则 en（与 entity-index 一致）。
 */
export function buildGraph(entities: ParsedEntity[]): KnowledgeGraph {
  // TODO(next phase): 实现完整的边推导、反向索引与三项检测
  const nodeMap = new Map<string, GraphNode>();

  // 节点：按 id 去重，zh 标题优先
  // zh 在前：为简化，先按 locale 排序使 zh 优先覆盖
  const sorted = [...entities].sort((a, b) =>
    a.locale === 'zh' ? -1 : b.locale === 'zh' ? 1 : 0,
  );
  for (const e of sorted) {
    if (!nodeMap.has(e.id)) {
      nodeMap.set(e.id, { id: e.id, type: e.type, title: e.title });
    }
  }

  // 边：从 connections 提取（source = 文档所在实体）
  const edges: GraphEdge[] = [];
  for (const e of entities) {
    const conns = (e.frontmatter.connections as Array<{
      target: string;
      type: string;
    }>) ?? [];
    for (const c of conns) {
      edges.push({ source: e.id, target: c.target, type: c.type });
    }
  }

  return {
    nodes: [...nodeMap.values()],
    edges,
    reverseIndex: {}, // TODO(next phase): 反向索引
    diagnostics: {
      missingReferences: [], // TODO(next phase): 缺失引用检测
      duplicateIds: [], // TODO(next phase): 重复 id 检测
      circularDependencies: [], // TODO(next phase): 环检测
    },
  };
}
