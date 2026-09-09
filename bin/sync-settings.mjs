#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// sync-settings.mjs — wires this repo's guards into ~/.claude/settings.json.
//
// WHY THIS EXISTS, and it is the whole lesson of 2026-09-09. `bootstrap.sh`
// symlinks the rules and the skills, so those travel by `git pull`. The guards
// they promise did not: the hook FILES lived only in ~/.claude/hooks, and the
// line that makes Claude RUN them lives in settings.json, which is machine-local.
// So on a second Mac the rules arrived, said "the hook is the braces", and there
// were no braces — silently, because a guard that never runs looks exactly like a
// guard with nothing to say.
//
// SCOPE, deliberately narrow (the README's allowlist rule). This touches ONE key:
// `hooks`. Everything else in settings.json is machine-local by nature — the
// status line's path, the model, the permissions the owner clicked through — and
// is never read, never written, never backed into git.
//
// And that one key is REPLACED, not merged. The repo is the single source, which
// is the property being bought: a guard deleted here disappears everywhere, and
// two runs converge. A merge would leave yesterday's guard running forever on the
// machine that once had it, which is the drift this repo exists to refuse. The
// previous file is copied beside it first, so nothing is lost without a trace.
// ─────────────────────────────────────────────────────────────────────────────
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL = join(REPO, "settings", "hooks.json");

/** Every hook command this repo declares, flattened — the list a machine is checked against. */
export function declaredCommands(canonical) {
  return Object.values(canonical.hooks ?? {})
    .flat()
    .flatMap((matcher) => matcher.hooks ?? [])
    .map((hook) => hook.command)
    .filter(Boolean);
}

/** What is missing from the live settings: the guards that exist on disk and never run. */
export function unwired(canonical, live) {
  const running = JSON.stringify(live?.hooks ?? {});
  return declaredCommands(canonical).filter((command) => !running.includes(command));
}

/**
 * The live settings with this repo's `hooks` key in place of whatever was there. Returns the
 * SAME object shape, so a caller can compare before and after to decide whether to write —
 * which is what keeps a second run from touching the file at all.
 */
export function withCanonicalHooks(canonical, live) {
  return { ...live, hooks: canonical.hooks };
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    // A settings.json that does not parse is not a reason to lose it: it is backed up like any
    // other, and replaced by one that at least runs the guards.
    return fallback;
  }
}

export function syncSettings({ home = process.env.HOME, check = false, say = console.log } = {}) {
  const canonical = readJson(CANONICAL, { hooks: {} });
  const settingsPath = join(home, ".claude", "settings.json");
  const live = existsSync(settingsPath) ? readJson(settingsPath, {}) : {};

  const missing = unwired(canonical, live);
  say("• settings.json — the guards' wiring");
  if (missing.length === 0) {
    say("   ✓ every guard this repo declares is wired");
  } else {
    for (const command of missing) say(`   ⚠️  not wired: ${command}`);
  }

  if (check) {
    if (missing.length > 0) say("   [dry-run] re-run without --check to wire them");
    return { missing, written: false };
  }

  const next = withCanonicalHooks(canonical, live);
  if (JSON.stringify(next) === JSON.stringify(live)) return { missing, written: false };

  mkdirSync(dirname(settingsPath), { recursive: true });
  // The backup is taken from the file being replaced, and only when there IS one: the owner's
  // own edits to the other keys survive in `next`, but a hooks block they hand-tuned does not,
  // and they are entitled to find it again.
  if (existsSync(settingsPath)) {
    copyFileSync(settingsPath, `${settingsPath}.bak.harness`);
    say(`   ↪ previous settings kept as settings.json.bak.harness`);
  }
  writeFileSync(settingsPath, `${JSON.stringify(next, null, 2)}\n`);
  say("   ✓ guards wired (only the `hooks` key was touched)");
  return { missing, written: true };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  syncSettings({ check: process.argv.includes("--check") });
}
