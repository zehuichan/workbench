import { defineConfig } from 'oxfmt';

/**
 * Oxfmt options for the basic template (semi / singleQuote / arrowParens).
 */
export default defineConfig({
  $schema: './node_modules/oxfmt/configuration_schema.json',
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
  ignorePatterns: [
    '**/dist/**',
    '**/node_modules/**',
    '**/pnpm-lock.yaml',
    '**/auto-imports.d.ts',
    '**/components.d.ts',
    '**/src/api/generated/**',
    'public/**',
    // Git symlink to AGENTS.md; checked out as link text, a final newline breaks the link.
    'CLAUDE.md',
    // vibe-harness and skills-lock.json compare these with upstream text byte for byte.
    '.agents/skills/**',
    '.agents/notes/README.md',
    '.agents/notes/**/AGENTS.md',
    'docs/AGENTS.md',
    'docs/defensive-patterns/**',
  ],
  insertFinalNewline: true,
  overrides: [
    {
      files: [
        '*.json',
        '*.json5',
        '*.jsonc',
        '*.code-workspace',
        '**/*.json',
        '**/*.json5',
        '**/*.jsonc',
        '**/*.code-workspace',
      ],
      options: {
        quoteProps: 'preserve',
        singleQuote: false,
        trailingComma: 'none',
      },
    },
  ],
  printWidth: 80,
  proseWrap: 'never',
  quoteProps: 'as-needed',
  semi: true,
  singleQuote: true,
  sortImports: false,
  sortPackageJson: false,
  tabWidth: 2,
  trailingComma: 'all',
});
