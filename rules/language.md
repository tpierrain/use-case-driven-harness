# Langue — artefacts en anglais, conversation en français

Thomas et moi **conversons en français** (chat, voix, explications, questions/réponses). Mais **tout
artefact durable** que je produis ou modifie est rédigé **en anglais**, sans exception cachée.

## En anglais (toujours)

- **Code** : identifiants, noms de fonctions/variables/types, **commentaires**.
- **Docs & Markdown** versionnés : `README`, `SETUP`, ADR, plans/roadmaps/TODO, skills (`SKILL.md`).
- **Git** : messages de commit, **titres ET corps de PR**, descriptions d'issues, noms de branches.
- **Logs, messages d'erreur, textes destinés à l'utilisateur final** du produit (sauf localisation, ci-dessous).

> Raison : diffusion internationale, relecture par n'importe qui, cohérence du repo. Une PR ou un
> commentaire en français est un défaut à corriger — pas un choix.

## Exception — localisation produit intentionnelle (NE PAS « corriger »)

Certains contenus sont **délibérément** non-anglais parce que c'est le **produit** qui est localisé,
pas mon écriture. Ne jamais les angliciser :

- `templates/<locale>/**` (ex. `templates/fr/…`) — sources d'artefacts localisés.
- Contenu généré sous `--lang fr` / autre locale, notes de démo localisées, stopwords par locale.
- Noms propres, citations, et **enregistrements historiques** explicitement conservés dans une autre langue.

> En cas de doute sur « artefact durable en anglais » vs « localisation produit », trancher : si c'est
> **moi qui rédige** (code, doc, commit, PR) → anglais ; si c'est **le produit qui parle à un
> utilisateur dans SA langue** → respecter la locale.

## Règle

- **À chaque fois que j'écris du code, une doc, un commit ou une PR** → en anglais, par défaut, sans
  qu'on me le redemande. Convention **globale**, tous projets.
- Si je repère un artefact durable rédigé en français (PR, commentaire, doc) → le **signaler et le
  corriger**.

## Pré-vol obligatoire — AVANT de publier (le rituel)

> 🛑 **STOP — checklist à exécuter dans ma tête juste AVANT** tout `git commit`, `gh pr create|edit`,
> `gh release create|edit`, `gh issue create|edit` (et avant d'écrire un corps de PR / une note de
> release dans un fichier ou un heredoc) :
>
> 1. **Chaque mot de l'artefact est-il en anglais ?** (titre, corps, message de commit, description.)
> 2. **Seule exception tolérée** : une localisation produit *délibérée* — une ligne d'exemple marquée
>    🇫🇷/🇪🇸…, du contenu sous `templates/<locale>/`, ou `--lang <locale>`. Tout le reste = anglais.
> 3. Si je rédige le corps via **heredoc / `-F -` / stdin** (cas que le hook ne voit pas), c'est
>    **à moi** de relire : pas de filet automatique sur ce chemin.

**Filet déterministe (ADR 0009) :** un hook `PreToolUse(Bash)` —
[`~/.claude/hooks/en-artifact-guard.mjs`](../../.claude/hooks/en-artifact-guard.mjs) — scanne les
commandes de publication et **m'avertit (non bloquant)** si du français traîne dans le payload visible
(valeurs inline + `--notes-file`/`--body-file`/`-F <fichier>`). Carve-out locale respecté ; override
conscient `SBG_ALLOW_FR=1`. **Le hook est le filet, ce rituel est la ceinture** : le hook est aveugle
aux heredocs, donc la relecture manuelle reste obligatoire.

> Thomas me l'a demandé explicitement (déclencheur : un corps de PR rédigé en français, puis rappel
> 2026-06-17) → règle gravée ici pour ne plus jamais avoir à le redemander. À l'origine « ce n'est
> pas un hook, c'est une convention de rédaction » ; renforcée depuis par **ceinture (ce rituel) +
> bretelles (le hook déterministe)**, sur demande explicite de Thomas.
