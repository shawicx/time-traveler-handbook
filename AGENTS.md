# AGENTS.md

本文件为 AI 编码代理（及协作者）提供项目级指令与约束。所有代理在本仓库工作前必须先阅读本文件。

## 项目简介

**Time Traveler Handbook** —— 基于 Astro + Starlight 的双语（中 / 英）历史知识库。
以 Markdown 为唯一数据源，在构建期生成知识图谱、时间线、科技树，输出纯静态站点。
无数据库、无后端，部署到 Cloudflare Pages / GitHub Pages。

## 强制约束（MUST）

1. **禁止执行 git 提交**
   - 不得运行任何改变提交历史的命令：`git commit`、`git push`、`git merge`、`git rebase`、`git reset`、`git tag` 等。
   - 仅允许只读 git 命令：`git status`、`git log`、`git diff`、`git branch`、`git show` 等。
   - 暂存（`git add`）仅可应提交准备类技能要求时使用，且不得执行实际提交。

2. **删除文件前必须经过用户确认**
   - 任何删除或破坏性覆盖操作执行前，必须先向用户列出将被删除 / 覆盖的内容并获得明确确认。
   - 涵盖：`rm`、`git rm`、`rmdir`、对已存在且非空文件的覆盖式 `Write`、`mv` 目标覆盖等。
   - 发现要删除的内容与描述不符，或并非本代理创建的内容时，应停止并向用户报告，而非继续删除。

3. **使用 pnpm 管理依赖**
   - 所有依赖安装、脚本执行、工作区操作统一使用 `pnpm`。
   - 禁止使用 `npm`、`yarn` 或生成 `package-lock.json` / `yarn.lock`。
   - 示例：`pnpm install`、`pnpm add <pkg>`、`pnpm -F <pkg> run <script>`、`pnpm run build`。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 框架 | Astro |
| 文档主题 | Starlight |
| 内容 | MDX + Astro Content Collections |
| 校验 | Zod |
| 搜索 | Pagefind |
| 图表 | Mermaid |
| 图标 | astro-icon |
| 构建 | Vite |
| 部署 | Cloudflare Pages / GitHub Pages（静态） |

## 内容约定

- 一个 Markdown 文件 = 一个实体。
- 每个实体拥有全局唯一且不可变的 `id`。
- 文件名必须等于 `id`，禁止中文文件名。
- 所有实体间引用使用 `id`（frontmatter 的 `connections`、`[[wiki-link]]` 正文链接均如此）。
- 双语采用**目录分语言**策略：`zh/` 与 `en/` 各有一份正文，共享同一个逻辑 `id`。
- 关系统一通过 `connections: [{target, type}]` 表达；`enables` 等反向边由构建期从正向边反推生成，无需手填。
- 所有结构化数据（图谱 / 时间线 / 科技树 / 实体索引）在构建期生成，无数据库。

## 编码风格

- 遵循既有代码风格：命名、注释密度、惯用法与周边代码保持一致。
- 新增 TypeScript 代码使用类型注解，schema 用 Zod 定义。
- 引用代码时使用 `file_path:line_number` 格式。
