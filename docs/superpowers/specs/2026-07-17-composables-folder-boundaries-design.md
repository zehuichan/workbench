# Composables Folder Boundaries Design

Date: 2026-07-17

## Goal

把 `src/composables/` 从平铺文件改为「每个 `useXxx` 一个文件夹」，用目录表达模块边界；对外仍只通过 `@/composables` 根 barrel 消费，调用方零改动。

## Decisions

| 项 | 选择 |
|----|------|
| 分包粒度 | 每个 `useXxx` 一个文件夹（含其私有实现与测试） |
| 共享工具 | `shared/watch-readable.ts`（被 form-draft / auto-save 共用） |
| 公共 API | 根 `index.ts` 继续导出全部现有公共符号 |
| 夹内 barrel | 各夹 `index.ts` 只 re-export 该夹公开面 |
| 深路径消费 | 不做；不鼓励 `@/composables/use-xxx` 直引（YAGNI） |
| 行为 / API 语义 | 不改；纯搬家 + 更新相对 import |

## Target structure

```text
src/composables/
  index.ts                         # 根 barrel：公开 API 唯一入口
  shared/
    watch-readable.ts              # 非公共；仅夹内相对引用
  use-emit-effect/
    index.ts
    emit-effect.ts                 # 纯函数 + 类型（经根 barrel 对外导出）
    emit-effect.test.ts
    use-emit-effect.ts
    use-emit-effect.test.ts
  use-form-draft/
    index.ts
    use-form-draft.ts
    use-form-draft.test.ts
  use-auto-save/
    index.ts
    use-auto-save.ts
    use-auto-save.test.ts
  use-save-hotkey/
    index.ts
    save-hotkey-registry.ts        # 非公共；仅夹内引用
    use-save-hotkey.ts
    use-save-hotkey.test.ts
```

## Public API (unchanged surface)

根 `src/composables/index.ts` 继续导出：

| 来源夹 | 导出 |
|--------|------|
| `use-auto-save` | `useAutoSave` + 相关 types |
| `use-emit-effect` | `useEmitEffect` + 相关 types；以及 `emit-effect` 的 mutation helpers / document types（ERP 已依赖） |
| `use-form-draft` | `useFormDraft` + 相关 types |
| `use-save-hotkey` | `useSaveHotkey` + 相关 types |

明确**不**从根 barrel 导出：

- `watchReadable`
- `registerSaveHotkey` / `save-hotkey-registry` 内部符号

夹内 `index.ts` 只导出该夹公开面；`emit-effect` 的 mutation/types 算 `use-emit-effect` 夹的公开面（因 ERP 规则文件直接用它们组 rules）。

## Internal imports

| 文件 | 改为 |
|------|------|
| `use-auto-save.ts` / `use-form-draft.ts` → `watch-readable` | `../shared/watch-readable` |
| `use-emit-effect.ts` → `emit-effect` | `./emit-effect`（同夹） |
| `use-save-hotkey.ts` → `save-hotkey-registry` | `./save-hotkey-registry`（同夹） |
| 各 `*.test.ts` | 跟随被测文件进同夹，相对路径同步更新 |
| 根 `index.ts` | `./use-auto-save` 等指向各夹（经夹内 `index.ts` 或目录入口） |

## Out of scope

- 不改任何 composable 运行时行为或类型语义
- 不改 `src/views/composables/` demo 路由与文件布局
- 不引入新抽象、不合并/拆分 API
- 不做 deep-import 路径别名清理以外的工程配置改动

## Verification

1. 现有依赖 `@/composables` 的 demo / ERP 文件无需改 import 路径
2. composables 相关单测全部通过
3. 目录一眼能看出四个 hook 边界 + 一个 shared
