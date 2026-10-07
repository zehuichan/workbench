---
name: workbench-agent-experience
description: >-
  写或改模型会读到的说明时读取：AGENTS.md、skill 的 description、composable / 组件的公开 JSDoc。
  让信息可发现、常驻上下文保持短。Use when editing AGENTS.md, skill frontmatter, or the public
  JSDoc of a composable or component that later sessions will follow.
---

# workbench agent 体验

服务对象是读这些文字的模型：它每轮只有有限上下文，看不到你没写进仓库的决定，只看到常驻说明、skill、类型和注释。

本仓没有独立的工具协议包。模型可见的「接口」就是下面三处，不要再发明第四份常驻说明。

## 通则

- **最小常驻**：每次会话固定带上的是根 `AGENTS.md`。composable 形状在 `.cursor/rules/vueuse-composables.mdc`（按 glob 触发）。审查、界面、简化、这段体验本身放在 `.agents/skills/workbench-*/SKILL.md`，靠 frontmatter `description` 触发。
- **发现要显式**：每份延后加载的 skill，description 里写清何时用、覆盖哪几目录。细则进 skill 或 `DESIGN.md`，不把步骤再贴回 `AGENTS.md`。
- **关键约束前置**：权限、破坏性效果、必须先跑的检查，写在对应动作之前。
- **一个事实一个家**：vueuse 签名只在 `vueuse-composables.mdc`；视觉 token 只在 `DESIGN.md` / `tailwind.css`；shadcn-vue 的 class 规则只在那份 skill。别处用一句话链过去。
- **输出有界**：给后来的会话留路径和符号名（`useTable`、`initComponentAdapter`、路由），不把整段实现贴进说明。

## 公开签名与 JSDoc

模型改调用点时读到的是导出签名和 JSDoc，不是实现注释。

- composable 的 JSDoc 用英文，带一个 `@example` 调用点（vueuse 规则）。示例只展示调用形状，不复述函数体。
- 参数约束写在该参数上：默认值、何时该设、成对出现。描述随选项变化的行为，通常属于某个 options 字段。
- 删模型能从类型或一次调用结果里学到的句子（「传错类型会报错」）。留下类型表达不了的义务：谁拥有副作用、失败时值还在不在、`undefined` 返回是不是「保持原值」（emit-effect 的 resolver 就是这种）。
- `defineColumns` / `defineEmitRules` 这类运行时原样返回的辅助函数，JSDoc 写明它们只收窄类型。不要写成会变换数据。

## 常驻说明

- `AGENTS.md` 保持短：目录落点、命令、架构红线（各一两句）、命名、测试位置、提交格式。展开的流程放 skill。
- 改 skill 时增量改编，不把 deepseek-harness 的 `.agents/skills` 整目录拷进来。那边的链接指向本仓没有的文档和门禁。
- 与 `workbench-code-review`、`workbench-ui-ux`、`workbench-find-simplifications` 重叠的规则只留一份，另一处链接。
