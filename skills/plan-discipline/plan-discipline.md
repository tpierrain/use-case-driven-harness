# Plan discipline — making `/clear` free at any instant

> **What this is.** A small, portable working convention for anyone pairing with a coding agent
> (Claude Code or otherwise) on work that spans more than one session. It costs nothing to adopt,
> needs no tooling, and removes one specific and expensive failure: **losing the state of a piece of
> work because it only ever lived in the conversation.**
>
> It is written to be lifted as-is into another repo. Nothing here is specific to any project,
> language or agent product.

## The problem it solves

A long-running agent conversation accumulates state that exists **nowhere else**: what was decided
and why, what was rejected, what is next, what is blocked and on what. Then the context is cleared —
deliberately (`/clear`), or by a crash, a compaction, a new day, a colleague picking the work up.

Everything that lived only in the thread is gone. What follows is worse than the loss itself: the
agent resumes from a plausible-looking artifact, re-derives a decision that was already made,
re-explores ground already covered, or restarts on a step that shipped last week. The human notices
only after the wrong work is done.

The fix is not a bigger context window, and not "remember to save". It is a rule about **where state
is allowed to live** — and, as the measurement below forced us to admit, about **what shape it is
allowed to take**.

## The five rules

### 1. One door: `ACTIVE.md`

**At instant T there is exactly one way in.** *"We're resuming"* means: open the repo's `ACTIVE.md`
(under your plans folder, at a path that never changes), follow its link to the active plan, read that
plan's STATE block, announce the step, work. **No memory lookup, no roadmap scan, no grep, no ranking
of candidate files.**

- The door holds **links and a date, never a status** — including in its *"open, but not active"*
  list. A file that names who the ball is with goes false the day the ball moves.
- **One door, not one file.** Sub-plans are legitimate: a side plan that gates a merge, or carries one
  long autonomous run, would be buried if folded into a 2 400-line parent. What must be unique is the
  **way in** — a sub-plan is reached *through* the active plan, never from memory, never from a
  roadmap.
- Cap it at ~30 lines and it can never become the thing it replaced.

`git log ACTIVE.md` then gives you, for free, the history of what was active when — something no other
file in a plan corpus can answer.

> **Why this rule exists.** Plans are usually named after their feature, which is convenient and gives
> you no index at all. Measured on a real repo (2026-08-22), answering a single *"we're resuming"*
> cost **eight files opened** before any work began: a memory pointer, four plan headers, a roadmap, an
> archived header. Not one of those reads was wasted *given the rules of the day*; every one was a
> search that a convention makes unnecessary.

### 2. State gets a form of its own

> 🎯 **A paragraph in a plan may not contain a fact that can become false.**

If a sentence can go false **without anyone editing it**, it is state. State has exactly two legal
forms:

**(a) A checkbox.** `- [ ]` / `- [x]` on **each step and each sub-step** — never plain bullets, never
text-only markers (`TODO`, `✅ DONE`) on their own. A multi-step plan opens a `## Tracking` section;
a finished step is ticked `- [x]` **and** annotated _(date · commit)_, and that annotation is the part
that survives everything else. Why checkboxes and not prose: a human can follow and tick progress
straight from the Markdown, in any editor or repository preview, without asking the agent anything.
Prose describing progress is something only the agent can update, which means it goes stale silently.

**(b) A capped, fixed-key STATE block**, immediately under the plan's title:

```markdown
## 📍 STATE — the only perishable block in this file  ·  moved <date>
- **Next:** <one line: the next real step>
- **Blocked on:** <what would lift it — or "nothing">
- **Owner's call pending:** <the question, one line — or "none">
- **A session may, alone:** <the boundary — or "ask first">
```

**Four keys, one date, ≤ 20 lines, always the same heading.** The cap *is* the prevention: a form with
four slots has nowhere to put a narration and nowhere to put a second copy of anything. If a plan ever
needs a fifth key or a thirtieth line, that is evidence against the convention, and it belongs in the
plan's findings rather than in a quietly widened block.

