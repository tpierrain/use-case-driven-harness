---
name: tdd-discipline
description: La discipline TDD universelle de Thomas Pierrain — baby-steps (un seul test à la fois, red→green→refactor complet à chaque pas, PAS de test-first batch), s'assurer que le test échoue d'abord (fail-first), triangulation, refactor jamais optionnel. Agnostique langage, pour TOUT code (libs, tools, helpers, algos, services). À charger dès qu'on écrit ou modifie du code en TDD. Pour les back-ends/services/APIs avec The Hive, voir la skill outside-in-diamond-tdd qui la spécialise.
origin: use-case-driven-harness
---

# Discipline TDD (universelle)

La discipline TDD de base, **agnostique langage**, qui s'applique à **tout type de code** :
petites libs, simples tools, helpers, algorithmes isolés comme services et applications.

> Pour le développement de **services / APIs / applications** (back-ends) avec The Hive, cette
> discipline est **reprise et complétée** par la skill **`outside-in-diamond-tdd`** (acceptance
> gros grain, Builder, périmètre Hive). Ici = le socle commun ; là-bas = la déclinaison spécialisée.

## Baby steps, PAS test-first batch

**Un seul test à la fois.** Cycle 🔴 red → 🟢 green → ♻️ refactor **complet pour chaque test**, avant d'écrire le test suivant.

- **Interdit** : écrire plusieurs tests d'avance puis implémenter pour tous les faire passer. C'est du *test-first batch*, pas du TDD.
- **Pourquoi** : écrire les tests en lot fige le design en amont (l'API est décrétée avant la moindre ligne d'implémentation) et **tue le design émergent**. En baby steps, chaque test tire le strict minimum de code et la structure se découvre incrément par incrément.
- **En pratique** : test 1 → red → plus petit code qui passe → refactor → test 2 → red → … Chaque pas est le plus petit qui fasse passer le test courant.
- **Le refactor n'est jamais optionnel.** Le pas n'est *terminé* qu'après le ♻️. Il porte **d'abord sur le code d'implémentation** : meilleure structure, mêmes comportements — un refactor **ne change jamais le contrat public** (c'est sa définition : behavior-preserving). Sur les tests, il se limite à les rendre **plus lisibles** (noms, helpers, intention) — **jamais** à affaiblir leurs assertions ni à leur faire vérifier moins de choses. Si un test couvre mal, c'est un *nouveau* test, pas un refactor. Même sans rien à nettoyer, on passe consciemment par l'étape et on le constate (« refactor : RAS »). Sauter le refactor « parce que ça marche » accumule de la dette à chaque cycle — c'est exactement ce que la discipline baby-steps est censée empêcher.

## S'assurer que le test échoue d'abord (fail-first)

Avant d'écrire la moindre ligne d'implémentation, **vérifier que le nouveau test échoue
pour la bonne raison** (assertion non satisfaite, pas une erreur de compilation accidentelle
ou un test qui ne s'exécute même pas). Un test qui passe avant qu'on ait codé ne prouve rien :
il faut le voir 🔴 *rouge* d'abord, puis le rendre 🟢 *vert*. C'est la garantie que le test
teste réellement quelque chose.

## Triangulation

Quand le comportement attendu n'est pas évident, on **triangule** : on n'introduit de la
généralisation dans l'implémentation que lorsqu'**au moins deux exemples** (deux tests) la
réclament. Le premier test peut être satisfait par une réponse « en dur » ; le deuxième,
différent, force à dégager la vraie logique. On évite ainsi de sur-généraliser trop tôt — la
généralité émerge des exemples, elle n'est pas décrétée.

## Qualité des assertions — leçons du mutation testing

Un audit de mutation (2026-07, trois packages) a montré que des tests **verts** laissaient survivre
des mutants : le comportement était « couvert » mais les **assertions étaient trop lâches**. Six
réflexes, à appliquer systématiquement - chacun aurait **empêché** le survivant :

1. **Asserter le message, pas le fait.** `throws`/`rejects` **toujours** avec un matcher (regex/type),
   jamais nus ; un résultat `ok` avec son corps ; un log avec son payload exact. Un
   `assert.throws(() => f())` nu survit à un `throw ''` : le 2ᵉ argument **n'est pas optionnel**.
2. **Asserter tout l'objet / toute la séquence, pas un champ.** `deepEqual` sur l'objet retourné
   **complet** et sur la **liste d'appels complète** (args inclus) - vérifier un seul champ laisse
   survivre les mutants sur les autres.
3. **Trianguler les bornes ET les opérateurs.** (prolongement direct de la triangulation ci-dessus)
   Ajouter le cas **sur la borne** (valeur d'égalité) pour distinguer `>` de `>=`, le cas **juste
   dehors**, et pour un opérateur un **discriminateur asymétrique** (`a·b ≠ b·a`, `contient-mais-pas-
   segment`, `#` en milieu de ligne vs en tête). Un exemple unilatéral ne distingue ni `>`/`>=` ni
   `&&`/`||` ni les ancres de regex `^`/`$`.
4. **Nourrir le cas absent/null à côté du présent.** Pour chaque `?.`, `??`, argument par défaut,
   court-circuit `&&`/`||` : écrire le **jumeau** avec l'entrée null/absente/omise. Le happy-path seul
   laisse la branche d'absence vivante. (Cluster le plus fréquent de l'audit.)
5. **Collections à ≥2 éléments, non triés, avec un decoy.** `some`/`every`/`find`/tri/`length` sont
   **indistinguables** sur 0-1 élément ou une liste déjà triée. Deux éléments délibérément non triés
   + un intrus hors-scope font diverger les mutants (et attrapent les off-by-last).
6. **Une branche inatteignable par les tests = défaut de conception, pas une exemption.** Si un test
   ne **peut pas** atteindre une branche (logique derrière de l'I/O, fonction non exportée, script
   top-level à effets de bord, composition root), extraire un **seam pur** / injecter un **port** /
   **nommer** chaque factory de wiring jusqu'à ce que chaque branche soit atteignable. C'est le driver
   n°1 des scores 0 %. « Pure glue, pas testable » n'est jamais une excuse - c'est le diagnostic.

> **Signal objectif : le mutation score, pas la couverture de lignes** (une suite peut couvrir 100 %
> des lignes et tuer 0 % des mutants). Savoir aussi **ne pas chasser les équivalents** (mutants
> indistinguables du code d'origine : wiring par défaut d'un port injecté, `?? []` qui recollapse en
> string après `.map().join('')`, regex greedy masquée par un `.trim()` aval, construction real-SDK
> observable seulement en réseau) et **se méfier des faux-timeouts** qui gonflent artificiellement le
> score (brider `concurrency`/`timeout` avant de croire un run).

## Portée

Cette discipline **vaut pour tous les langages** et tous les types de code. C'est le socle
non négociable. Les déclinaisons spécialisées (Outside-in Diamond + Hive pour les back-ends,
conventions par langage) la **présupposent** sans jamais la contredire.
