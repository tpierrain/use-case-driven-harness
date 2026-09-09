#!/usr/bin/env bash
#
# bootstrap-check.sh — the regression net for CLAUDE.md's rule 4
# ("never break bootstrap.sh's idempotence").
#
# It drives bootstrap.sh as a PROCESS, with a fake $HOME, in --check mode, so it
# exercises the real entry point and writes nothing outside a temp directory.
#
# What it pins down: how `--check` judges an ALREADY-INSTALLED symlink.
#   1. linked through the exact repo path      → "already linked correctly"
#   2. linked through an EQUIVALENT path       → "already linked correctly"
#   3. linked to a genuinely different place   → "points elsewhere"
#
# Case 3 is not decoration: without it, "always say it is fine" would pass 1 and 2.
#
# It also pins that every block declared in MAPPINGS actually EXISTS in the repo:
# a mapping pointing at nothing is silently "skipped", which reads as success on
# the machine that declared it and installs nothing on the next one.
#
# Usage: ./test/bootstrap-check.sh   (exit 0 = green)

set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
[[ -n "$WORK" && -d "$WORK" ]] || { echo "cannot create a temp dir"; exit 1; }
trap 'rm -rf "$WORK"' EXIT

FAILURES=0

# Runs bootstrap.sh --check against a fake HOME whose .claude/rules is a symlink
# to $1, and asserts the output does contain $2 and does not contain $3.
expect_verdict() {
  local case_name="$1" link_target="$2" wanted="$3" unwanted="$4"
  local fake_home="$WORK/home-$case_name"

  mkdir -p "$fake_home/.claude"
  ln -s "$link_target" "$fake_home/.claude/rules"

  local output
  output="$(HOME="$fake_home" "$REPO_DIR/bootstrap.sh" --check 2>&1)"

  if [[ "$output" == *"$wanted"* && "$output" != *"$unwanted"* ]]; then
    echo "  ✓ $case_name"
  else
    echo "  ✗ $case_name"
    echo "      expected to contain : $wanted"
    echo "      expected to lack    : $unwanted"
    echo "      actual verdict      : $(printf '%s\n' "$output" | grep -A1 '^• rules$' | tail -1)"
    FAILURES=$((FAILURES + 1))
  fi
}

echo "bootstrap.sh --check, on an already-installed symlink:"

# 1. The exact path. This one already passed before the -ef fix; it is here so a
#    fix cannot buy case 2 by breaking the case that used to work.
expect_verdict "exact repo path" \
  "$REPO_DIR/rules" \
  "already linked correctly" "points elsewhere"

# 2. An equivalent path: same directory, different spelling. Reproduces the lived
#    defect (a link recorded as ~/dev/... against a repo resolved at ~/Dev/...)
#    portably, through an alias symlink rather than through case-insensitivity.
ln -s "$REPO_DIR" "$WORK/alias"
expect_verdict "equivalent path (alias symlink)" \
  "$WORK/alias/rules" \
  "already linked correctly" "points elsewhere"

# 3. A genuinely foreign target must still be reported, untouched.
mkdir -p "$WORK/somewhere-else/rules"
expect_verdict "genuinely different directory" \
  "$WORK/somewhere-else/rules" \
  "points elsewhere" "already linked correctly"

# 4. Every declared block must exist in the repo. Run against a pristine fake HOME
#    so nothing on this machine can stand in for a block the repo is missing:
#    bootstrap.sh reports "skipped" when neither side has the path, and a skip is
#    the shape a typo in MAPPINGS -- or a block declared before it was written --
#    takes. Without this case, such a mapping stays green here and installs
#    nothing on the next machine.
echo
echo "bootstrap.sh --check, on a pristine HOME:"
FRESH="$WORK/home-pristine"
mkdir -p "$FRESH/.claude"
fresh_output="$(HOME="$FRESH" "$REPO_DIR/bootstrap.sh" --check 2>&1)"

if [[ "$fresh_output" != *"skipped"* ]]; then
  echo "  ✓ every block declared in MAPPINGS exists in the repo"
