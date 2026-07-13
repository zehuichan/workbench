#!/usr/bin/env node
/**
 * first-principles-review quality check (Windows-friendly)
 *
 * Usage:
 *   node check.mjs --selftest
 */

import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};

const ERR = `${c.red('✗')}`;
const OK = `${c.green('✓')}`;
const WARN = `${c.yellow('!')}`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SKILL_ROOT, '../..');
const SKILL_NAME = 'first-principles-review';

async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  let currentKey = null;
  let currentVal = [];
  const flush = () => {
    if (!currentKey) return;
    fm[currentKey] = currentVal.join('\n').trim();
    currentKey = null;
    currentVal = [];
  };
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      flush();
      currentKey = kv[1];
      const rest = kv[2].trim();
      if (rest === '|' || rest === '>') {
        currentVal = [];
      } else {
        currentVal = [rest];
      }
      continue;
    }
    if (currentKey && (/^  /.test(line) || line.trim() === '')) {
      currentVal.push(line.replace(/^  /, ''));
      continue;
    }
  }
  flush();
  return fm;
}

function getLatestChangelogVersion(content, skillName) {
  const escaped = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const heading = content.match(new RegExp(`^##\\s+${escaped}\\s*$`, 'm'));
  if (!heading) return null;
  const after = content.slice(heading.index + heading[0].length);
  const nextHeading = after.search(/^##\s/m);
  const section = nextHeading >= 0 ? after.slice(0, nextHeading) : after;
  return section.match(/^###\s+v(\d+\.\d+\.\d+)/m)?.[1] ?? null;
}

function getListedVersion(content, skillName) {
  const row = content
    .split(/\r?\n/)
    .find((line) => line.includes(`./skills/${skillName}/`));
  return row?.match(new RegExp(`${skillName}-v(\\d+\\.\\d+\\.\\d+)`))?.[1] ?? null;
}

function requireMarkers(content, source, markers, errors) {
  for (const marker of markers) {
    if (content.includes(marker)) continue;
    errors.push(`${source} missing marker: ${marker}`);
  }
}

async function selftest() {
  const errors = [];
  const warnings = [];

  const changelogFixture =
    '## first-principles-review-backup\n### v9.9.9\n## first-principles-review\n### v3.0.0\n';
  if (getLatestChangelogVersion(changelogFixture, SKILL_NAME) !== '3.0.0') {
    errors.push('getLatestChangelogVersion must match an exact section heading');
  }

  const required = [
    'SKILL.md',
    'README.zh-CN.md',
    'UPSTREAM.md',
    'references/algorithm.md',
    'references/first-principles.md',
    'references/examples.md',
    'assets/review-template.md',
    'scripts/check.mjs',
  ];

  for (const rel of required) {
    const p = path.join(SKILL_ROOT, rel);
    if (!(await isFile(p))) errors.push(`missing required file: ${rel}`);
    else console.log(`${OK} ${rel}`);
  }

  const skillPath = path.join(SKILL_ROOT, 'SKILL.md');
  const skillMd = await readFile(skillPath, 'utf8');
  const fm = parseFrontmatter(skillMd);
  if (!fm) {
    errors.push('SKILL.md missing YAML frontmatter');
  } else {
    if (fm.name !== SKILL_NAME) {
      errors.push(`frontmatter name must be "${SKILL_NAME}", got "${fm.name}"`);
    }
    if (!fm.version || !/^\d+\.\d+\.\d+$/.test(fm.version)) {
      errors.push(`frontmatter version must be semver, got "${fm.version}"`);
    }
    const desc = fm.description || '';
    const triggers = [
      '第一性原理',
      '第一性原理审查',
      '五步算法',
      '五步审查',
      'first principles',
      'first-principles review',
    ];
    for (const t of triggers) {
      if (!desc.includes(t)) errors.push(`description missing trigger: ${t}`);
    }
    if (!desc.toLowerCase().includes('do not skip') && !desc.includes('Order is mandatory')) {
      warnings.push('description should stress mandatory order / do-not-skip');
    }
    if (!desc.toLowerCase().includes('analogy') && !desc.includes('类比')) {
      warnings.push('description should warn against analogy-as-axiom');
    }
    console.log(`${OK} frontmatter name=${fm.name} version=${fm.version}`);
  }

  requireMarkers(skillMd, 'SKILL.md', [
    'Step 0',
    'Step 1',
    'Step 2',
    'Step 3',
    'Step 4',
    'Step 5',
    'first principles',
    'assets/review-template.md',
    'references/first-principles.md',
    'references/algorithm.md',
    'references/examples.md',
    'Before reviewing',
    'Hard Rules',
  ], errors);

  const readme = await readFile(path.join(SKILL_ROOT, 'README.zh-CN.md'), 'utf8');
  requireMarkers(readme, 'README.zh-CN.md', [
    '第一性原理',
    '质疑每一项需求',
    '能删就删',
    '简化与优化',
    '加速周期',
    '自动化',
    '~/.agents/skills/first-principles-review/',
    '~/.claude/skills/',
  ], errors);
  const readmeVersion = readme.match(/当前版本：v(\d+\.\d+\.\d+)/)?.[1];
  if (!readmeVersion || (fm?.version && readmeVersion !== fm.version)) {
    errors.push(`README.zh-CN.md version "${readmeVersion}" != SKILL.md "${fm?.version}"`);
  }
  if (!readme.includes(
    'npx skills add git@git.georgebuilder.com:georgegroup/agent-skills.git --skill first-principles-review',
  )) {
    errors.push('README.zh-CN.md missing canonical one-click npx skills add install command');
  }

  const algorithm = await readFile(path.join(SKILL_ROOT, 'references/algorithm.md'), 'utf8');
  requireMarkers(algorithm, 'references/algorithm.md', [
    'optimize a thing that should not exist',
    '10%',
    'Automate',
  ], errors);

  const firstPrinciples = await readFile(
    path.join(SKILL_ROOT, 'references/first-principles.md'),
    'utf8',
  );
  requireMarkers(firstPrinciples, 'references/first-principles.md', [
    'fundamental truths',
    'reasoning by analogy',
    'Step 0',
  ], errors);

  const template = await readFile(path.join(SKILL_ROOT, 'assets/review-template.md'), 'utf8');
  requireMarkers(template, 'assets/review-template.md', [
    'Step 0',
    'First principles',
    'Axiom',
    'Step 1',
    'Step 2',
    'Step 3',
    'Step 4',
    'Step 5',
    'Named owner',
  ], errors);
  if (!template.includes('0 → 1 → 2 → 3 → 4 → 5')) {
    errors.push('assets/review-template.md must state exact order 0 → 1 → 2 → 3 → 4 → 5');
  }

  const upstream = await readFile(path.join(SKILL_ROOT, 'UPSTREAM.md'), 'utf8');
  requireMarkers(upstream, 'UPSTREAM.md', [
    'Walter Isaacson',
    'Local Divergence',
  ], errors);

  const changelogPath = path.join(REPO_ROOT, 'CHANGELOG.md');
  if (await isFile(changelogPath)) {
    const changelog = await readFile(changelogPath, 'utf8');
    const latest = getLatestChangelogVersion(changelog, SKILL_NAME);
    if (!latest) {
      errors.push(`CHANGELOG.md missing section "## ${SKILL_NAME}" with ### vX.Y.Z`);
    } else if (fm?.version && latest !== fm.version) {
      errors.push(
        `version mismatch: SKILL.md=${fm.version} CHANGELOG latest=${latest}`,
      );
    } else {
      console.log(`${OK} CHANGELOG version=${latest}`);
    }
  } else {
    console.log(`${WARN} CHANGELOG.md not found (vendored copy?) — skip version sync check`);
  }

  const rootReadmePath = path.join(REPO_ROOT, 'README.md');
  if (await isFile(rootReadmePath)) {
    const listed = getListedVersion(await readFile(rootReadmePath, 'utf8'), SKILL_NAME);
    if (!listed || (fm?.version && listed !== fm.version)) {
      errors.push(`root README version "${listed}" != SKILL.md "${fm?.version}"`);
    } else {
      console.log(`${OK} root README version=${listed}`);
    }
  }

  for (const w of warnings) console.log(`${WARN} ${w}`);
  if (errors.length) {
    console.error(`\n${ERR} selftest failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`\n${OK} selftest passed`);
}

async function main() {
  const arg = process.argv[2];
  if (arg === '--selftest') {
    await selftest();
    return;
  }
  console.error(`${arg ? `Unknown arg: ${arg}\n` : ''}Usage: node check.mjs --selftest`);
  process.exit(2);
}

main().catch((error) => {
  console.error(`${ERR} check.mjs crashed`);
  console.error(error);
  process.exit(2);
});
