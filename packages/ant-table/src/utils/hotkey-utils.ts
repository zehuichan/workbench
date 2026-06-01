/**
 * 热键匹配：将 'Ctrl+Shift+Z' 等组合键字符串与 KeyboardEvent 进行比对。
 */
export function matchesHotkey(event: KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey
    .toLowerCase()
    .split('+')
    .map((s) => s.trim());
  const mainKey = parts.find(
    (p) => !['ctrl', 'shift', 'alt', 'meta'].includes(p),
  );
  if (!mainKey) return false;

  return (
    event.ctrlKey === parts.includes('ctrl') &&
    event.shiftKey === parts.includes('shift') &&
    event.altKey === parts.includes('alt') &&
    event.metaKey === parts.includes('meta') &&
    event.key.toLowerCase() === mainKey
  );
}

/** 判断按键是否为可打印字符（排除 Ctrl/Alt/Meta 修饰键） */
export function isPrintableKey(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.altKey || event.metaKey) return false;
  return event.key.length === 1;
}
