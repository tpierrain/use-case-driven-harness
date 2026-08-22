# Plans, state and memory — always-on

> **Loaded at EVERY session start.** Not a skill: a skill loads when a task matches, and the
> save-point rule below has to fire at the exact moment nothing looks like it needs loading — when I
> am about to stop and hand back.
>
> The *how* (writing, opening, resuming and ticking a plan) is the on-demand half, in the
> [`plan-discipline`](../skills/plan-discipline/SKILL.md) skill. The full rationale, the measurements
> behind each rule, and what each one is paying for, is in
> [`plan-discipline.md`](../skills/plan-discipline/plan-discipline.md) beside it.

## "On reprend" → ONE door: the repo's `ACTIVE.md`

**At instant T there is exactly ONE way in.** *"On reprend"*, *"where were we"*, a fresh session after
a `/clear`: open the repo's **`ACTIVE.md`** (`maintainers/plans/ACTIVE.md` on Kenjaku, `docs/plans/`
elsewhere), follow its link to the active plan, read that plan's `## 📍 STATE` block, **announce the
step**, work. **No memory lookup, no ROADMAP scan, no grep.**

- The door holds **links and a date, never a status** — including in its *"open but not active"* list.
  A file that names who the ball is with goes false the day the ball moves. Capped at 30 lines.
- **One door, not one file.** Sub-plans stay legitimate (one of them gated a merge and carried a whole
  autonomous run; folding it into a 2 400-line plan would have buried it). What must be unique is the
  **way in**: a sub-plan is reached *through* the active plan, never from memory, never from a roadmap.
- No `ACTIVE.md` in the repo yet → create it as the first act of resuming, rather than searching.

> **Measured on Kenjaku, 2026-08-22**: answering one *"on reprends"* cost **eight files opened** before
> any work began — a memory pointer, four plan headers, a roadmap, an archived header. Not one read was
> wasted *given the old rules*; every one was a search a convention makes unnecessary. And
> `git log ACTIVE.md` gives, for free, the history of what was active when.

## The invariant — state gets a FORM of its own

> 🎯 **A paragraph in a plan may not contain a fact that can become false.**

If a sentence can go false **without anyone editing it**, it is state, and state has exactly two legal
forms: **a checkbox**, or a line in the **`## 📍 STATE` block**. Prose then carries only what is true
forever: rationale, evidence, what was rejected and why, how it went.

**Why the form and not the file** (measured on a 33 654-line plan corpus, 2026-08-22 — do not
re-derive): state and history were both written as *paragraphs*, and nothing can tell one paragraph
from another, which is why every net ever built could only **detect** a copy after the fact, and fired
on correct files too. **84 %** of the writes to the biggest live plan moved **no checkbox at all**: the
state was in the prose the whole time. Duplication was never the disease — **unfindability** was, and
copying state upward into headers and roadmaps was the writer's rational fix for it.

### Rule 1 — every live plan opens with a capped, fixed-key STATE block

```markdown
## 📍 STATE — the only perishable block in this file  ·  moved <date>
- **Next:** <one line: the next real step>
- **Blocked on:** <what would lift it — or "nothing">
- **Owner's call pending:** <the question, one line — or "none">
- **A session may, alone:** <the boundary — or "ask first">
```

**Four keys, one date, ≤ 20 lines, always that heading.** The cap *is* the prevention: a form with four
slots has nowhere to put a narration and nowhere to put a second copy of anything. It **replaces** the
hand-invented `WHERE THIS RESUMES` / `STATUS` headers (up to ~80 lines) that were themselves an
unmanaged copy of state scattered through the body.

### Rule 2 — a fact another system owns is LINKED, never asserted

Merged, tagged, released, CI green, branch alive, which commit: **git and `gh` are the record.** A plan
may write `PR #76` as a link; it may not write *"#76 is a draft"*, *"CI 7/7"* or *"nothing tagged"*.
Every such copy is true until a date certain and false forever after, with nobody present.

