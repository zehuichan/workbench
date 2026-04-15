import { createBundledHighlighter } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

/** 仅注册文档用到的语言，避免拉全量 bundle-web。 */
const langs = {
  typescript: () => import('@shikijs/langs/typescript').then((m) => m.default),
  javascript: () => import('@shikijs/langs/javascript').then((m) => m.default),
  ts: () => import('@shikijs/langs/typescript').then((m) => m.default),
  js: () => import('@shikijs/langs/javascript').then((m) => m.default),
  tsx: () => import('@shikijs/langs/tsx').then((m) => m.default),
  vue: () => import('@shikijs/langs/vue').then((m) => m.default),
};

const themes = {
  'github-light': () => import('@shikijs/themes/github-light').then((m) => m.default),
  'github-dark': () => import('@shikijs/themes/github-dark').then((m) => m.default),
};

const createHighlighter = createBundledHighlighter({
  langs,
  themes,
  /** 纯 JS 引擎，避免浏览器里 Oniguruma WASM 初始化失败导致整页无高亮。 */
  engine: () => createJavaScriptRegexEngine(),
});

type DocsHighlighter = Awaited<ReturnType<typeof createHighlighter>>;

let highlighterPromise: Promise<DocsHighlighter> | null = null;

export function getShikiHighlighter(): Promise<DocsHighlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      langs: ['typescript', 'javascript', 'tsx', 'vue'],
      themes: ['github-light', 'github-dark'],
    });
  }
  return highlighterPromise;
}
