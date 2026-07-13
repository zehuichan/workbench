# First Principles（第一性原理）

This skill uses two tools that must both appear:

| Tool | Role |
|---|---|
| **First principles** | Reasoning habit — how to *think* about the problem |
| **Five-step checklist** | Building method — ordered strip-down of a design/process |

They interlock: Step 1 ("make requirements less dumb") is first principles applied to specs. Do not treat them as synonyms. Method lineage: [`../UPSTREAM.md`](../UPSTREAM.md).

## Canonical habit

Widely quoted first-principles habit (see UPSTREAM):

> Boil things down to their fundamental truths and reason up from there, as opposed to reasoning by analogy.

Most of life runs on **analogy** (copy what others do with slight variation). That is fine for routine work. For something new or expensive, switch to the **physics approach**: discover what is actually true at the foundation, then build up — even when the answer is counter-intuitive.

Lex Fridman #438 spirit (paraphrased in secondary sources): set an axiomatic base from things you are most confident are true at a foundational level, then reason upward.

## Agent procedure（强制）

Before Algorithm Steps 1–5, complete **Step 0**:

1. **State the problem** in one sentence (outcome, not solution).
2. **Strip analogies**: list "industry standard / competitor does X / we always did Y" and mark them as non-axioms until proven.
3. **List axioms**: facts you would bet on (physics, law, measured customer constraint, math, budget atoms). Prefer measurable truths.
4. **Reason up**: from axioms only, what must exist? What is optional theater?
5. **Hand off to Algorithm Step 1**: every remaining "requirement" must survive named-owner challenge.

If Step 0 cannot produce ≥1 axiom, stop and ask the user — do not invent analogy-based plans.

## Useful probes（secondary）

From public interviews / wiki summaries (use as probes, not dogma):

- **Think in the limit**: scale volume/time to extreme; if still expensive/slow, the cause is design, not "we need more volume".
- **Magic wand / material floor**: price against raw fundamentals (atoms, bits, irreversible constraints), then work backward to process.
- **Best part is no part**: deletion is often the first-principles conclusion.

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| "Best practice says…" as axiom | Demote to analogy; find the underlying constraint |
| Jumping to Algorithm Step 3 optimize | Return to axioms: does the thing need to exist? |
| Fake axioms ("users hate change") | Replace with measured evidence or drop |
| First principles as slogan only | Force the axiom table in the review template |

## Software mapping

| Domain | Analogy trap | First-principles dig |
|---|---|---|
| Architecture | "Every SaaS needs microservices" | What failure domains / scale / team size are true *here*? |
| Process | "We need weekly status deck" | What decision latency / risk visibility is required? |
| Feature | "Competitors have AI chat" | What job-to-be-done and data constraint are real? |
| Cost | "Cloud bill is cost of growth" | Which bytes/queries/steps are physically necessary? |
