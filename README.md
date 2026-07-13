# Time Traveler Handbook

> 时空旅人手册 —— 基于 Astro + Starlight 的双语（中 / 英）历史知识库。

以 Markdown 为唯一数据源，在构建期把扁平的文档加工成结构化的**知识图谱**、**时间线**、**科技树**，输出纯静态站点。无数据库、无后端。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 框架 | Astro 7 |
| 文档主题 | Starlight |
| 内容 | MDX + Astro Content Collections |
| 校验 | Zod |
| 搜索 | Pagefind（Starlight 内置，CJK 开箱即用） |
| 图标 | astro-icon |
| 构建 | Vite |
| 部署 | Cloudflare Pages / GitHub Pages（静态） |

## 快速开始

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器
pnpm gen         # 生成结构化数据产物（graph/timeline/tech-tree/entity-index）
pnpm build       # 完整构建（自动先跑 pnpm gen）
pnpm preview     # 预览构建产物
```

> 包管理统一使用 `pnpm`，禁止使用 npm / yarn。

## 核心概念

- **一个 Markdown = 一个实体**（人物 / 事件 / 地点 / 朝代 / 组织 / 技术 / 发明 / 书籍 / 时间线）。
- **每个实体有全局唯一且不可变的 `id`**，文件名必须等于 `id`，禁止中文文件名。
- **所有引用使用 `id`**：frontmatter 的 `connections`、正文里的 `[[wiki-link]]` 均如此。
- **双语采用目录分语言策略**：`src/content/docs/zh/...` 与 `src/content/docs/en/...` 各维护一份正文，共享同一逻辑 `id`。
- **关系统一通过 `connections: [{target, type}]` 表达**；`enables` 等反向边由构建期反推，无需手填。
- **所有结构化数据在构建期生成**，无数据库。

## 目录结构

```
src/
├── content/docs/
│   ├── zh/knowledge/{people,events,places,dynasties,organizations,
│   │                 technologies,inventions,books,timelines}/
│   ├── zh/guides/
│   ├── en/...
│   └── en/guides/
├── lib/
│   ├── schemas/       # Zod schema + type→目录映射（唯一真源）
│   ├── builders/      # reader + 4 个 builder（graph/timeline/tech-tree/entity-index）
│   ├── types.ts       # 构建产物类型契约
│   └── build.ts       # 构建管线编排
├── plugins/
│   └── remark-wikilink.ts   # [[wiki-link]] 解析
└── data/generated/    # 构建产物（gitignore，由 pnpm gen 生成）
    ├── entity-index.json
    ├── graph.json
    ├── timeline.json
    └── tech-tree.json
scripts/
└── gen-data.mts       # 独立构建入口
assets/                # 与语言无关的媒体资源
```

## 构建产物

`pnpm gen`（在 `astro build` 前由 `prebuild` 自动触发）产出以下 JSON：

| 文件 | 内容 |
| --- | --- |
| `entity-index.json` | id → {type, title, paths:{zh,en}}，wiki-link 解析依据 |
| `graph.json` | 知识图谱：nodes + edges + 反向索引 + 诊断 |
| `timeline.json` | 带 start/end 的实体按时间排序 |
| `tech-tree.json` | 技术依赖树（含 enables 反推） |

## 内容约定示例

```markdown
---
id: steam-engine
type: technology
title: 蒸汽机
start: 1765
dependencies:
  - iron
  - steel
connections:
  - target: james-watt
    type: invented_by
---

瓦特改良的蒸汽机开启了工业革命。参见 [[industrial-revolution]]。
```

## 约束与协作

详见 [AGENTS.md](./AGENTS.md)。要点：
- **禁止 git 提交**（仅只读 git 操作）。
- **删除文件前必须经用户确认**。
- **统一使用 pnpm** 管理依赖。
