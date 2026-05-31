# Architecture — The Hive (back-ends)

Tout **back-end / API / service** que je développe, je l'implémente en **ruche (The Hive)** :
architecture hexagonale modulaire, où **un module = un hexagone = un bounded context**, et où
la communication inter-module passe **uniquement** par des ports API/SPI (+ In-Proc Adapters).

**Comment :** charger et suivre la skill **`the-hive-pattern`** (ports API/SPI, In-Proc Adapters,
vertical slicing, penser réseau, extractabilité vers microservices — détaillée là, pas ici, pour
ne pas alourdir le contexte en permanence).

**Flux de développement associé :** l'**Outside-in Diamond 🔷 TDD** (skill `outside-in-diamond-tdd`),
lui-même une spécialisation du TDD classique (cf. `testing.md`).

> Le principe Hive est agnostique langage (la skill `the-hive-pattern` l'illustre avec des
> exemples C#/.NET). Ne s'applique qu'aux back-ends : les front-ends / UI consomment les ports
> API des modules sans être eux-mêmes en ruche.
