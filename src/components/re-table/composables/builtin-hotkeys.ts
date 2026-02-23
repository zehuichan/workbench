import type { HotkeyBinding, HotkeyContext } from '../types'

const notEditing = (ctx: HotkeyContext) => !ctx.cellMeta.editing
const isEditing = (ctx: HotkeyContext) => ctx.cellMeta.editing
const isActive = (ctx: HotkeyContext) => ctx.cellMeta.activated

/** input/textarea 聚焦时禁用方向键导航，保留光标移动 */
const notInInput = (ctx: HotkeyContext) => {
  const el = ctx.event?.target as HTMLElement | null
  if (!el) return true
  const tag = el.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea') return false
  if (el.isContentEditable) return false
  return !el.closest('input, textarea, [contenteditable="true"]')
}

export function createBuiltinHotkeys(): HotkeyBinding[] {
  return [
    // ──── 方向键导航（input 聚焦时禁用）────
    {
      key: 'ArrowUp',
      handler: (ctx) => ctx.navigate(-1, 0),
      when: (ctx) => isActive(ctx) && notInInput(ctx),
    },
    {
      key: 'ArrowDown',
      handler: (ctx) => ctx.navigate(1, 0),
      when: (ctx) => isActive(ctx) && notInInput(ctx),
    },
    {
      key: 'ArrowLeft',
      handler: (ctx) => ctx.navigate(0, -1),
      when: (ctx) => isActive(ctx) && notEditing(ctx) && notInInput(ctx),
    },
    {
      key: 'ArrowRight',
      handler: (ctx) => ctx.navigate(0, 1),
      when: (ctx) => isActive(ctx) && notEditing(ctx) && notInInput(ctx),
    },

    // ──── Tab 导航 ────
    {
      key: 'Tab',
      handler: (ctx) => ctx.navigate(0, 1),
      when: isActive,
    },
    {
      key: 'Shift+Tab',
      handler: (ctx) => ctx.navigate(0, -1),
      when: isActive,
    },

    // ──── Enter 确认并下移 ────
    {
      key: 'Enter',
      handler: (ctx) => ctx.navigate(1, 0),
      when: isActive,
    },

    // ──── F2 进入编辑 ────
    {
      key: 'F2',
      handler: (ctx) => ctx.startEdit(),
      when: (ctx) => isActive(ctx) && notEditing(ctx),
    },

    // ──── Escape 取消编辑（stopPropagation 防止 el-select 等 popper 占用） ────
    {
      key: 'Escape',
      handler: (ctx) => ctx.cancelEdit(),
      when: (ctx) => isActive(ctx) && isEditing(ctx),
      stopPropagation: true,
    },

    // ──── Ctrl+C 复制 ────
    {
      key: 'Ctrl+C',
      handler: (ctx) => {
        if (!ctx.row || !ctx.column?.prop) return
        const value = ctx.row[ctx.column.prop]
        const text = value == null ? '' : String(value)
        navigator.clipboard.writeText(text).catch(() => {})
      },
      when: (ctx) => isActive(ctx) && notEditing(ctx),
    },

    // ──── Ctrl+V 粘贴 ────
    {
      key: 'Ctrl+V',
      handler: (ctx) => {
        if (!ctx.column?.prop) return
        navigator.clipboard
          .readText()
          .then((text) => ctx.updateCellValue(text))
          .catch(() => {})
      },
      when: (ctx) => isActive(ctx) && notEditing(ctx),
    },

    // ──── Delete / Backspace 清空并编辑 ────
    {
      key: 'Delete',
      handler: (ctx) => {
        ctx.updateCellValue('')
        ctx.startEdit()
      },
      when: (ctx) => isActive(ctx) && notEditing(ctx),
    },
    {
      key: 'Backspace',
      handler: (ctx) => {
        ctx.updateCellValue('')
        ctx.startEdit()
      },
      when: (ctx) => isActive(ctx) && notEditing(ctx),
    },

    // ──── Home / End ────
    {
      key: 'Home',
      handler: (ctx) => {
        const cols = ctx.columns
        const firstCol = cols.findIndex(
          (c) => !['selection', 'index', 'expand'].includes(c.type ?? ''),
        )
        if (firstCol >= 0) {
          ctx.navigate(0, firstCol - ctx.cellMeta.col)
        }
      },
      when: (ctx) => isActive(ctx) && notEditing(ctx),
    },
    {
      key: 'End',
      handler: (ctx) => {
        const cols = ctx.columns
        let lastCol = cols.length - 1
        while (
          lastCol >= 0 &&
          ['selection', 'index', 'expand'].includes(cols[lastCol].type ?? '')
        ) {
          lastCol--
        }
        if (lastCol >= 0) {
          ctx.navigate(0, lastCol - ctx.cellMeta.col)
        }
      },
      when: (ctx) => isActive(ctx) && notEditing(ctx),
    },

    // ──── Ctrl+Home / Ctrl+End ────
    {
      key: 'Ctrl+Home',
      handler: (ctx) => {
        const cols = ctx.columns
        const firstCol = cols.findIndex(
          (c) => !['selection', 'index', 'expand'].includes(c.type ?? ''),
        )
        ctx.navigate(-ctx.cellMeta.row, firstCol - ctx.cellMeta.col)
      },
      when: (ctx) => isActive(ctx) && notEditing(ctx),
    },
    {
      key: 'Ctrl+End',
      handler: (ctx) => {
        const cols = ctx.columns
        const totalRows = ctx.tableData.length
        let lastCol = cols.length - 1
        while (
          lastCol >= 0 &&
          ['selection', 'index', 'expand'].includes(cols[lastCol].type ?? '')
        ) {
          lastCol--
        }
        ctx.navigate(
          totalRows - 1 - ctx.cellMeta.row,
          lastCol - ctx.cellMeta.col,
        )
      },
      when: (ctx) => isActive(ctx) && notEditing(ctx),
    },
  ]
}

const PRINTABLE_KEY_RE = /^[\w\d ]$/

export function isPrintableKey(key: string): boolean {
  return PRINTABLE_KEY_RE.test(key)
}
