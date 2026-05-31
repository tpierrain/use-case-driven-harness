# use-case-driven-harness

Mon harnais [Claude Code](https://claude.com/claude-code) : les règles, skills et
agents globaux qui incarnent la façon de concevoir du logiciel que je pousse depuis
des années sous le pseudo **Use Case Driven** — **Outside-in Diamond 🔷 TDD**,
**The Hive** (architecture hexagonale modulaire), et ma discipline de tests.

> Source unique de vérité pour mon `~/.claude`. Relié par **symlinks** (pas par
> copie) → édition en place, synchro entre machines par un simple `git pull`,
> **zéro dérive**.

## Contenu (périmètre « méthodo seule »)

| Bloc | Symlinké vers | Quoi |
|---|---|---|
| `rules/` | `~/.claude/rules` | `testing.md` (Outside-in Diamond + Hive), `dotnet-conventions.md`, `README.md` |
| `skills/hexagonal-dotnet/` | `~/.claude/skills/hexagonal-dotnet` | Skill : architecture hexagonale .NET — The Hive |
| `agents/tdd-diamond.md` | `~/.claude/agents/tdd-diamond.md` | Agent : workflow Outside-in Diamond 🔷 TDD + Hive |

Volontairement **rien d'autre** : pas de `settings.json`, pas de caches, pas de
sessions, pas de secrets. Une allowlist stricte ne peut pas fuiter ce qu'on a
oublié d'ignorer.

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

1. J'édite une règle/skill/agent **en place** (c'est symlinké, donc ça modifie le repo).
2. `git add -A && git commit -m "..." && git push`.
3. Sur l'autre laptop : `git pull` → tout est à jour, immédiatement.

## Pourquoi des symlinks et pas une copie

Un workflow par copie/script d'install **dérive** : on finit avec des versions
divergentes entre machines (vécu). Le symlink fait du repo l'unique source ;
`~/.claude` n'en est qu'une vue. Impossible de désynchroniser.
