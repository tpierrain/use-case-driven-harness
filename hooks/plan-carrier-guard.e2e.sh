#!/bin/zsh
# End-to-end payloads for plan-carrier-guard, against a throwaway repo.
set +e
HOOK=~/.claude/hooks/plan-carrier-guard.mjs
ROOT=$(mktemp -d)
SESSION="e2e-carrier-$$"
STAMP=~/.claude/.cache/plan-carriers/${SESSION}.json
rm -f "$STAMP"

cd "$ROOT"
git init -q -b main .
git config user.email e2e@test && git config user.name e2e
printf 'roadmap\n' > ROADMAP.md
printf 'plan\n' > PLAN.md
printf 'results\n' > RESULTS.md
git add ROADMAP.md PLAN.md RESULTS.md
git commit -qm base
git checkout -qb feat/carrier-e2e
# three files now name the branch; only PLAN.md will be touched afterwards
for f in ROADMAP.md PLAN.md RESULTS.md; do printf 'tracks feat/carrier-e2e\n' >> $f; done
# the declared door, set up BEFORE the session starts so neither counts as touched:
# INDEX.md declares in its header that it holds no state → never a carrier.
# LATE.md carries the same words below the header window → still a carrier.
printf '<!-- plan-carrier-guard: delegates-only -->\n# index\ntracks feat/carrier-e2e\n' > INDEX.md
{ printf '# late\n'; for i in $(seq 1 25); do printf 'a row\n'; done; printf 'plan-carrier-guard: delegates-only\ntracks feat/carrier-e2e\n'; } > LATE.md
git add . && git commit -qm "the carriers name the branch; one declares it holds no state"

run() { # run <label> <json>
  local out rc
  out=$(printf '%s' "$2" | node "$HOOK" 2>&1); rc=$?
  echo "── $1 → exit=$rc"
  [[ -n "$out" ]] && echo "$out" | head -8
  return 0
}

# 1. SessionStart stamps the baseline (HEAD right now)
run "1. SessionStart stamps" "{\"hook_event_name\":\"SessionStart\",\"session_id\":\"$SESSION\",\"cwd\":\"$ROOT\"}"
echo "   stamp: $(cat $STAMP 2>/dev/null)"

# session work: touch ONE carrier only, and commit it
printf 'progress\n' >> PLAN.md
git add PLAN.md && git commit -qm "update the plan that was open"

run "2. Stop, 2 carriers untouched" "{\"hook_event_name\":\"Stop\",\"session_id\":\"$SESSION\",\"cwd\":\"$ROOT\",\"stop_hook_active\":false}"
run "3. Stop again, same state (suppressed)" "{\"hook_event_name\":\"Stop\",\"session_id\":\"$SESSION\",\"cwd\":\"$ROOT\",\"stop_hook_active\":false}"
run "4. Stop with stop_hook_active" "{\"hook_event_name\":\"Stop\",\"session_id\":\"$SESSION\",\"cwd\":\"$ROOT\",\"stop_hook_active\":true}"

# now touch the other two carriers → nothing left to name
printf 'progress\n' >> ROADMAP.md; printf 'progress\n' >> RESULTS.md; printf 'progress\n' >> LATE.md
git add . && git commit -qm "the siblings are updated too"
run "5. Stop, every carrier touched" "{\"hook_event_name\":\"Stop\",\"session_id\":\"$SESSION\",\"cwd\":\"$ROOT\",\"stop_hook_active\":false}"

# main is never guarded
git checkout -q main
run "6. Stop on main" "{\"hook_event_name\":\"Stop\",\"session_id\":\"$SESSION\",\"cwd\":\"$ROOT\",\"stop_hook_active\":false}"

# a non-repo cwd, and a malformed payload: both silent
run "7. Stop outside a git repo" "{\"hook_event_name\":\"Stop\",\"session_id\":\"$SESSION\",\"cwd\":\"/\",\"stop_hook_active\":false}"
run "8. malformed payload" "not json at all"

rm -f "$STAMP"
rm -rf "$ROOT"
