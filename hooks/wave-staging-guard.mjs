#!/usr/bin/env node
// wave-staging-guard — the deterministic net under "stage explicit paths while a
// wave of subagents is in flight".
//
// WHY THIS EXISTS. During the first agent-orchestrated run (Kenjaku S0bis,
// 2026-08-20) the SAME mistake was made twice in one night: a broad `git add`
// issued while parallel agents were still writing, which swept half-finished work
// into an unrelated commit (b4bd7a4 via `git add -A`, then 4fdb91b via
// `git add scripts/`). Both happened to be green — by luck, not by construction.
// A defect that repeats is not a missing rule, it is an unwired net. This is the
// net; the written rule is CONVENTIONS.md § 12.
//
// SHAPE. Two matchers, one file:
//   PreToolUse(Task|Agent) → stamp "a wave was dispatched at T" for this session.
//   PreToolUse(Bash)       → if a broad staging command lands while that stamp is
//                            FRESH, block it (exit 2) and say what to do instead.
//
// Blocking, unlike en-artifact-guard, because the cost of a false positive is
// near zero: the fix is to name the paths, which is what should have happened
// anyway. Outside the freshness window the hook is silent, so ordinary solo
// `git add -A` is untouched.
//
// Fail-open on every internal error: a guard bug must never wedge a session.

import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, resolve, isAbsolute } from "node:path";
import { homedir } from "node:os";

// How long after dispatching an agent a broad stage is considered dangerous.
// Generous on purpose: a wave that finishes early costs one explicit `git add`,
// while a window that closes early costs a swept commit. Time-based rather than
// cleared on completion, so a killed or backgrounded agent can never wedge it.
const FRESH_MS = 20 * 60 * 1000;

const STAMP_DIR = join(homedir(), ".claude", ".cache", "agent-waves");

// ── The testable core ────────────────────────────────────────────────────────

// Everything that stages more than the paths it names. `-u` is included: it
// restages every tracked file in the tree, which is the same sweep by another
// spelling. `git commit -a` / `-am` skip the index entirely and are the same
// hazard one step later.
export function findBroadStaging(command, isDirectory = defaultIsDirectory) {
  for (const segment of splitSegments(command)) {
    const words = segment.trim().split(/\s+/).filter(Boolean);
    if (words[0] !== "git") continue;

    const verb = words[1];
    const rest = words.slice(2);

    if (verb === "add") {
      for (const word of rest) {
        if (word === "-A" || word === "--all") return { kind: "git add -A" };
        if (word === "-u" || word === "--update") return { kind: "git add -u" };
        if (word === "." || word === ":/" || word === "*") return { kind: `git add ${word}` };
        // A bare directory stages whatever an agent happened to leave in it.
        if (!word.startsWith("-") && isDirectory(word)) return { kind: `git add ${word}` };
      }
    }

    if (verb === "commit") {
      for (const word of rest) {
        if (word === "--all") return { kind: "git commit --all" };
        // Short-flag clusters: -a, -am, -na… but never a long flag or a value.
        if (/^-[a-z]*a[a-z]*$/.test(word)) return { kind: `git commit ${word}` };
      }
    }
  }
  return null;
}

// Command separators only — a quoted `;` or `&&` inside a message must not split
// the command, or a commit body could be read as a second command.
function splitSegments(command) {
  const segments = [];
  let current = "";
  let quote = null;
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (quote) {
      if (ch === "\\") current += ch + (command[++i] ?? "");
      else if (ch === quote) { quote = null; current += ch; }
      else current += ch;
      continue;
    }
    if (ch === "'" || ch === '"') { quote = ch; current += ch; continue; }
    if (ch === ";" || ch === "\n" || (ch === "&" && command[i + 1] === "&") || (ch === "|" && command[i + 1] === "|")) {
      if (ch === "&" || ch === "|") i++;
      segments.push(current);
      current = "";
      continue;
    }
    if (ch === "|") { segments.push(current); current = ""; continue; }
    current += ch;
  }
  segments.push(current);
  return segments;
}

export function waveIsFresh(stampedAt, now, freshMs = FRESH_MS) {
  if (typeof stampedAt !== "number") return false;
  return now - stampedAt < freshMs;
}

function defaultIsDirectory(path, cwd = process.cwd()) {
  try {
    return statSync(isAbsolute(path) ? path : resolve(cwd, path)).isDirectory();
  } catch {
    return false;
  }
}

// ── Self-test (run: node wave-staging-guard.mjs --selftest) ──────────────────

