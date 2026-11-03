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
bun install      # install dependencies
bun dev          # start dev server
bun gen          # generate structured data artifacts (graph/timeline/tech-tree/entity-index)
bun build        # full build (runs bun gen automatically first)
bun preview      # preview the build output
```

> Use `bun` for all package management. Do not use npm / pnpm / yarn.

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
└── data/generated/    # build artifacts (gitignored, produced by bun gen)
    ├── entity-index.json
    ├── graph.json
    ├── timeline.json
    └── tech-tree.json
scripts/
└── gen-data.mts       # standalone build entry point
assets/                # language-agnostic media
```

## Build Artifacts

`bun gen` (auto-triggered before `astro build` via the `prebuild` hook) produces the following JSON:

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
- **Use `bun` exclusively** for dependency management.

For the Chinese version of this README, see [README_ZH.md](./README_ZH.md).

## Time-Travel Premise

The handbook follows a single **core premise**, and all content must be built on it:

- **The traveler can only travel in their own body** — no luggage, no pockets, no devices, no modern items of any kind. This is the foundational setting of the entire handbook.
- **The traveler's only advantage is knowledge carried in their mind**: hygiene, scientific principles, engineering, astronomy, medicine *theory*, agriculture, map memory, etc.
- **Do not write content that relies on modern artifacts**: no "bring antibiotics / a stainless-steel knife / salt / a compass / a notebook / a lighter." This applies to every section of every era guide, including survival checklists, first-24-hours advice, and knowledge-advantage sections.
- **Medicine is the sharpest case of this rule**: the traveler may *know* germ theory, wound-care principles, or which local plants have pharmacological effects — but they carry no pills. Survival advice must be built from **what can be found, grown, or made in the destination era**, plus modern knowledge applied to those materials.
- **The 16-section survival template (Era Snapshot … Survival Checklist) is a structure, not a fixed checklist of items.** The "Survival Checklist" section lists **knowledge and skills to memorize before departure**, not physical objects to pack.

## Known Design Gaps (to be decided once content is written)

The following gaps were identified during the architecture phase and are deferred — they'll be addressed based on real pain points once content authoring begins:

- **No "civilization / era" aggregation level**: entities are currently organized by type (person/event/technology…), but users may want to "browse everything about Ancient Rome." Cross-regime periods (Middle Ages, Renaissance, Age of Discovery) have no corresponding type. Candidates: add a `civilization`/`era` entity type, or aggregate via tags + index pages.
- **`place` lacks a geographic hierarchy**: locations are currently flat; "Europe > Italy > Rome" containment cannot be expressed.
- **`dynasty` semantics vary across civilizations**: Chinese dynasties, Roman political systems, and Japanese era names (Asuka/Edo) don't align perfectly and may need refinement.

