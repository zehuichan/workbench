import type { MarkdownRenderer } from 'vitepress';

import { buildDemoImports, transformMarkdownDemos } from './parse-demo';

/**
 * 文档 `<demo src="...">标题</demo>` 写法的 markdown-it 插件。
 *
 * 工作流程（在 `core` 阶段最早期一次性改写 `state.src`）：
 *
 * 1. 扫描 markdown 源里所有 `<demo>` 标签，去重收集 `(src, title, description)`。
 * 2. 把每个 `<demo>` 替换为 `<DemoBlock title :description :source><Component /></DemoBlock>`。
 * 3. 自动在 `<script setup>` 块里追加示例组件与 `?raw` 源的 import；若页面尚无脚本块则新建一个。
 */
export function labDemoPlugin(md: MarkdownRenderer): void {
  md.core.ruler.before('normalize', 'lab-demo', (state) => {
    const original = state.src;
    if (!original.includes('<demo')) return;

    const { source: rewritten, demos } = transformMarkdownDemos(original);
    if (!demos.length) {
      state.src = rewritten;
      return;
    }

    state.src = injectDemoImports(rewritten, buildDemoImports(demos));
  });
}

/** 把 import 语句合并进既有 `<script setup>` 或新建一个脚本块。 */
function injectDemoImports(source: string, imports: string): string {
  if (!imports) return source;

  const setupRe = /<script\b([^>]*\bsetup\b[^>]*)>([\s\S]*?)<\/script>/;
  const match = source.match(setupRe);
  if (match) {
    const [full, attrs, body] = match;
    const merged = `<script${attrs}>\n${imports}\n${body}</script>`;
    return source.replace(full, merged);
  }

  const block = `<script setup lang="ts">\n${imports}\n</script>\n\n`;
  const fmRe = /^---\n[\s\S]*?\n---\n/;
  if (fmRe.test(source)) {
    return source.replace(fmRe, (m) => `${m}\n${block}`);
  }
  return `${block}${source}`;
}
