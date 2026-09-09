#!/usr/bin/env node
// en-artifact-guard — PreToolUse(Bash) guard.
//
// Durable artifacts (commit messages, PR titles/bodies, release notes, issues)
// MUST be written in English (rule: use-case-driven-harness/rules/language.md).
// This is the *deterministic* net under that written convention (ADR 0009):
// when a publish command (git commit / gh pr|release|issue create|edit) carries
// French-looking text, it injects a non-blocking reminder into Claude's context
// so the slip is caught BEFORE it reaches GitHub.
//
// Non-blocking by design (heuristic → false positives possible). It never blocks
// the command; it only warns. Deliberate product localization is carved out:
//   - lines flagged with a regional flag emoji (🇫🇷, 🇪🇸, …) are ignored;
//   - commands touching templates/<locale>/ or `--lang <locale>` are skipped;
//   - set SBG_ALLOW_FR=1 to silence it entirely for one conscious call.
//
// Known blind spot (covered by the written ritual, not here): a body passed via
// heredoc `-F -` / stdin is invisible to a PreToolUse hook — only inline values
// and `--notes-file/--body-file/-F <path>` file contents are scanned.

import { readFileSync, existsSync } from 'node:fs'

// --- French detection (the testable core) -----------------------------------

// High-signal French function words with low English collision (no "plus",
// "tout" kept but "a"/"est" dropped to avoid noise). Word-boundary matched.
const FR_WORDS = [
  'avec', 'pour', 'vous', 'nous', 'votre', 'notre', 'cette', 'dans', 'déjà',
  'être', 'aussi', 'donc', 'mais', 'très', 'sans', 'sous', 'leur', 'elle',
  'ils', 'ainsi', 'alors', 'peut', 'chaque', 'entre', 'toute', 'toutes',
  'ancien', 'anciennes', 'nouvelle', 'rapatrie', 'importe', 'migre', 'cerveau',
  'fonctionne', 'permet', 'depuis', 'vers', 'celui', 'celle', 'quand',
]
// French elision: a consonant + apostrophe + vowel (c'est, n'est, j'ai, d'un, qu'…)
const FR_ELISION = /\b[cdjlmnstCDJLMNST]['’][aàâeéèêiîoôuûyAÀÂEÉÈÊIÎOÔUÛhH]/
const FR_ACCENT = /[àâäéèêëîïôöùûüçœÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒ]/

// Strip product-localization carve-outs before scanning.
function stripLocale(text) {
  return text
    .split('\n')
    .filter((line) => !/[\u{1F1E6}-\u{1F1FF}]{2}/u.test(line)) // flag emoji line
    .join('\n')
}

// Returns { french: boolean, hits: string[] }.
export function detectFrench(rawText) {
  const text = stripLocale(rawText)
  const lower = text.toLowerCase()
  const hits = []

  const distinct = new Set()
  for (const w of FR_WORDS) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(lower)) distinct.add(w)
  }
  const elision = FR_ELISION.test(text)
  const accent = FR_ACCENT.test(text)

  if (elision) hits.push("elision (c'est/qu'…)")
  if (distinct.size) hits.push(`words: ${[...distinct].join(', ')}`)
  if (accent) hits.push('accented chars')

  // Flag if: any elision, OR ≥2 distinct function words, OR 1 word + an accent.
  const french = elision || distinct.size >= 2 || (distinct.size >= 1 && accent)
  return { french, hits }
}

// --- command analysis -------------------------------------------------------

const PUBLISH_RE = /\b(git\s+commit\b|gh\s+(pr|release|issue)\s+(create|edit)\b)/

function isLocaleScoped(cmd) {
  return /templates\/[a-z]{2}\b|--lang\s+\S+/i.test(cmd)
}

// Gather scannable text: the command line itself + any referenced notes/body files.
function collectText(cmd) {
  let text = cmd
  const fileFlags = [/--notes-file\s+(\S+)/, /--body-file\s+(\S+)/, /(?:^|\s)(?:-F|--file)\s+(\S+)/]
  for (const re of fileFlags) {
    const m = cmd.match(re)
    if (m && m[1] && m[1] !== '-') {
      const path = m[1].replace(/^["']|["']$/g, '')
      try {
        if (existsSync(path)) text += '\n' + readFileSync(path, 'utf8')
      } catch { /* fail-open */ }
    }
  }
  return text
}

// --- selftest ---------------------------------------------------------------

function selftest() {
  const cases = [
    ['English commit', 'git commit -m "docs(plans): introduce prospective bucket"', false],
    ['French commit (words)', 'git commit -m "ajoute le support pour vous, avec une note"', true],
    ['French commit (elision)', `git commit -m "fix: c'est enfin réparé"`, true],
    ['English PR title', 'gh pr create --title "The One With The Engine" --body "Ships import."', false],
    ['FR-flag carve-out only', 'release note\n🇫🇷 "importe / migre mes anciennes notes"\nall english here', false],
    ['English release', 'gh release edit v3.1.0 --title "Migrate Your Old Brain"', false],
    ['French body', 'gh pr create --title "x" --body "Cette PR permet de rapatrier vos notes"', true],
  ]
  let ok = 0
  for (const [name, cmd, expected] of cases) {
    const got = detectFrench(collectText(cmd)).french
    const pass = got === expected
    ok += pass ? 1 : 0
    console.log(`${pass ? '✓' : '✗ FAIL'}  ${name} → french=${got} (expected ${expected})`)
  }
  console.log(`\n${ok}/${cases.length} passed`)
  process.exit(ok === cases.length ? 0 : 1)
}

// --- main -------------------------------------------------------------------

if (process.argv.includes('--selftest')) selftest()

let payload = ''
try {
  payload = readFileSync(0, 'utf8')
} catch { process.exit(0) }

try {
  if (process.env.SBG_ALLOW_FR === '1') process.exit(0)
  const data = JSON.parse(payload || '{}')
  if (data.tool_name !== 'Bash') process.exit(0)
  const cmd = data?.tool_input?.command || ''
  if (!PUBLISH_RE.test(cmd) || isLocaleScoped(cmd)) process.exit(0)

  const { french, hits } = detectFrench(collectText(cmd))
  if (!french) process.exit(0)

  const msg =
    `⚠️ EN-ARTIFACT GUARD — this publish command looks like it contains FRENCH ` +
    `(${hits.join('; ')}). Durable artifacts (commit / PR / release / issue) must be ` +
    `ENGLISH (rule language.md). Re-read the message/body: translate it to English, ` +
    `unless this is deliberate product localization (a 🇫🇷 example line, templates/<locale>, ` +
    `--lang) — in which case proceed (or set SBG_ALLOW_FR=1).`
  // Non-blocking: inject as context, exit 0.
  console.log(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: msg },
  }))
  process.exit(0)
} catch {
  process.exit(0) // fail-open: a guard bug must never block a commit
}
