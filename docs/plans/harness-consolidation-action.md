# Harness consolidation — one readable source, and the nets that carry it

> **Status (2026-08-20): the consolidation is DONE and pushed. What remains is the two Gas Town
> ideas, T4 and T5 — neither has been started — plus one owner's call left by T7.**
>
> **▶️ T8 IS DONE** _(2026-08-20)_ — `skills/test-first-discipline/SKILL.md` v2.1.0 now carries the
> section *"A mutation run LIES to you"* (the five traps, the survivor triage, and the move from recipe
> to command). **Do not re-open it, and above all do not hand-edit Kenjaku's vendored copy**: that
> refresh belongs to Kenjaku's update-regime rider, which was waiting on this text and is now unblocked.
>
> **▶️ The next step is T4** (an acceptance criterion on every plan step); **T5** is the bigger one and
> nothing orders it against T4. Everything above them is shipped, so do **not** re-open T1…T3, T6 or T8.
>
> **T7 landed unplanned the same day** (the save-point rule leaked in the singular → the rule now
> speaks of **carriers, plural**, plus a machine-local `Stop` hook that names them). It is an early
> instance of T5's thesis, and it leaves **one decision that is the owner's**: the public extract and
> the published page still carry the singular version, and both are outward-facing — which is the same
> T0 sub-question about `plan-memory-test-harness` still open below. **Do not propagate alone.**
>
> **One sub-question of T0 is still unanswered and is the owner's**: what happens to
> `plan-memory-test-harness`, the public extract for a colleague. It is currently a copy that drifts by
> design, and the drift is what started this whole plan. Options are: regenerate it from this repo on
> demand, keep it drifting with a dated banner, or retire it. **Do not decide this alone.**
>
> _(2026-08-20, checked rather than assumed: that repo is **not** broken. All 14 relative links
> resolve and no dangling skill reference survives the `outside-in-diamond-tdd` removal. Its
> `Provenance` section had gone stale and was fixed on the spot — `77cd814`, pushed to its `main`.
> **Two mentions of Kenjaku were deliberately left** in `skills/test-first-discipline/SKILL.md`
> lines 25 and 112: they are evidence citations for the mutation figures, not provenance, and
> removing them would leave "earned, not theorised" with nothing behind it. Awaiting the owner's word
> before touching them.)_
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
- [~] **T7 — The save-point rule leaked, and it leaked in the SINGULAR** _(2026-08-20 — an early,
      unplanned instance of T5's own thesis: a convention breached repeatedly gets a **dumber, more
      reliable carrier**, not a smarter rule)_
  - [x] **The measurement, taken before writing anything** (Kenjaku, same day): 8 commits, 4 into
        plans, each updating **the plan that was open**; **four** repo files restated that item's
        status. The rule fired every time; what it could not reach was the **copies**.
  - [x] `rules/plans.md` — new section *"The plan is PLURAL"*: name the carriers with `git grep -l`,
        one item = one **owning** plan, and the save point moves to **each decision** on a long
        autonomous run (where hand-backs are hours apart).
  - [x] `skills/plan-discipline/SKILL.md` — the actionable line, inside the save-point check.
  - [x] `skills/plan-discipline/plan-discipline.md` — § 3.bis: the measurement, the three causes, and
        why prose alone could not be the whole answer.
  - [x] **The braces**: `~/.claude/hooks/plan-carrier-guard.mjs`, a `Stop` hook that greps the tracked
        Markdown for the current branch, subtracts what the session touched, and **blocks the
        hand-back** naming what is left. **It judges no content** — a guard that tried to tell stale
        from current would be wrong often enough to be ignored, and being ignored is how a guard dies.
        Test-first: 29 self-test cases on the pure core (red first, then green) plus 8 end-to-end
        payloads (`plan-carrier-guard.e2e.sh`, beside it). **Machine-local: it does not travel**,
        which is why the written rule above stays load-bearing.
  - [ ] **Not propagated, deliberately, and it is the owner's call**: `plan-memory-test-harness` (the
        public extract) and the published page still carry the singular version. Both are
        **outward-facing**, and the fate of that repo is the T0 sub-question still open in the header
        note. Decide the repo first; the propagation is then mechanical.
  - [ ] Kenjaku's own corpus deduplication — the third slice of that chantier, tracked in **its** plan
        (`maintainers/plans/prospective/agent-orchestrated-release-mode-action.md`), which owns it.
        Named here only so this repo's reader knows where it lives.
