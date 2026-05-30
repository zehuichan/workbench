---
layout: home

hero:
  name: 组件实验室
  text: Component Labs
  tagline: 基于 Vue 3 + TypeScript + Vite 的组件与工具库试验场
  actions:
    - theme: brand
      text: PlusTable
      link: /components/plus-table
    - theme: alt
      text: 工具库
      link: /libraries/hucre

features:
  - title: PlusTable 增强表格
    details: 在 Element Plus el-table 之上提供配置式列、可编辑单元格、键盘导航与热键、校验、行增删改与撤销重做、列设置持久化、单元格联动与分页自适应。
    link: /components/plus-table
    linkText: 查看文档
  - title: hucre 电子表格引擎
    details: 零依赖读写 XLSX / CSV / ODS，支持模板引擎、Schema 校验、流式处理、往返保存与 Web Worker。
    link: /libraries/hucre
    linkText: 查看文档
  - title: immer 不可变状态
    details: 以「原地修改 draft」的写法处理不可变数据，结构共享、引用相等、自动冻结，天然适配 undo / redo 与协同。
    link: /libraries/immer
    linkText: 查看文档
---

## 关于本站

本文档站基于 [VitePress](https://vitepress.dev/) 构建，示例以 `<demo>` 标签内嵌真实可交互组件并附带源码查看。

```bash
pnpm install
pnpm docs:dev      # 启动文档站
pnpm docs:build    # 构建静态文档
```

各示例直接引用仓库 `src/` 下的真实组件（通过别名 `@`），与组件实现保持同步。
