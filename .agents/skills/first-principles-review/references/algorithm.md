# The Algorithm — detailed notes

> Pair with [`first-principles.md`](first-principles.md). First principles is the reasoning habit; this file is the ordered build checklist. Step 1 is first principles applied to named requirements.

## Why order matters

Musk: the algorithm's power is the **sequence**. He admits personally reversing all five steps at Tesla — automate → accelerate → simplify → then discover it should have been deleted.

Classic failure quote:

> The most common error of a smart engineer is to optimize a thing that should not exist.

Root cause he cites: school trains **convergent** answering ("answer the question on the paper"), so people never challenge whether the question is dumb.

## Step notes

### 1. Make requirements less dumb

Quoted spirit (Isaacson / Musk restatements):

- Question every requirement.
- Each requirement must come with the **name of the person** who made it.
- Never accept "legal department" / "safety department" as the source.
- Requirements from smart / senior people are **most dangerous** — less likely to be challenged.
- Challenge even if the requirement came from Musk himself.
- Goal: avoid the perfect answer to the wrong question.

Agent practice:

- Build a table: Requirement | Named owner | Why it exists | Keep / Rewrite / Delete candidate
- If owner unknown → treat as delete candidate until someone claims it.

### 2. Delete the part or process

- Try hard to delete entirely; people forget deletion as an option.
- You may add some back later.
- Heuristic: if you do **not** add back **at least ~10%**, you did not delete enough.
- Prefer temporary pain + restore over permanent bloat.

Agent practice:

- List deletions with blast radius and "first restore if broken" order.
- Call out sacred cows (compliance theater, "industry standard", legacy flags).

### 3. Simplify and optimize

- Only after deletion.
- Common mistake: simplify/optimize a part or process that should not exist.
- If optimization reveals non-necessity → go back to Step 2.

Agent practice:

- Separate "simplify structure" from "optimize performance".
- Refuse optimization tickets that skip Steps 1–2 evidence.

### 4. Accelerate cycle time

- Every process can be sped up — **after** 1–3.
- Factory lesson: time spent accelerating processes later found deletable.
- Metaphor often attributed in secondary sources: if digging your grave, don't dig faster.

Agent practice:

- Measure cycle: idea → decision → build → feedback.
- Speed only the remaining critical path; do not parallelize waste.

### 5. Automate

- Comes last.
- Nevada / Fremont mistake: try to automate every step too early; later remove expensive robots (including cutting a hole in the building to extract equipment — per biography accounts).
- Wait until requirements questioned, parts/processes deleted, bugs shaken out.

Agent practice:

- Automation backlog is allowed, but mark items **blocked until Steps 1–4 evidence**.
- Scripts/CI/agents count as automation — same rule.

## Loop

After Step 5, re-open Step 1. Systems drift: new requirements appear; yesterday's necessary part becomes deletable.

## Mapping to software work

| Step | Software translation |
|---|---|
| 1 | Challenge tickets, SLAs, "architecture decision", compliance checklists — name the person |
| 2 | Delete features, services, fields, meetings, abstractions, feature flags |
| 3 | Refactor survivors; reduce states; clarify APIs |
| 4 | Faster CI, smaller PRs, shorter review SLA, tighter feedback |
| 5 | Codemods, bots, auto-deploy, AI agents — only on stable flow |

## Chinese gloss（对照）

| # | 常用中文 | 要点 |
|---|---|---|
| 1 | 质疑需求 | 落到具体人；默认需求偏蠢 |
| 2 | 删除 | 删到可能要加回约 10% |
| 3 | 简化优化 | 只动幸存者 |
| 4 | 加速 | 方向对了再快 |
| 5 | 自动化 | 最后上；否则焊死错误 |
