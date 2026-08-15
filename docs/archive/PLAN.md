# PLAN.md — Commissioning the `use-case-driven-harness` repo

> 🗄️ **ARCHIVED — executed on 2026-05-31, nothing left to run.** This is a **historical record**, not
> a mission: the repo has been in service ever since (see [`../../CLAUDE.md`](../../CLAUDE.md) for the
> operating rules). If you are a Claude instance opening this repo, **do not execute anything below**.
> It is kept for the trace, and it deliberately still names things that no longer exist (the
> `hexagonal-dotnet` skill, the `tdd-diamond` agent, "3 blocks"): that is what the repo looked like
> that day. Translated from the French original on 2026-08-15; the untouched original stays in git
> history.

> **For the Claude instance opening this repo for the first time.**
> This plan is your mission. Execute it **end to end, in order**, ticking as you go. Everything is
> idempotent: if a step is already done, note it and move to the next. Only two mandatory human
> pauses: the **confidentiality gate** (step 4) and the **publication confirmation** (step 6).

## Context (decisions already taken — do not re-litigate)

The repo becomes the **single source of truth** for Thomas Pierrain's global Claude Code config
(handle "Use Case Driven" for 15 years): his **Outside-in Diamond 🔷 TDD + The Hive** methodology
(modular hexagonal architecture).

Locked decisions:
- **Name**: `use-case-driven-harness` · **GitHub owner**: `tpierrain` · **Visibility: PUBLIC**.
- **Perimeter: "methodology only"** — 3 blocks only (see `bootstrap.sh`): `~/.claude/rules`,
  `~/.claude/skills/hexagonal-dotnet`, `~/.claude/agents/tdd-diamond.md`. Nothing else (no settings,
  caches, sessions, secrets).
- **Mechanism: symlinks** (no copies). The repo is the truth; `~/.claude` is a view of it.

## Prerequisites

- [x] **P1** — cwd = this repo (`~/dev/use-case-driven-harness`). Check with: `pwd`.
- [x] **P2** — `gh` authenticated: `gh auth status`. If not → ask Thomas to run `! gh auth login`
      (browser flow), then resume.
- [x] **P3** — `~/.claude/rules`, `~/.claude/skills/hexagonal-dotnet` and
      `~/.claude/agents/tdd-diamond.md` exist (otherwise there is nothing to adopt — alert Thomas).

## Steps

- [x] **1 — Dry-run**: `./bootstrap.sh --check`. Read the output, check that the 3 blocks will be
      handled (expected adoption: moving `~/.claude/...` → repo + symlink).
- [x] **2 — Bootstrap**: `./bootstrap.sh`. It moves the 3 blocks into the repo and creates the
      symlinks. (Idempotent: safely re-runnable, backups as `.bak.<timestamp>`.)
- [x] **3 — Symlink check**: `ls -la ~/.claude/rules ~/.claude/skills/hexagonal-dotnet ~/.claude/agents/tdd-diamond.md`
      → they must point into this repo. And `ls rules/ skills/hexagonal-dotnet/ agents/` → content present.
- [x] **4 — 🚧 CONFIDENTIALITY GATE (PUBLIC repo)**: before any commit, scan:
      ```bash
      grep -rinE "inqom|shodo|baker.?tilly|secret|token|password|api.?key|U0AD031|@gmail|@shodo|@inqom" rules/ skills/ agents/
      ```
      - If **nothing** comes out → OK, carry on.
      - If **anything at all** comes out → **STOP**. Show the lines to Thomas, ask what to do
        (remove/reword) before going any further. Never publish anything confidential.
- [x] **5 — Local commit**:
      ```bash
      git init
      git add -A
      git commit -m "init: harnais Use Case Driven (Outside-in Diamond, Hive, TDD)"
      ```
- [x] **6 — 🚦 PUBLICATION CONFIRMATION**: show Thomas a summary (versioned files, scan result) and
      ask **"do I publish this publicly?"**. Publishing is near-irreversible (indexed, forkable).
      After their "yes":
      ```bash
      gh repo create tpierrain/use-case-driven-harness --public --source=. --remote=origin --push
      ```
- [x] **7 — Final check**:
      - `gh repo view tpierrain/use-case-driven-harness --web` (or without `--web` for the summary).
      - Re-check the symlinks (step 3): still intact.
      - Confirm the Claude rules still load (the files are there through the symlink).
- [x] **8 — Closing**: update the **Journal** below, commit/push this PLAN.md
      (`docs: plan de mise en service exécuté`). Tell Thomas it is finished and remind them of the
      daily workflow: edit in place → commit → push; other laptop → `git pull`.

## Rollback (if it needs undoing)

- The symlinks: `rm ~/.claude/rules` (etc.) then restore the matching `.bak.<timestamp>`
  (`mv ~/.claude/rules.bak.XX ~/.claude/rules`), or `mv` the content back out of the repo.
- The GitHub repo: `gh repo delete tpierrain/use-case-driven-harness` (asks for confirmation).

## Execution journal (append-only)

- 2026-05-31 — steps 1→7 — bootstrap: the 3 blocks adopted (`rules/`, `skills/hexagonal-dotnet/`,
  `agents/tdd-diamond.md`) + symlinks created towards the repo. Confidentiality gate: nothing to
  report (only false positives on `CancellationToken` / generic "secrets"). `.claude/` added to
  `.gitignore` (session artifacts, out of perimeter). Initial commit `0c910f1`. PUBLIC publication
  confirmed by Thomas → repo created and pushed:
  https://github.com/tpierrain/use-case-driven-harness

---

> Once this plan is executed, it becomes **history**. The repo is in service; routine work follows
> the `CLAUDE.md` (the repo's operating rules).
