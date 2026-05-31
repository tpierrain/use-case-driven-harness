# CLAUDE.md — `use-case-driven-harness`

Repo **public** contenant mes règles, skills et agents globaux Claude Code
(méthodo « Use Case Driven » : Outside-in Diamond 🔷 TDD + The Hive).

---

## 🚀 PREMIÈRE SESSION — lis ça d'abord

**Si ce repo n'est pas encore en service** (pas de `.git`, ou pas encore poussé sur
GitHub) : ta mission est d'exécuter **[PLAN.md](PLAN.md)** de bout en bout. C'est un
plan turnkey, idempotent, avec deux seules pauses humaines (portail confidentialité +
confirmation de publication). Ne fais rien d'autre tant qu'il n'est pas déroulé.

**Si le repo est déjà en service** (poussé sur GitHub, symlinks en place) : PLAN.md est
historique. Suis les règles de vie ci-dessous pour tout travail courant.

Pour savoir où tu en es : `git remote -v` (origin présent = en service) et
`ls -la ~/.claude/rules` (symlink vers ce repo = bootstrap fait).

---

## Nature du repo

- **Source unique de vérité** de mon `~/.claude` (blocs `rules/`, `skills/hexagonal-dotnet/`,
  `agents/tdd-diamond.md`). Relié par **symlinks** via `bootstrap.sh`.
- Éditer un fichier ici **modifie ma config Claude live** (et inversement, puisque
  c'est symlinké). Toujours en avoir conscience.

## Règles

1. **Public = zéro confidentiel.** Avant tout commit, vérifier qu'aucun secret,
   token, ni référence client/employeur confidentielle n'entre dans le repo. Le
   périmètre est volontairement « méthodo seule » — garder cette allowlist stricte.
2. **Ne pas élargir le périmètre sans raison.** Pas de `settings.json`, pas de
   caches, pas de sessions, pas de `.credentials`. Cf. README.
3. **Commits clairs et atomiques** : un sujet par commit (`rules: …`, `skill: …`,
   `agent: …`, `docs: …`, `bootstrap: …`).
4. **Ne jamais casser l'idempotence de `bootstrap.sh`.** Toute évolution doit
   rester rejouable sans danger (backups en `.bak`, dry-run `--check`).

## Anti-dérive

Ce repo existe *parce que* les workflows par copie dérivent. Ne jamais réintroduire
de mécanisme de copie/install qui dupliquerait le contenu : le symlink est le cœur
du dispositif.
