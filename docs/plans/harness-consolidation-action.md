# Harness consolidation — one readable source, and the nets that carry it

> **Status (2026-08-20): OPEN, nothing executed yet. The agenda, not the work.**
>
> **The real next step is T0** — an owner's call on the target shape. Every other track below is
> written so it can be picked up straight after that call, but running T1…T6 before T0 would harden a
> shape nobody chose. Do **not** resume at the first unticked box; resume at T0.
>
> Born from two things in one session (2026-08-20): a read of Steve Yegge's *Gas Town* (what to steal,
> what to refuse), and the owner's own framing — *"j'aime bien rationaliser mon approche, la
> consolider pour avoir un truc qui soit lisible, simplement, au lieu d'avoir des includes sur plein
> de trucs à droite à gauche."*

---

## Tracking

- [ ] **T0 — Decide the target shape** *(owner's call, blocks everything else)*
  - [ ] Confirm: this repo is the single source; every other surface points at it or is a declared,
        dated copy.
  - [ ] Confirm: the always-on layer is capped (a stated budget in files or KB), and anything above
        the cap moves into an on-demand skill.
  - [ ] Decide whether the Kenjaku-side copies (`maintainers/plan-discipline.md`,
        `maintainers/skills/plan-discipline/`) become pointers or stay copies.
- [ ] **T1 — Adopt the consolidated rewrite upstream**
  - [ ] Bring `plan-memory-test-harness`'s `rules/plans.md` (63 lines) back over this repo's version
        (~100 lines), keeping the personal specifics the public extract deliberately dropped.
  - [ ] Same for `rules/testing.md`.
  - [ ] Re-check every cross-reference the merge touches (`../skills/...` links resolve here too).
- [ ] **T2 — The missing `plan-discipline` skill**
  - [ ] Add `skills/plan-discipline/` to this repo (source: the Kenjaku version, which is the fuller
        one).
  - [ ] Symlink it into `~/.claude/skills/` via `bootstrap.sh`, like the other three.
  - [ ] Verify by acceptance: a session in an unrelated project can load it.
- [ ] **T3 — Delete the stale `rules/README.md`**
  - [ ] Delete it (see *What was measured* — it is injected into every session and describes a layout
        that has never existed here).
  - [ ] Move anything worth keeping into the repo's root `README.md`, which is not injected.
- [ ] **T4 — Acceptance criteria on plan steps** *(the first thing worth stealing from Gas Town)*
  - [ ] Extend `rules/plans.md`: a step carries **what makes it green**, not only what to do.
  - [ ] State the rationale in the `plan-discipline` skill (the *how*, with a worked example).
  - [ ] Apply it to this very plan's own Tracking as the first dogfooding.
- [ ] **T5 — Audit: which convention is carried by nothing** *(the second thing worth stealing)*
  - [ ] List every standing convention across this repo's `rules/` and Kenjaku's
        `maintainers/CONVENTIONS.md`.
  - [ ] For each, name its carrier: an always-on rule, an on-demand skill, a hook, CI, or **nothing**.
  - [ ] For those carried by nothing, decide per case: a hook, a CI check, or an accepted risk written
        down as accepted.
  - [ ] File the Kenjaku-side findings where that repo says out-of-band work goes (its issue tracker),
        not as a second plan.
- [ ] **T6 — Make the copies point instead of copy**
  - [ ] Decide the propagation net for `plan-memory-test-harness` (today: a memory line asking a human
        to remember — which is exactly the failure shape T5 is about).
  - [ ] Update the `plan-discipline-shareable` memory once the surfaces change, or delete it if the
        net makes it redundant.

---

## What was measured (2026-08-20, do not re-derive)

The state of the three surfaces, checked on disk rather than recalled:

- **The harness actually in service is this repo.** `~/.claude/rules` is a symlink to
  `use-case-driven-harness/rules`, and `~/.claude/skills/` holds three symlinks into
  `use-case-driven-harness/skills/` (`outside-in-diamond-tdd`, `test-first-discipline`,
  `the-hive-pattern`). Editing this repo edits the live configuration. That half works and is not in
  question.
- **The plan discipline has an always-on rule but no loadable skill.** `rules/plans.md` is injected
  every session; there is **no `plan-discipline` skill in `~/.claude/skills/`**. The skill exists only
  in `kenjaku/maintainers/skills/` (a path Claude Code does not scan) and in
  `plan-memory-test-harness`. It is therefore loadable in **no session at all**, while the rule that
  should merely point at it carries all the detail inline — the exact inversion of this repo's stated
  design principle (`CLAUDE.md`: a rule is a minimal directive, the detail lives in a skill).
- **The public extract is ahead of its own source.** `plan-memory-test-harness/rules/plans.md` is a
  63-line consolidation of this repo's ~100-line version: de-personalized, reorganized, and it
  promotes to a first-class section a rule this repo only implies (*"Durable memory holds no state —
  ever"*). Same story for `rules/testing.md`. The refactor happened downstream, for a colleague, and
  never came back. Its README says the source repos win — which is now false in substance.
- **`rules/README.md` is dead weight paid on every session.** ~4 KB, untouched since the init commit
  (`0c910f1`), inherited boilerplate from the `everything-claude-code` plugin. It documents a
  `common/ typescript/ python/ golang/ swift/` layout and an `install.sh` — **none of which exists in
  this repo**. Because it sits in `rules/`, it is injected as a global instruction into every session
  of every project.
- **Propagation between the surfaces is manual, and its only net is a memory line.** The
  `plan-discipline-shareable` memory exists solely to remind the agent to propagate by hand, or *"the
  version colleagues read starts lying"*. A convention whose only carrier is a reminder to remember.

## What Gas Town contributed, and what was refused

Read on 2026-08-20 (the Medium original returned 403; five secondary sources, including two hands-on
accounts and Maggie Appleton's critique).

**Refused, deliberately:** the 20-30 parallel agents, the seven roles, the town/rig topology, the
Beads/Dolt ledger, `--dangerously-skip-permissions`. Measured cost is around \$100/hour; the author
burned three accounts in a launch week; a user matching the intended profile abandoned it after one
week, having lost a config file to a system whose stated philosophy is *"most work gets done; some
work gets lost"*. None of that fits a solo, correctness-first workflow.

**Kept, as T4 and T5:**

- **Nondeterministic idempotence** → T4. Each step declares its acceptance criterion, not its
  procedure: *"the path is whatever the agent decides; the destination is whatever the step says"*. A
  crashed or cleared session re-reads the state and resumes, because *done* is observable rather than
  asserted.
- **The watchdog chain** → T5. *"Each layer is dumber than what it watches, but more reliable about
  waking up on time."* The design rule that follows: when a convention keeps being breached, do not
  write a smarter rule — give it a dumber, more reliable carrier. Its corollary, polling with backoff
  over event-driven, is the same bet: a missed event costs nothing because the state is re-checked.

**The warning kept on file**, and the reason this plan starts at T0 rather than at T1: *"you can move
so fast you never stop to think, and only once you are hip-deep in poor architectural decisions do you
realise you have burned a billion tokens in exchange for a pile of hot trash."* Gas Town is its own
cautionary tale — 75k lines in 17 days, concepts invented as it went, unusable by anyone but its
author.

## Sources

- <https://yegge.ai/gastown> · <https://www.augusteo.com/blog/inside-gas-town/>
- <https://maggieappleton.com/gastown> · <https://tenzinwangdhen.com/posts/gastown-good-bad-ugly/>
- <https://codex.danielvaughan.com/2026/04/08/gas-town-multi-agent-factory/>
