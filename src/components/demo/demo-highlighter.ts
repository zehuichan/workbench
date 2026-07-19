import { createHighlighter, type Highlighter } from 'shiki';

const LANG_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
};

export function resolveLang(lang: string): string {
  return LANG_ALIASES[lang] ?? lang;
}

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light'],
      langs: ['typescript', 'vue', 'javascript'],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(
  code: string,
  lang = 'ts',
): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang: resolveLang(lang),
    theme: 'github-light',
  });
}