### Rule 3 — one item, one STATE block; every other mention is a LINK, syntactically

Not *"prefer a link to a restatement"* as a discipline (that was the old rule, and the corpus shows
what it was worth), but as the only **syntax available**: other files write
`[what it delivers](path/to/plan.md)` and stop. A roadmap's map table therefore carries **no Status
column** — `Plan | Delivers | Depends on`. **A form with no status field cannot hold a status.**

## The save point is EVERY handed-back turn — not the end of a step

**Before handing back** — any reply that does not chain into another tool call, so **every instant
Thomas might clear the context** — **the `## 📍 STATE` block must already say what my reply is about to
say.**

> **Does my reply contain "next: X", "Y remains", "blocked on Z", or a decision taken in
> conversation?** Then it already exists in the committed STATE block — or I write it there first, and
> let the chat be the echo.

Four keys and ≤ 20 lines is cheap enough to write **mid-reply**, and that cheapness is the rule: an
expensive save point is one that gets skipped under load.

- **A long autonomous stretch has no hand-back to hang this on.** An orchestrated run chains dozens of
  tool calls between two of them, so the mode **rarefies the trigger exactly when there is most state
  to record**. There the save point moves to **each decision as it lands** — write it into the STATE
  block, commit, do not bank it for a hand-back that may be an hour away.
- **Opening a plan with no STATE block**, or with plain bullets instead of checkboxes → restore them,
  without waiting to be asked.
- **What this does NOT fix, stated rather than buried**: it does not make a session *notice* it has
  state to write. That is a trigger problem, not a storage problem; the form only makes the write cheap
  enough that noticing is usually enough.

### Interim net, pending the shape lint — do NOT remove it

Before rules 1-3 existed, the corpus was policed by **detection**: `~/.claude/hooks/plan-carrier-guard.mjs`
(runs on `Stop`, greps the tracked Markdown for the current branch name, subtracts what the session
touched, and blocks the hand-back naming what is left), the **`plan-carrier-guard: delegates-only`**
door declared in a file's header to silence it, and the "certificate" variant of that door.

**All three stay installed and firing.** They were to be retired *by* a repo-side **shape lint** —
which judges form instead of branch mentions, travels with the clone where a machine-local hook cannot,
and needs no door because a file that genuinely delegates contains no status sentences and passes by
construction. **That lint is not built yet** (Kenjaku, deferred 2026-08-22). Removing them "for
consistency with the new convention" would leave no net at all, which is worse than the over-firing it
replaces. They are **interim, not doctrine**: the day the lint exists, all three go together.

## Durable memory holds no state — ever

**Never write the next step into memory.** "Next: X", "what remains", "blocked on Y", any summary of
where the work stands: that is the plan's job, always. Writing it into memory *feels* like saving it
and is the opposite — the plan is edited and committed as the work moves, so it stays true, while a
memory line is written once and then outlives the step it describes, still read at every session start
with full authority. **A stale memory line is a wrong instruction, not a missing one.**

Only two kinds of entry are admissible, and neither is state:

- a **pointer** — which plan file holds the state, and to go open it. Since the door exists, the only
  pointer a repo needs is *"on reprend → open `ACTIVE.md`"*: anything ranking plans, flagging one
  *"read this first"*, or carrying a due date **is state wearing a pointer's clothes**;
- a **reference** — something recoverable nowhere else: a published URL, a durable preference, a
  convention with its rationale.

`MEMORY.md` is reloaded **in full** at every session start and is size-bounded (~25 KB): each surplus
line spends the budget the critical instructions need, and pushes them out **silently**. So, without
being asked: **prune the ✅ SHIPPED and historical entries** as soon as a chantier is delivered —
delete the index line **and** the pointer file that has become pure history. What is shipped is no
longer actionable context; its trace lives in git and in the archived plan. What stays in the index is
mostly **durable conventions** and **active chantiers**.
