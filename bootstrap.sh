#!/usr/bin/env bash
#
# bootstrap.sh — wires this repo's global rules/skills/agents into ~/.claude via
# symlinks. Single source of truth = this repo. Live editing, sync = git pull.
#
# Idempotent. Handles two situations with the SAME command:
#   • Laptop 1 (first time, repo still empty): ADOPTS the existing files from
#     ~/.claude (moves them into the repo), then creates the symlinks.
#   • Laptop 2 (repo cloned, already populated): backs up any existing ~/.claude
#     entry (as .bak), then creates the symlinks towards the repo's content.
#
# Usage:
#   ./bootstrap.sh          applies the links
#   ./bootstrap.sh --check  dry-run: shows what would be done, touches nothing
#
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
STAMP="$(date +%Y%m%d-%H%M%S)"
DRY_RUN=false
[[ "${1:-}" == "--check" ]] && DRY_RUN=true

# Perimeter: <path inside ~/.claude>  <equivalent path inside the repo>
# (methodology only — see the README. We version ONLY these blocks.)
MAPPINGS=(
  "rules|rules"
  "hooks|hooks"
  "skills/the-hive-pattern|skills/the-hive-pattern"
  "skills/outside-in-diamond-tdd|skills/outside-in-diamond-tdd"
  "skills/test-first-discipline|skills/test-first-discipline"
  "skills/plan-discipline|skills/plan-discipline"
)

say()  { printf '%s\n' "$*"; }
run()  { if $DRY_RUN; then say "   [dry-run] $*"; else eval "$*"; fi; }

link_one() {
  local rel_claude="$1" rel_repo="$2"
  local claude_path="$CLAUDE_DIR/$rel_claude"
  local repo_path="$REPO_DIR/$rel_repo"

  say "• $rel_claude"

  # Already a symlink?
  if [[ -L "$claude_path" ]]; then
    local target; target="$(readlink "$claude_path")"
    # -ef compares device + inode, so an equivalent spelling of the same directory
    # counts as linked (a link recorded as ~/dev/... against a repo resolved at
    # ~/Dev/... on a case-insensitive filesystem, a path through another symlink…).
    # Comparing the target as a literal string reported those as broken.
    if [[ "$claude_path" -ef "$repo_path" ]]; then
      say "   ✓ already linked correctly — nothing to do"
    else
      say "   ⚠️  existing symlink points elsewhere ($target) — check it by hand"
    fi
    return
  fi

  if [[ -e "$repo_path" ]]; then
    # The repo already holds the content (laptop 2, or adoption already done).
    if [[ -e "$claude_path" ]]; then
      say "   ↪ backing up the existing one → $claude_path.bak.$STAMP"
      run "mv \"$claude_path\" \"$claude_path.bak.$STAMP\""
    fi
    run "mkdir -p \"$(dirname "$claude_path")\""
    run "ln -s \"$repo_path\" \"$claude_path\""
    say "   ✓ symlink created → repo"
  elif [[ -e "$claude_path" ]]; then
    # Adoption (laptop 1, first time): move the live content into the repo.
    say "   ⤵ adoption: moving $claude_path → repo"
    run "mkdir -p \"$(dirname "$repo_path")\""
    run "mv \"$claude_path\" \"$repo_path\""
    run "ln -s \"$repo_path\" \"$claude_path\""
    say "   ✓ adopted + symlink created"
  else
    say "   ⚠️  neither the repo nor ~/.claude has this path — skipped"
  fi
}

say "═══════════════════════════════════════════════════════════"
say " use-case-driven-harness — bootstrap"
say " repo   : $REPO_DIR"
say " target : $CLAUDE_DIR"
$DRY_RUN && say " mode   : DRY-RUN (no modification)"
say "═══════════════════════════════════════════════════════════"

for m in "${MAPPINGS[@]}"; do
  link_one "${m%%|*}" "${m##*|}"
done

# The half a symlink cannot do. A hook FILE that travels is not a hook that RUNS: Claude
# executes what settings.json declares, and that file is machine-local. Linking the hooks
# without wiring them would ship the braces and leave the belt holding everything up —
# silently, which is exactly how the second Mac ran for a day with no guards at all.
if $DRY_RUN; then
  node "$REPO_DIR/bin/sync-settings.mjs" --check
else
  node "$REPO_DIR/bin/sync-settings.mjs"
fi

say "───────────────────────────────────────────────────────────"
if $DRY_RUN; then
  say "Dry-run done. Re-run without --check to apply."
else
  say "✅ Done. Your global rules and guards now point at this repo."
  say "   Edit them in place, commit, push. On the other laptop: git pull && ./bootstrap.sh."
fi
