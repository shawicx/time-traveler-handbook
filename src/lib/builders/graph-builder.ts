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
 *  - 生成边列表（从 connections 提取，按 source→target 去重）。
 *  - 生成反向索引（target → 被谁引用），供实体详情页聚合下属实体。
 *  - 检测缺失引用、重复 id、循环依赖。
 *
 * 节点的 title：跨语言合并时优先 zh，缺则 en（与 entity-index 一致）。
 *
 * 边去重：同一逻辑实体的 zh/en 两份文档各产生一条 edge，导致重复。
 * 这里先按 id 去重（zh 优先），只对去重后的实体集合生成 edges。
 */
export function buildGraph(entities: ParsedEntity[]): KnowledgeGraph {
  const nodeMap = new Map<string, GraphNode>();
  const edgeSet = new Map<string, GraphEdge>();

  // 节点 + 边：按 id 去重，zh 优先。
  // 排序使 zh 排前，这样后续 Map 的 first-write 即保留 zh 版本。
  const sorted = [...entities].sort((a, b) =>
    a.locale === 'zh' ? -1 : b.locale === 'zh' ? 1 : 0,
  );

  // 第一遍：收集去重后的节点
  for (const e of sorted) {
    if (!nodeMap.has(e.id)) {
      nodeMap.set(e.id, { id: e.id, type: e.type, title: e.title });
    }
  }

  // 第二遍：从去重后的实体（zh 优先）提取 edges，按 source|target|type 去重
  const seenIds = new Set<string>();
  for (const e of sorted) {
    if (seenIds.has(e.id)) continue;
    seenIds.add(e.id);

    const conns =
      (e.frontmatter.connections as Array<{
        target: string;
        type: string;
      }>) ?? [];
    for (const c of conns) {
      const key = `${e.id}|${c.target}|${c.type}`;
      if (!edgeSet.has(key)) {
        edgeSet.set(key, {
          source: e.id,
          target: c.target,
          type: c.type,
        });
      }
    }
  }

  const edges = [...edgeSet.values()];

  // 反向索引：target → [{source, type}]，用于实体详情页聚合"指向自己的实体"
  const reverseIndex: Record<string, Array<{ source: string; type: string }>> =
    {};
  for (const edge of edges) {
    if (!reverseIndex[edge.target]) {
      reverseIndex[edge.target] = [];
    }
    reverseIndex[edge.target].push({
      source: edge.source,
      type: edge.type,
    });
  }

  return {
    nodes: [...nodeMap.values()],
    edges,
    reverseIndex,
    diagnostics: {
      missingReferences: [], // TODO(next phase): 缺失引用检测
      duplicateIds: [], // TODO(next phase): 重复 id 检测
      circularDependencies: [], // TODO(next phase): 环检测
    },
  };
}