Everything else — rationale, evidence, what was rejected and why, how it went — is prose, and prose
now carries **only what is true forever**. That is separation by lifetime, enforced by **form** rather
than by **file**.

### 3. A fact another system owns is linked, never asserted

Merged, tagged, released, CI green, branch alive, which commit: **git and your forge are the record.**
A plan may write `PR #76` as a link; it may not write *"#76 is a draft"*, *"CI 7/7"* or *"nothing
tagged"*.

This is not pedantry: those are the only sentences in a plan corpus that are **guaranteed** to go
false, on a date certain, with nobody present and nothing to notice.

### 4. One canonical plan in the repo — and one owning STATE block per item

The living plan is the file **in the repo**, versioned alongside the code it describes. Any snapshot
the agent tooling keeps elsewhere (a local plans folder, a scratch file, a chat pane) is **throwaway**
the moment a plan is promoted into the repo — mark it superseded and never read it again.

> The trap that motivates this: two copies of the same plan, one with zero ticked boxes and one with
> thirteen. Both looked authoritative. Whichever gets opened first wins, and it is a coin flip.

And across files: **one item, one STATE block.** Every other mention is a **link**, syntactically —
`[what it delivers](path/to/plan.md)` — not "prefer a link to a restatement" as a discipline. The
sharp end of this: a roadmap's map table has columns `Plan | Delivers | Depends on` and **no Status
column**, because *a form with no status field cannot hold a status*.

If your agent has a persistent memory feature, keep **pointers there, not copies**: one thin line
saying *which* file holds the state. With the door in place that line is simply *"resuming → open
`ACTIVE.md`"*. Anything that ranks plans, flags one "read this first", or carries a due date **is
state wearing a pointer's clothes**.

**Never put the next step in memory — not even once.** "Next: X", "what remains is Y", "blocked on Z",
a summary of where the work stands: all of it belongs in the plan, always. This is the sharpest edge of
the rule and the one that gets bent, because writing it into memory *feels* like saving it. It is the
opposite. The plan is edited and committed as the work moves, so it stays true; a memory line
describing the next step is written once and then quietly outlives the step it describes, while still
being read at every session start with full authority. **A stale pointer is a wrong instruction, not a
missing one** — worse than nothing, because it is obeyed.

So only two kinds of memory entry are admissible, and neither is state:

- a **pointer** — which file holds the state, and to go open it;
- a **reference** — something that exists nowhere else and cannot be recovered from the repository:
  a published URL, a durable preference, a convention with its rationale.