else
  echo "  ✗ a declared block is missing from the repo"
  printf '%s\n' "$fresh_output" | grep -B1 'skipped' | sed 's/^/      /'
  FAILURES=$((FAILURES + 1))
fi

# ─── The hooks, and the half that makes them run ────────────────────────────
# A hook FILE that travels is not a hook that RUNS: Claude executes what
# settings.json declares, and settings.json is machine-local. The lived failure
# (2026-09-09, the second Mac): the rules arrived by git, the guards they promise
# did not, and nothing said so. So `--check` must NAME an unwired guard, and
# applying must wire it — without touching anything else in that file.

expect_report() {
  local case_name="$1" home="$2" wanted="$3"
  local output
  output="$(HOME="$home" "$REPO_DIR/bootstrap.sh" --check 2>&1)"

  if [[ "$output" == *"$wanted"* ]]; then
    echo "  ✓ $case_name"
  else
    echo "  ✗ $case_name"
    echo "      expected to contain : $wanted"
    echo "      actual              :"
    printf '%s\n' "$output" | sed 's/^/        /'
    FAILURES=$((FAILURES + 1))
  fi
}

echo
echo "the hooks, and their wiring in settings.json:"

# 5. A HOME with no settings.json at all: every canonical hook is unwired, and
#    --check has to say so rather than report a clean install.
UNWIRED="$WORK/home-unwired"
mkdir -p "$UNWIRED/.claude"
expect_report "an unwired machine is REPORTED, not silently fine" "$UNWIRED" "not wired"

# 6. --check writes nothing. The whole promise of the dry-run.
if [[ ! -e "$UNWIRED/.claude/settings.json" ]]; then
  echo "  ✓ --check wired nothing (it is a dry-run)"
else
  echo "  ✗ --check WROTE settings.json"
  FAILURES=$((FAILURES + 1))
fi

# 7. Applying wires the guards — and leaves everything else in that file alone.
#    The pre-existing keys are the point: settings.json is co-owned (Claude Code
#    rewrites it, the owner edits it), so a sync that overwrites it would silently
#    undo a model choice or a permission on every bootstrap.
APPLIED="$WORK/home-applied"
mkdir -p "$APPLIED/.claude"
printf '%s\n' '{"model":"opus[1m]","statusLine":{"type":"command","command":"mine"},"hooks":{"PreToolUse":[]}}' \
  > "$APPLIED/.claude/settings.json"

HOME="$APPLIED" "$REPO_DIR/bootstrap.sh" >/dev/null 2>&1

if node -e '
  const fs = require("fs");
  const live = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const canonical = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const asText = JSON.stringify(live.hooks);
  for (const event of Object.keys(canonical.hooks)) {
    if (!live.hooks[event]) throw new Error(`event ${event} was not wired`);
  }
  if (!asText.includes("plan-carrier-guard")) throw new Error("the guards are not in there");
  if (live.model !== "opus[1m]") throw new Error("an unrelated key was lost");
  if (live.statusLine.command !== "mine") throw new Error("the machine-local status line was overwritten");
' "$APPLIED/.claude/settings.json" "$REPO_DIR/settings/hooks.json"; then
  echo "  ✓ applying wires the guards and preserves the rest of settings.json"
else
  echo "  ✗ applying did not wire the guards, or clobbered the file"
  FAILURES=$((FAILURES + 1))
fi

# 8. Idempotent: a second run must not duplicate the entries, or every bootstrap
#    would run every guard one more time than the last.
before="$(cat "$APPLIED/.claude/settings.json")"
HOME="$APPLIED" "$REPO_DIR/bootstrap.sh" >/dev/null 2>&1
if [[ "$before" == "$(cat "$APPLIED/.claude/settings.json")" ]]; then
  echo "  ✓ a second run changes nothing"
else
  echo "  ✗ running twice did not converge"
  FAILURES=$((FAILURES + 1))
fi

# 9. And once wired, --check says so instead of crying wolf.
expect_report "a wired machine is reported as wired" "$APPLIED" "wired"

if [[ $FAILURES -eq 0 ]]; then
  echo "✅ green"
  exit 0
fi
echo "❌ $FAILURES failing case(s)"
exit 1
