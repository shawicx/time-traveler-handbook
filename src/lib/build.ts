import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readEntities } from './builders/reader.js';
import { buildEntityIndex } from './builders/entity-index.js';
import { buildGraph } from './builders/graph-builder.js';
import { buildTimeline } from './builders/timeline.js';
import { buildTechTree } from './builders/tech-tree.js';

/**
 * 构建管线编排：把 Markdown 加工成结构化产物 JSON。
 *
 * 流水线（对应设计文档 Build Pipeline）：
 *   Markdown
 *     → readEntities (glob + gray-matter + Zod)
 *     → buildEntityIndex  → entity-index.json
 *     → buildGraph        → graph.json
 *     → buildTimeline     → timeline.json
 *     → buildTechTree     → tech-tree.json
 *
 * 产物写入 src/data/generated/，供 wiki-link 插件（构建期）与
 * 前端组件（运行期 import）消费。该目录被 gitignore，始终由构建生成。
 *
 * 错误处理：读取/校验错误以 console.warn 输出，不中断构建
 * （允许站点在有少量坏文档时仍能产出，便于内容逐步完善）。
 */

/** 生成产物的目标目录（相对仓库根）。 */
export const GENERATED_DIR = 'src/data/generated';

interface GenerateAllOptions {
  /** 仓库根目录，默认 process.cwd()。 */
  cwd?: string;
  /** 是否静默（不打印进度/警告），默认 false。 */
  silent?: boolean;
}

export interface GenerateAllResult {
  entityCount: number;
  errorCount: number;
  outputs: string[];
}

/** 写 JSON 产物（确保目录存在）。 */
async function writeJson(
  dir: string,
  name: string,
  data: unknown,
): Promise<string> {
  await mkdir(dir, { recursive: true });
  const path = resolve(dir, name);
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return path;
}

/**
 * 运行完整构建管线，产出全部 JSON 产物。
 *
 * @returns 统计信息（实体数、错误数、产物路径）
 */
export async function generateAll(
  options: GenerateAllOptions = {},
): Promise<GenerateAllResult> {
  const cwd = options.cwd ?? process.cwd();
  const silent = options.silent ?? false;
  const log = (...a: unknown[]) => {
    if (!silent) console.log(...a);
  };
  const warn = (...a: unknown[]) => {
    if (!silent) console.warn(...a);
  };

  log('[gen] 读取并校验实体...');
  const { entities, errors } = await readEntities(cwd);
  log(`[gen] 实体: ${entities.length}，错误: ${errors.length}`);

  if (errors.length > 0) {
    warn('[gen] ⚠️ 以下文档存在问题（已跳过，未中断构建）：');
    for (const e of errors) warn(`   - ${e.filePath}: ${e.message}`);
  }

  const outDir = resolve(cwd, GENERATED_DIR);
  const outputs: string[] = [];

  log('[gen] 生成 entity-index.json ...');
  const entityIndex = buildEntityIndex(entities);
  outputs.push(await writeJson(outDir, 'entity-index.json', entityIndex));

  log('[gen] 生成 graph.json ...');
  const graph = buildGraph(entities);
  outputs.push(await writeJson(outDir, 'graph.json', graph));

  log('[gen] 生成 timeline.json ...');
  const timeline = buildTimeline(entities);
  outputs.push(await writeJson(outDir, 'timeline.json', timeline));

  log('[gen] 生成 tech-tree.json ...');
  const techTree = buildTechTree(entities);
  outputs.push(await writeJson(outDir, 'tech-tree.json', techTree));

  log(`[gen] 完成，产物目录: ${GENERATED_DIR}/`);
  return { entityCount: entities.length, errorCount: errors.length, outputs };
}
