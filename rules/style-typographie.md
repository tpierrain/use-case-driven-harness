# Style — Typographie

## Zéro tiret cadratin — EN FRANÇAIS UNIQUEMENT

**Ne JAMAIS utiliser de tiret cadratin (—) dans ce que Claude écrit EN FRANÇAIS** : réponses de chat,
notes, messages, docs et commentaires rédigés en français. Demande explicite de Thomas (2026-07-04).

À la place, selon le contexte :
- une **virgule**,
- un **deux-points**,
- des **parenthèses**.

Quand on retouche un artefact **français** qui contient des tirets cadratins, les **convertir**
au passage (virgule, deux-points ou parenthèses selon le sens).

## 🛑 La portée est la LANGUE, pas le support

**En anglais, le tiret cadratin est normal et reste autorisé.** Il fait partie de la typographie
anglaise courante ; l'interdire là-bas n'a aucun sens et produit de la prose bancale. Or la quasi-
totalité des artefacts durables sont **en anglais** (cf. [`language.md`](./language.md) : code,
commentaires, docs versionnées, commits, corps de PR, notes de release). **Donc, en pratique, cette
règle ne s'applique presque jamais aux artefacts du repo, seulement à ce que j'écris en français.**

**Ne JAMAIS « corriger » les tirets cadratins d'un texte anglais**, et en particulier :
- ne pas les retirer d'un **titre de release**, d'un titre de PR ou d'un titre de section anglais
  quand la série existante les utilise (ex. `v4.0.0 — The One Where It Becomes Kenjaku`) : la
  **cohérence de la série prime**, c'est une convention de titrage, pas une faute ;
- ne pas les retirer du contenu anglais existant d'un repo au motif de « retouche au passage » : la
  clause de conversion ci-dessus est **française uniquement**.

> ⚠️ Thomas a dû me le redire **une bonne demi-douzaine de fois** (dernier rappel : 2026-07-27, à la
> release v4.1.0 de Kenjaku, où j'avais signalé comme un défaut des tirets cadratins parfaitement
> légitimes dans un corps de PR et un titre de release anglais). La cause était **cette règle
> elle-même**, muette sur la langue : je re-dérivais donc la mauvaise portée à chaque fois. Corrigé
> ici, à la source, plutôt que dans une mémoire projet, pour que ça vaille partout et pour de bon.
