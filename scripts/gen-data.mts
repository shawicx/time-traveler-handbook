#!/usr/bin/env tsx
/**
 * 独立构建入口：生成结构化数据产物（graph / timeline / tech-tree / entity-index）。
 *
 * 用法：
 *   pnpm gen
 *
 * 由 package.json 的 `prebuild` 钩子自动触发，确保 astro build 前产物就绪。
 * 也可在开发期手动运行，刷新 wiki-link 插件所依赖的 entity-index。
 */
import { generateAll } from '../src/lib/build.ts';

const result = await generateAll();

console.log(
  `\n✓ 生成完成：${result.entityCount} 个实体，${result.outputs.length} 个产物文件。`,
);
if (result.errorCount > 0) {
  console.warn(
    `⚠ 有 ${result.errorCount} 个文档存在问题，详见上方警告。产物已尽力生成。`,
  );
}
