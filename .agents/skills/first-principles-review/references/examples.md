# Worked examples

Illustrative only — adapt to the user's artifact. Always still fill `assets/review-template.md`.

## Example A — Product feature request

**Input:** "Add a 12-step approval workflow for expense claims, then build a dashboard and auto-reminders."

| Step | Pass |
|---|---|
| 0 | Axioms: fraud/loss risk on claims >X; audit trail legally required. Analogies: "ERP had 12 steps", "dashboards are table stakes" → demote. Must exist: 3 risk gates + audit log. |
| 1 | Owner of "12 steps"? Finance lead names 3 real risk gates; 9 are habit from old ERP. Rewrite: 3 gates. |
| 2 | Delete dashboard v1 and reminder bot until volume proves need. Delete 2 of 3 report exports. |
| 3 | One form + one status machine; merge duplicate "manager" and "dept head" if same person 80% of time. |
| 4 | SLA: submit → first decision in 1 business day; instrument cycle time. |
| 5 | Defer auto-reminders and RPA until manual process runs 2 weeks clean. |

**Wrong path:** Automate 12-step reminders first → locks in bureaucracy.

## Example B — Engineering "performance project"

**Input:** "Optimize the report API; add Redis and a worker queue."

| Step | Pass |
|---|---|
| 0 | Axiom: decision-makers need the report by next morning (measured). Analogy: "APIs must be real-time / always cache" → demote. Must exist: correct nightly numbers, not hot path. |
| 1 | Who requires real-time? PM: nightly is enough. "Real-time" was assumed. |
| 2 | Delete the hot-path report from the user-facing page; move to async export. Delete unused columns. |
| 3 | Simplify query; one indexed view for survivors. |
| 4 | Faster export job cadence for the remaining report. |
| 5 | Only then consider cache/queue if still slow. |

**Wrong path:** Redis + queue on a report nobody needs live → classic Step-3-before-1 failure.

## Example C — Meeting / ops process

**Input:** "Weekly 90-minute status meeting + slide deck + three tools for tracking."

| Step | Pass |
|---|---|
| 0 | Axiom: surface blockers before they age >48h. Analogy: "every team needs weekly slides" → demote. Must exist: short risk list, not deck. |
| 1 | Owner of weekly ritual? Manager. Goal is risk visibility, not slides. |
| 2 | Delete deck requirement; delete two of three trackers. |
| 3 | One rolling risk list (10 lines max). |
| 4 | 20-minute standup twice weekly on blockers only. |
| 5 | Auto-pull metrics into the list only after the list is used for 3 weeks. |

## Example D — Tesla-style cautionary (secondary accounts)

Battery sound/fire mat + expensive robot cell: team optimized and automated the cell; Musk traced the requirement chain, found the part unnecessary, **deleted** the mat and removed the automation. Lesson: return to Steps 1–2 even mid-optimization.
