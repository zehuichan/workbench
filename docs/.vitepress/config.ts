import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitepress';

import { labDemoPlugin } from './markdown/demo';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '../..');

export default defineConfig({
  title: '组件实验室',
  description: 'Component Labs · Vue 3 组件与工具库文档',
  lang: 'zh-CN',
  // 部署到 GitHub Pages 时通过 DOCS_BASE 注入子路径，本地开发保持根路径。
  base: process.env.DOCS_BASE ?? '/',
  // demo 源码以 `?raw` 形式引入、并通过别名解析到包源码，无需校验死链。
  ignoreDeadLinks: true,
  markdown: {
    lineNumbers: true,
    config(md) {
      md.use(labDemoPlugin);
    },
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/', activeMatch: '^/$' },
      {
        text: '组件',
        link: '/components/plus-table',
        activeMatch: '^/components/',
      },
      {
        text: '工具库',
        link: '/libraries/hucre',
        activeMatch: '^/libraries/',
      },
    ],
    sidebar: {
      '/components/': [
        {
          text: 'PlusTable',
          items: [
            { text: 'API', link: '/components/plus-table/' },
            { text: '基础用法', link: '/components/plus-table/basic' },
            { text: '综合示例', link: '/components/plus-table/playground' },
          ],
        },
      ],
      '/libraries/': [
        {
          text: '工具库',
          items: [
            { text: 'hucre · 电子表格', link: '/libraries/hucre' },
            { text: 'immer · 不可变状态', link: '/libraries/immer' },
          ],
        },
      ],
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
  },
  vite: {
    resolve: {
      alias: {
        // 文档直接引用 workspace 包源码，无需先构建。
        '@labs/plus-table': join(repoRoot, 'packages/plus-table/src/index.ts'),
      },
    },
    // 这些库在 SSR 下需内联打包，避免 CJS/ESM 互操作报错。
    ssr: {
      noExternal: ['element-plus', 'hucre'],
    },
  },
});
