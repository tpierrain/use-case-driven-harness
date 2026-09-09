# use-case-driven-harness

My [Claude Code](https://claude.com/claude-code) harness: the global rules and skills that embody
the way of designing software I have been advocating for years under the handle
**Use Case Driven** — **Outside-in Diamond 🔷 TDD**, **The Hive** (modular hexagonal architecture),
and my testing discipline.

> The single source of truth for my `~/.claude`. Wired with **symlinks** (not copies) → edit in
> place, sync across machines with a plain `git pull`, **zero drift**.

## Contents (the "methodology only" perimeter)

| Block | Symlinked to | What |
|---|---|---|
| `rules/` | `~/.claude/rules` | **always-loaded** directives (lightweight) — see below |
| `hooks/` | `~/.claude/hooks` | the **deterministic guards** the rules promise (plan carriers, English artifacts, memory size, …) |
| `settings/hooks.json` | *(merged, not linked)* | the **wiring** that makes those guards run — see below |
| `skills/test-first-discipline/` | `~/.claude/skills/test-first-discipline` | Skill: the universal testing discipline (test-first, fail-first, small batches by default, assertion quality) |
| `skills/outside-in-diamond-tdd/` | `~/.claude/skills/outside-in-diamond-tdd` | Skill: Outside-in Diamond 🔷 TDD (services/APIs/apps) — a specialization of the discipline above |
| `skills/the-hive-pattern/` | `~/.claude/skills/the-hive-pattern` | Skill: The Hive — Microservices-Ready Modular Monolith (how-to, language-agnostic; C#/.NET examples) |
| `skills/plan-discipline/` | `~/.claude/skills/plan-discipline` | Skill: how to write, open, resume and tick a plan so a cleared context costs nothing — plus the standalone rationale essay beside it |

`rules/` holds exactly the files meant to be **injected into every session**: `plans.md`,
`testing.md`, `architecture.md`, `dotnet-conventions.md`, `language.md`, `inclusive-writing.md`,
`style-typography.md`, `explaining.md`. Nothing else belongs there — a file dropped into `rules/` becomes a standing
instruction on every project, whether or not it was written to be one. Documentation about the repo
goes here, in this README, which is **not** injected.

Deliberately **nothing else** in the perimeter: no caches, no sessions, no secrets, and **no
wholesale `settings.json`**. A strict allowlist cannot leak what someone forgot to ignore.

### The one exception, and why it earns its place

A hook **file** that travels is not a hook that **runs**. Claude executes what `settings.json`
declares, and that file is machine-local — so before 2026-09-09 the rules crossed to the second Mac
announcing "the hook is the braces", and the braces stayed behind. Silently, which is the worst part:
a guard that never runs looks exactly like a guard with nothing to say.

So the perimeter now also carries `hooks/` (symlinked like everything else) plus **one key** of the
settings, in `settings/hooks.json`. `bootstrap.sh` applies it through `bin/sync-settings.mjs`, which:

- reads and writes **only `hooks`** — the status line's path, the model, the permissions you clicked
  through are never read, never written, never in git;
- **replaces** that key rather than merging it, so the repo stays the single source: a guard deleted
  here disappears everywhere, and two runs converge;
- keeps the previous file as `settings.json.bak.harness` before its first change;
- in `--check`, **names every guard that is not wired** and writes nothing.

That last point is the real deliverable: the failure was never "a hook was missing", it was "nobody
could tell".

## Architecture: a lightweight directive (rule) → detail on demand (skill)

The guiding principle: **rules** are injected into **every** session (expensive in context), so they
stay **minimal directives** that *point* at a skill; all the **detail** lives in a **skill loaded on
demand** (only when actually developing). One single copy of each piece of knowledge → **zero
duplication**, minimal always-on context.

```
WHEN I DEVELOP
│
├─ rule testing.md ────────►  skill test-first-discipline ──────►  skill outside-in-diamond-tdd
│   "test before code"          "the universal how"            "the layer for hives"
│                                                                      ▲
└─ rule architecture.md ────►  skill the-hive-pattern ───────────────┘
    "back-end ⇒ Hive"           "The Hive how-to (.NET examples)"     (the matching dev flow)
```

- **`testing.md`** (rule) → I always write the test before the code. The universal *how*
  (test-first, fail-first, refactor as part of the step, small batches by default, assertion
  quality, the entry-point seam) is in **`test-first-discipline`**.
- **`architecture.md`** (rule) → every back-end / API / service is built as a **hive (The Hive)**:
  one module = one hexagon = one bounded context, inter-module communication through API/SPI ports
  only. The *how-to* is in **`the-hive-pattern`**.
- **`outside-in-diamond-tdd`** (skill) → the dev flow of a hive: a **specialization** of the
  discipline (coarse-grained acceptance through the left-side adapter, Builder, Hive perimeter).
- **`dotnet-conventions.md`** (rule) → the C# / .NET **language** conventions only (modern syntax,
  `Result<T>`, async, logging). Hive architecture defers to the rules/skills above.

## Installing on a machine

```bash
git clone git@github.com:tpierrain/use-case-driven-harness.git
cd use-case-driven-harness
./bootstrap.sh --check   # dry-run: shows what would be done
./bootstrap.sh           # applies the symlinks (backs up anything existing as .bak)
```

```bash
./test/bootstrap-check.sh   # the regression net, if you change bootstrap.sh
```

`bootstrap.sh` is idempotent and handles both cases with the same command:
- **First machine** (repo still empty): it *adopts* the files already present in `~/.claude` (moves
  them into the repo), then creates the symlinks.
- **Next machine** (repo already populated): it backs up anything existing as `.bak.<timestamp>`
  then creates the symlinks towards the repo's content.

## Daily workflow

1. I edit a rule/skill/hook **in place** (it is symlinked, so this edits the repo).
2. `git add -A && git commit -m "..." && git push`.
3. On the other laptop: `git pull` → the rules, skills and hooks are up to date immediately. Then
   **`./bootstrap.sh`** — the one thing a pull cannot do is edit that machine's `settings.json`, so
   a new or changed guard needs it to actually start running. `./bootstrap.sh --check` first if you
   want to see what it would change.

## Why symlinks and not copies

A copy/install-script workflow **drifts**: you end up with diverging versions across machines (lived
experience). The symlink makes the repo the one source; `~/.claude` is only a view of it.
Desynchronizing is impossible.
