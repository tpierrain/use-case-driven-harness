# Style — Typography

## Zero em dash — IN FRENCH ONLY

**NEVER use an em dash (—) in what Claude writes IN FRENCH**: chat replies, notes, messages, docs and
comments written in French. Explicit request from Thomas (2026-07-04).

Instead, depending on the context:
- a **comma**,
- a **colon**,
- **parentheses**.

When touching up a **French** artifact that contains em dashes, **convert them** along the way (comma,
colon or parentheses, whichever fits the meaning).

## 🛑 The scope is the LANGUAGE, not the medium

**In English, the em dash is normal and stays allowed.** It is part of ordinary English typography;
banning it there makes no sense and produces lopsided prose. And nearly every durable artifact is **in
English** (see [`language.md`](./language.md): code, comments, versioned docs, commits, PR bodies,
release notes). **So in practice this rule almost never applies to a repo's artifacts, only to what I
write in French.**

**NEVER "fix" the em dashes of an English text**, and in particular:
- do not strip them from an English **release title**, PR title or section title when the existing
  series uses them (e.g. `v4.0.0 — The One Where It Becomes Kenjaku`): **consistency of the series
  wins**, it is a titling convention, not a mistake;
- do not strip them from a repo's existing English content on the grounds of "touching up along the
  way": the conversion clause above is **French only**.

> ⚠️ Thomas had to repeat this a good **half-dozen times** (latest reminder: 2026-07-27, at Kenjaku's
> v4.1.0 release, where I had flagged as a defect some perfectly legitimate em dashes in an English PR
> body and release title). The cause was **this very rule**, silent about language: I kept re-deriving
> the wrong scope every time. Fixed here, at the source, rather than in a project memory, so it holds
> everywhere and for good.
