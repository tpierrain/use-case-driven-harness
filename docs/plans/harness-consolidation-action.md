# Harness consolidation — one readable source, and the nets that carry it

> **Status (2026-08-20): the consolidation is DONE and pushed. What remains is the two Gas Town
> ideas, T4 and T5 — neither has been started.**
>
> **The real next step is T4** (an acceptance criterion on every plan step). T5 is the bigger one and
> can follow it or precede it; nothing orders them. Everything above them is shipped, so do **not**
> re-open T1…T3 or T6.
>
> **One sub-question of T0 is still unanswered and is the owner's**: what happens to
> `plan-memory-test-harness`, the public extract for a colleague. It is currently a copy that drifts by
> design, and the drift is what started this whole plan. Options are: regenerate it from this repo on
> demand, keep it drifting with a dated banner, or retire it. **Do not decide this alone.**
>
> Born from two things in one session (2026-08-20): a read of Steve Yegge's *Gas Town* (what to steal,
> what to refuse), and the owner's own framing — *"j'aime bien rationaliser mon approche, la
> consolider pour avoir un truc qui soit lisible, simplement, au lieu d'avoir des includes sur plein
> de trucs à droite à gauche."*

---

## Tracking

- [x] **T0 — Decide the target shape** _(2026-08-20 · owner's call in conversation)_
  - [x] This repo is the single source; every other surface points at it or is a declared, dated copy.
  - [x] The Kenjaku-side copies become **pointers** — owner's words: *"le harnais absorbe tout, Kenjaku
        ne garde que des pointeurs"*.
  - [ ] **Still open, owner's**: what becomes of `plan-memory-test-harness` (see the header note).
  - [ ] Deferred, not refused: capping the always-on layer with a stated budget. T5 is the natural
        place to decide it, since it is the same question asked of every rule.
- [x] **T1 — Adopt the consolidated rewrite upstream** _(2026-08-20 · `3792bee`)_
  - [x] `rules/plans.md`: took the 63-line consolidated shape, kept the `MEMORY.md` size bound and its
        pruning rule, which the public extract had dropped as too personal. 100 → 66 lines.
  - [x] `rules/testing.md`: same, keeping the outside-in-diamond specialization and the
        counter-evidence line. 43 lines.
  - [x] Cross-references re-checked: `../skills/...` resolves both in the repo and through the
        `~/.claude/rules` symlink, because the skills are symlinked as siblings.
- [x] **T2 — The missing `plan-discipline` skill** _(2026-08-20 · `e525867`)_
  - [x] `skills/plan-discipline/` added, with the rationale essay beside it as
        `plan-discipline.md` — inside the skill folder, so it travels through the symlink.
  - [x] Declared in `bootstrap.sh` and symlinked into `~/.claude/skills/`.
  - [x] **The test came first**, and it was a case the net was missing: a mapping that resolves to
        nothing is reported "skipped", which reads as success on the machine that declared it and
        installs nothing on the next one. Declared before the folder existed → red on exactly that
        line → green once written.
  - [x] **Verified by acceptance, not by assertion**: the running session picked the skill up and
        announced it as available, in an unrelated repo (Kenjaku).
- [x] **T3 — Delete the stale `rules/README.md`** _(2026-08-20 · `9287fbb`)_
  - [x] Deleted. ~4 KB of standing instructions, injected into every session since the init commit,
        describing a `common/ typescript/ python/…` layout and an `install.sh` that never existed here.
  - [x] The root `README.md` now says what `rules/` may contain and why documentation does not go
        there — so the next file dropped in gets the same question asked of it.
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
- [x] **T6 — Make the Kenjaku copies point instead of copy** _(2026-08-20 · kenjaku `0001ba9`, branch
      `chore/plan-discipline-points-at-the-harness`, pushed, PR not opened)_
  - [x] `maintainers/skills/plan-discipline/` deleted, `maintainers/plan-discipline.md` reduced to a
        pointer. `DEVELOPING.md` follows.
  - [x] `CONVENTIONS.md` §1's banner **inverted**: the harness is the source for the method, that
        section is its application here.
  - [x] **Arbitration taken while doing it, do not re-open**: §1/§2/§3/§3bis were *not* gutted into
        bare pointers. That file exists so the rules **travel with a clone** (its own header says so),
        and a pointer to another repo does not travel. What left is only the project-agnostic half,
        which is what was actually duplicated.
  - [x] `rag` suite green, 515/515.
  - [ ] Update the `plan-discipline-shareable` memory once the `plan-memory-test-harness` question is
        settled — it still describes the old three-surface shape.

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