**Pointers, not copies** — the phrase comes from Thomas Pierrain,
[*« Des pointeurs, pas des copies, banane »*](https://medium.com/@tpierrain/des-pointeurs-pas-des-copies-banane-56c9d197b80b).

### 5. The save point is EVERY handed-back turn — not the end of a step

This is the rule that does the real work, and the one most often missing.

**Before handing back** — that is, any reply that does not chain into another tool call, so **every
instant the human might clear the context** — the STATE block must already say what the reply is about
to say.

The test, applied before writing the reply:

> **If my reply contains "next: X", "Y remains", "resume at Z", or a decision taken in conversation —
> those sentences already exist in the committed STATE block.** Otherwise write them there first, and
> let the chat be the echo.

Four keys and ≤ 20 lines is cheap enough to write mid-reply. That cheapness is load-bearing: an
expensive save point is one that gets skipped under exactly the pressure that makes it matter.

It covers what no checkbox says on its own:

- **What the next real step is**, when the first unticked box is *not* the right marker. Constraints,
  rejected options and evidence are checkboxes too; a step can be done bar one line of documentation;
  a check can be waiting on an environment.
- **A decision taken in conversation** — a trade-off, a scope call, an explicit "we are not doing X".
  It dies at the clear if it lives only in the thread, and the next session cheerfully re-opens it.
- **A blocker or an external wait**, and what it would take to lift it.
- **A question put to the owner and not yet answered** — the key most often lost, because it feels
  like the human's turn rather than something to write down.

**Why this precise trigger.** "Tick the plan as you go" sounds like it already covers this. It does
not: its trigger is *"a step is finished"*. Between two steps, the state therefore lives in the last
reply — the one place a clear destroys — and the human has to remember to ask for it to be saved.

**And a long autonomous run has no hand-back to hang it on.** An orchestrated stretch chains dozens of
tool calls between two hand-backs, so the trigger is **rarefied exactly when there is most state to
record** — an interaction between two harness parts, not a lapse. On such a run the save point moves to
**each decision as it lands**: write it, commit it, do not bank it.

**Goal: clearing is free at every instant, never only at step boundaries.**

## The measurement — why the form, and not just the file

Both halves of this convention were paid for. The numbers are here so nobody has to re-derive them, and
so the convention travels with its evidence instead of as an opinion.

**First measurement (2026-08-20).** A session made **8 commits, 4 of them into plans**. Every one of
those four obeyed the save-point rule — and every one updated **the plan that was open**. Meanwhile
**four** repo files restated the same work item's status: three plans and a measurement register.
Result: a corpus stale in three places out of four, produced by a session that never once skipped the
save point. Nothing was forgotten; **the state was copied**, and a copy is invisible from inside the
file you have open. That is why rule 4 speaks of carriers in the plural.

**Second measurement (2026-08-22), on the same corpus: 90 plan files, 33 654 lines.** It broke the
first fix's assumption.

| What was measured | Number |
|---|---|
| The two live plans | **3 079** and **2 406** lines, written in 21 days |
| Share of their lines that are a checkbox | **3 %** and **8 %** |
| Commits touching the biggest live plan in 21 days | **130** — of which **109 (84 %) moved no checkbox at all** |
| A roadmap that declared *"pointers, not copies"* | 316 lines holding **22 commit shas, 19 PR numbers, 23 status words** |
| Hand-invented "where this resumes" headers | **4 files**, the largest ~80 lines |

Four findings, in the order they change the answer:

1. **The checkbox layer is not where the state is.** 84 % of writes moved no box. The authorization
   boundary, the "still owed", the open question, the scope call — all **prose**. Every mechanism that
   reads the machine-readable layer therefore sees a *minority* of state changes.
2. **Duplication is the symptom; unfindability is the disease.** You cannot find state in 42 000 words,
   so a resume header was invented to hold a copy at the top. You cannot find it across files either,
   so the roadmap held another copy. **The copy is not a discipline failure — it is the rational fix
   the writer chose for a real problem.** Detectors fight the remedy, not the cause.
3. **"Does this file hold state?" is not answerable at declaration time.** A file was formally declared
   state-free by a careful human on the very day its own numbers said otherwise. A human declaring it is
   exactly as unreliable as a tool guessing it.
4. **Every lie with a delivery date is a copy of a fact another system owns.** Hence rule 3.

**The conclusion that reshaped the convention:** state and history were both written as **paragraphs**,
and nothing can tell one paragraph from another — not a hook, not a grep, not a reader in a hurry. So
every net ever built could only **detect** a copy after the fact, and fired on correct files too. Give
state a form that is not prose, and the guessing problem disappears rather than being relocated.
**Splitting files without changing the form just moves the paragraphs.**

## The resume ritual

Coming back after a clear, a crash, or a week away:

1. Open `ACTIVE.md`. It names the active plan. **That is the whole search.**
2. Read that plan's **`## 📍 STATE`** block.
3. Restart **where the STATE block says** — not at the first unticked box.
4. **Announce which step, before writing any code.**

Step 4 is not ceremony. It is the cheapest possible check that the agent and the human are resuming
the same work, and it costs one sentence.

If the plan has no STATE block, or plain bullets instead of checkboxes, restore them — don't wait to be
asked. If the repo has no `ACTIVE.md`, create it as the first act of resuming.

## Adopting it

Two halves, and they belong in two different places.

**The always-on half** — rules 1, 3, 4 and 5 — must be live at every turn, including the turn where you
would not think to load anything. Put it in the file your agent reads at the start of every session
(`CLAUDE.md`, or its equivalent). A ready-to-paste version:

```markdown
## Plans and state

- **Resuming ("where were we", "on reprend") = open `<your-plans-folder>/ACTIVE.md`.** It links to
  the one active plan; open that, read its `## 📍 STATE` block, announce the step, work. No memory
  lookup, no roadmap scan, no grep. Sub-plans are reached THROUGH the active plan.
- **A paragraph in a plan may not contain a fact that can become false.** If a sentence can go false
  without anyone editing it, it is state, and state has two legal forms: a checkbox, or a line in the
  plan's `## 📍 STATE` block (four keys — Next / Blocked on / Owner's call pending / A session may,
  alone — one date, ≤ 20 lines). Prose carries only what is true forever.
