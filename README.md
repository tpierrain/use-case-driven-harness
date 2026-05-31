# use-case-driven-harness

Mon harnais [Claude Code](https://claude.com/claude-code) : les règles et skills
globaux qui incarnent la façon de concevoir du logiciel que je pousse depuis
des années sous le pseudo **Use Case Driven** — **Outside-in Diamond 🔷 TDD**,
**The Hive** (architecture hexagonale modulaire), et ma discipline de tests.

> Source unique de vérité pour mon `~/.claude`. Relié par **symlinks** (pas par
> copie) → édition en place, synchro entre machines par un simple `git pull`,
> **zéro dérive**.

## Contenu (périmètre « méthodo seule »)

| Bloc | Symlinké vers | Quoi |
|---|---|---|
| `rules/` | `~/.claude/rules` | directives **toujours chargées** (légères) — voir ci-dessous |
| `skills/tdd-discipline/` | `~/.claude/skills/tdd-discipline` | Skill : discipline TDD universelle (baby-steps, fail-first, triangulation) |
| `skills/outside-in-diamond-tdd/` | `~/.claude/skills/outside-in-diamond-tdd` | Skill : Outside-in Diamond 🔷 TDD (services/APIs/apps) — surcouche du TDD classique |
| `skills/hexagonal-dotnet/` | `~/.claude/skills/hexagonal-dotnet` | Skill : architecture hexagonale .NET — The Hive (how-to) |

`rules/` contient : `testing.md`, `architecture.md`, `dotnet-conventions.md`, `README.md`.

Volontairement **rien d'autre** : pas de `settings.json`, pas de caches, pas de
sessions, pas de secrets. Une allowlist stricte ne peut pas fuiter ce qu'on a
oublié d'ignorer.

## Architecture : directive légère (rule) → détail à la demande (skill)

Principe directeur : les **rules** sont injectées dans **chaque** session (coûteuses en
contexte), donc elles restent des **directives minimales** qui *pointent* vers une skill ; tout
le **détail** vit dans une **skill chargée à la demande** (uniquement quand on développe). Une
seule copie de chaque connaissance → **zéro duplication**, contexte always-on minimal.

```
QUAND JE DÉVELOPPE
│
├─ rule testing.md ─────────►  skill tdd-discipline ──────►  skill outside-in-diamond-tdd
│   « toujours du TDD »         « TDD classique »             « surcouche pour les ruches »
│                                                                      ▲
└─ rule architecture.md ────►  skill hexagonal-dotnet ───────────────┘
    « back-end ⇒ Hive »         « how-to The Hive (.NET) »      (flux de dev associé)
```

- **`testing.md`** (rule) → je pratique le TDD systématiquement. Le *comment* universel
  (baby-steps, fail-first, triangulation, refactor obligatoire) est dans **`tdd-discipline`**.
- **`architecture.md`** (rule) → tout back-end / API / service s'implémente en **ruche (The
  Hive)** : un module = un hexagone = un bounded context, communication inter-module par ports
  API/SPI uniquement. Le *how-to* est dans **`hexagonal-dotnet`**.
- **`outside-in-diamond-tdd`** (skill) → le flux de dev d'une ruche : une **spécialisation**
  du TDD classique (acceptance gros grain via l'adaptateur gauche, Builder, périmètre Hive).
- **`dotnet-conventions.md`** (rule) → uniquement les conventions de **langage** C# / .NET
  (syntaxe moderne, `Result<T>`, async, logging). L'archi Hive renvoie aux rules/skills ci-dessus.

## Installation sur une machine

```bash
git clone git@github.com:tpierrain/use-case-driven-harness.git
cd use-case-driven-harness
./bootstrap.sh --check   # dry-run : montre ce qui sera fait
./bootstrap.sh           # applique les symlinks (sauvegarde l'existant en .bak)
```

`bootstrap.sh` est idempotent et gère les deux cas avec la même commande :
- **Première machine** (repo encore vide) : il *adopte* les fichiers déjà présents
  dans `~/.claude` (les déplace dans le repo), puis crée les symlinks.
- **Machine suivante** (repo déjà peuplé) : il sauvegarde l'éventuel existant en
  `.bak.<horodatage>` puis crée les symlinks vers le contenu du repo.

## Workflow quotidien

1. J'édite une règle/skill **en place** (c'est symlinké, donc ça modifie le repo).
2. `git add -A && git commit -m "..." && git push`.
3. Sur l'autre laptop : `git pull` → tout est à jour, immédiatement.

## Pourquoi des symlinks et pas une copie

Un workflow par copie/script d'install **dérive** : on finit avec des versions
divergentes entre machines (vécu). Le symlink fait du repo l'unique source ;
`~/.claude` n'en est qu'une vue. Impossible de désynchroniser.
