import matter from 'gray-matter';
import { glob } from 'glob';
import { resolve, relative } from 'node:path';
import { readFile } from 'node:fs/promises';
import {
  LOCALES,
  type Locale,
  type EntityType,
  directoryToType,
  KNOWLEDGE_ROOT,
  entityUrl,
  isEntityType,
} from '../schemas/index.js';
import { entitySchema } from '../schemas/index.js';
import type { ParsedEntity } from '../types.js';

/**
 * 从文件系统读取所有实体 Markdown 并解析 frontmatter。
 *
 * 这是 builders 的公共数据源：用 glob 扫描 src/content/docs 下的所有 md/mdx，
 * 用 gray-matter 解析 frontmatter，再用 Zod schema 校验，
 * 最终产出带来源信息的 ParsedEntity[] 供各 builder 消费。
 *
 * 本函数与 Astro 运行时解耦（不依赖 astro:content），可在构建脚本中独立调用。
 */

/** 内容文档根目录（相对仓库根）。 */
const DOCS_DIR = 'src/content/docs';

/**
 * 从文件路径推断语言。
 * 路径形如 src/content/docs/zh/knowledge/...，locale 段紧跟 docs/ 之后。
 */
function inferLocale(relPath: string): Locale | undefined {
  const parts = relPath.split('/');
  // src/content/docs/<locale>/...
  const afterDocs = parts.slice(3);
  const first = afterDocs[0];
  if (first && (LOCALES as readonly string[]).includes(first)) {
    return first as Locale;
  }
  return undefined;
}

/**
 * 从文件路径推断实体类型。
 * 路径形如 src/content/docs/zh/knowledge/<dir>/...，dir 段映射到 type。
 */
function inferType(relPath: string): EntityType | undefined {
  const parts = relPath.split('/');
  const afterDocs = parts.slice(3); // [locale, knowledge, dir, ...]
  const knowledgeIdx = afterDocs.indexOf(KNOWLEDGE_ROOT);
  if (knowledgeIdx === -1) return undefined;
  const dir = afterDocs[knowledgeIdx + 1];
  if (!dir) return undefined;
  const type = directoryToType[dir];
  return type && isEntityType(type) ? type : undefined;
}

/** 从路径提取实体 id（文件名，不含扩展名）。 */
function idFromPath(relPath: string): string {
  const base = relPath.split('/').pop() ?? '';
  return base.replace(/\.(md|mdx)$/, '');
}

export interface ReadEntitiesResult {
  /** 解析成功的实体。 */
  entities: ParsedEntity[];
  /** 解析/校验失败的文件及原因（构建期用于警告，不中断）。 */
  errors: Array<{ filePath: string; message: string }>;
}

/**
 * 读取并校验所有实体 Markdown。
 *
 * @param cwd 仓库根目录，默认 process.cwd()
 */
export async function readEntities(
  cwd: string = process.cwd(),
): Promise<ReadEntitiesResult> {
  const docsRoot = resolve(cwd, DOCS_DIR);
  const pattern = resolve(docsRoot, '**/*.{md,mdx}');

  // glob 返回绝对路径；忽略 index 文件（Starlight 章节首页，非实体）
  const files = (await glob(pattern)).filter(
    (f) => !/(^|\/)index\.(md|mdx)$/.test(f),
  );

  const entities: ParsedEntity[] = [];
  const errors: ReadEntitiesResult['errors'] = [];

  for (const absPath of files) {
    const relPath = relative(cwd, absPath);

    const locale = inferLocale(relPath);
    if (!locale) {
      // 非 locale 目录下的文件跳过（不当作实体）
      continue;
    }

    let parsed;
    try {
      const raw = await readFile(absPath, 'utf8');
      parsed = matter(raw);
    } catch (err) {
      errors.push({
        filePath: relPath,
        message: `读取失败: ${(err as Error).message}`,
      });
      continue;
    }

    const type = inferType(relPath) ?? (parsed.data.type as EntityType);
    const id = idFromPath(relPath);

    // 组装 frontmatter：补齐从路径推断的 id/type（防御性，避免漏填）
    const frontmatter = {
      ...parsed.data,
      id: (parsed.data.id as string) ?? id,
      type: type ?? parsed.data.type,
    };

    // Zod 校验
    const result = entitySchema.safeParse(frontmatter);
    if (!result.success) {
      errors.push({
        filePath: relPath,
        message: `schema 校验失败: ${result.error.issues
          .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
          .join('; ')}`,
      });
      continue;
    }

    const valid = result.data;
    // 文件名须等于 id
    if (id !== valid.id) {
      errors.push({
        filePath: relPath,
        message: `文件名 "${id}" 与 frontmatter id "${valid.id}" 不一致`,
      });
      continue;
    }

    entities.push({
      id: valid.id,
      type: valid.type,
      title: valid.title,
      locale,
      filePath: relPath,
      url: entityUrl(valid.type, locale, valid.id),
      frontmatter: valid as Record<string, unknown>,
    });
  }

  return { entities, errors };
}
