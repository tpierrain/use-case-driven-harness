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
