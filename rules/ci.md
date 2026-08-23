# CI — pushing is not the point. READING what comes back is.

> **Loaded at EVERY session start**, like [`plans.md`](./plans.md), and for the same reason: the
> moment it has to fire is the moment nothing looks like it needs loading — just after a push, when
> the work feels finished and the next thing is already being typed.

## The rule

**Every push is followed by reading its result.** Not "eventually", not "before the PR": the pushing
session is the one that reads. A green needs one glance; a red stops the next commit.

Concretely, after a push:

- `gh run list --limit 4` — is there a conclusion yet?
- if it is **red**: `gh run view <id> --json jobs` then the failing job's log, **before writing
  another line of code**. A red CI makes every later commit ambiguous — was it already broken, or did
  I break it?
- if it is still running and the work continues: **say so out loud in the reply**, so the human knows
  a verdict is outstanding. Never let "it is pushed" stand in for "it is green".

**A push whose result is never read is worse than no push**: it manufactures the *appearance* of a
net while the net is unread.

## Why this is a written rule and not a hook — Thomas's call, 2026-08-23

The obvious fix is a `Stop` hook that queries the CI and blocks the hand-back, exactly like
`plan-carrier-guard`. **He turned it down, and the reason is not laziness:** *"j'ai peur que l'option
A alourdisse vraiment la latence. On a de plus en plus de hooks et si on doit en plus aller fetcher et
analyser des CI, ça va pas le faire."*

That is a real budget. Every deterministic net costs milliseconds on **every** hand-back, including
the hundreds that have nothing to do with CI, and a network call is the most expensive kind. So this
one buys its safety by **having no trigger to miss**: it applies to the next push, and the one after.

> ⚠️ **Which means this file is the ONLY net.** There are no braces here. Read it that way.

## What it cost, measured — Kenjaku, 2026-08-23

The failure that produced this rule is worth keeping, because none of its parts looked like a mistake:

- A test fixture spelled a path with `/` where Windows uses `\`. **The repo's own Windows tripwire
  exists for exactly that class**, is documented as such, and went red **on the first push**.
- **Twenty-odd commits followed, each pushed, none read.** The standing rule at the time said *push
  every green commit so the CI tripwire is not disabled* — it made me push, it never made me **look**.
  A rule about supplying a net said nothing about consuming it.
- Meanwhile a second defect landed: a unit test reading the process's real stdin, which POSIX answers
  instantly and **Windows never answers at all**. One runner held **2 h 46 min**, and three hours of
  jobs queued behind it.
- Thomas is the one who noticed, from the GitHub UI: *"ça fait au moins 10 builds qui sont queued"*,
  then *"tout est rouge depuis 15h30"*. **The human was the monitoring.**

**The lesson is not "be more careful".** It is that *push-as-you-go* and *read-what-comes-back* are two
halves of one discipline, and shipping only the first half produces a branch that looks continuously
integrated and is continuously broken.

## Two engineering reflexes this also bought (they are not conventions, they are cheap)

- **Every CI job carries a `timeout-minutes`**, sized at a few times its measured green. GitHub's
  default is **6 hours**: without one, a hung job is not a red, it is a runner leak that queues
  everything behind it. Thomas, same day: *"on devrait avoir des timeouts plus aggressifs"*.
- **The test runner gets a per-test ceiling too** (`node --test --test-timeout=…`), one level below
  the job. The job timeout kills a hang **mute**; the per-test one **names the test**.

**Related**: [`testing.md`](./testing.md) governs what a test must prove; this file governs what
happens after the push that carries it.
