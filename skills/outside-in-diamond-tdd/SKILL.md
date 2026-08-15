---
name: outside-in-diamond-tdd
description: Outside-in Diamond 🔷 TDD — the TDD style developed by Thomas Pierrain for any back-end, API, worker or service, and equally suited to The Hive pattern. Coarse-grained acceptance tests driven through the left-side adapter, a Builder that returns the Domain Service, In-Proc Adapters inside the perimeter, other modules' API ports stubbed. Use it to develop/test a back-end, an API, a worker, a service or a Hive module (examples in .NET). For generic test-first work (libs, tools), see the test-first-discipline skill.
origin: use-case-driven-harness
---

# Outside-in Diamond 🔷 TDD + The Hive

A TDD style developed by Thomas Pierrain for **any back-end, API, worker or service**, and equally
**suited to The Hive pattern**.

## Perimeter: back-ends, APIs, workers, services

Outside-in Diamond TDD targets **the development of back-ends, APIs, workers and services**: you
drive **from the outside** (left-side adapter / acceptance test) inwards. The Hive is a prime
application of it (you then test through the perimeter of a Hive module), but the approach holds for
any back-end driven from the outside.

It is **not** the right grain for low-level code — a small lib, a plain tool, an isolated algorithm:
there, the **plain discipline** is plenty (no coarse-grained acceptance, no Builder, no Hive
perimeter). The universal testing discipline — tests before code, fail-first, refactor as part of the
step, assertion quality — lives in the **`test-first-discipline`** skill; this skill **presupposes**
it and **extends** it with the specifics below.

## The Diamond (not a pyramid)

```
        ◆ Acceptance Tests (coarse-grained)
       ◆ ◆    Exercise the module through the left-side adapter
      ◆   ◆   In-Proc Adapters included in the perimeter
     ◆     ◆
      ◆   ◆   Fine-grained tests (isolated Domain logic)
       ◆ ◆
        ◆ Integration/Contract tests
```

**More acceptance (coarse-grained) tests than fine-grained ones.** The belly of the diamond is
acceptance; fine-grained tests only serve to dig into a delicate piece of domain logic, and
integration/contract tests only target the SPI adapters that genuinely leave the module.

