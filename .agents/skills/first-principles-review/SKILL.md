---
name: first-principles-review
version: 3.0.0
description: |-
  First-principles + five-step review for plans, processes, features, and redesigns
  (axioms → question → delete → simplify → accelerate → automate).
  Must use this Skill when the user says
  "第一性原理", "第一性原理审查", "五步算法", "五步审查", "first principles",
  "first-principles review", "质疑需求再删除", "先删再优化", "不要过早自动化",
  "马斯克五步工作法", "The Algorithm".
  Order is mandatory — first principles before the five steps; never optimize/accelerate/automate
  before questioning and deleting. Do not skip steps. Do not reason by analogy as if it were axiom.
  Do not generate advice from memory — follow this skill's process and template.
---

# First Principles Review（GeorgeGroup Internal）

Capability skill: strip a plan/process/feature with **first principles**, then a mandatory five-step build checklist. Method lineage in [`UPSTREAM.md`](UPSTREAM.md).

| Tool | Chinese | Role |
|---|---|---|
| **First principles** | 第一性原理 | Reasoning habit: boil to fundamental truths, reason **up** |
| **Five-step checklist** | 五步审查 | question → delete → simplify → accelerate → automate |

> First principles decides what is *true*. The five steps decide what *survives* to be built faster and automated.

## When to Use

- Feature / process / architecture **design review**
- Scope cuts, tech debt, ceremony removal
- Decide whether to optimize, parallelize, or automate
- User invokes **第一性原理 / 五步审查 / first principles** or related phrases

Do **not** use as pep talk. Produce a concrete Step 0 + Steps 1–5 pass.

## Hard Rules（硬约束）

1. **Step 0 first**: establish axioms; demote analogy ("industry standard", "competitor has…", "we always…").
2. **Strict five-step order**: 1 → 2 → 3 → 4 → 5. Never reorder.
3. **Step 3 ≠ Step 1**: do not optimize something that should not exist.
4. **Step 4 after 1–3**; **Step 5 last**.
5. **Named owners**: requirements attach to a **person**, never a department.
6. **Delete enough**: if add-back never hits ~10%, you probably did not delete enough.
7. Output must use [`assets/review-template.md`](assets/review-template.md) including the First Principles block.

中文：先第一性原理立公理，再跑五步；禁止把类比当公理；禁止先优化/加速/自动化。

## Mandatory Process

Before reviewing, read these local files; do not substitute memory:

1. [`references/first-principles.md`](references/first-principles.md)
2. [`references/algorithm.md`](references/algorithm.md)
3. [`references/examples.md`](references/examples.md)
4. [`assets/review-template.md`](assets/review-template.md)

```
Pass:
- [ ] Step 0 First principles (axioms vs analogies)
- [ ] Step 1 Question requirements
- [ ] Step 2 Delete parts/processes
- [ ] Step 3 Simplify & optimize (survivors only)
- [ ] Step 4 Accelerate cycle time
- [ ] Step 5 Automate (last)
- [ ] Fill assets/review-template.md
```

### Step 0 — First principles（第一性原理）

Full notes: [`references/first-principles.md`](references/first-principles.md).

1. One-sentence **problem** (outcome, not solution).
2. List **analogies** and mark them non-axiomatic until proven.
3. List **axioms** (physics / law / measured constraint / math / budget atoms).
4. **Reason up** from axioms only: what must exist?
5. Hand remaining candidates to Step 1.

Canonical habit: *boil things down to their fundamental truths and reason up from there, as opposed to reasoning by analogy.*

If zero axioms → ask the user; do not invent an analogy plan.

### Step 1 — Make requirements less dumb（质疑每一项需求）

For each requirement:

1. Name the **person** who owns it (not a department).
2. Classify why it exists: axiom / law / customer / habit / politics — habits & politics are delete candidates.
3. Challenge even if the owner is senior or "smart".
4. Rewrite to be less dumb, or mark for Step 2 deletion.

Fail if any requirement has no named owner.

### Step 2 — Delete the part or process（能删就删）

- Prefer delete over "just in case".
- Expect later restore; **≥10% add-back** signals you deleted hard enough.
- Document blast radius and first-restore order.

### Step 3 — Simplify and optimize（简化与优化）

Only survivors of Steps 0–2.

> The most common error of a smart engineer is to optimize a thing that should not exist.

If non-existence becomes obvious → **return to Step 2**.

### Step 4 — Accelerate cycle time（加速周期）

Only after 0–3. Shorten feedback loops; do not speed a deletable process.

### Step 5 — Automate（最后才自动化）

Scripts / CI / robots / agents — last. Early automation welds the wrong process.

Then optionally loop: new axioms → re-challenge → delete more.

## Output Format

Use [`assets/review-template.md`](assets/review-template.md). Minimum:

0. First principles (problem / analogies / axioms / reasoned-up must-haves)
1. Step 1 requirement table
2. Step 2 delete list (+ add-backs)
3. Step 3 simplify actions
4. Step 4 accelerate actions
5. Step 5 automate candidates (deferred if early)
6. Decision & next actions

## Anti-Patterns（禁止）

| Anti-pattern | Why it fails |
|---|---|
| Analogy as axiom ("best practice") | Copies the wrong problem |
| Skip Step 0 | Checklist runs on fog |
| Jump to optimize / automate | Freezes the wrong thing |
| "Department said so" | No accountability |
| Keep "just in case" forever | Never hits 10% add-back |
| Accelerate a broken flow | Digs the grave faster |

## References

| File | Purpose |
|---|---|
| [`assets/review-template.md`](assets/review-template.md) | Required output |
| [`references/first-principles.md`](references/first-principles.md) | Step 0 deep notes |
| [`references/algorithm.md`](references/algorithm.md) | Steps 1–5 + quotes |
| [`references/examples.md`](references/examples.md) | Worked examples |
| [`UPSTREAM.md`](UPSTREAM.md) | Method lineage / sources |
