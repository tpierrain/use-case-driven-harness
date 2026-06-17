# Plans & docs de suivi — checkboxes obligatoires

Tout document de **plan / roadmap / TODO / suivi d'avancement** que je rédige ou modifie (au premier
chef les `maintainers/plans/**`, mais aussi **tout** fichier qui liste des étapes à réaliser) DOIT
utiliser des **checkboxes Markdown** `- [ ]` / `- [x]` sur **chaque étape ET chaque sous-étape** —
jamais des puces simples `-`, ni des marqueurs purement textuels (`TODO`, `✅ DONE`) seuls — afin que
Thomas puisse **suivre et cocher l'avancement directement depuis le Markdown** (Typora, Obsidian,
l'aperçu GitHub), sans rien me redemander.

## Règles

- **Plan multi-étapes** → une section **« Tracking »** en tête, avec **une checkbox par étape**, puis
  des **sous-checkboxes** au fil de chaque étape (modèle de référence :
  `maintainers/plans/prospective/rag-embedder-plan-action.md` du repo second-brain-generator).
- **Étape terminée** → cocher `- [x]` **et** noter _(date · commit)_ : c'est la mémoire qui survit
  aux `/clear`.
- **Par défaut, à l'ouverture d'un plan**, proposer/rétablir les checkboxes si elles manquent —
  ne pas attendre qu'on me le demande.
- Cette convention est **globale** : elle s'applique à **tous** les projets, sans avoir à la
  re-spécifier.

> Thomas me l'a demandé de façon répétée → règle gravée ici pour ne plus jamais avoir à le redemander.
> Ce n'est pas un hook (un hook ne peut pas rédiger des checkboxes) : c'est une **convention de
> rédaction**, donc une instruction globale.
