import { createHash } from 'node:crypto';

/**
 * 单个 `<demo>` 引用解析后的中间表示。
 */
export interface DemoEntry {
  /** demo 源文件路径，原样保留用户写入的字符串（推荐 `./demo/xxx.vue` 形式的相对路径）。 */
  src: string;
  /** 标题：来自闭合标签内文本或 `title="..."` 属性，已去标签与压缩空白。 */
  title: string;
  /** 可选描述：来自 `description="..."` 属性。 */
  description?: string;
  /** 基于 src 计算的稳定 id，用于在同一页内 dedupe 与命名 import。 */
  id: string;
}

export interface DemoTransformResult {
  /** 已用 `<DemoBlock>` 替换 `<demo>` 后的 markdown 源文。 */
  source: string;
  /** 当前页面去重后的 demo 引用列表（按首次出现顺序）。 */
  demos: DemoEntry[];
}

/** 给 `replaceMarkdownDemos` 的替换器：拿到去重后的 entry，返回想要写回源串的字符串。 */
export type DemoReplacer = (entry: DemoEntry, fullMatch: string) => string;

const DEMO_TAG_RE = /<demo\b([^>]*?)\/\s*>|<demo\b([^>]*?)>([\s\S]*?)<\/demo>/g;
const ATTR_RE = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
// 保留首/尾三+ 反引号或波浪线围成的代码块原样：文档里在 ```md 里举例 <demo> 写法时，
// 不应被插件改写，否则 vite 会把示例当真实 demo 解析失败。
const FENCE_RE = /^([ \t]{0,3})(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1\2[ \t]*$/gm;
// 占位符避开 markdown / Vue 模板里可能出现的字符，以及 demo 解析正则要识别的 `<demo`。
const FENCE_PLACEHOLDER_PREFIX = '@@LAB_FENCE_';
const FENCE_PLACEHOLDER_SUFFIX = '@@';
const FENCE_PLACEHOLDER_RE = new RegExp(
  `${FENCE_PLACEHOLDER_PREFIX}(\\d+)${FENCE_PLACEHOLDER_SUFFIX}`,
  'g',
);

function maskFencedBlocks(src: string): {
  masked: string;
  unmask: (s: string) => string;
} {
  const slots: string[] = [];
  const masked = src.replace(FENCE_RE, (block) => {
    const i = slots.length;
    slots.push(block);
    return `${FENCE_PLACEHOLDER_PREFIX}${i}${FENCE_PLACEHOLDER_SUFFIX}`;
  });
  return {
    masked,
    unmask: (s) =>
      s.replace(FENCE_PLACEHOLDER_RE, (_m, i) => slots[Number(i)] ?? ''),
  };
}

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of raw.matchAll(ATTR_RE)) {
    const key = m[1]!;
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    out[key] = val;
  }
  return out;
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** 与 Vue/JS 标识符兼容的 8 位 id，前缀 X 保证以字母开头。 */
function hashId(src: string): string {
  return `X${createHash('md5').update(src).digest('hex').slice(0, 8)}`;
}

function defaultTitleFromSrc(src: string): string {
  const base = src.split(/[\\/]/).pop() ?? src;
  return base.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
}

/** 把单个 `<demo>` 匹配解析为 DemoEntry；attrs 缺 src 时返回 null。 */
function parseDemoMatch(
  selfAttrs: string | undefined,
  openAttrs: string | undefined,
  inner: string | undefined,
): DemoEntry | null {
  const attrsRaw = selfAttrs ?? openAttrs ?? '';
  const attrs = parseAttrs(attrsRaw);
  const src = attrs.src?.trim();
  if (!src) return null;

  const titleRaw = attrs.title ?? inner ?? '';
  const title = stripTags(titleRaw) || defaultTitleFromSrc(src);
  const description = attrs.description
    ? stripTags(attrs.description)
    : undefined;
  return { src, title, description, id: hashId(src) };
}

/**
 * 通用的 `<demo>` 标签遍历器。
 *
 * 调用方提供 `replacer`：以 dedupe 后的 entry 决定如何重写当前匹配。
 */
export function replaceMarkdownDemos(
  md: string,
  replacer: DemoReplacer,
): DemoTransformResult {
  const dedup = new Map<string, DemoEntry>();
  const { masked, unmask } = maskFencedBlocks(md);
  const replaced = masked.replace(
    DEMO_TAG_RE,
    (full, selfAttrs, openAttrs, inner) => {
      const parsed = parseDemoMatch(selfAttrs, openAttrs, inner);
      if (!parsed) return full;
      if (!dedup.has(parsed.src)) dedup.set(parsed.src, parsed);
      return replacer(dedup.get(parsed.src)!, full);
    },
  );
  return { source: unmask(replaced), demos: [...dedup.values()] };
}

/** 仅提取 `<demo>` 引用列表，不修改源串。 */
export function extractDemoEntries(md: string): DemoEntry[] {
  return replaceMarkdownDemos(md, (_, full) => full).demos;
}

/**
 * 把 markdown 中所有 `<demo src="...">标题</demo>` 重写为 `<DemoBlock>` 块。
 *
 * 仅在源串里替换 demo 标签；脚本块的合并交给上层（markdown-it 插件）处理。
 * demo 实例统一裹一层 `<ClientOnly>`，避免 SSR 阶段触发浏览器 API（RAF、localStorage 等）报错。
 */
export function transformMarkdownDemos(md: string): DemoTransformResult {
  return replaceMarkdownDemos(md, (entry) => {
    const titleAttr = ` title="${escapeAttr(entry.title)}"`;
    const descAttr = entry.description
      ? ` description="${escapeAttr(entry.description)}"`
      : '';
    return `<DemoBlock${titleAttr}${descAttr} :source="LabDemoSource${entry.id}"><ClientOnly><LabDemo${entry.id} /></ClientOnly></DemoBlock>`;
  });
}

/** 生成 `<script setup>` 内待注入的 import 语句串。 */
export function buildDemoImports(demos: DemoEntry[]): string {
  if (!demos.length) return '';
  return demos
    .map(
      (d) =>
        `import LabDemo${d.id} from '${d.src}';\nimport LabDemoSource${d.id} from '${d.src}?raw';`,
    )
    .join('\n');
}
