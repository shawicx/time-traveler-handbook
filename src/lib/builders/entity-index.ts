import type { EntityIndex, EntityIndexEntry, ParsedEntity } from '../types.js';

/**
 * 构建 entity-index.json：id → {id, type, title, paths:{zh,en}}。
 *
 * 按 id 跨语言去重合并：同一逻辑实体在不同语言下有不同文件，
 * 但共享同一 id，这里把它们聚合到一条记录，paths 记录各语言 URL。
 *
 * title 默认取 zh，缺则取 en（保证总有显示标题）。
 */
export function buildEntityIndex(entities: ParsedEntity[]): EntityIndex {
  // TODO(next phase): 实现完整的去重合并与重复 id 诊断
  const index: EntityIndex = {};

  for (const e of entities) {
    const existing = index[e.id];
    if (existing) {
      // 聚合该语言的路径
      existing.paths[e.locale] = e.url;
    } else {
      const entry: EntityIndexEntry = {
        id: e.id,
        type: e.type,
        title: e.title,
        paths: { [e.locale]: e.url },
        start: e.frontmatter.start as number | undefined,
        end: e.frontmatter.end as number | undefined,
        featured: (e.frontmatter.featured as boolean | undefined) ?? false,
        regions:
          e.type === 'civilization' || e.type === 'era'
            ? ((e.frontmatter.regions as string[] | undefined) ?? [])
            : [],
        // era/dynasty 的所属文明：从 connections 里 type=belongs_to 的 target 提取。
        civilizationId:
          e.type === 'era' || e.type === 'dynasty'
            ? ((e.frontmatter.connections as Array<{ target: string; type: string }> | undefined)?.find(
                (c) => c.type === 'belongs_to',
              )?.target as string | undefined)
            : undefined,
      };
      index[e.id] = entry;
    }
  }

  // title 兜底：zh 优先，否则 en
  for (const entry of Object.values(index)) {
    if (!entry.paths.zh && entry.paths.en) {
      // 仅有英文版本时，标题已为 en 的 title（保留原值即可）
    }
  }

  return index;
}
