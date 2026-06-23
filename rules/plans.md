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

## Mémoire & `/clear` — des pointeurs, pas des copies

> Réf. : Thomas Pierrain, *« Des pointeurs, pas des copies, banane »*
> (<https://medium.com/@tpierrain/des-pointeurs-pas-des-copies-banane-56c9d197b80b>).

Le **plan du repo (`maintainers/plans/**`) est la source UNIQUE** de l'état d'un chantier (checkboxes,
commits, reste-à-faire). `MEMORY.md` est **rechargé en entier à chaque session** (et borné, ~25 Ko) :
toute redite de l'état d'un plan y crée du **context rot** et peut **noyer les instructions critiques**
sous de l'obsolète — un débordement **silencieux**. Donc, par défaut, sans qu'on me le redemande :

- **Pointeurs, pas des copies.** Pour un chantier en cours : **un seul fichier mémoire = pointeur fin**
  (branche + chemin du plan + « lire le plan »), et **une seule ligne d'index fine** dans `MEMORY.md`.
  Je ne **duplique JAMAIS** dans la mémoire le contenu du plan (done/remains, commits, détails) — il vit
  dans le plan, lu à la demande, jamais auto-chargé.
- **Cocher au fil de l'eau** le plan du repo (et lui seul) pour que le repère ne mente pas — cf. la
  section checkboxes ci-dessus et « Étape terminée → _(date · commit)_ ».
- **Élaguer `MEMORY.md` des entrées ✅ SHIPPED / historiques** dès qu'un chantier est livré : un livré
  n'est plus du contexte actionnable, sa trace vit dans **git + le plan archivé**. Supprimer la ligne
  d'index **et** le fichier-pointeur devenu pur historique. Garder dans l'index surtout :
  **préférences / conventions durables** + **chantiers actifs**.
- **Reprise après `/clear`** : suivre le pointeur → **ouvrir le plan**, reprendre au **1ᵉʳ `- [ ]` non
  coché**, et **l'annoncer avant de coder**. Le `/clear` redevient gratuit parce qu'il n'y a rien à
  perdre en mémoire — l'état est dans le plan.

> Pourquoi global : c'est une **convention de rédaction de la mémoire**, pas un hook. Sœur de la mémoire
> projet `one-canonical-plan-in-repo` (un seul plan canonique = celui du repo) ; cette règle en est la
> généralisation tous-projets, toujours chargée.
