# first-principles-review

> **当前版本：v3.0.0**（与 `SKILL.md` frontmatter `version` 一致）  
> GeorgeGroup 能力型 skill（命名对齐 `ui-autotest` / `vue-vben-crud`：描述做什么，不用人名）。

## 这是什么

对方案 / 流程 / 功能做强制审查：

1. **第一性原理**：公理 vs 类比，从基本事实往上推。
2. **五步清单**：质疑 → 删除 → 简化 → 加速 → 自动化。

最常见失败：「把类比当真理」或「优化了不该存在的东西」。

## 流程速览

| 顺序 | 英文 | 中文 | 一句话 |
|---|---|---|---|
| 0 | First principles | 第一性原理 | 公理 vs 类比；从公理往上推 |
| 1 | Question requirements | 质疑每一项需求 | 落到具体的人，不是「部门」 |
| 2 | Delete the part or process | 能删就删 | 事后加回不到 10% 说明删得太怂 |
| 3 | Simplify and optimize | 简化与优化 | 只优化幸存者 |
| 4 | Accelerate cycle time | 加速周期 | 方向对了再提速 |
| 5 | Automate | 自动化 | 最后才上 |

## 安装

```bash
npx skills add git@git.georgebuilder.com:georgegroup/agent-skills.git --skill first-principles-review
```

安装时选择 `Global` + `Symlink` 后，canonical copy 在 `~/.agents/skills/first-principles-review/`，CLI 会按目标 agent 同步到 `~/.claude/skills/` 等兼容目录。

> 旧名 `musk-5-step-algorithm` / `george-five-step` 已废弃，请改装本 skill 并删除旧目录。

## 触发短语

- 中文：「第一性原理」「第一性原理审查」「五步算法」「五步审查」「质疑需求再删除」「先删再优化」「不要过早自动化」（兼容：「马斯克五步工作法」）
- English：`first principles` / `first-principles review` / `The Algorithm` / `question then delete` / `don't automate early`

## Agent 会产出什么

按 [`assets/review-template.md`](./assets/review-template.md) 输出结构化审查。

- [`references/first-principles.md`](./references/first-principles.md)
- [`references/algorithm.md`](./references/algorithm.md)
- [`references/examples.md`](./references/examples.md)

## 质检

```bash
node ~/.agents/skills/first-principles-review/scripts/check.mjs --selftest

# 维护者在源仓中也可运行：
node skills/first-principles-review/scripts/check.mjs --selftest
```

## 资料来源

见 [`UPSTREAM.md`](./UPSTREAM.md)。
