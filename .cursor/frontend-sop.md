---
description: '前端 SOP - .cursor 命令 + Superpowers 技能一体化工作流'
---

# 前端 SOP - 标准作业流程

将 `.cursor/commands/` 与 Superpowers 技能结合的完整前端开发工作流；并与 **Agent Skills 式分层**对齐：
**命令薄、`assets/` / `references/` 厚**（见 [规范](https://agentskills.io/specification)）。

---

## 〇、分层资源（优化后约定）

| 路径                                          | 模式               | 用途                                                  |
|---------------------------------------------|------------------|-----------------------------------------------------|
| `.cursor/assets/plan-template.md`           | **Generator**    | 实施计划唯一结构模板；`/plan`、`/feat`、`/workflow` 写计划前加载并按章节填写 |
| `.cursor/references/stack-conventions.md`   | **Tool Wrapper** | 本仓库工程/栈约定；`/feat` 实施前、改产品代码前加载                      |
| `.cursor/references/review-checklist-fe.md` | **Reviewer**     | 前端/体验审查清单；`/review` 首推加载并按条扣分分组                     |

**门禁（Inversion + Pipeline）**：需求未澄清或用户未选定方案前，**不得**产出已定稿的 `.cursor/plan/*.md`；计划展示后须 *
*AskQuestion** 得用户选择（开始实施 / 改计划 / 仅保存）。复杂任务可在计划「阶段确认门」逐段验收。

---

## 一、技能与命令映射表

| 阶段    | .cursor 命令                  | Superpowers 技能                                            | 用途             |
|-------|-----------------------------|-----------------------------------------------------------|----------------|
| 需求探索  | `/feat` 2.0、`/workflow` 1-2 | `brainstorming`                                           | 澄清意图、方案对比、设计审批 |
| 规划    | `/plan`、`/feat` 2.2         | `writing-plans`                                           | 结构化实施计划、任务拆解   |
| UI 设计 | `/feat` 2.2                 | `ui-ux-designer`、`ui-ux-pro-max`                          | 页面结构、组件拆分、设计系统 |
| 实施    | `/feat` 3、`/workflow` 4     | `test-driven-development`、`executing-plans`               | TDD 开发、按计划逐步执行 |
| 调试    | `/debug`                    | `systematic-debugging`                                    | 根因分析、假设验证      |
| 测试    | `/test`                     | `test-driven-development`                                 | 测试策略、用例设计      |
| 审查    | `/review`                   | `requesting-code-review`、`verification-before-completion` | 前端/体验审查、交付前验证  |

---

## 二、核心流程

### 流程 A：新功能开发（推荐）

```
/feat <功能描述>
    │
    ├─ 2.0 Prompt 增强 ────────────► invoke brainstorming
    │
    ├─ 2.1 上下文检索
    │
    ├─ 2.2 产出规划 ───────────────► invoke writing-plans
    │   ├─ UI/UX 设计（参考 ui-ux-designer 模板）
    │   └─ 功能规划文档
    │
    ├─ 2.3 保存至 .cursor/plan/<功能名>.md
    │
    └─ 3. 执行实施 ────────────────► invoke test-driven-development
        └─ Red → Green → Refactor
```

### 流程 B：纯规划（不实施）

```
/plan <任务描述>
    │
    ├─ Phase 1 上下文检索 ─────────► Prompt 增强
    │
    └─ Phase 2 分析规划 ───────────► invoke writing-plans
        └─ 保存至 .cursor/plan/<功能名>.md
```

### 流程 C：全流程协作

```
/workflow <任务描述>
    │
    ├─ 1. 研究 ───────────────────► Prompt 增强 + 上下文检索
    ├─ 2. 构思 ───────────────────► invoke brainstorming
    ├─ 3. 计划 ───────────────────► invoke writing-plans
    ├─ 4. 执行 ───────────────────► invoke TDD / executing-plans
    ├─ 5. 优化 ───────────────────► 安全检查、A11y、性能
    └─ 6. 评审 ───────────────────► invoke verification-before-completion
```

### 流程 D：调试

```
/debug <问题描述>
    │
    └─ 全程 ──────────────────────► invoke systematic-debugging
        Phase 1 根因调查 → Phase 2 模式分析 → Phase 3 假设验证 → Phase 4 修复
```

---

## 三、路径与文档约定

| 文档类型   | 本 SOP 约定                                    | Superpowers 约定                        | 说明                                  |
|--------|---------------------------------------------|---------------------------------------|-------------------------------------|
| 计划结构模板 | `.cursor/assets/plan-template.md`           | —                                     | 与 `plan` / `feat` / `workflow` 同步演进 |
| 工程约定   | `.cursor/references/stack-conventions.md`   | —                                     | 按项目改 `TBD`，避免命令里堆长列表                |
| 审查清单   | `.cursor/references/review-checklist-fe.md` | —                                     | 与 `/review` 严重程度分级一致                |
| 实施计划   | `.cursor/plan/<功能名>.md`                     | `docs/plans/YYYY-MM-DD-<名>.md`        | 统一使用 `.cursor/plan/`                |
| 设计文档   | `.cursor/plan/<功能名>-design.md` 或计划内嵌        | `docs/plans/YYYY-MM-DD-<名>-design.md` | 可内嵌在计划中                             |
| 设计系统   | `design-system/MASTER.md`                   | ui-ux-pro-max 推荐                      | 复杂项目可选                              |

---

## 四、前端专项检查清单

### 4.1 UI 实施前（writing-plans / ui-ux-designer）

- [ ] 页面结构草图（布局、区块划分）
- [ ] 组件树（可复用组件识别）
- [ ] 交互流程（状态流转、Loading/Error）
- [ ] 响应式断点策略
- [ ] A11y 要点（语义、ARIA、键盘、对比度）

### 4.2 设计系统（ui-ux-pro-max，可选）

产品类型明确时，可运行：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<产品类型> <行业> <风格>" --design-system -p "项目名"
```

产出：pattern、style、color、typography、effects、anti-patterns。

### 4.3 交付前检查（ui-ux-pro-max Pre-Delivery）

**完整逐项清单**已迁至 **`.cursor/references/review-checklist-fe.md`**（含 Critical/Major/Minor 与交付前速查）。本处仅提醒：交付前执行
`/review` 或对照该文件自检。

---

## 五、技能调用规则

1. **流程技能优先**：brainstorming、systematic-debugging、writing-plans 决定「怎么做」，先于实施技能。
2. **强制场景**：
    - 新功能 / 新页面 → 先 `brainstorming` 再 `writing-plans`
    - Bug / 异常 → 先 `systematic-debugging`，找到根因后再修
    - 写业务代码 → 遵循 `test-driven-development`（先红后绿）
3. **命令内显式引用**：各命令已包含「本阶段 invoke 某 skill」说明，执行时务必遵守。

---

## 六、快速命令速查

| 场景         | 命令              | 主要技能                                               |
|------------|-----------------|----------------------------------------------------|
| 新功能（规划+实施） | `/feat 描述`      | brainstorming → writing-plans → TDD                |
| 只要规划       | `/plan 描述`      | writing-plans                                      |
| 全流程协作      | `/workflow 描述`  | brainstorming → writing-plans → TDD → verification |
| Bug 调试     | `/debug 描述`     | systematic-debugging                               |
| 补测试        | `/test 路径`      | TDD 思路（用例设计）                                       |
| 代码审查       | `/review 路径或计划` | requesting-code-review                             |
| 需求不清晰      | `/enhance 描述`   | —                                                  |

---

## 七、与 Superpowers 的衔接

- **using-superpowers**：每次回复前检查是否有适用技能，有则 invoke。
- **本 SOP**：在前端场景下，明确哪些阶段对应哪些技能，避免遗漏。
- 两者互补：SOP 提供阶段映射，Superpowers 提供具体方法论。
