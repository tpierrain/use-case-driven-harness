# CLAUDE.md — `use-case-driven-harness`

A **public** repo holding my global Claude Code rules and skills (the "Use Case Driven"
methodology: Outside-in Diamond 🔷 TDD + The Hive).

---

## Status: the repo is in service

The repo is **in steady state**: pushed to GitHub, symlinks in place. Follow the operating rules
below for any routine work.

The initial commissioning plan is **archived** in [docs/archive/PLAN.md](docs/archive/PLAN.md) —
history, nothing left to run.

To check the state if needed: `git remote -v` (origin present = in service) and
`ls -la ~/.claude/rules` (a symlink into this repo = bootstrap done).

---

## What this repo is

- The **single source of truth** for my `~/.claude` (the `rules/`, `skills/test-first-discipline/`,
  `skills/the-hive-pattern/`, `skills/outside-in-diamond-tdd/` blocks). Wired with **symlinks** via
  `bootstrap.sh`.
- Editing a file here **modifies my live Claude config** (and the other way round, since it is
  symlinked). Always stay aware of that.

## The shape of the methodology: rule (lightweight directive) → skill (on-demand detail)

A design principle to **preserve**: **rules** are loaded into *every* session (expensive in context)
→ they stay **minimal directives** that *point* at a skill; all the **detail** lives in a **skill
loaded on demand**. **One single copy** of each piece of knowledge → no duplication, minimal
always-on context.

```
rule testing.md ────────►  skill test-first-discipline ──────►  skill outside-in-diamond-tdd
  "test before code"         "the universal how"            "the layer for hives"
                                                                    ▲
rule architecture.md ────►  skill the-hive-pattern ────────────────┘
  "back-end ⇒ Hive"          "The Hive how-to (.NET examples)"    (the matching dev flow)
```

- `rules/testing.md` → always test-first; the *how* is in the `test-first-discipline` skill.
- `rules/architecture.md` → back-end/API/service ⇒ a hive (The Hive); the how-to is in
  `the-hive-pattern`.
- `rules/dotnet-conventions.md` → the C#/.NET **language** conventions only (no architecture).
- `skills/outside-in-diamond-tdd` → the dev flow of a hive, a specialization of the discipline.

**When enriching the methodology:** put the directive (the *what/when*) in a rule, the detail (the
*how*, examples, code) in a skill. Never copy the detail back into the rule. Skill slugs in ASCII
kebab-case (emoji only in the title/content).

## Rules

1. **Public = zero confidential material.** Before any commit, check that no secret, token, or
   confidential client/employer reference makes it into the repo. The perimeter is deliberately
   "methodology only" — keep that allowlist strict.
2. **Do not widen the perimeter without a reason.** No `settings.json`, no caches, no sessions, no
   `.credentials`. See the README.
3. **Clear, atomic commits**: one subject per commit (`rule: …`, `skill: …`, `docs: …`,
   `bootstrap: …`).
4. **Never break `bootstrap.sh`'s idempotence.** Any change must stay safely replayable (`.bak`
   backups, `--check` dry-run). **Run `./test/bootstrap-check.sh` after touching that script** — it
   drives it as a process against a fake `$HOME` and pins how `--check` judges an already-installed
   symlink (exact path, equivalent path, foreign target). It is the only mechanical net in this repo;
   a rule nobody can run is not a net.

## Anti-drift

This repo exists *because* copy-based workflows drift. Never reintroduce a copy/install mechanism
that would duplicate the content: the symlink is the heart of the design.
