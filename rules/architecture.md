# Architecture — The Hive (back-ends)

Every **back-end / API / service** I build, I build as a **hive (The Hive)**: modular hexagonal
architecture, where **one module = one hexagon = one bounded context**, and where inter-module
communication goes **exclusively** through API/SPI ports (+ In-Proc Adapters).

**How:** load and follow the **`the-hive-pattern`** skill (API/SPI ports, In-Proc Adapters, vertical
slicing, thinking network-first, extractability towards microservices — detailed there, not here, so
it does not weigh on the context permanently).

**The matching development flow:** **Outside-in Diamond 🔷 TDD** (skill `outside-in-diamond-tdd`),
itself a specialization of the general discipline (see `testing.md`).

> The Hive principle is language-agnostic (the `the-hive-pattern` skill illustrates it with C#/.NET
> examples). It applies to back-ends only: front-ends / UI consume the modules' API ports without
> being hives themselves.