## Test perimeter inside the Hive

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE A (Booking)                           │
│                                                                 │
│   ✅ TESTED:                                                    │
│   Controller ──► Domain Service ──► In-Proc Adapter            │
│                                          │                      │
│                                          │ orchestration        │
│                                          │ logic                │
│                                          ▼                      │
│   ❌ STUBBED:                                                   │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Stub IAvailabilityApi    Stub IReservationRepository    │  │
│   │ (module B's API port)    (infra SPI)                    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- Acceptance tests drive **the left-side adapter** (the Controller).
- The **Builder** returns the **Domain Service** (the API port) with the real In-Proc Adapters; the
  **test** instantiates the Controller, injecting that Domain Service.
- The **In-Proc Adapters' orchestration logic is inside the perimeter** (tested).
- The **other modules' API ports** are stubbed → this guarantees extractability (vertical slicing).
  The **infra SPIs** (repositories, external HTTP services) are stubbed too.
- **Blazing fast**: sub-millisecond to 400 ms max per test (stubs, no I/O).
- **Isolated and self-contained**: no `[Setup]`, no shared mutable fields.

## Workflow

### 1. RED — an acceptance test through the left-side adapter

```csharp
[Fact]
public async Task Return_confirmed_reservation_when_rooms_are_available()
{
    // Arrange — the builder returns the Domain Service
    var bookingApi = new BookingServiceBuilder()
        .WithAffiliatedHotels(bellagio, otherHotel)
        .WithFullyBookedHotel(otherHotel)
        .WithOneAvailabilityPerSupportedRoomType()
        .Build();  // ◄── Returns IBookingApi

    // The test instantiates the Controller
    var controller = new BookingController(bookingApi);

    // Act — we drive the left-side adapter
    var response = await controller.Book(request, CancellationToken.None);

    // Assert — a business-oriented assertion
    CheckThatBookingIsConfirmed(response, bellagio);
}
```

### 2. The Builder assembles the module and returns the Domain Service

The Builder:
1. Expresses **business intentions** (never public technical details — no "stub" in the public API).
2. Configures the stubs of the **other hive modules' API ports**.
3. Configures the stubs of the **infra SPIs** (repositories, external services).
4. Instantiates the **real In-Proc Adapters** (with their orchestration logic).
5. Returns the **Domain Service** (which implements the API port).

```csharp
public class BookingServiceBuilder
{
    // Business API — intentions only
    public BookingServiceBuilder WithAffiliatedHotels(...) { ... }
    public BookingServiceBuilder WithFullyBookedHotel(...) { ... }

    public IBookingApi Build()
    {
        // 1. Stub of ANOTHER module's API port
        var availabilityApi = Substitute.For<IAvailabilityApi>();
        // ... configured from the intentions expressed above

        // 2. REAL In-Proc Adapter (its orchestration logic is under test)
        var availabilityModule = new AvailabilityInProcAdapter(availabilityApi);

        // 3. Stubs of the infra SPIs
        var repository = Substitute.For<IReservationRepository>();

        // 4. Return the Domain Service
        return new BookingService(repository, availabilityModule, ...);
    }
}
```

### 3. Inner loops when needed

While the acceptance test is RED, you can run inner test-first loops on the Domain (in small batches,
or one example at a time when the design is genuinely unknown — see `test-first-discipline`):

```csharp
[Fact]
public void Reserve_WhenNotEnoughSeats_ReturnsFailure()
{
    // A fine-grained test, on the Domain only
    var reservation = Reservation.Create(...);

    var result = reservation.Confirm(SeatCount.From(5));

    Check.That(result.IsFailure).IsTrue();
}
```

### 4. GREEN — the acceptance test passes

### 5. REFACTOR

Never optional (see the `test-first-discipline` skill). First on the implementation, then on the
readability of the tests — without ever weakening an assertion.

## A complete acceptance test

```csharp
public class BookingControllerShould
{
    [Fact]
    public async Task Return_confirmed_reservation_when_rooms_are_available()
    {
        // Arrange — fuzzers to generate the data
        var fuzzer = new Fuzzer();
        var bellagio = fuzzer.GenerateHotelSpecification("Bellagio")
            .WithRoomTypes(fuzzer.GenerateRoomTypes(3));
        var otherHotel = fuzzer.GenerateHotelSpecification("OtherHotel")
            .WithRoomTypes(RoomType.All);

        // Builder with business intentions — returns the Domain Service
        var bookingApi = new BookingServiceBuilder()
            .WithAffiliatedHotels(bellagio, otherHotel)
            .WithFullyBookedHotel(otherHotel)
            .WithOneAvailabilityPerSupportedRoomType()
            .Build();

        // The test instantiates the Controller
        var controller = new BookingController(bookingApi);

        var request = new BookingRequest
        {
            HotelId = bellagio.Id.Value,
            RoomType = bellagio.RoomTypes.First()
        };

        // Act — we call the left-side adapter
        var response = await controller.Book(request, CancellationToken.None);

        // Assert — a domain-driven one-liner
        CheckThatBookingIsConfirmed(response, bellagio);
    }

    // Private helper — hides the technical details (DTOs, HTTP status, etc.)
    private static void CheckThatBookingIsConfirmed(
        IActionResult response,
        HotelSpecification expectedHotel)
    {
        var createdResult = response as CreatedResult;
        Check.That(createdResult).IsNotNull();
        Check.That(createdResult!.StatusCode).IsEqualTo(201);

        var reservation = createdResult.Value as ReservationDto;
        Check.That(reservation).IsNotNull();
        Check.That(reservation!.HotelId).IsEqualTo(expectedHotel.Id.Value);
    }
}
```

## The Diamond + Hive rules

1. **7-15 lines max per test** — fuzzers + builders + assertion helpers.
2. **Domain-Driven** — the test and the builder speak the business language, never "stub" in public.
3. **Blazing Fast** — sub-ms to 400 ms max (stubs, no I/O).
4. **Isolated** — no `[Setup]`, no shared fields.
5. **The Builder returns the Domain Service** (the API port), the test instantiates the Controller.
6. **In-Proc Adapters inside the perimeter** — their orchestration logic is tested.
7. **Other modules' API ports stubbed** — extractability guaranteed (vertical slicing).
8. **Infra SPIs stubbed** — repositories, external HTTP services, etc.
9. **Assertion helpers** — they hide the technical details (DTOs, HTTP status…).

## .NET test stack

| Lib | Usage | NuGet |
|-----|-------|-------|
| **xUnit** | Framework | `xunit` |
| **NFluent** | Assertions (`Check.That()`) | `NFluent` |
| **NSubstitute** | **Stubs** of the API and SPI ports (`Substitute.For<...>()`) | `NSubstitute` |
| **Diverse** | **Fuzzers** / varied data generation | `Diverse` |

> **Diverse** is the fuzzing library **created by Thomas** (`tpierrain`). Prefer it for generating
> varied test data (see `new Fuzzer()` in the examples above) over hard-coded values.
> NuGet: <https://www.nuget.org/packages/Diverse/> · repo: <https://github.com/tpierrain/Diverse>.

## Why this approach?

- **Extractability**: any module can be extracted into a separate repo at any moment.
- **Self-contained tests**: no dependency on the other modules' implementation.
- **Orchestration logic tested**: the In-Proc Adapters are part of the perimeter.
- **Vertical slicing**: tests / architecture / deployment stay aligned.

## See also

- The **`test-first-discipline`** skill — the universal testing discipline (test-first, fail-first, assertion quality; baby-steps are a mode there, no longer a ritual).
- The **`the-hive-pattern`** skill — The Hive architecture (API/SPI ports, In-Proc Adapters).
