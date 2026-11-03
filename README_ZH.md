# 时空旅人手册

> 基于 Astro + Starlight 的双语（中 / 英）历史知识库。

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
bun install      # 安装依赖
bun dev          # 启动开发服务器
bun gen          # 生成结构化数据产物（graph/timeline/tech-tree/entity-index）
bun build        # 完整构建（自动先跑 bun gen）
bun preview      # 预览构建产物
```

> 包管理统一使用 `bun`，禁止使用 npm / pnpm / yarn。

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
└── data/generated/    # 构建产物（gitignore，由 bun gen 生成）
    ├── entity-index.json
    ├── graph.json
    ├── timeline.json
    └── tech-tree.json
scripts/
└── gen-data.mts       # 独立构建入口
assets/                # 与语言无关的媒体资源
```

## 构建产物

`bun gen`（在 `astro build` 前由 `prebuild` 自动触发）产出以下 JSON：

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
- **统一使用 bun** 管理依赖。

英文版 README 见 [README.md](./README.md)。

## 时空旅行基本设定

本手册遵循一个**核心前提**，所有内容必须基于此展开：

- **穿越者只能本人穿越**——没有行李、口袋、设备或任何现代物品。这是整本手册的基础设定。
- **穿越者唯一的优势是脑子里的知识**：卫生常识、科学原理、工程、天文、医学*理论*、农业、地图记忆等。
- **严禁出现依赖现代物品的内容**：不写"带抗生素 / 不锈钢刀 / 盐 / 指南针 / 笔记本 / 打火机"。这适用于每个时代手册的每一节，包括生存清单、前 24 小时建议、知识优势章节。
- **医疗是最典型的边界**：穿越者可以*知道*细菌学说、伤口护理原则、或哪些当地植物有药效——但身上没有药片。生存建议必须建立在**目的地时代能找到、种植或制造的东西**之上，加上现代知识对这些材料的运用。
- **16 段生存模板（时代概览 … 穿越者检查清单）是结构，不是固定物品清单**。"检查清单"一节列出的是**出发前要记住的知识与技能**，而非要打包的实物。

## 已知设计留白（待内容驱动决策）

以下缺口在架构阶段识别，暂不处理，待实际写内容时根据真实痛点再定方案：

- **缺少"文明/时期"聚合维度**：当前实体按类型（人物/事件/技术…）组织，但用户可能想"浏览古罗马的全部内容"。中世纪、文艺复兴、大航海等跨政权时期无对应类型。候选方案：新增 `civilization`/`era` 实体类型，或用 tags + 索引页聚合。
- **`place` 缺少地理层级**：当前地点是扁平的，无法表达"欧洲 > 意大利 > 罗马"的从属关系。
- **`dynasty` 语义在不同文明间有差异**：中国朝代、罗马政体、日本时代名（飞鸟/江户）语义不完全对齐，未来可能需要细化。
