---
name: workbench-find-simplifications
description: >-
  在 workbench 的代码、公开导出、配置、测试与散文里找有证据支撑的简化：删死的、重复的、投机的、
  白维护的行为。写提案、找可就地清理的小项、评估别的分支提出的简化。Use when asked to find
  simplifications, dead code, redundant abstractions, or unnecessary infrastructure in workbench,
  or to assess a simplification proposal.
---

# 在 workbench 找简化

目标是删掉**维护义务**：API、表示形式、状态、配置、依赖、测试、文档。少而有证据的候选胜过删除行数。这是指引不是清单；守住用户给的范围，调查不等于获准实施。

## 先定范围与约束

读 `AGENTS.md`、`.cursor/rules/vueuse-composables.mdc`、`DESIGN.md`。这些是有意为之，用户没有明确放开前不提删：

- PlusTable 的网格是 `el-table`。列配置经 `defineColumns`（运行时原样返回）。装配只在 `useTable`：composable 显式解构、显式传参。子树只经 `usePlusTable()` 读上下文。
- 字段控件只注册一次：`initComponentAdapter()` → `useGlobalShareState`。PlusTable 的 `resolveEditor` 与 Filters 的 `component` 共用这张表。`input-number` 的 `controls: false` 是为了 cell 模式能靠 blur 退出编辑。
- emit-effect 的两种规则：`compute` 覆盖用户输入，`default` 是可覆盖的建议；裸函数等于 `compute`。`defineEmitRules` 只提供类型，运行时原样返回。
- 壳层原语在 `src/ui/`（shadcn-vue）；录入控件是 Element Plus。两套并存是界面分工，不是重复实现。
- demo 之间相似的单据页是场景样本。跨 ERP demo 的相似模板不是自动重复，除非它们已经在复制同一段会一起改错的逻辑。
- `src/composables/index.ts` 与 `src/components/plus-table/index.ts` 的导出是 playground 的公开面。仓内调用少，不等于死代码；先对 README 的路由和 demo 页。

受保护设计内部**没人用的成员**仍是候选，只要删掉后设计目的不变。

大范围请求按域拆开查：PlusTable（`table` / composables / cell）；Filters 与 `src/adapter`；`src/composables`（表单草稿、emit-effect、微信）；`layouts` 与 `views` 壳；`src/ui` 与样式。每个域要给出消费者证据。除了明显的未用符号，也要看有分量的生产路径，别在第一个可删项就停。

## 找可删的义务

- **声明的能力有完整的效果路径吗？** 追生产者、变换、消费者、屏幕上或测试里能看到的结果。一个到处被拷贝的字段可能没有写入、没有读取。
- **哪些区分会改变调用方的动作？** 几个内部状态可能只需要对外一个状态。保留控制编辑态、脏数据、历史、校验的内部分辨；删只会让人做无用选择的公开选项。
- **更小的显式行为能否删掉整个子系统？** 固定值、调用方传入的参数、如实报告失败，可能替代通用策略或自动回滚。写清放弃的能力与删掉的机制。有 demo 或导出在用时，这是行为决策，实施须在用户授权内。
- **调用方能否在需要时直接读权威值？** 找拷贝出来的快照、失效之后紧跟着的再读、以及共享数据旁边的第二份缓存。先定清要观察的时机。
- **谁承担完整的维护成本？** 比较整个被删的路径和替代物（含残留胶水）。把复杂度挪个地方、或加一道检查保证两份定义相等，都不算删。

## 证明可达性与取舍

从 `rg` 开始，然后读命中处。搜精确符号、属性读写、以及 `.method(` 与 `method(` 两种形式。测试和类型声明能证明契约还在，证明不了有页面在用。

覆盖 `src/`、`README.md` 里点名的路由、`package.json` 的依赖。每个候选记录：当前 owner、实际的生产者 / 消费者、删掉什么、留下什么、保留它的最强理由。区分三类：

- 删不可达或没人读的行为；
- 收窄公开行为，并写明损失（哪个 demo、哪条导出）；
- 受保护义务或证据不足。

候选破坏了保留的义务、只是搬动同样的复杂度、或没有实质减少，就否决。小的局部改进直接改，或在 PR 里写一句，不为此另开文档。

## 保留所有权与失败语义

同进程里类型已经约束的值可以借用。解析外部 JSON、`localStorage` 草稿、OAuth 回调、微信 / 企微 SDK 回包时，要拥有或校验输入。异步路径写清谁拥有 promise、定时器、监听器；`tryOnScopeDispose` 清掉的东西不要再留第二份取消标志，除非两者表达的不是同一件事。

## 换基础设施只为净减少

先查 `@vueuse/core`、`es-toolkit`、以及已经在用的 Element Plus / Vue Router。列出替代物删掉的具体实现和专属测试、它的维护成本、胶水必须留下的行为。一个库盖住了框架、却要重建同样的框架才能限尺寸或接上现有编辑态，不是简化。

## 记录与验证

散文在范围内时按 `workbench-code-review` 的散文六禁改写。公开行为变了，同步 README 里对应的路由或 API 说明，以及对外的 JSDoc。

本仓没有 notes 目录。否决过备选、值得下次会话记住的理由写在 PR 或 commit 正文里。不要为一次清理另开一套决策文档。

只动散文时跑 `pnpm format:check`。动代码按改动面跑 `pnpm typecheck` 与相关的 `pnpm test`。报告调查过的区域、有证据的候选、有意义的否决、实际跑过的命令。没验证过的搜索不称「穷尽」。
