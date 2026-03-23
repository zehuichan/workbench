# 栈与工程约定（Tool Wrapper）

**用途**：编写或审查**本项目**前端/全栈代码前，将本文件与业务计划一并视为权威约定。内容应随仓库演进更新；未知项填 `TBD` 并在首次 PR 中补齐。

> 对齐 [Agent Skills](https://agentskills.io/specification) 的 `references/`：**命令/技能正文保持短，细则集中在此。**

---

## 1. 技术栈

| 层级   | 选型     | 备注 |
| ------ | -------- | ---- |
| 框架   | Vue 3    | Composition API + `<script setup>`（以仓库实际为准） |
| 包管理 | pnpm     | |
| 样式   | Tailwind | |
| 测试   | Vitest   | 组件测是否用 Testing Library 以仓库为准 |

---

## 2. 命名与目录（对齐 vben5：全 kebab-case）

- **原则**：与 **vben5**（Vben Admin 5）命名规范一致，**文件、目录、`*.vue` 单文件组件名一律 kebab-case**（如 `user-profile.vue`、`src/views/system/menu/`），不采用 PascalCase 组件文件名。
- **代码内组件名**：`<script setup>` 中局部组件注册、模板里标签写法等以 **仓库现有 vben5 规则与 eslint 配置**为准（若与「仅文件名 kebab」并存，以可运行 + lint 通过为优先）。
- **禁止**：与 `eslint` / `prettier` / 项目 vben 约定冲突的例外须在 PR 说明

---

## 3. 代码质量

- **Lint / Format**：提交前本地通过；CI 规则以仓库配置为准
- **提交信息**：遵循 `commitlint`（若有）
- **拼写**：`cspell`（若有）

---

## 4. 前端专项

- **路由**：新增页面时同步注册路由（路径以项目为准，如 `router/routes.ts`）
- **A11y（可选）**：语义标签、焦点、表单 label；若不可用则说明替代方案
- **响应式**：约定断点（如 375 / 768 / 1024 / 1440）

---

## 5. 开发环境

- **本地 dev**：除非用户要求，代理**不**主动执行 `pnpm run dev` / `npm run dev`（由开发者本机已启动为前提时可注明）

---

## 6. 与命令的衔接

- `/feat` 实施阶段：在首次改动产品代码前 **Read** 本文件；若与计划冲突，以**计划 + 用户当轮指令**为准，并记入计划的「实现调整」。
