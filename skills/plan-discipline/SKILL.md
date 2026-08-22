---
name: plan-discipline
description: "Write, open, resume or tick a plan / roadmap / TODO so its state survives a cleared context. Use when asked to write or draft a plan, open or re-open an existing plan, resume work after a /clear or a break ('we're resuming', 'where were we', 'on reprend'), tick off a finished step, or record a decision or blocker so it is not lost. Also use when a plan is found with plain bullets instead of checkboxes or without a STATE block, when the active plan changes hands, or when about to hand back with work still in flight."
---

# Plan discipline

Keep the state of a piece of work **outside the conversation**, so clearing the context costs
nothing. Full rationale, and the measurements each rule is paying for:
[`plan-discipline.md`](plan-discipline.md).

## The two things to get right

1. **The plan is the truth; the chat is the echo.** Anything a reply says about *where the work
   stands* must already be in the committed plan when the reply is written — not after being asked.
2. **A paragraph in a plan may not contain a fact that can become false.** If a sentence can go false
   without anyone editing it, it is state, and state has exactly two legal forms: a **checkbox**, or a
   line in the **`## 📍 STATE` block**. Prose carries only what is true forever.

## Resuming — the door, then the block

1. Open the repo's **`ACTIVE.md`** (`maintainers/plans/` or `docs/plans/`). It names the active plan.
   **That is the whole search**: no memory lookup, no roadmap scan, no grep, no ranking of candidates.
2. Open that plan, read its **`## 📍 STATE`** block. It is the resume marker and it outranks the
   checkboxes — **do not restart at the first unticked `- [ ]`**: constraints and rejected options are
   checkboxes too, a step can be done bar one line of doc, a check can be waiting on an environment.
3. **Announce which step before writing any code.** One sentence — the cheapest check that both sides
   are resuming the same work.
4. Sub-plans are legitimate, and are reached **through** the active plan, never directly.
5. Plan missing its STATE block, or using plain bullets instead of checkboxes → **restore them**,
   without waiting to be asked. No `ACTIVE.md` at all → create it as the first act of resuming.

## The STATE block — rule 1, and the shape to copy

```markdown
## 📍 STATE — the only perishable block in this file  ·  moved <date>
- **Next:** <one line: the next real step>
- **Blocked on:** <what would lift it — or "nothing">
- **Owner's call pending:** <the question, one line — or "none">
- **A session may, alone:** <the boundary — or "ask first">
```

**Four keys, one date, ≤ 20 lines, always that heading, immediately under the title.**

- The cap **is** the prevention: four slots have nowhere to put a narration and nowhere to put a
  second copy of anything. Needing a fifth key or a thirtieth line is **evidence against the
  convention** — record it in the plan's findings rather than quietly widening the block.
- It **replaces** any hand-invented `WHERE THIS RESUMES` / `STATUS` header. Migrating one: the four
  keys take the perishable lines, and everything else (how it went, what was decided, what it cost)
  moves down into an append-only *§ How this was worked*.
- **`Owner's call pending`** is the one key that is easy to lose: a question asked in chat and not
  answered dies at the clear unless it is written here.

## Writing a plan

1. **The STATE block first**, right under the title, before any other section exists.
2. **A `## Tracking` section**, one checkbox per step, then sub-checkboxes down each step as it is
   worked. Checkboxes `- [ ]` / `- [x]` on **every** step and sub-step — never plain bullets, never
   text-only markers (`TODO`, `✅ DONE`) alone, so a human can tick straight from the Markdown.
3. **Lead each step with the WHAT** — the capability added, changed or removed, phrased as what the
   user or the system can now do. The HOW (tests, refactors, file names) goes in the sub-steps.
4. Constraints, rejected options and evidence are **also** checkboxes — tick them when established, so
   a returning reader can see what is settled.
5. **Rule 2 while writing**: a fact another system owns is **linked, never asserted**. Git and `gh`
   are the record for merged / tagged / released / CI / which commit / branch alive. Write `PR #76` as
   a link; never *"#76 is a draft"*, *"CI 7/7"* or *"nothing tagged"* — each is true until a date
   certain and false forever after, with nobody present.

## Ticking a finished step

- `- [x]` **plus** _(date · commit)_. The annotation is what survives everything else.
- Record **what was decided while building it**, especially what was not obvious before starting, with
  a short "do not re-open" if the decision was expensive to reach. That goes in prose — it is true
  forever, so it is exactly what prose is for.
