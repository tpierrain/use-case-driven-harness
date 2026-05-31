# CLAUDE.md — `use-case-driven-harness`

Repo **public** contenant mes règles et skills globaux Claude Code
(méthodo « Use Case Driven » : Outside-in Diamond 🔷 TDD + The Hive).

---

## État : repo en service

Le repo est **en régime de croisière** : poussé sur GitHub, symlinks en place. Suis les
règles de vie ci-dessous pour tout travail courant.

Le plan de mise en service initial est **archivé** dans
[docs/archive/PLAN.md](docs/archive/PLAN.md) — historique, plus rien à dérouler.

Pour vérifier l'état si besoin : `git remote -v` (origin présent = en service) et
`ls -la ~/.claude/rules` (symlink vers ce repo = bootstrap fait).

---

## Nature du repo

- **Source unique de vérité** de mon `~/.claude` (blocs `rules/`, `skills/tdd-discipline/`,
  `skills/the-hive-pattern/`, `skills/outside-in-diamond-tdd/`). Relié par **symlinks** via `bootstrap.sh`.
- Éditer un fichier ici **modifie ma config Claude live** (et inversement, puisque
  c'est symlinké). Toujours en avoir conscience.

## Structure de la méthodo : rule (directive légère) → skill (détail on-demand)

Principe de conception à **préserver** : les **rules** sont chargées dans *chaque* session
(coûteuses en contexte) → elles restent des **directives minimales** qui *pointent* vers une
skill ; tout le **détail** vit dans une **skill chargée à la demande**. **Une seule copie** de
chaque connaissance → pas de duplication, contexte always-on minimal.

```
rule testing.md ─────────►  skill tdd-discipline ──────►  skill outside-in-diamond-tdd
  « toujours du TDD »        « TDD classique »             « surcouche pour les ruches »
                                                                    ▲
rule architecture.md ────►  skill the-hive-pattern ────────────────┘
  « back-end ⇒ Hive »        « how-to The Hive (exemples .NET) »  (flux de dev associé)
```

- `rules/testing.md` → toujours TDD ; le *comment* est dans la skill `tdd-discipline`.
- `rules/architecture.md` → back-end/API/service ⇒ ruche (The Hive) ; how-to dans `the-hive-pattern`.
- `rules/dotnet-conventions.md` → conventions de **langage** C#/.NET seulement (pas d'archi).
- `skills/outside-in-diamond-tdd` → flux de dev d'une ruche, spécialisation du TDD classique.

**Quand on enrichit la méthodo :** mettre la directive (le *quoi/quand*) dans une rule, le
détail (le *comment*, exemples, code) dans une skill. Ne jamais recopier le détail dans la rule.
Slugs de skills en kebab-case ASCII (emoji seulement dans le titre/contenu).

## Règles

1. **Public = zéro confidentiel.** Avant tout commit, vérifier qu'aucun secret,
   token, ni référence client/employeur confidentielle n'entre dans le repo. Le
   périmètre est volontairement « méthodo seule » — garder cette allowlist stricte.
2. **Ne pas élargir le périmètre sans raison.** Pas de `settings.json`, pas de
   caches, pas de sessions, pas de `.credentials`. Cf. README.
3. **Commits clairs et atomiques** : un sujet par commit (`rule: …`, `skill: …`,
   `docs: …`, `bootstrap: …`).
4. **Ne jamais casser l'idempotence de `bootstrap.sh`.** Toute évolution doit
   rester rejouable sans danger (backups en `.bak`, dry-run `--check`).

## Anti-dérive

Ce repo existe *parce que* les workflows par copie dérivent. Ne jamais réintroduire
de mécanisme de copie/install qui dupliquerait le contenu : le symlink est le cœur
du dispositif.
