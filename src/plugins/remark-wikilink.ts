import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'unified';
import type { Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';
import type { EntityIndex, EntityIndexEntry } from '../lib/types.js';

/**
 * remark-wikilink —— 把 Obsidian 风格的 wiki 链接解析为标准 mdast link 节点。
 *
 * 支持：
 *   [[steam-engine]]        → <a href="/zh/knowledge/technologies/steam-engine">蒸汽机</a>
 *   [[qin-shi-huang|秦始皇]] → 显示别名，链接仍指向实体
 *
 * 数据来源：构建管线生成的 src/data/generated/entity-index.json
 * （由 `pnpm gen` / prebuild 产出）。
 *
 * 语言路由：根据当前文档所属 locale 选择对应语言的 URL；
 *           该语言缺失时回退到 zh，再回退到 en。
 *
 * 当前状态：注册到位、类型正确、未命中时保留原文不破坏构建。
 *   节点遍历逻辑的完整实现（别名处理、locale 感知、回退）在下一阶段完成。
 *   本 stub 已能正确加载 entity-index 并跳过无文本节点的文档，构建安全。
 */

/** entity-index.json 的路径（相对仓库根）。 */
const ENTITY_INDEX_PATH = 'src/data/generated/entity-index.json';

/** wiki 链接正则：[[id]] 或 [[id|别名]]。 */
const WIKI_LINK_REGEX = /\[\[([^\]\|#]+)(?:\|([^\]]+))?\]\]/g;

/**
 * entity-index 缓存（基于文件 mtime 失效）。
 *
 * 为什么不用永久缓存：dev server 是长生命周期进程，`pnpm gen` 会更新
 * entity-index.json；若缓存不失效，dev 启动时读到的旧/空索引会一直用下去，
 * 导致 wiki-link 不解析（build 不受影响——每次 build 都是全新进程）。
 * 用 mtime 做失效条件，既避免每个文档重复读盘解析，又能感知 gen 产物更新。
 */
interface IndexCache {
  mtime: number;
  data: EntityIndex;
}
let cachedIndex: IndexCache | null = null;

/** 读取（并按 mtime 失效缓存）entity-index。文件不存在时返回空索引（构建期首跑容错）。 */
function loadEntityIndex(cwd = process.cwd()): EntityIndex {
  const filePath = resolve(cwd, ENTITY_INDEX_PATH);
  let mtime: number;
  try {
    mtime = statSync(filePath).mtimeMs;
  } catch {
    // 文件不存在：清空缓存，返回空索引（首次 gen 前运行 dev 的容错）
    cachedIndex = null;
    return {};
  }
  if (cachedIndex && cachedIndex.mtime === mtime) {
    return cachedIndex.data;
  }
  try {
    const raw = readFileSync(filePath, 'utf8');
    cachedIndex = { mtime, data: JSON.parse(raw) as EntityIndex };
    return cachedIndex.data;
  } catch {
    cachedIndex = null;
    return {};
  }
}

/** 选择实体在指定语言下的 URL，缺失时回退 zh→en。 */
function resolveUrl(
  entry: EntityIndexEntry,
  locale: 'zh' | 'en',
): string | undefined {
  return entry.paths[locale] ?? entry.paths.zh ?? entry.paths.en;
}

export interface RemarkWikilinkOptions {
  /** 当前语言（默认从文档路径推断）。 */
  locale?: 'zh' | 'en';
}

const remarkWikilink: Plugin<[RemarkWikilinkOptions?], Root> = (options) => {
  const defaultLocale = options?.locale;
  return (tree, file) => {
    const index = loadEntityIndex();
    if (Object.keys(index).length === 0) return; // 无索引，跳过

    // 从文件路径推断 locale（src/content/docs/<locale>/...）
    let locale = defaultLocale;
    if (!locale && file.path) {
      const m = file.path.match(/src[\/\\]content[\/\\]docs[\/\\](zh|en)/);
      if (m) locale = m[1] as 'zh' | 'en';
    }
    const loc: 'zh' | 'en' = locale ?? 'zh';

    // TODO(next phase): 完整实现节点遍历与替换
    // 当前为占位：扫描 text 节点中的 [[...]] 标记，命中即替换；
    // 未命中或无别名时保留原文，确保不破坏构建。
    visit(tree, 'text', (node: Text, i, parent) => {
      if (!parent || typeof i !== 'number') return;
      const text = node.value;
      if (!text.includes('[[')) return;

      const segments: Array<Text | import('mdast').Link> = [];
      let last = 0;
      let match: RegExpExecArray | null;
      WIKI_LINK_REGEX.lastIndex = 0;

      while ((match = WIKI_LINK_REGEX.exec(text)) !== null) {
        const [whole, rawId, alias] = match;
        const id = rawId.trim();
        const entry = index[id];

        // 命中前的前置文本
        if (match.index > last) {
          segments.push({ type: 'text', value: text.slice(last, match.index) });
        }

        if (entry) {
          const url = resolveUrl(entry, loc);
          const label = (alias?.trim() || entry.title) ?? id;
          segments.push({
            type: 'link',
            url: url ?? `#${id}`,
            title: null,
            children: [{ type: 'text', value: label }],
          });
        } else {
          // 未命中：保留原文（便于作者发现坏链）
          segments.push({ type: 'text', value: whole });
        }

        last = match.index + whole.length;
      }

      // 末尾剩余文本
      if (last < text.length) {
        segments.push({ type: 'text', value: text.slice(last) });
      }

      // 仅当确实发生替换时才改写 children
      if (segments.length > 0 && segments.length !== 1) {
        parent.children.splice(i, 1, ...segments);
      }
    });
  };
};

export default remarkWikilink;
