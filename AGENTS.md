# AGENTS.md

This file provides project-level instructions and constraints for AI coding agents (and collaborators). All agents working in this repository must read this file before starting.

## Project Overview

**Time Traveler Handbook** — A bilingual (Chinese / English) historical knowledge base built on Astro + Starlight.
Markdown is the single source of truth. At build time, it generates a knowledge graph, timeline, and tech tree, producing a fully static site.
No database, no backend. Deploys to Cloudflare Pages / GitHub Pages.

## Hard Constraints (MUST)

1. **Do NOT perform git commits**
   - Do not run any command that alters commit history: `git commit`, `git push`, `git merge`, `git rebase`, `git reset`, `git tag`, etc.
   - Only read-only git commands are allowed: `git status`, `git log`, `git diff`, `git branch`, `git show`, etc.
   - Staging (`git add`) may be used only when a commit-prep skill explicitly requires it, and the actual commit must never be executed.

2. **File deletion requires user confirmation**
   - Before performing any deletion or destructive overwrite, you must first list what will be deleted/overwritten to the user and obtain explicit confirmation.
   - This covers: `rm`, `git rm`, `rmdir`, overwriting `Write` on an existing non-empty file, `mv` overwriting a target, etc.
   - If you discover that the content to be deleted contradicts how it was described, or was not created by this agent, stop and report to the user instead of proceeding with the deletion.

3. **Use pnpm for dependency management**
   - All dependency installation, script execution, and workspace operations must use `pnpm`.
   - Do not use `npm`, `yarn`, or generate `package-lock.json` / `yarn.lock`.
   - Examples: `pnpm install`, `pnpm add <pkg>`, `pnpm -F <pkg> run <script>`, `pnpm run build`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Astro |
| Docs theme | Starlight |
| Content | MDX + Astro Content Collections |
| Validation | Zod |
| Search | Pagefind |
| Diagrams | Mermaid |
| Icons | astro-icon |
| Build | Vite |
| Deploy | Cloudflare Pages / GitHub Pages (static) |

## Content Conventions

- One Markdown file = one entity.
- Each entity has a globally unique, immutable `id`.
- The filename must equal the `id`. No Chinese filenames.
- All inter-entity references use `id` (both frontmatter `connections` and in-body `[[wiki-links]]`).
- Bilingual via directory-based i18n: `zh/` and `en/` each have their own copy, sharing the same logical `id`.
- Relationships go through `connections: [{target, type}]` exclusively; reverse edges like `enables` are derived at build time from forward edges — no need to write them by hand.
- All structured data (graph / timeline / tech tree / entity index) is generated at build time. No database.

## Coding Style

- Follow existing code style: keep naming, comment density, and idioms consistent with surrounding code.
- New TypeScript code uses type annotations; schemas are defined with Zod.
- Reference code using `file_path:line_number` format.
