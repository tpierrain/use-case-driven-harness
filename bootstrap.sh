#!/usr/bin/env bash
#
# bootstrap.sh — relie les règles/skills/agents globaux de ce repo à ~/.claude
# via des symlinks. Source unique de vérité = ce repo. Édition live, sync = git pull.
#
# Idempotent. Gère deux situations avec la MÊME commande :
#   • Laptop 1 (1re fois, repo encore vide) : ADOPTE les fichiers existants de
#     ~/.claude (les déplace dans le repo), puis crée les symlinks.
#   • Laptop 2 (repo cloné, déjà peuplé) : sauvegarde l'éventuel ~/.claude existant
#     (en .bak), puis crée les symlinks vers le contenu du repo.
#
# Usage :
#   ./bootstrap.sh          applique les liens
#   ./bootstrap.sh --check  dry-run : montre ce qui serait fait, ne touche à rien
#
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
STAMP="$(date +%Y%m%d-%H%M%S)"
DRY_RUN=false
[[ "${1:-}" == "--check" ]] && DRY_RUN=true

# Périmètre : <chemin dans ~/.claude>  <chemin équivalent dans le repo>
# (méthodo seule — cf. README. On ne versionne QUE ces 3 blocs.)
MAPPINGS=(
  "rules|rules"
  "skills/the-hive-pattern|skills/the-hive-pattern"
  "skills/outside-in-diamond-tdd|skills/outside-in-diamond-tdd"
  "skills/tdd-discipline|skills/tdd-discipline"
)

say()  { printf '%s\n' "$*"; }
run()  { if $DRY_RUN; then say "   [dry-run] $*"; else eval "$*"; fi; }

link_one() {
  local rel_claude="$1" rel_repo="$2"
  local claude_path="$CLAUDE_DIR/$rel_claude"
  local repo_path="$REPO_DIR/$rel_repo"

  say "• $rel_claude"

  # Déjà un symlink ?
  if [[ -L "$claude_path" ]]; then
    local target; target="$(readlink "$claude_path")"
    if [[ "$target" == "$repo_path" ]]; then
      say "   ✓ déjà lié correctement — rien à faire"
    else
      say "   ⚠️  symlink existant pointe ailleurs ($target) — à vérifier manuellement"
    fi
    return
  fi

  if [[ -e "$repo_path" ]]; then
    # Le repo a déjà le contenu (laptop 2, ou adoption déjà faite).
    if [[ -e "$claude_path" ]]; then
      say "   ↪ sauvegarde de l'existant → $claude_path.bak.$STAMP"
      run "mv \"$claude_path\" \"$claude_path.bak.$STAMP\""
    fi
    run "mkdir -p \"$(dirname "$claude_path")\""
    run "ln -s \"$repo_path\" \"$claude_path\""
    say "   ✓ symlink créé → repo"
  elif [[ -e "$claude_path" ]]; then
    # Adoption (laptop 1, 1re fois) : on déplace le contenu live dans le repo.
    say "   ⤵ adoption : déplacement de $claude_path → repo"
    run "mkdir -p \"$(dirname "$repo_path")\""
    run "mv \"$claude_path\" \"$repo_path\""
    run "ln -s \"$repo_path\" \"$claude_path\""
    say "   ✓ adopté + symlink créé"
  else
    say "   ⚠️  ni le repo ni ~/.claude n'ont ce chemin — ignoré"
  fi
}

say "═══════════════════════════════════════════════════════════"
say " use-case-driven-harness — bootstrap"
say " repo   : $REPO_DIR"
say " cible  : $CLAUDE_DIR"
$DRY_RUN && say " mode   : DRY-RUN (aucune modification)"
say "═══════════════════════════════════════════════════════════"

for m in "${MAPPINGS[@]}"; do
  link_one "${m%%|*}" "${m##*|}"
done

say "───────────────────────────────────────────────────────────"
if $DRY_RUN; then
  say "Dry-run terminé. Relance sans --check pour appliquer."
else
  say "✅ Terminé. Tes règles globales pointent maintenant vers ce repo."
  say "   Édite-les en place, commit, push. Sur l'autre laptop : git pull."
fi
