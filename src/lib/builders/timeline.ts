import type { ParsedEntity, TimelineEntry } from '../types.js';

/**
 * 构建时间线：把带 start/end 的实体按时间排序。
 *
 * 仅包含定义了 start 或 end 的实体。跨语言合并：同一 id 只保留一条
 * （zh 优先），避免重复。按 start 升序排列（公元前为负，自然在前）。
 */
export function buildTimeline(entities: ParsedEntity[]): TimelineEntry[] {
  // TODO(next phase): 实现跨语言去重与更精确的时间排序（含仅 end 的情况）
  const seen = new Set<string>();
  const entries: TimelineEntry[] = [];

  const sorted = [...entities].sort((a, b) =>
    a.locale === 'zh' ? -1 : b.locale === 'zh' ? 1 : 0,
  );

  for (const e of sorted) {
    if (seen.has(e.id)) continue;
    const start = e.frontmatter.start as number | undefined;
    const end = e.frontmatter.end as number | undefined;
    if (start === undefined && end === undefined) continue;

    seen.add(e.id);
    entries.push({ id: e.id, type: e.type, title: e.title, start, end });
  }

  entries.sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  return entries;
}
