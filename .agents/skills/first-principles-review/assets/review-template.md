# First Principles Review Template

Copy and fill. Keep Step order (0 → 1 → 2 → 3 → 4 → 5). Mark `N/A` only with a one-line reason.

```markdown
# First Principles Review — <target name>

**Date:** YYYY-MM-DD
**Reviewer / Agent:** …
**Artifact:** <plan | feature | process | architecture | postmortem>
**One-line goal:** …

## Step 0 — First principles（第一性原理）

**Problem (outcome, not solution):** …

| Analogies (non-axioms until proven) | Why it is analogy |
|---|---|
| industry standard / competitor / "we always…" | … |

| # | Axiom (fundamental truth) | Evidence / why confident | Binding? |
|---|---|---|---|
| 1 | … | physics / law / measured / math | yes/no |

**Reasoned up from axioms — must exist:** …
**Optional / theater (not forced by axioms):** …
**If zero axioms:** STOP — questions for user: …

## Step 1 — Question requirements（质疑需求）

| # | Requirement | Named owner (person) | Why it exists | Verdict | Less-dumb rewrite |
|---|---|---|---|---|---|
| 1 | … | … | axiom / law / customer / habit / politics | keep / rewrite / delete-candidate | … |

**Unowned requirements (must resolve):** …
**Assumptions challenged:** …

## Step 2 — Delete（删除）

| Deleted item | Why safe to delete | Blast radius | First restore if broken |
|---|---|---|---|
| … | … | … | … |

**Delete count:** N  
**Expected add-back (≥10% heuristic):** ~M items — list: …

## Step 3 — Simplify & optimize（仅幸存者）

| Survivor | Simplify / optimize action | Explicitly NOT optimizing (should not exist) |
|---|---|---|
| … | … | … |

**Returned to Step 2?** yes/no — …

## Step 4 — Accelerate cycle time

| Loop | Current cycle | Target cycle | Change |
|---|---|---|---|
| … | … | … | … |

**Confirmed Steps 0–3 done before speed-up?** yes/no

## Step 5 — Automate（最后）

| Candidate automation | Blocked until | Ready now? |
|---|---|---|
| … | steps 0–4 evidence / clean run for N days | yes/no |

**Early-automation risks rejected:** …

## Decision

- **Ship / cut / resequence:** …
- **Top 3 actions this week:** 1) … 2) … 3) …
- **Risks:** …
```
