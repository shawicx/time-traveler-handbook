import type { ParsedEntity, TechTreeNode } from '../types.js';

/**
 * 构建科技树：技术实体之间的依赖关系。
 *
 * 职责：
 *  - 从每个 technology 的 frontmatter 提取 dependencies（本技术依赖谁）。
 *  - 反推 enables：若 A.dependencies 含 B，则 B.enables 含 A。
 *  - 跨语言去重（同一 id 只保留一条，zh 优先）。
 *
 * 设计要点：frontmatter 只需写 dependencies，enables 完全由构建期反推，
 * 避免手填双向关系导致的不一致。
 */
export function buildTechTree(entities: ParsedEntity[]): TechTreeNode[] {
  // TODO(next phase): 实现完整的 enables 反推与环检测联动
  const techs = entities.filter((e) => e.type === 'technology');

  const seen = new Set<string>();
  const nodes: TechTreeNode[] = [];

  const sorted = [...techs].sort((a, b) =>
    a.locale === 'zh' ? -1 : b.locale === 'zh' ? 1 : 0,
  );

  for (const e of sorted) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    const deps = (e.frontmatter.dependencies as string[]) ?? [];
    nodes.push({ id: e.id, title: e.title, dependencies: deps, enables: [] });
  }

  // 反推 enables：A.dependencies 含 B → B.enables += A
  const idToNode = new Map(nodes.map((n) => [n.id, n]));
  for (const node of nodes) {
    for (const dep of node.dependencies) {
      const target = idToNode.get(dep);
      if (target && !target.enables.includes(node.id)) {
        target.enables.push(node.id);
      }
    }
  }

  return nodes;
}
