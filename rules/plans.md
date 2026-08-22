# Plans, state and memory — always-on

> **Loaded at EVERY session start.** Not a skill: a skill loads when a task matches, and the
> save-point rule below has to fire at the exact moment nothing looks like it needs loading — when I
> am about to stop and hand back.
>
> The *how* (writing, opening, resuming and ticking a plan) is the on-demand half, in the
> [`plan-discipline`](../skills/plan-discipline/SKILL.md) skill. The full rationale, and what each
> rule is paying for, is in
> [`plan-discipline.md`](../skills/plan-discipline/plan-discipline.md) beside it.

## The living plan is a file in the repo

Every plan / roadmap / TODO / progress document uses Markdown checkboxes `- [ ]` / `- [x]` on **every
step and every sub-step** — never plain bullets, never text-only markers (`TODO`, `✅ DONE`) alone —
so Thomas can follow and tick progress **straight from the Markdown** (Typora, Obsidian, a repository
preview) without having to ask me anything.

- A multi-step plan opens with a **`## Tracking`** section: one checkbox per step, then sub-checkboxes
  down each step as it is worked.
- A finished step is ticked `- [x]` **and** annotated _(date · commit)_. That annotation is the part
  that survives a cleared context.
- **One canonical plan**, and it is the file in the repo. Any snapshot the tooling keeps elsewhere is
  throwaway the moment a plan is promoted there — mark it superseded and never read it again.
- Opening a plan that has no checkboxes → restore them, without waiting to be asked.

## The save point is EVERY handed-back turn — not the end of a step

**Before handing back** — any reply that does not chain into another tool call, so **every instant
Thomas might clear the context** — the plan must already say what the reply is about to say.

> **Does my reply contain "next: X", "Y remains", or "resume at Z"?**
> Then those sentences must already exist in the committed plan. If not, I write them there first, and
> let the chat be the echo.

This covers the three things no checkbox records on its own, and all three die at a clear:

- **the next real step**, when the first unticked box is not the right marker (constraints and
  rejected options are checkboxes too; a step can be done bar one line of doc; a check can be waiting
  on an environment);
- **a decision taken in conversation** — a trade-off, a scope call, an explicit "we are not doing X";
- **a blocker or an external wait**, and what would lift it.

On resuming: open the plan, read its **header note** and its `## Tracking`, restart **where the header
says** (not at the first unticked box), and **announce which step before writing any code**.

### "The plan" is PLURAL — the save point covers every carrier of that status

The rule above says *the* plan, and that singular is the hole. **Measured on Kenjaku, 2026-08-20**:
the session made **8 commits, 4 of them into plans**, and every single one updated **the plan that
was open** — while **four** repo files restated the very same item's status (three plans plus a
measurement register). The rule fired every time and the corpus still went stale. Nothing was
forgotten: **the state was COPIED**, and a copy is invisible from inside the file you have open.

So, before handing back:

- **Name the carriers, do not recall them.** `git grep -l` the branch name (and the item's name)
  across the plans, the roadmap and the registers. Every file that answers claims to speak about this
  work, and must already say what the reply is about to say — or be told, in one line, why it needs
  nothing.
- **One item, one OWNING plan.** A second file that restates a status is not redundancy, it is a
  future lie: replace the restatement with a **link** to the owning plan. Deduplicate the moment the
  grep shows a duplicate, rather than hand-synchronising three files forever.
- **A long autonomous stretch has no hand-back to hang this on.** The save point is "every
  handed-back turn", and an orchestrated run chains dozens of tool calls between two of them: the
  mode **rarefies the trigger exactly when there is most state to record**. On such a run the save
  point moves to **each decision as it lands** — write it into its carriers and commit, do not bank
  it for a hand-back that may be an hour away.

> **Deterministic net (belt and braces).** `~/.claude/hooks/plan-carrier-guard.mjs` runs on `Stop`:
> it greps the tracked Markdown for the current branch name, subtracts what the session touched, and
> **blocks the hand-back** naming what is left ("4 files name this branch, you touched 2"). It judges
> **no content** — it cannot tell stale from current, it only makes the omission impossible to not
> see. **Machine-local, so it does not travel**: this written rule is the belt, and it stays load-bearing
> on any machine where the hook is not installed.
>
> 🚪 **The declared door, for files that hold no state BY CONSTRUCTION** (2026-08-22, Thomas's call,
> after the guard blocked four hand-backs in one session over a roadmap that was correct every time).
> An ordering map, an index, a register that delegates: they name the branch, they are right to
> restate nothing, and the hook cannot tell that from staleness — so it is **told, in the file**. Put
> **`plan-carrier-guard: delegates-only`** in the file's **header** (first 20 lines, typically inside
> the STATUS comment) and the guard stops counting it as a carrier.
>
> - **The header window is the whole safety of the door.** An opt-out at line 400 is invisible; in the
>   header, anyone opening the file reads it, and so does the next session. Merely *mentioning* the
>   hook does not qualify — the words must be the declaration itself.
> - **It is the admission of a contract, not a shortcut.** Write beside it what the file *does* own,
>   and delete the line the day a row there starts carrying state of its own. **A plan may never
>   declare it**: holding state is a plan's whole job.
> - **The read fails towards the guard**: a file that cannot be read stays a carrier, so an I/O error
>   can never open the door by accident.

## Durable memory holds no state — ever

**Never write the next step into memory.** "Next: X", "what remains", "blocked on Y", any summary of
where the work stands: that is the plan's job, always. Writing it into memory *feels* like saving it
and is the opposite — the plan is edited and committed as the work moves, so it stays true, while a
memory line is written once and then outlives the step it describes, still read at every session start
with full authority. **A stale memory line is a wrong instruction, not a missing one.**

Only two kinds of entry are admissible, and neither is state:

- a **pointer** — which plan file holds the state, and to go open it;
- a **reference** — something recoverable nowhere else: a published URL, a durable preference, a
  convention with its rationale.

`MEMORY.md` is reloaded **in full** at every session start and is size-bounded (~25 KB): each surplus
line spends the budget the critical instructions need, and pushes them out **silently**. So, without
being asked: **prune the ✅ SHIPPED and historical entries** as soon as a chantier is delivered —
delete the index line **and** the pointer file that has become pure history. What is shipped is no
longer actionable context; its trace lives in git and in the archived plan. What stays in the index is
mostly **durable conventions** and **active chantiers**.
