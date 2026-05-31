# PLAN.md — Mise en service du repo `use-case-driven-harness`

> **Pour l'instance Claude qui ouvre ce repo pour la première fois.**
> Ce plan est ta mission. Exécute-le **de bout en bout, dans l'ordre**, en cochant
> au fur et à mesure. Tout est idempotent : si une étape est déjà faite, constate-le
> et passe à la suivante. Une seule pause humaine obligatoire : le **portail
> confidentialité** (étape 4) et la **confirmation de publication** (étape 6).

## Contexte (décisions déjà prises — ne pas re-débattre)

Repo qui devient la **source unique de vérité** de la config globale Claude Code de
Thomas Pierrain (pseudo « Use Case Driven » depuis 15 ans) : sa méthodo **Outside-in
Diamond 🔷 TDD + The Hive** (architecture hexagonale modulaire).

Décisions verrouillées :
- **Nom** : `use-case-driven-harness` · **Owner GitHub** : `tpierrain` · **Visibilité : PUBLIC**.
- **Périmètre : « méthodo seule »** — uniquement 3 blocs (cf. `bootstrap.sh`) :
  `~/.claude/rules`, `~/.claude/skills/hexagonal-dotnet`, `~/.claude/agents/tdd-diamond.md`.
  Rien d'autre (pas de settings, caches, sessions, secrets).
- **Mécanisme : symlinks** (pas de copie). Le repo est la vérité ; `~/.claude` en est une vue.

## Pré-requis

- [ ] **P1** — cwd = ce repo (`~/dev/use-case-driven-harness`). Vérifie : `pwd`.
- [ ] **P2** — `gh` authentifié : `gh auth status`. Si non → demande à Thomas de lancer
      `! gh auth login` (flow navigateur), puis reprends.
- [ ] **P3** — `~/.claude/rules`, `~/.claude/skills/hexagonal-dotnet` et
      `~/.claude/agents/tdd-diamond.md` existent (sinon, rien à adopter — alerte Thomas).

## Étapes

- [ ] **1 — Dry-run** : `./bootstrap.sh --check`. Lis la sortie, vérifie que les 3 blocs
      seront bien traités (adoption attendue : déplacement de `~/.claude/...` → repo + symlink).
- [ ] **2 — Bootstrap** : `./bootstrap.sh`. Il déplace les 3 blocs dans le repo et crée
      les symlinks. (Idempotent : relançable sans danger, backups en `.bak.<horodatage>`.)
- [ ] **3 — Vérif symlinks** : `ls -la ~/.claude/rules ~/.claude/skills/hexagonal-dotnet ~/.claude/agents/tdd-diamond.md`
      → doivent pointer vers ce repo. Et `ls rules/ skills/hexagonal-dotnet/ agents/` → contenu présent.
- [ ] **4 — 🚧 PORTAIL CONFIDENTIALITÉ (repo PUBLIC)** : avant tout commit, scanne :
      ```bash
      grep -rinE "inqom|shodo|baker.?tilly|secret|token|password|api.?key|U0AD031|@gmail|@shodo|@inqom" rules/ skills/ agents/
      ```
      - Si **rien** ne sort → OK, continue.
      - Si **quoi que ce soit** sort → **STOP**. Montre les lignes à Thomas, demande quoi
        faire (retirer/reformuler) avant d'aller plus loin. Ne publie jamais du confidentiel.
- [ ] **5 — Commit local** :
      ```bash
      git init
      git add -A
      git commit -m "init: harnais Use Case Driven (Outside-in Diamond, Hive, TDD)"
      ```
- [ ] **6 — 🚦 CONFIRMATION PUBLICATION** : montre à Thomas un résumé (fichiers versionnés,
      résultat du scan) et demande **« je publie en public ? »**. Une publication est
      quasi-irréversible (indexée, forkable). Après son « oui » :
      ```bash
      gh repo create tpierrain/use-case-driven-harness --public --source=. --remote=origin --push
      ```
- [ ] **7 — Vérif finale** :
      - `gh repo view tpierrain/use-case-driven-harness --web` (ou sans `--web` pour le résumé).
      - Re-vérifie les symlinks (étape 3) : toujours intacts.
      - Confirme que les règles Claude se chargent toujours (les fichiers sont là via symlink).
- [ ] **8 — Clôture** : mets à jour le **Journal** ci-dessous, commit/push ce PLAN.md
      (`docs: plan de mise en service exécuté`). Signale à Thomas que c'est terminé et
      rappelle-lui le workflow quotidien : éditer en place → commit → push ; autre laptop → `git pull`.

## Rollback (si besoin d'annuler)

- Les symlinks : `rm ~/.claude/rules` (etc.) puis restaurer le `.bak.<horodatage>` correspondant
  (`mv ~/.claude/rules.bak.XX>  ~/.claude/rules`), ou re-`mv` le contenu depuis le repo.
- Le repo GitHub : `gh repo delete tpierrain/use-case-driven-harness` (demande confirmation).

## Journal d'exécution (append-only)

- 2026-05-31 — étapes 1→7 — bootstrap : adoption des 3 blocs (`rules/`, `skills/hexagonal-dotnet/`,
  `agents/tdd-diamond.md`) + symlinks créés vers le repo. Portail confidentialité : RAS (seuls
  faux positifs `CancellationToken` / « secrets » génériques). `.claude/` ajouté au `.gitignore`
  (artefacts de session, hors périmètre). Commit initial `0c910f1`. Publication PUBLIC confirmée par
  Thomas → repo créé et poussé : https://github.com/tpierrain/use-case-driven-harness

---

> Une fois ce plan exécuté, il devient **historique**. Le repo est en service ; le
> travail courant suit le `CLAUDE.md` (règles de vie du repo).
