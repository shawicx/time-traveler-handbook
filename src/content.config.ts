import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

/**
 * 内容集合配置。
 *
 * Starlight 的 docs 集合使用其内置 loader + schema（保证主题 UI 与路由正常），
 * 并通过 docsSchema({extend}) 追加实体字段的宽松校验。
 *
 * 实体字段的权威定义在 src/lib/schemas/，这里仅做"实体字段存在性"的宽松校验，
 * 严格的 discriminated union 校验由构建管线（reader.ts → entitySchema）负责，
 * 避免与 Starlight 自身 frontmatter schema 产生冲突。
 */
const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: () =>
      z.object({
        id: z.string().optional(),
        type: z
          .enum([
            'era',
            'civilization',
            'person',
            'event',
            'place',
            'dynasty',
            'organization',
            'technology',
            'invention',
            'book',
            'timeline',
          ])
          .optional(),
        aliases: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        summary: z.string().optional(),
        featured: z.boolean().optional(),
        start: z.number().optional(),
        end: z.number().optional(),
        connections: z
          .array(z.object({ target: z.string(), type: z.string() }))
          .optional(),
        sources: z.array(z.string()).optional(),
        // person
        birth: z.number().optional(),
        death: z.number().optional(),
        country: z.string().optional(),
        dynasty: z.string().optional(),
        // event
        location: z.string().optional(),
        // technology
        dependencies: z.array(z.string()).optional(),
        enables: z.array(z.string()).optional(),
      }),
  }),
});

export const collections = { docs };
