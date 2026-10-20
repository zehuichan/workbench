import type { Linter } from 'eslint';

import parserVue from 'vue-eslint-parser';

import parserTs from '@typescript-eslint/parser';
import pluginPerfectionist from 'eslint-plugin-perfectionist';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import pluginVue from 'eslint-plugin-vue';

const vuePlugin = pluginVue as typeof pluginVue & {
  configs?: Record<string, Linter.Config[] | { rules?: Linter.RulesRecord }>;
  processors?: Record<string, Linter.Processor>;
};

const flatEssential = vuePlugin.configs?.['flat/essential'] ?? [];
const flatStronglyRecommended =
  vuePlugin.configs?.['flat/strongly-recommended'] ?? [];
const flatRecommended = vuePlugin.configs?.['flat/recommended'] ?? [];

const config: Linter.Config[] = [
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/dist-*',
      '**/*-dist',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/pnpm-lock.yaml',
      '**/bun.lockb',
      '**/coverage',
      '**/temp',
      '**/.temp',
      '**/tmp',
      '**/.tmp',
      '**/.history',
      '**/.idea',
      '**/.cache',
      '**/.vite-inspect',
      '**/CHANGELOG*.md',
      '**/*.min.*',
      '**/LICENSE*',
      '**/auto-import?(s).d.ts',
      '**/components.d.ts',
      '**/*.sh',
      '**/.agent/**',
      '**/.agents/**',
      '**/.codex/**',
      '**/.claude/**',
      '**/.cursor/**',
      'public/**',
      '**/src/api/generated/**',
    ],
  },

  ...flatEssential,
  ...flatStronglyRecommended,
  ...flatRecommended,

  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      'unused-imports': pluginUnusedImports as never,
    },
    rules: {
      'dot-notation': ['error', { allowKeywords: true }],
      'no-restricted-syntax': [
        'error',
        'DebuggerStatement',
        'LabeledStatement',
        'WithStatement',
        'TSEnumDeclaration[const=true]',
        'TSExportAssignment',
      ],
      'object-shorthand': [
        'error',
        'always',
        { avoidQuotes: true, ignoreConstructors: false },
      ],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    languageOptions: {
      parser: parserTs as never,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    rules: {
      'unused-imports/no-unused-vars': 'off',
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue as never,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        extraFileExtensions: ['.vue'],
        parser: parserTs as never,
        sourceType: 'module',
      },
    },
    plugins: {
      vue: vuePlugin as never,
    },
    processor: vuePlugin.processors?.['.vue'],
    rules: {
      ...(vuePlugin.configs?.base as undefined | { rules?: Linter.RulesRecord })
        ?.rules,

      'unused-imports/no-unused-vars': 'off',

      'vue/attribute-hyphenation': ['error', 'always', { ignore: [] }],
      'vue/attributes-order': 'off',
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-options-name-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
        },
      ],
      'vue/dot-location': ['error', 'property'],
      'vue/dot-notation': ['error', { allowKeywords: true }],
      'vue/eqeqeq': ['error', 'smart'],
      'vue/html-closing-bracket-newline': 'error',
      'vue/html-indent': 'off',
      'vue/html-quotes': ['error', 'double'],
      'vue/html-self-closing': [
        'error',
        {
          html: { component: 'always', normal: 'never', void: 'always' },
          math: 'always',
          svg: 'always',
        },
      ],
      'vue/max-attributes-per-line': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/multiline-html-element-content-newline': 'error',
      'vue/no-empty-pattern': 'error',
      'vue/no-extra-parens': ['error', 'functions'],
      'vue/no-irregular-whitespace': 'error',
      'vue/no-loss-of-precision': 'error',
      'vue/no-reserved-component-names': 'off',
      'vue/no-restricted-syntax': [
        'error',
        'DebuggerStatement',
        'LabeledStatement',
        'WithStatement',
      ],
      'vue/no-restricted-v-bind': ['error', '/^v-/'],
      'vue/no-sparse-arrays': 'error',
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/object-shorthand': [
        'error',
        'always',
        { avoidQuotes: true, ignoreConstructors: false },
      ],
      'vue/one-component-per-file': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-template': 'error',
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/require-default-prop': 'error',
      'vue/require-explicit-emits': 'error',
      'vue/require-prop-types': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/space-infix-ops': 'error',
      'vue/space-unary-ops': ['error', { nonwords: false, words: true }],
      'vue/v-on-event-hyphenation': [
        'error',
        'always',
        { autofix: true, ignore: [] },
      ],
    },
  },

  (pluginPerfectionist as { configs: Record<string, Linter.Config> }).configs[
    'recommended-natural'
  ],
  {
    rules: {
      'perfectionist/sort-exports': [
        'error',
        { order: 'asc', type: 'natural' },
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          customGroups: [
            {
              elementNamePattern: ['^vue$', '^vue-.+', '^@vue/.+'],
              groupName: 'vue-type',
              selector: 'type',
            },
            {
              elementNamePattern: ['^vue$', '^vue-.+', '^@vue/.+'],
              groupName: 'vue',
            },
          ],
          environment: 'node',
          groups: [
            ['type-external', 'type-builtin', 'type-import'],
            'vue-type',
            ['type-parent', 'type-sibling', 'type-index'],
            ['type-internal'],
            'value-builtin',
            'vue',
            'value-external',
            'value-internal',
            ['value-parent', 'value-sibling', 'value-index'],
            'side-effect',
            'side-effect-style',
            'style',
            'ts-equals-import',
            'unknown',
          ],
          // `@/*` → `src/*`
          internalPattern: ['^@/.+'],
          newlinesBetween: 1,
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-modules': 'off',
      'perfectionist/sort-named-exports': [
        'error',
        { order: 'asc', type: 'natural' },
      ],
      'perfectionist/sort-objects': 'off',
    },
  },

  // Build / config scripts may use console freely.
  {
    files: [
      'scripts/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}',
      '*.config.{js,cjs,mjs,ts,cts,mts}',
      'vite.config.ts',
      'commitlint.config.ts',
      'stylelint.config.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },

  // Business code must use @/utils/request; forbid deep relative imports.
  {
    files: ['src/**/*.{ts,tsx,vue}'],
    ignores: ['src/utils/request.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              importNames: ['default'],
              message:
                'Import the shared axios instance from `@/utils/request` instead of creating a new one.',
              name: 'axios',
            },
          ],
          patterns: [
            {
              group: ['../../../**', '../../../../**'],
              message:
                'Avoid deep relative imports across `src/`. Use the `@/` alias instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/utils/request.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['auto-imports.d.ts', 'components.d.ts', '**/*.d.ts'],
    rules: {
      'unused-imports/no-unused-vars': 'off',
    },
  },
];

export default config;
