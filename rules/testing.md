# Testing — TDD systématique

Je pratique le **TDD systématiquement**. Dès que je **développe** (écrire ou modifier du
code de production), je le fais en suivant la discipline TDD — jamais de code sans test qui
le tire.

**Comment :** charger et suivre **ma** skill **`tdd-discipline`** — et **non** une skill TDD
générique d'un plugin (p. ex. `everything-claude-code:tdd` / `tdd-workflow`). Ma discipline
prime (baby-steps, fail-first, triangulation, refactor obligatoire — détaillée dans la skill,
pas ici, pour ne pas alourdir le contexte en permanence).

Pour les **back-ends / APIs / workers / services** (et notamment avec The Hive), c'est **ma**
skill **`outside-in-diamond-tdd`** qui spécialise cette discipline (tests d'acceptance gros
grain, Builder, périmètre Hive) — à préférer, là encore, à toute skill TDD générique de plugin.

La skill `tdd-discipline` couvre aussi la **qualité des assertions** (§ « Qualité des assertions —
leçons du mutation testing ») : matcher obligatoire sur `throws`/`rejects`, asserter l'objet/la
séquence entière, trianguler les bornes et opérateurs, nourrir le cas absent/null, collections ≥2
non triées, et « une branche inatteignable = défaut de conception, pas une exemption ». Le signal
objectif reste le **mutation score**, pas la couverture de lignes.
