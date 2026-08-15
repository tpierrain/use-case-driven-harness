# Plans & tracking docs — checkboxes are mandatory

Every **plan / roadmap / TODO / progress-tracking** document I write or modify (first and foremost
`maintainers/plans/**`, but also **any** file that lists steps to carry out) MUST use Markdown
**checkboxes** `- [ ]` / `- [x]` on **every step AND every sub-step** — never plain bullets `-`, and
never purely textual markers (`TODO`, `✅ DONE`) on their own — so that Thomas can **follow progress
and tick it straight from the Markdown** (Typora, Obsidian, the GitHub preview) without having to ask
me anything.

## Rules

- **A multi-step plan** → a **"Tracking"** section at the top, with **one checkbox per step**, then
  **sub-checkboxes** along each step (reference model:
  `maintainers/plans/prospective/rag-embedder-plan-action.md` in the second-brain-generator repo).
- **A finished step** → tick `- [x]` **and** note _(date · commit)_: that is the memory which survives
  a `/clear`.
- **By default, whenever a plan is opened**, offer to restore the checkboxes if they are missing —
  do not wait to be asked.
- This convention is **global**: it applies to **every** project, with no need to re-specify it.

> Thomas asked for this repeatedly → a rule carved here so it never has to be asked for again. It is
> not a hook (a hook cannot write checkboxes): it is a **writing convention**, hence a global
> instruction.

## Memory & `/clear` — pointers, not copies

> Ref.: Thomas Pierrain, *« Des pointeurs, pas des copies, banane »*
> (<https://medium.com/@tpierrain/des-pointeurs-pas-des-copies-banane-56c9d197b80b>).

**The repo's plan (`maintainers/plans/**`) is the SINGLE source** of a chantier's state (checkboxes,
commits, what remains). `MEMORY.md` is **reloaded in full at every session** (and bounded, ~25 KB):
any restatement of a plan's state creates **context rot** there and can **drown critical instructions**
under stale text — a **silent** overflow. So, by default and without being asked:

- **Pointers, not copies.** For an ongoing chantier: **a single memory file = a thin pointer** (branch
  + path to the plan + "read the plan"), and **a single thin index line** in `MEMORY.md`. I **NEVER
  duplicate** the plan's content into memory (done/remains, commits, details) — it lives in the plan,
  read on demand, never auto-loaded.
- **Tick as you go** in the repo's plan (and only there) so the landmark never lies — see the
  checkboxes section above and "a finished step → _(date · commit)_".
- **Prune `MEMORY.md` of ✅ SHIPPED / historical entries** as soon as a chantier is delivered: what is
  shipped is no longer actionable context, its trace lives in **git + the archived plan**. Delete the
  index line **and** the pointer file that has become pure history. Keep mostly this in the index:
  **durable preferences / conventions** + **active chantiers**.
- **Resuming after a `/clear`**: follow the pointer → **open the plan**, resume at the **first unticked
  `- [ ]`**, and **announce it before writing code**. The `/clear` becomes free again because there is
  nothing to lose in memory — the state is in the plan.

### The save point is EVERY hand-back (not the end of a step)

**Before handing back** (any reply that does not chain into a tool, hence **every moment where Thomas
can clear**), the plan must already say what my chat message says about the state. A simple test, to
run before writing the reply: **if my reply contains "next: X", "Y remains", "resume at Z", those
sentences must already exist in the plan, committed.** Otherwise I write them there first, and the
chat becomes no more than their echo.

This covers in particular what no checkbox says:

- **what the real next step is**, when the first `- [ ]` of the Tracking is NOT the right landmark (an
  unticked step with only a line of doc left, a verification waiting on an environment, a suspended
  choice): write it in the plan, otherwise the resume restarts on something already delivered;
- **a decision taken in conversation** (an arbitration, a scope call, "we are not doing X"): it dies at
  the `/clear` if it only lives in the thread;
- **a blocker / an external wait** and what it would take to lift it.

> **Why this refinement, when "tick as you go" was already written**: its trigger was *"a step is
> finished"*. Between two steps, the state therefore lived in my last reply, that is, in the one place
> a `/clear` destroys, and Thomas had to ask me to save it. The right trigger is not the end of a step,
> it is **the hand-back**. Asked for explicitly by Thomas (2026-07-28, Kenjaku): *"do it as you go so
> I can clear the moment you are waiting"*. **Goal: the `/clear` is free at any instant, never only at
> step boundaries.**

> Why global: this is a **convention for writing memory**, not a hook. Sibling of the project memory
> `one-canonical-plan-in-repo` (a single canonical plan = the repo's); this rule is its all-projects
> generalization, always loaded.
