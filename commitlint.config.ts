import type { UserConfig } from '@commitlint/types';

import { execSync } from 'node:child_process';

// Scope allow-list from top-level `src/` folders plus project-wide tags.
const SRC_SCOPES = [
  'adapter',
  'api',
  'components',
  'composables',
  'layouts',
  'router',
  'styles',
  'ui',
  'utils',
  'views',
];

const PROJECT_SCOPES = [
  'project',
  'style',
  'lint',
  'ci',
  'dev',
  'deploy',
  'release',
  'other',
];

const allowedScopes = [...SRC_SCOPES, ...PROJECT_SCOPES];

// If the working tree has modified files under `src/<bucket>/`, offer that
// bucket as the default prompt scope.
const scopeComplete = (() => {
  try {
    return execSync('git status --porcelain || true')
      .toString()
      .trim()
      .split('\n')
      .find((r) => ~r.indexOf('M src'))
      ?.replaceAll(/(\/)/g, '%%')
      ?.match(/src%%((\w|-)*)/)?.[1]
      ?.replace(/s$/, '');
  } catch {
    return undefined;
  }
})();

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  plugins: ['commitlint-plugin-function-rules'],
  prompt: {
    alias: {
      b: 'build: bump dependencies',
      c: 'chore: update config',
      f: 'docs: fix typos',
      r: 'docs: update README',
      s: 'style: update code format',
    },
    allowCustomIssuePrefixs: false,
    allowEmptyIssuePrefixs: false,
    customScopesAlign: scopeComplete ? 'bottom' : 'top',
    defaultScope: scopeComplete,
    typesAppend: [
      { name: 'workflow:  workflow improvements', value: 'workflow' },
      { name: 'types:     type definition file changes', value: 'types' },
    ],
  },
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
    'function-rules/scope-enum': [
      2,
      'always',
      (parsed) => {
        if (!parsed.scope || allowedScopes.includes(parsed.scope)) {
          return [true];
        }
        return [false, `scope must be one of ${allowedScopes.join(', ')}`];
      },
    ],
    'header-max-length': [2, 'always', 108],
    'scope-enum': [0],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'style',
        'docs',
        'test',
        'refactor',
        'build',
        'ci',
        'chore',
        'revert',
        'types',
        'release',
        'workflow',
      ],
    ],
  },
};

export default config;
