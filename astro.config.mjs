// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import icons from 'astro-icon';
import remarkWikilink from './src/plugins/remark-wikilink.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://time-traveler-handbook.example.com',

  integrations: [
    starlight({
      title: '时空旅人手册',
      defaultLocale: 'zh',

      // 双语：zh 与 en 均为带前缀 locale，URL 形如 /zh/... /en/...
      locales: {
        zh: {
          label: '简体中文',
          lang: 'zh-CN',
        },
        en: {
          label: 'English',
          lang: 'en',
        },
      },

      // 侧边栏：按知识分类自动生成折叠组。
      // Starlight 0.39+ 不再允许 autogenerate 直接带 label；
      // 每个分类须写成 {label, collapsed, items:[{autogenerate}]} 形式。
      sidebar: [
        {
          label: '知识库',
          collapsed: false,
          items: [
            {
              label: '时期',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/eras' } },
              ],
            },
            {
              label: '文明',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/civilizations' } },
              ],
            },
            {
              label: '人物',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/people' } },
              ],
            },
            {
              label: '事件',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/events' } },
              ],
            },
            {
              label: '地点',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/places' } },
              ],
            },
            {
              label: '朝代',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/dynasties' } },
              ],
            },
            {
              label: '组织',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/organizations' } },
              ],
            },
            {
              label: '技术',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/technologies' } },
              ],
            },
            {
              label: '发明',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/inventions' } },
              ],
            },
            {
              label: '书籍',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/books' } },
              ],
            },
            {
              label: '时间线',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'knowledge/timelines' } },
              ],
            },
          ],
        },
        {
          label: '生存指南',
          collapsed: false,
          items: [
            {
              label: '指南',
              collapsed: true,
              items: [{ autogenerate: { directory: 'guides' } }],
            },
          ],
        },
      ],

      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/shawicx/time-traveler-handbook',
        },
      ],
    }),

    mdx(),
    icons(),
  ],

  // Astro 7 用 markdown.processor 注册 remark/rehype 插件
  // （markdown.remarkPlugins 已废弃）。
  // 注意：须确保构建前 entity-index.json 已由 prebuild(pnpm gen) 生成。
  markdown: {
    processor: unified({ remarkPlugins: [remarkWikilink] }),
  },
});