- **A fact another system owns is linked, never asserted.** Merged, tagged, CI, which commit: git and
  the forge are the record. Write `PR #76` as a link, never "#76 is a draft" or "nothing tagged".
- **One item, one STATE block.** Every other mention is a link, syntactically. A roadmap table has
  `Plan | Delivers | Depends on` and no Status column: a form with no status field cannot hold one.
- **Before handing back** — any reply that does not chain into another tool call — the STATE block
  must already say what my reply says: next step, decision taken in conversation, blocker, question
  put to the owner. The chat is only the echo. On a long autonomous run, save at each decision as it
  lands, not at a hand-back that may be an hour away.
- **Durable memory NEVER holds work state.** It holds a POINTER (open `ACTIVE.md`) or a REFERENCE
  (a published URL, a durable preference). A stale memory line is a wrong instruction, not a missing
  one.
```

**The on-demand half** — how to write, migrate, tick and hand over a plan — is genuine skill material:
it triggers on a recognizable task ("write a plan", "open the plan", "resume this"). One is written and
ready to copy: [`skills/plan-discipline/SKILL.md`](SKILL.md) — drop the folder into a repo's
`.claude/skills/` and it activates there.

Do not put the always-on half in a skill. A skill loads when a task matches, and the save point has to
fire at the exact moment nothing looks like it needs loading: when the agent is about to stop and hand
back.

**Migrating an existing corpus is cheap**, and deliberately partial: archived files are not touched.
Live plans get the block, their hand-written resume header is hoisted into it, and the roadmap loses
its Status column. Roughly a quarter of an hour per live plan, after which the cost is negative — a
live plan absorbing ~150 lines of prose a day stops spending part of that restating its own state.

## What this is not, and what it cannot fix

- **Not a hook, and not automation.** No tool can write the sentence "this decision was taken and here
  is why" on your behalf; that is judgment. It is a writing convention, which is why it lives in an
  instruction file rather than in a script.
- **It does not make a session *notice* it has state to write.** That is a trigger problem, not a
  storage problem. The form only makes the write cheap enough that noticing is usually enough.
- **"Can this sentence become false?" stays a judgment call.** A recognizable shape (a sha, a PR
  number, "shipped") is easy; a rationale resting on a premise that quietly expires is not. Rule 3
  narrows this; nothing closes it.
- **It does not shrink a 3 000-line plan.** Archiving aggressively is still worth doing on its own
  merits. The STATE block only makes size non-fatal, by giving the perishable part a fixed address.
- **It is a convention, so a determined writer can still write a status paragraph.** The claim is not
  that copies become impossible — it is that the form no longer invites them, the motive
  (unfindability) is gone, and what remains is cheap to see.
- **Not project management.** The plan is a working file for two collaborators, one of whom forgets
  everything periodically. It is not a status report, and it has no audience beyond the pair.