- **Update the STATE block's `Next:`** in the same edit. A ticked box with a stale STATE block is a
  plan that lies.

## One item, one STATE block — rule 3

Every other mention of that item, anywhere in the corpus, is a **link**:
`[what it delivers](path/to/plan.md)`. Not "prefer a link to a restatement" as a discipline, but as
the only syntax available — **a form with no status field cannot hold a status**. Concretely: a
roadmap's map table has columns `Plan | Delivers | Depends on` and **no Status column**.

When a second file restates a status, do not hand-synchronise it: **replace the restatement with the
link**, in the same pass that noticed it.

## Handing the door over — when the active plan changes

`ACTIVE.md` is a file, so the hand-over is an edit and a commit, not a memory update:

1. Move the outgoing plan's link from **The active plan** into **Open, but NOT active** — or delete it
   if the plan is closing and being archived.
2. Put the incoming plan under **The active plan**: its subject in plain words, its link, and the date
   it became active.
3. **Write no status anywhere in the file**, in either list. "Waiting on review", "nearly done", "the
   ball is with Thomas" all go false the day the ball moves; each plan's own STATE block answers that.
4. Keep it under 30 lines, and commit it **with** the work that caused the hand-over, so
   `git log ACTIVE.md` stays a truthful history of what was active when.

## Before handing back — the save-point check

Run this before writing any reply that does not chain into another tool call, because that is when the
human may clear:

> **Does my reply contain "next: X", "Y remains", "blocked on Z", or a decision taken in
> conversation?** Then those sentences already exist in the committed **STATE block** — or I write
> them there first, and let the chat be the echo.

Four keys and ≤ 20 lines is cheap enough to write mid-reply. That cheapness is the point: an expensive
save point is one that gets skipped under load.

**On a long autonomous run there is no hand-back to hang this on** — an orchestrated stretch chains
dozens of tool calls between two of them, so the trigger is rarefied exactly when there is most state
to record. There the save point moves to **each decision as it lands**: write it, commit it, do not
bank it for a hand-back that may be an hour away.

**What this does not fix**: it does not make a session *notice* it has state to write. That is a
trigger problem, not a storage problem. _(The interim detection net — a machine-local `Stop` hook, its
`delegates-only` door, and the certificate variant — is described in
[`rules/plans.md`](../../rules/plans.md); it stays until a repo-side shape lint replaces it.)_

## One canonical plan

The living plan is the file **in the repo**. Any snapshot the tooling keeps elsewhere is throwaway the
moment a plan is promoted there — mark it superseded and never read it again.

> The trap behind this rule: two copies of one plan, zero ticked boxes versus thirteen. Both looked
> authoritative; whichever is opened first wins.

### Durable memory holds no state — ever

**Never write the next step into memory.** "Next: X", "what remains", "blocked on Y", any summary of
where the work stands: that is the plan's job, always. Writing it into memory *feels* like saving it
and is the opposite — the plan is edited and committed as the work moves, so it stays true, while a
memory line is written once and then outlives the step it describes, still read at every session start
with full authority. **A stale memory line is a wrong instruction, not a missing one.**

Only two kinds of entry are admissible, and neither is state:

- a **pointer** — which plan file holds the state, and to go open it. With the door in place, the only
  pointer a repo needs is *"on reprend → open `ACTIVE.md`"*. Anything ranking plans, flagging one
  "read this first", or carrying a due date **is state wearing a pointer's clothes**;
- a **reference** — something recoverable nowhere else: a published URL, a durable preference, a
  convention with its rationale.

Everything else is already in the plan, the code or the history. Memory is reloaded in full at every
session start and is size-bounded: each surplus line spends the budget the critical instructions need,
and pushes them out silently.

## Scope note

This skill is the **on-demand** half of the discipline. The always-on half — the door, the invariant,
the save-point check — is [`rules/plans.md`](../../rules/plans.md) in this repo, symlinked into
`~/.claude/rules/`, because it must fire at the exact moment nothing looks like it needs loading. A
ready-to-paste version of that block, for a repo that has no such rules layer, is in
[`plan-discipline.md`](plan-discipline.md).

## Installing this skill elsewhere

On my machines it needs no install: `./bootstrap.sh` symlinks this folder into `~/.claude/skills/`, so
it is available in every project. To hand it to someone else, copy the folder into that repo's
`.claude/skills/plan-discipline/` and paste the always-on block into that repo's `CLAUDE.md` — that
second half is the one that matters, since a rule living only in a skill fires too late, or not at all.
