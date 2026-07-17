# ERP Currency + Exchange Rate Design

Date: 2026-07-17

Related: `docs/superpowers/specs/2026-07-17-erp-emit-effect-demos-design.md`

## Goal

三个 ERP 联动 Demo（销售订单、采购订单、费用报销）在已有币种 `force` 的基础上补齐汇率：

1. 表头具备可编辑 `exchangeRate`，明细具备只读本位币金额。
2. 改币种时，仅当当前汇率仍等于「旧币种默认汇率」才写入新币种默认汇率；手改过的汇率保留。
3. 汇率变更触发全部明细本位币重算与汇总更新。

不改动 `useEmitEffect` / `buildHeaderMutation` 公共 API。

## Confirmed Decisions

- 范围：三单据全部接入（销售 / 采购补汇率与本位币；费用补币种→默认汇率联动）。
- 默认汇率覆盖策略：仅当 `exchangeRate === DEFAULT[旧币种]` 时覆盖为 `DEFAULT[新币种]`；否则保留。
- 本位币展示：明细行 `localAmount` 列 + 汇总本位币合计（销售/采购为 `totalLocalAmount`；费用沿用 `localAmount` 汇总键）。
- 实现落点：`views/erp/emit-helpers.ts` 共享助手 + 各场景 `*-linkage.ts` / `*-demo.vue`；不扩展 composable。
- 演示汇率表：`CNY → 1`，`USD → 7.2`，`EUR → 7.8`。
- 本位币固定为 CNY（演示约定，不做多本位币切换）。

## Data Model

### Shared defaults (`emit-helpers`)

```ts
DEFAULT_EXCHANGE_RATES = { CNY: 1, USD: 7.2, EUR: 7.8 }
```

Helpers:

- `defaultExchangeRate(currency): number`
- `syncExchangeRateIfStillDefault(nextHeader, previousHeader): void`  
  若 `Number(previousHeader.exchangeRate) === defaultExchangeRate(previousHeader.currency)`，则  
  `nextHeader.exchangeRate = defaultExchangeRate(nextHeader.currency)`。
- `forceCurrencyWithRate(): HeaderEmitRule`  
  替代三处 `forceField('currency', 'currency')`：对每行 `patch.currency = nextHeader.currency`；并在 `apply` 内幂等调用 `syncExchangeRateIfStillDefault`（`nextHeader` 为 `buildHeaderMutation` 的共享 working header）。

### Header (all three drafts)

| Field           | Role                                      |
| --------------- | ----------------------------------------- |
| `currency`      | 结算/报销币种；强制同步到明细             |
| `exchangeRate`  | 原币→本位币汇率；可手改；改币种时条件覆盖 |

初始值：三单据均为 `currency: 'CNY'`，`exchangeRate: 1`。

### Line + summary

| Scene     | Original amount                         | Local amount                         | Summary keys                                      |
| --------- | --------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| Sales     | `amount = qty × unitPrice × (1+taxRate)` | `localAmount = amount × exchangeRate` | `totalQty`, `totalAmount`, `totalLocalAmount`     |
| Purchase  | same as sales                           | same                                 | `totalQty`, `totalAmount`, `totalLocalAmount`     |
| Expense   | `amount`, `deductibleTax` (unchanged)   | `max(amount - deductibleTax, 0) × exchangeRate` | `originalAmount`, `deductibleTax`, `localAmount` |

金额均经现有 `money()` 两位小数规整。

## Header Rules

| Field           | Policy         | Confirm | Behavior                                                                 |
| --------------- | -------------- | ------- | ------------------------------------------------------------------------ |
| `currency`      | force (+ rate) | yes     | Force line currency；条件同步表头汇率；`recalculateLine` 重算本位币     |
| `exchangeRate`  | recalculate    | yes     | `apply` 返回空补丁；靠 `recalculateLine` 用新汇率更新 `localAmount`     |
| other fields    | unchanged      | —       | 销售/采购：客户/供应商 reprice、仓库/税率 inherit；费用：部门/项目 inherit |

币种规则通过 mutate 共享 `nextHeader` 写回汇率：在单次 `changeHeader('currency', …)` 内原子完成，避免两次确认。`sync` 对每行 `apply` 调用均幂等。

## UI

- 销售 / 采购表头增加「汇率 · 触发重算」`el-input-number`（`min: 0.01`，与费用一致）。
- 明细增加只读「本位币金额」列（`localAmount`）。
- 底栏增加本位币合计展示。
- 页面 description / hint 补充：改币种可能带出默认汇率；手改汇率后改币种不覆盖。

费用报销既有汇率控件与本位币列保留，仅规则改为 `forceCurrencyWithRate`。

## Testing

规则单测（各场景 `*-linkage.test.ts`）：

1. 默认汇率下改币种（如 CNY→USD）→ 表头汇率变为 `7.2`，明细 `localAmount` / 汇总本位币随之变化。
2. 先手改 `exchangeRate` 再改币种 → 汇率保持手改值；本位币按保留汇率重算。
3. 单独改 `exchangeRate` → 本位币变化（费用已有；销售/采购新增）。
4. 既有行为不回归：币种 force 到每行；manual 仓库/部门等仍保留。

不强制改 E2E / demo 路由测试。

## Out of Scope

- 真实汇率 API / 历史汇率 / 生效日期。
- 明细行独立币种或独立汇率。
- 扩展 `HeaderLineEffect.headerPatch` 或修改 composable 引擎。
- 多本位币账套切换。

## Files Touched

- `src/views/erp/emit-helpers.ts` — 默认汇率表与 `forceCurrencyWithRate`
- `src/views/erp/sales-order-linkage.ts` + demo + test
- `src/views/erp/purchase-order-linkage.ts` + demo + test
- `src/views/erp/expense-report-linkage.ts` + test（demo 文案可小幅更新）
