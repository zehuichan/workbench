# ERP Emit-Effect Demos Design

Date: 2026-07-17

Supersedes: `docs/superpowers/specs/2026-07-17-erp-document-linkage-demos-design.md`

## Goal

把现有「配置驱动共享壳 + 薄路由」的 ERP 单据 Demo，改成三个 1 对 1 的完整页面，并抽出可复用的反应式副作用引擎，供真实系统直接使用。

Demo 只保留表头↔明细联动的核心可观察行为；去掉模拟服务端、乐观锁冲突、联动流水等重演示能力。

## Confirmed Decisions

- 三个路由各自成为完整 demo（对齐 PlusTable / Composables playground），删除 `ErpDocumentDemo` 薄壳。
- 共享边界：纯函数引擎 + `useEmitEffect`；可选保留无场景 UI 零件（如动态表头字段），不抽页面骨架 composable。
- 场景规则与初始数据放在 `views/erp/` 旁路模块，与对应 `.vue` 同目录。
- 引擎沉淀到 `@/composables`，公开导出，命名走「发出副作用」语义：`emit-effect` / `useEmitEffect`。
- API 形态：纯函数可单独使用 + 薄 composable 包草稿状态与命令入口（调用方注入确认）。
- 精简范围：去掉 mock server、版本冲突、并发模拟、联动流水、`clientRevision` / `serverVersion`、`ScenarioConfig` 驱动渲染。
- 不修改 PlusTable 公共 API；路由 path / title /「ERP 场景」分组保持不变。

## Routes and Navigation

| Route                         | Title        | Group    |
| ----------------------------- | ------------ | -------- |
| `/erp/sales-order-linkage`    | 销售订单联动 | ERP 场景 |
| `/erp/purchase-order-linkage` | 采购订单联动 | ERP 场景 |
| `/erp/expense-report-linkage` | 费用报销联动 | ERP 场景 |

现有路由默认重定向与其它分组顺序不变。

## Architecture

```text
src/composables/
  emit-effect.ts              # 纯函数：计划副作用并生成 nextDraft
  emit-effect.test.ts
  use-emit-effect.ts          # 草稿状态 + changeHeader/changeCell/addLine/removeLine
  use-emit-effect.test.ts
  index.ts                    # 导出 useEmitEffect 及必要纯函数/类型

src/views/erp/
  sales-order-linkage.ts
  sales-order-linkage-demo.vue
  purchase-order-linkage.ts
  purchase-order-linkage-demo.vue
  expense-report-linkage.ts
  expense-report-linkage-demo.vue
```

**删除**

- `src/components/erp-document-demo/` 整目录（壳、scenarios、mock server、旧 linkage、相关测试）

**职责**

- `emit-effect.ts`：无 UI；根据规则从当前草稿计算 mutation（含可选 confirmation）。
- `useEmitEffect`：持有 `draft`；把用户命令交给纯函数；有 confirmation 时先 `await confirm(...)`，取消则不落地。
- `views/erp/*-linkage.ts`：本场景的 `EmitEffectRules`、初始草稿、列/表头展示配置、行计算与汇总。
- `views/erp/*-linkage-demo.vue`：完整页面 UI 与交互编排。

## Core Model

草稿精简为：

```ts
interface DocumentDraft<H = Record<string, unknown>, L = DocumentLine> {
  header: H;
  lines: L[];
  summary: DocumentSummary;
  dirty: boolean;
}
```

明细仍用 `fieldSources` 标记可继承字段的 `inherited` | `manual`。单据编号等业务字段放在 `header`（或场景自有字段），不再作为引擎一等公民。

引擎规则（不含 PlusTable 列 / 页面文案）：

```ts
interface EmitEffectRules<H = Record<string, unknown>, L = DocumentLine> {
  headerRules: Record<string, HeaderEmitRule>;
  createLine: (draft: DocumentDraft<H, L>, id: string) => L;
  recalculateLine: (line: L, header: H) => L;
  summarize: (lines: L[], header: H) => DocumentSummary;
}
```

表头策略仍为：

- `force`：同步所有明细
- `inherit`：只更新 `inherited` 行，保留 `manual`
- `recalculate`：表头作为计算上下文，重算系统维护字段

## Emit-Effect Pipeline

所有变更走显式命令，不用表头/明细双向 `watch` 互触发：

```text
接收命令
→ 纯函数计算 EmitEffectMutation（副本上传播 → 行重算 → 汇总）
→ 若有 confirmation，调用方确认
→ 确认通过后提交 nextDraft，并标记 dirty
```

纯函数至少包括：

- `buildHeaderMutation`
- `applyDetailMutation`
- `addLineMutation`
- `removeLineMutation`
- `normalizeDraft`

`EmitEffectMutation` 返回 `nextDraft`、受影响/保留行 id，以及可选 `confirmation`（影响行数、保留行数、字段列表、提示文案）。不再强制依赖联动流水 `record` 结构；Demo 可用一行 status 文案提示结果。

### `useEmitEffect`

```ts
const { draft, changeHeader, changeCell, addLine, removeLine, reset } = useEmitEffect({
  rules,
  initialDraft,
  confirm: async (confirmation) => boolean,
});
```

- 不内置保存、版本、服务端
- `confirm` 由调用方提供（Demo 用 `ElMessageBox`；真实系统可接自有对话框）

## Scenario Scope (Slimmed)

每场景表头约 4 个字段、明细约 5–7 列（含只读计算列），够讲清策略即可。

### Sales Order

- 币种 `force`；仓库/税率 `inherit`；客户或价目表触发单价 `recalculate`
- 明细改数量/折扣 → 行金额 → 表头汇总

### Purchase Order

- 采购组织/结算币种 `force`；仓库/税率 `inherit`；供应商触发采购价 `recalculate`

### Expense Report

- 报销币种 `force`；部门/项目 `inherit`；汇率 `recalculate` 本位币金额

## User Interface

每页包含：

1. `DemoPage` + 简短规则说明
2. 表头表单（字段旁可标注策略标签）
3. PlusTable 明细（编辑、增删、字段来源）
4. 汇总条
5. 可选一行 live status（已应用 / 已取消）

不包含：保存、重置到服务端、模拟并发、重新载入服务端、联动流水面板、客户端/服务端版本号。

窄屏单列布局，沿用现有文档站视觉。

## Testing

- `emit-effect.test.ts`：`force` / `inherit` / `recalculate`、人工覆盖与确认语义、明细→汇总、增删行
- `use-emit-effect.test.ts`：确认取消不落地、确认通过提交草稿
- 场景旁路模块：代表性计算与策略（可按场景拆测或集中轻测）
- 路由测试：三条 ERP 路由与分组顺序仍成立
- Demo 契约：三页引用 `useEmitEffect`，且不含 mock server / 冲突 UI / 共享壳

## Acceptance Criteria

1. 导航仍有「ERP 场景」三页；无 `ErpDocumentDemo` 壳与薄包装依赖。
2. `@/composables` 导出 `useEmitEffect` 及可用纯函数/类型。
3. 每页能演示表头→明细与明细→表头两类副作用。
4. `inherited` / `manual` 行为符合策略；需确认时取消不改草稿。
5. 无循环 watcher；顺序固定为传播 → 行重算 → 汇总。
6. 无模拟服务端与冲突相关 UI/代码。
7. `pnpm test`、`pnpm typecheck`、`pnpm build` 通过。

## Out of Scope

- 真实后端、持久化、审批、权限、库存/预算占用
- 将联动能力并入 PlusTable 公共 API
- 页面级骨架 composable
- 国际化与大数据量压测
- npm 独立发包（本仓库内 `@/composables` 导出即可）
