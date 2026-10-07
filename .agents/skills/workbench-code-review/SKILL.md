---
name: workbench-code-review
description: >-
  用于审查 workbench 的 diff，或非琐碎改动宣称完成前的自审。按红线 → 范围 → 风格 → 散文 → 人工项
  的顺序核对，产出「问题 → 例子 → 方案」格式的报告。Use when reviewing a workbench diff, or
  before claiming a non-trivial change is done.
---

# workbench 代码审查

Prettier 管格式，这份清单管语义。先跑 `pnpm typecheck` 与 `pnpm test`，红的先修；绿了再往下。

## 真源

按这个顺序查证，不凭记忆：`AGENTS.md` → `.cursor/rules/vueuse-composables.mdc`（composable 形状）→ `DESIGN.md` 与 `src/styles/tailwind.css`（视觉）→ `.agents/skills/shadcn-vue/SKILL.md`（壳层原语）。diff 与真源冲突时，先确认是真源过期还是 diff 越界。

## 阻断项（任一命中即退回）

- `src/composables/` 与 `src/utils/` 遵守 vueuse 规则：必填参数位置参数、可选项进尾部 options、导出 `UseXxxOptions` / `UseXxxReturn`、多值返回对象、`MaybeRefOrGetter` + `toValue`、`tryOnScopeDispose`、浏览器全局走 `ConfigurableWindow`、模块无 import 期副作用。文件名 kebab-case（`use-auto-save/use-auto-save.ts`），不改成 VueUse 的 `useAutoSave/index.ts`。
- Element Plus 字段控件只在 `src/adapter/component/index.ts` 的 `initComponentAdapter()` 注册进 `useGlobalShareState`。PlusTable 经 `resolveEditor`、Filters 经 schema 的 `component` 取这张表。不另开一张组件表。
- PlusTable 的网格是 `el-table`。`defineColumns` 运行时原样返回数组。新表行为写进 `src/components/plus-table/composables/` 的对应模块，在 `useTable` 里显式解构、显式传参、显式返回。子组件只经 `usePlusTable()` 读上下文。
- `input-number` 注册时 `controls: false`。加减按钮会打断 input 失焦，cell 模式无法靠 blur 退出编辑。要改这条，先改退出编辑的路径。
- emit-effect：裸函数是 `{ compute }` 的简写；`compute` 覆盖用户编辑；`default` 是可被用户改掉的建议值。`defineEmitRules` 运行时原样返回规则。
- demo 路由在 `src/views/<area>/`；可复用逻辑在 `src/composables/` 或 `src/components/`。Playground 壳用 `src/ui/` 的 shadcn-vue 原语，不在 `layouts/` / `views/` 里另写一套 Reka。录入 demo 可以用 Element Plus（`ElMessage`、`ElMessageBox`）。
- 新逻辑有 colocated 测试（`__tests__/` 或 `*.test.ts`）。壳层改动同步 `src/layouts/__tests__/`。

## 范围核对

- diff 里每个**新抽象、选项、状态机、兼容路径、防御性拷贝**都要能指出当前消费者（demo 页、另一个 composable、或 README 写明的公开导出）。指不出：删除，或在 PR 里说明为什么留着。
- 与任务无关的顺手改动（重命名、清理、多余文件、整文件格式化）单列出来，问要不要拆出去。
- 删掉了看起来是有意为之的功能或代码：确认有人问过。

## 风格核对（Prettier 管不到的）

- 命名：组件与类 `PascalCase`，变量 / 函数 / composable `camelCase`（`useXxx`），导出配置常量才用 `SCREAMING_SNAKE_CASE`。
- 注释跟所在文件的现有语言。composable 的 JSDoc 保持英文，并带 `@example`。不要在功能 diff 里顺手翻译一整片注释。
- 测试断言行为：不断言私有字段或调用次数，不把实现里的常量抄出来再比一次。
- 不新增 `as unknown` / `<unknown>`。`any` 有一句为什么。规则在 `AGENTS.md`。
- 新依赖先看 `@vueuse/core` 与 `es-toolkit` 能不能做。留下的依赖要在 PR 里写明为什么现有库不够。

## 散文核对（注释、README、`AGENTS.md`、skill）

命中任一条就改写：

1. **变更叙事**：之前 / 现在 / 不再 / 改成 / 原来 / 修复了。散文写现状，历史在 git。
2. **过程叙述**：先…然后…、「为了让测试通过」、逐步实现走读。留结论，删推导路径。
3. **会话残留**：引用某次对话里的决策编号、上轮讨论的结论、评审意见、未提交的草稿。
4. **spec-speak**：已落地的说明里出现应当 / 计划 / 待验收。写「是什么」。
5. **复述代码**：注释把下一行代码用中文或英文念一遍。删。
6. **强调通胀**：到处加粗、大写、「关键」。只给改变行为的那一句留强调。

## 人工项

- UI 改动：在 playground（`pnpm dev`，`vite.config.ts` 端口 9527）走一遍受影响路由。设计判断按 `.agents/skills/workbench-ui-ux/SKILL.md`。
- 模型会读到的说明（`AGENTS.md`、skill 的 description、公开 JSDoc）按 `.agents/skills/workbench-agent-experience/SKILL.md`。
- 宣称完成前：`pnpm typecheck` 与 `pnpm test`。格式用 `pnpm format:check`。

## 报告格式

先说同意 / 不同意，再说改了什么。每条按「问题 → 具体例子（文件:行）→ 方案」。阻断项放最前；范围与风格其次；散文最后。没有问题就写「无阻断项」，不要凑。