function selftest() {
  const dirs = new Set(["scripts", "scripts/", "maintainers/mutation/reports"]);
  const isDir = (p) => dirs.has(p);
  const cases = [
    // [command, expected broad?]
    ["git add -A", true],
    ["git add --all", true],
    ["git add .", true],
    ["git add -u", true],
    ["git add scripts/", true],
    ["git add maintainers/mutation/reports", true],
    ["git commit -a -m 'x'", true],
    ["git commit -am 'x'", true],
    ["git add -A && git commit -m 'x'", true],
    // Explicit paths: the whole point, must stay allowed.
    ["git add scripts/status-line.mjs", false],
    ["git add a.md b.md", false],
    ["git commit -m 'x'", false],
    ["git commit -q -F -", false],
    ["git status --short", false],
    ["git add -p", false],
    // A message that merely mentions the flags is not a command.
    ["git commit -m 'do not use git add -A here'", false],
    // Not git at all.
    ["npm add -A", false],
    // Freshness
  ];

  let ok = 0;
  for (const [cmd, expected] of cases) {
    const got = Boolean(findBroadStaging(cmd, isDir));
    const pass = got === expected;
    ok += pass ? 1 : 0;
    console.log(`${pass ? "✓" : "✗ FAIL"}  ${JSON.stringify(cmd)} → broad=${got} (expected ${expected})`);
  }

  const freshCases = [
    [waveIsFresh(1000, 2000, 5000), true, "a wave 1s old is fresh"],
    [waveIsFresh(1000, 90_000, 5000), false, "a wave 89s old has expired"],
    [waveIsFresh(undefined, 2000, 5000), false, "no wave ever dispatched"],
  ];
  for (const [got, expected, name] of freshCases) {
    const pass = got === expected;
    ok += pass ? 1 : 0;
    console.log(`${pass ? "✓" : "✗ FAIL"}  ${name} → ${got} (expected ${expected})`);
  }

  const total = cases.length + freshCases.length;
  console.log(`\n${ok}/${total} passed`);
  process.exit(ok === total ? 0 : 1);
}

// ── main ─────────────────────────────────────────────────────────────────────

if (process.argv.includes("--selftest")) selftest();

let payload = "";
try {
  payload = readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

try {
  const data = JSON.parse(payload || "{}");
  const session = String(data.session_id || "no-session").replace(/[^\w-]/g, "_");
  const stampFile = join(STAMP_DIR, `${session}.json`);
  const tool = data.tool_name || "";

  // 1. An agent is being dispatched → open the danger window.
  if (tool === "Task" || tool === "Agent") {
    try {
      mkdirSync(STAMP_DIR, { recursive: true });
      writeFileSync(stampFile, JSON.stringify({ stampedAt: Date.now() }));
    } catch {
      /* stamping is best-effort: never block a dispatch */
    }
    process.exit(0);
  }

  if (tool !== "Bash") process.exit(0);

  const command = data?.tool_input?.command || "";
  const cwd = data.cwd || process.cwd();
  const broad = findBroadStaging(command, (p) => defaultIsDirectory(p, cwd));
  if (!broad) process.exit(0);

  let stampedAt;
  try {
    stampedAt = JSON.parse(readFileSync(stampFile, "utf8")).stampedAt;
  } catch {
    process.exit(0); // no wave recorded for this session → nothing to guard
  }
  if (!waveIsFresh(stampedAt, Date.now())) process.exit(0);

  const minutes = Math.round((Date.now() - stampedAt) / 60000);
  process.stderr.write(
    `🛑 WAVE STAGING GUARD — blocked \`${broad.kind}\`.\n\n` +
      `A subagent was dispatched ${minutes} min ago in this session, so files you did not write ` +
      `may be sitting half-finished in the working tree. A broad stage sweeps them into your ` +
      `commit; this exact mistake was made twice during the S0bis run (b4bd7a4, 4fdb91b).\n\n` +
      `Do this instead: run \`git status --short\`, then \`git add\` the paths YOU changed, ` +
      `named one by one. If you genuinely mean to commit an agent's work, name its files too — ` +
      `so that it is a decision, not a sweep.\n\n` +
      `(This guard is silent once ${Math.round(FRESH_MS / 60000)} min have passed with no new dispatch.)\n`,
  );
  process.exit(2); // 2 = block the tool call, stderr goes back to Claude
} catch {
  process.exit(0); // fail-open: a guard bug must never wedge a session
}