- [x] **T8 — What `test-first-discipline` was missing: how a mutation run LIES to you**
      _(2026-08-20 · skill bumped to v2.1.0 — one new section, `## A mutation run LIES to you`)_
  - [x] **The decision, so it is not re-litigated**: it goes in **this repo's** skill
        (`skills/test-first-discipline/SKILL.md`), the source. Do **NOT** hand-edit Kenjaku's vendored
        copy (see the finding at the bottom of this task).
  - [x] **Why it is not already covered — checked on disk, not assumed.** The skill's *assertion* half
        is complete and needs nothing: "simplify the production rather than excusing the mutant", not
        chasing equivalents, asserting whole objects and sequences, the composition-root seam, and the
        day-of cadence. What it holds on **operating** a pass is one clause about false timeouts. That
        clause is the whole gap.
  - [x] **The section written — the five ways a run hands you a number that measures nothing.** Each
        one cost a real run on Kenjaku; none is tool- or language-specific. Each is written as
        symptom → counter-move, because knowing a trap is not what stops it:
    - [x] a **stale log** from the previous pass, read as this pass's result because the command failed
          silently and left the file where it was;
    - [x] a suite that **silently skips** in the run environment (a missing dependency, a guard that
          self-disables), so the mutants face a judge that judges nothing — with a score on top;
    - [x] a run **killed mid-way**, producing no table, where the absence of a score is read as a zero
          or, worse, as the previous number;
    - [x] a suite that really **touches the disk**, run in place on the working tree rather than in a
          throwaway checkout, and destroys for real;
    - [x] **false timeouts** from CPU oversubscription — **moved** out of the assertion-quality
          blockquote, which now hands over to the new section instead of carrying that clause alone.
    - [x] The unifying sentence, and the reason the section exists: *the worst failure of a measuring
          tool is not being wrong, it is being **confidently precise about nothing**.*
  - [x] **Plus the triage the skill did not have** (`### Triage a survivor before writing a test for
        it`). A first-pass survivor sorts into three families — an adapter layer judged by nothing, a
        double that ignores its arguments, a genuinely missing case — and **only the third is about
        missing tests**. Each family now points back at the reflex that already answers it (6, 8, then
        1–5 / 7 / 9 / 10); what was missing is *"ask which family you are in first"*.
  - [x] **Plus the move**, this repo's own doctrine applied to measurement for the first time: when the
        operating recipe keeps costing you, it becomes a **command that refuses to report what it did
        not measure**, not one more paragraph. Kenjaku's runner is cited as **dated evidence**, the way
        the `/switch` mutation figures already are; the implementation stays there.
  - [x] **Kept agnostic.** No paths, no Stryker flags, no tuning values, no file names — the only
        Kenjaku mentions are the two dated evidence citations. The operational half stays in Kenjaku's
        `maintainers/skills/mutation-testing/SKILL.md`.
  - [x] 🔎 **The finding that came with it, and it is T5's thesis again** — recorded here, **acted on
        in Kenjaku's plan**, which is where that work lives. Kenjaku ships a **vendored
        copy** of this very skill at `.claude/skills/test-first-discipline/SKILL.md` (frontmatter
        `origin: use-case-driven-harness`, dated 2026-08-15) and it has **already diverged** from this
        source. Unlike the other copies, that one is **shipped to every generated brain**. Refreshing
        it belongs to the update-regime chantier (Kenjaku's
        `update-regime-owns-what-it-shipped-action.md`, its S6 rider), **not** to a hand edit: editing
        it by hand today would widen the gap while looking like closing it.
- [ ] 💡 **T9 — `plan-carrier-guard` re-asks about carriers already declared "nothing to do"**
      _(raised 2026-08-20 by me, **not signed by the owner**, nothing started — record only)_
  - [x] **The observation, from a real session**: on Kenjaku's `chore/s0bis-entrypoint-mutation-debt`,
        the `Stop` hook named the same two files **three turns running** (`mutation/RESULTS.md` and
        `plans/prospective/v4.9.0-mutation-debt-plan.md`), and all three times the honest answer was
        *"this one genuinely needs nothing"* — both speak of the release by **name**, never by number,
        so no conversation about it can make them stale.
  - [ ] **Why it is worth a look and not a shrug**: the hook judges no content **on purpose**, and that
        is what makes it trustworthy — it must not start guessing. But a guard that asks the same
        question every turn is training its reader to answer without looking, and **being ignored is
        how a guard dies** (T7's own words). The failure mode here is not a false positive, it is
        **habituation**.
  - [ ] **The shape to consider, if the owner wants it**: remember a per-branch *"seen and declared
        without object"* for a file, and re-raise it only when **that file** changes or the branch
        moves on. Still zero content judgement — it would only stop repeating a question already
        answered. ⚠️ **The risk to weigh first**: a declaration is cheap to give and then silences the
        file for the rest of the branch, which is exactly the hole the hook exists to close. Decide
        that trade before writing a line.
  - [ ] Nothing ordered against T4 or T5. **Do not build it on my own judgement** — it changes a net
        the owner asked for.
- [x] **T10 — File the low mutation numbers where they belong, so they stop being blamed on baby-steps**
      _(2026-08-20 · owner's explicit ask, skill bumped to **v2.2.0**)_
  - [x] **The trigger, and it is a recurrence, not a one-off.** The owner asked whether baby-steps
        "scored about 60 % in general, so it works less well than test-first". Checked against
        Kenjaku's `maintainers/mutation/RESULTS.md` and `RETROSPECTIVE.md` rather than answered from
        memory: **there is no ~60 % baby-steps run anywhere in the record.** The two numbers attached
        to strict baby-steps are **84.62 %** and **87.74 %**, and the single file built that way in the
        earlier audit came out **top of its batch at 86.7 %**.
  - [x] **What the low numbers actually are** — 51.5 % is composition glue written **after** an
        already-green core; 71.4 % is a pure core wrapped in I/O and a CLI; 66 % and the months-long
        0 % are top-level entry points no test imported. All three are *when the test was written* or
        *whether the line sits in a reachable seam*. **None is about step size.**
  - [x] **Why a table and not a corrected answer in chat**: the misfiling has now happened **twice from
        both sides** — this skill's own predecessor quoted the 87-vs-51 pair as evidence about step
        size, and the owner recalled a 60 % figure today. A number misfiled twice will be misfiled
        again, so what is written down is **the filing**, not the correction. (New subsection under the
        evidence table in § *Why "test-first" and not "TDD"*.)
  - [x] **`rules/testing.md` deliberately NOT touched** — it already carries the 87-vs-51 correction and
        ends with *"the figures, and what they do not prove, are in the skill"*. One owning carrier; a
        second copy of the table would be the very defect T7 was about.
  - [ ] ⚠️ **Kenjaku's vendored copy falls one version further behind** (it ships the 2026-08-15 text;
        upstream is now v2.2.0). Still **not** to be hand-edited — that refresh is Kenjaku's S6 rider,
        and its plan owns the divergence.

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
