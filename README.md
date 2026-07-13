# Time Traveler Handbook

> A bilingual (Chinese / English) historical knowledge base built on Astro + Starlight.

Markdown is the single source of truth. At build time, flat documents are compiled into a structured **knowledge graph**, **timeline**, and **tech tree**, producing a fully static site. No database, no backend.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Astro 7 |
| Docs theme | Starlight |
| Content | MDX + Astro Content Collections |
| Validation | Zod |
| Search | Pagefind (built into Starlight; CJK works out of the box) |
| Icons | astro-icon |
| Build | Vite |
| Deploy | Cloudflare Pages / GitHub Pages (static) |

## Quick Start

```bash
pnpm install     # install dependencies
pnpm dev         # start dev server
pnpm gen         # generate structured data artifacts (graph/timeline/tech-tree/entity-index)
pnpm build       # full build (runs pnpm gen automatically first)
pnpm preview     # preview the build output
```

> Use `pnpm` for all package management. Do not use npm / yarn.

## Core Concepts

- **One Markdown file = one entity** (person / event / place / dynasty / organization / technology / invention / book / timeline).
- **Each entity has a globally unique, immutable `id`**. The filename must equal the `id`. No Chinese filenames.
- **All references use `id`**: frontmatter `connections` and in-body `[[wiki-links]]` alike.
- **Bilingual via directory-based i18n**: `src/content/docs/zh/...` and `src/content/docs/en/...` each maintain their own copy, sharing the same logical `id`.
- **Relationships go through `connections: [{target, type}]` exclusively**; reverse edges like `enables` are derived at build time — no need to write them by hand.
- **All structured data is generated at build time** — no database.

## Directory Structure

```
src/
├── content/docs/
│   ├── zh/knowledge/{people,events,places,dynasties,organizations,
│   │                 technologies,inventions,books,timelines}/
│   ├── zh/guides/
│   ├── en/...
│   └── en/guides/
├── lib/
│   ├── schemas/       # Zod schemas + type→directory mapping (single source of truth)
│   ├── builders/      # reader + 4 builders (graph/timeline/tech-tree/entity-index)
│   ├── types.ts       # build artifact type contracts
│   └── build.ts       # build pipeline orchestration
├── plugins/
│   └── remark-wikilink.ts   # [[wiki-link]] resolution
└── data/generated/    # build artifacts (gitignored, produced by pnpm gen)
    ├── entity-index.json
    ├── graph.json
    ├── timeline.json
    └── tech-tree.json
scripts/
└── gen-data.mts       # standalone build entry point
assets/                # language-agnostic media
```

## Build Artifacts

`pnpm gen` (auto-triggered before `astro build` via the `prebuild` hook) produces the following JSON:

| File | Contents |
| --- | --- |
| `entity-index.json` | id → {type, title, paths:{zh,en}}; basis for wiki-link resolution |
| `graph.json` | Knowledge graph: nodes + edges + reverse index + diagnostics |
| `timeline.json` | Entities with start/end, sorted by time |
| `tech-tree.json` | Technology dependency tree (with derived `enables`) |

## Content Example

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

Watt's improved steam engine launched the Industrial Revolution. See [[industrial-revolution]].
```

## Constraints & Collaboration

See [AGENTS.md](./AGENTS.md). Key points:
- **No git commits** (read-only git operations only).
- **File deletion requires user confirmation**.
- **Use `pnpm` exclusively** for dependency management.

For the Chinese version of this README, see [README_ZH.md](./README_ZH.md).

## Known Design Gaps (to be decided once content is written)

The following gaps were identified during the architecture phase and are deferred — they'll be addressed based on real pain points once content authoring begins:

- **No "civilization / era" aggregation level**: entities are currently organized by type (person/event/technology…), but users may want to "browse everything about Ancient Rome." Cross-regime periods (Middle Ages, Renaissance, Age of Discovery) have no corresponding type. Candidates: add a `civilization`/`era` entity type, or aggregate via tags + index pages.
- **`place` lacks a geographic hierarchy**: locations are currently flat; "Europe > Italy > Rome" containment cannot be expressed.
- **`dynasty` semantics vary across civilizations**: Chinese dynasties, Roman political systems, and Japanese era names (Asuka/Edo) don't align perfectly and may need refinement.

