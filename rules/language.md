# Language — artifacts in English, conversation in French

Thomas and I **converse in French** (chat, voice, explanations, questions and answers). But **every
durable artifact** I produce or modify is written **in English**, with no hidden exception.

## In English (always)

- **Code**: identifiers, function/variable/type names, **comments**.
- **Versioned docs & Markdown**: `README`, `SETUP`, ADRs, plans/roadmaps/TODOs, skills (`SKILL.md`).
- **Git**: commit messages, **PR titles AND bodies**, issue descriptions, branch names.
- **Logs, error messages, end-user-facing text** of the product (except localization, below).

> Why: international reach, review by anyone, consistency of the repo. A PR or a comment written in
> French is a defect to fix — not a choice.

## Exception — deliberate product localization (do NOT "fix" it)

Some content is **deliberately** not in English because it is the **product** that is localized, not
my writing. Never anglicize it:

- `templates/<locale>/**` (e.g. `templates/fr/…`) — sources of localized artifacts.
- Content generated under `--lang fr` / another locale, localized demo notes, per-locale stopwords.
- Proper nouns, quotes, and **historical records** explicitly kept in another language.

> When in doubt between "durable artifact in English" and "product localization", decide this way: if
> **I am the one writing** (code, doc, commit, PR) → English; if it is **the product speaking to a
> user in THEIR language** → honour the locale.

## Rule

- **Every time I write code, a doc, a commit or a PR** → in English, by default, without being asked
  again. A **global** convention, every project.
- If I spot a durable artifact written in French (PR, comment, doc) → **flag it and fix it**.

## Mandatory pre-flight — BEFORE publishing (the ritual)

> 🛑 **STOP — a checklist to run in my head right BEFORE** any `git commit`, `gh pr create|edit`,
> `gh release create|edit`, `gh issue create|edit` (and before writing a PR body / release note into
> a file or a heredoc):
>
> 1. **Is every word of the artifact in English?** (title, body, commit message, description.)
> 2. **The only tolerated exception**: a *deliberate* product localization — a sample line marked
>    🇫🇷/🇪🇸…, content under `templates/<locale>/`, or `--lang <locale>`. Everything else = English.
> 3. If I write the body through a **heredoc / `-F -` / stdin** (a path the hook cannot see), the
>    re-read is **on me**: there is no automatic net on that path.

**Deterministic net (ADR 0009):** a `PreToolUse(Bash)` hook —
[`~/.claude/hooks/en-artifact-guard.mjs`](../../.claude/hooks/en-artifact-guard.mjs) — scans publishing
commands and **warns me (non-blocking)** if French is lingering in the visible payload (inline values
+ `--notes-file`/`--body-file`/`-F <file>`). The locale carve-out is honoured; deliberate override with
`SBG_ALLOW_FR=1`. **The hook is the braces, this ritual is the belt**: the hook is blind to heredocs,
so the manual re-read stays mandatory.

> Thomas asked for this explicitly (trigger: a PR body written in French, then a reminder on
> 2026-06-17) → a rule carved here so it never has to be asked for again. Originally "this is not a
> hook, it is a writing convention"; reinforced since with **belt (this ritual) + braces (the
> deterministic hook)**, at Thomas's explicit request.
