# DemoCode (Shiki) Design

Date: 2026-07-19

## Goal

新增 playground 共享组件 `DemoCode`：用 Shiki 做语法高亮，并支持行号与一键复制。先替换 `useAuth` / `useWeixin` 文档页里过于干瘪的裸 `<pre>`。

## Decisions

| 项 | 选择 |
|----|------|
| 高亮库 | `shiki`（客户端 `createHighlighter` 单例） |
| 主题 | 仅 `github-light`（贴合现有 playground 浅色） |
| 行号 | Shiki 输出的 `.line` + CSS `counter`（VitePress 同款） |
| 复制 | 工具栏按钮；`navigator.clipboard.writeText`；短暂「已复制」反馈 |
| 降级 | highlighter 未就绪 / 失败时渲染纯文本 `<pre>` |
| 首批接入 | `use-auth-demo.vue`、`use-weixin-demo.vue` |
| 明确不做 | 暗色主题切换、构建期预渲染、全站 demo 源码迁移 |

## Public API

```ts
// DemoCode props
{
  code: string          // 必填。源码文本
  lang?: string         // 默认 'ts'；映射到 Shiki lang（ts → typescript）
  title?: string        // 可选。工具栏左侧标签；缺省显示 lang
}
```

用法：

```vue
<DemoBlock title="代码演示">
  <template #hint>...</template>
  <DemoCode :code="codeDemo" lang="ts" />
</DemoBlock>
```

## Structure

```text
src/components/demo/
  demo-code.vue              # UI：工具栏 + 高亮区
  demo-highlighter.ts        # createHighlighter 单例 + codeToHtml 封装
  demo-components.test.ts    # 追加 DemoCode 用例
src/styles/index.scss        # .demo-code 样式（行号 counter、工具栏）
src/views/composables/
  use-auth-demo.vue          # 裸 pre → DemoCode
  use-weixin-demo.vue        # 裸 pre → DemoCode
```

## Highlighting

- 依赖：`shiki`（`dependencies`）
- 单例 highlighter：
  - `langs: ['typescript', 'vue', 'javascript']`
  - `themes: ['github-light']`
- `codeToHtml(code, { lang, theme: 'github-light' })`，结果 `v-html` 进容器
- `lang` 别名：`ts` → `typescript`，`js` → `javascript`，`vue` 原样
- 组件 `watch` `code`/`lang`，异步更新 HTML；用递增 token 丢弃过期结果

## UI / Styling

- 外层 `.demo-code`：细边框、圆角、白底，对齐 `--demo-*` / `demo-block`
- 工具栏：左 title/lang，右复制按钮（Element Plus `el-button` text/small）
- 代码区：横向滚动；行号 CSS counter，弱化色，与代码区分
- 不改 `DemoBlock` footer（仍为 `playground`）

## Testing

在 `demo-components.test.ts`：

1. 传入 `code` + `lang="ts"`，等待后出现 `.shiki` 与至少一个 `.line`
2. mock `navigator.clipboard.writeText`，点击复制后被以完整 `code` 调用

## Success criteria

1. `DemoCode` 可复用，高亮 / 行号 / 复制可用
2. `useAuth` / `useWeixin` 文档页使用 `DemoCode`，不再用裸 `<pre class="demo__pre">`
3. `pnpm test`（demo components）与 `pnpm typecheck` 通过
4. 非微信环境仍只展示静态代码，不触发真实授权 / JSSDK
