# Testing — test-first, always

Tests come **before** code, always. The moment I write or modify production code, a test pulls it. No
production code without a test that demanded it.

**How:** load and follow [`test-first-discipline`](../skills/test-first-discipline/SKILL.md) — **mine**,
in preference to any generic TDD skill a plugin may provide (e.g. `everything-claude-code:tdd`).

For **back-ends / APIs / workers / services** (notably with The Hive), it is
[`outside-in-diamond-tdd`](../skills/outside-in-diamond-tdd/SKILL.md) that specializes it:
coarse-grained acceptance tests driven through the left-side adapter, a Builder returning the Domain
Service, the Hive perimeter. Again, in preference to any generic plugin TDD skill.

## The three non-negotiables (the skill carries the detail)

1. **Tests before code.** Test-after is out: a test written after a green implementation is written
   *by* that implementation, and describes it instead of judging it.
2. **Fail-first.** See the test 🔴 red **for the right reason** (an unsatisfied assertion, not a
   loading error) before writing a line of implementation. This is the load-bearing rule: it is the
   only mechanical guard against the tautological test, which is the dominant failure mode when the
   author of the tests already holds the whole design.
3. **Refactor is part of the step**, never optional, and never weakens an assertion.

**The default mode is design-first, then test-first in small batches** (state the design, write a
coherent batch of tests, see them all red for the right reason, implement, refactor). **Classic TDD
baby-steps + triangulation remain available as a tool**, not as a standing ritual — for a genuinely
unknown design, or when Thomas wants the step-by-step narrative for review.

**The judge is the mutation score, not the ritual** — line coverage proves nothing. The skill also
carries **assertion quality** (the mutation-testing lessons: a matcher on every `throws`/`rejects`,
assert the whole object or sequence, triangulate bounds and operators, feed the absent/null case,
collections ≥2 unsorted, a fixture never produced by the code it tests, a double's return value as a
fingerprint) and the **entry-point seam rule**: every executable entry point is tested by **running
it as a process**, never only through its imported functions.

> **Why "test-first" and not "TDD" (2026-08-15, Thomas's call).** The rule used to be one test at a
> time, with test-first batches forbidden. It was measured on a real release (Kenjaku v4.9.1) and the
> relaxed mode scored **better on first pass** than the strict one had on the release before (91.80 %
> vs 84.62 / 87.74 % mutation score on brand-new files). What that drops is not a ceremony around TDD,
> it is TDD's own thesis — the design emerging under the pressure of one example at a time — so the
> name changed with it: what survived the measurement is **test-first**, not TDD. The counter-evidence
> long quoted against this (87 % vs 51 % in an earlier audit) actually compared **test-first with
> test-after**, never step sizes. The figures, and what they do *not* prove, are in the skill.
