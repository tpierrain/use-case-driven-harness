#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// memory-size-guard.mjs — SessionStart guard for the ~25 KB MEMORY.md bound.
//
// The agent's working-memory index `MEMORY.md` is reloaded IN FULL every session
// and is size-bounded (~25 KB). Past the bound it overflows SILENTLY — the tail
// is dropped and critical instructions get buried under stale text, with no
// visible error (the failure mode Thomas hit, cf. his article "Des pointeurs,
// pas des copies"). This hook makes that boundary LOUD: at each session start it
// stats the active project's MEMORY.md and, only when it approaches the limit,
// injects a warning into the session context (additionalContext) so the agent
// prunes ✅ SHIPPED / stale entries before the overflow happens. Stays SILENT
// when healthy (no noise). Deterministic, dependency-free (ADR 0009 spirit).
// ═══════════════════════════════════════════════════════════════════════════
import { statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const HARD_LIMIT = 25 * 1024; // ~25 KB — the MEMORY.md reload bound
const WARN_AT = Math.round(HARD_LIMIT * 0.8); // ~20 KB → start nudging
const CRIT_AT = Math.round(HARD_LIMIT * 0.92); // ~23.5 KB → loud

// Claude Code stores per-project auto-memory under
// ~/.claude/projects/<sanitized-cwd>/memory/ where <sanitized-cwd> is the cwd
// with every non-alphanumeric char turned into '-' (verified against the real
// dir name). Derive it from the project dir the hook runs in.
function memoryIndexPath(cwd) {
  const sanitized = cwd.replace(/[^a-zA-Z0-9]/g, "-");
  return join(homedir(), ".claude", "projects", sanitized, "memory", "MEMORY.md");
}

function main() {
  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  let size;
  try {
    size = statSync(memoryIndexPath(cwd)).size;
  } catch {
    return; // no memory index for this project → nothing to guard, stay silent
  }
  if (size < WARN_AT) return; // healthy → silent, no noise

  const kb = (size / 1024).toFixed(1);
  const pct = Math.round((size / HARD_LIMIT) * 100);
  const level = size >= CRIT_AT ? "CRITICAL" : "WARNING";
  const advice =
    `MEMORY.md is ${kb} KB (${pct}% of the ~25 KB reload bound). Past the bound it ` +
    `overflows SILENTLY and buries critical instructions. Prune it now: drop ` +
    `✅ SHIPPED / historical entries (their trace lives in git + the archived plan), ` +
    `keep only durable conventions + active-chantier thin pointers ` +
    `(maintainers/CONVENTIONS.md §3bis · rules/plans.md "Mémoire & /clear").`;

  process.stdout.write(
    JSON.stringify({
      // CLI-visible nudge (dropped by Claude Desktop, harmless there).
      systemMessage: `🧠 MEMORY.md ${level} — ${kb} KB / ~25 KB. Prune ✅ SHIPPED entries.`,
      // The reliable channel: injected into the model's context so the agent
      // surfaces it to Thomas and offers to prune before continuing.
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: `[memory-size-guard] ${level}: ${advice} Proactively tell Thomas and offer to prune before continuing the session.`,
      },
    })
  );
}

main();
