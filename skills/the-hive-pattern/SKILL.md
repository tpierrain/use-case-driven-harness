---
name: the-hive-pattern
description: The Hive — the "Microservices-Ready Modular Monolith" back-end architecture pattern (Thomas Pierrain), language-agnostic. Each module is a hexagon (API/SPI ports, In-Proc Adapters); one module = one hexagon = one bounded context; vertical slicing, thinking network-first, extractability towards microservices. Use it to design, structure or refactor a back-end / service / API into modules. Code examples in C#/.NET (illustrative; the pattern applies just as well in Java, TypeScript, etc.).
origin: use-case-driven-harness
---

# Skill: The Hive — Microservices-Ready Modular Monolith

> **A language-agnostic pattern.** The Hive structures **back-ends** (services, APIs, applications)
> whatever the ecosystem — .NET, Java, TypeScript… The code examples in this skill are in
> **C#/.NET by way of illustration**: they are *examples*, not a platform constraint. The pattern,
> the modules, the ports and the vertical slicing all transpose as they are.

## Founding principle

Each module is a **self-contained, extractable hexagon** (vertical slicing).
The Hive pattern composes several hexagons in the same process, while keeping the option of
deploying them separately.

**Base heuristic: one module = one hexagon = one bounded context** (in the DDD sense). That is the
default carving rule, the one applied unless there is a reason not to. Variants exist (a larger
bounded context can be subdivided, and so on), but that remains the reference grain inside the hive.

The Hive is the art of the **"Microservices-Ready Modular Monolith"**: you *model* the system as a
well-carved modular monolith (one module = one hexagon), while keeping it **ready to be broken out
into microservices** the day that becomes useful — *"Model once, deploy as you wish"*.

It is a **back-end / server-side** structuring pattern: it applies to **applications, services and
APIs** (business back-ends), where the API/SPI Ports and the In-Proc Adapters live. It **does not
concern** front-end / UI architecture, which consumes the modules' API Ports without being organized
as a Hive itself.

## The three pillars of The Hive

The Hive rests on **three inseparable principles**. Honouring them is what makes the *"Model once,
deploy as you wish"* promise actually hold.

### 1. Vertical slicing — each module is self-contained end to end

A module is a complete vertical slice, **from the controller down to the database**. Maximum
autonomy is the target:

- **Dedicated data per module**: ideally **dedicated tables** (a separate schema), or even a
  **dedicated database**. No table shared between modules, no cross-module join in the database —
  otherwise extractability is a lie.
- **The tests are part of the slice.** Each module's tests are **self-contained** and belong to the
  module's vertical slice: a module you extract carries its tests with it, green, with nothing to
  re-wire. This is **essential**. Two levels complement each other:
    - **Acceptance tests** — the bulk of the harness. They exercise the module end to end
      (Controller → Domain Service → In-Proc Adapters) **stubbing the other modules the moment it
      depends on one** (their API Ports are substituted), along with the infra SPIs. That is what
      guarantees autonomy: no test ever touches another module's implementation.
    - **Integration-point tests** (*integration tests*) — rarer, aimed at the **SPI adapters** that
      leave the module (towards other modules' API Ports, or towards infra: DB, HTTP, broker…). They
      check that those adapters **genuinely work under normal conditions** (really wired up, no
      stub), where the acceptance tests make do with stubs.

Success criterion: you can **extract a module into a separate repo** (code + data + tests) without
touching the others.

### 2. Ports & adapters between modules — never anything else

Each module is a **miniature hexagonal architecture**. All inter-module communication goes
**exclusively through ports and adapters** (the other module's API Port, called through an In-Proc
Adapter on the SPI side). No direct coupling: no call to another module's internal class, no shared
domain model, no access to its database.

That discipline is what makes it possible to replace an In-Proc Adapter with an HTTP/AMQP client
without touching the domain (see [Extracting a module](#extracting-a-module)).

### 3. Think network from day one — avoid the chatty API

Even when everything runs in-proc, you **design inter-module exchanges as if they already went over
the network**. Interactions through ports/adapters must stay **not chatty**: prefer coarse-grained
calls over a burst of small round trips.

Why: the day the In-Proc Adapter becomes a real **HTTP or AMQP** client, an over-talkative API (N+1
calls, too fine a granularity) turns into **nasty performance surprises** (network latency × number
of calls). You then pay at runtime for a design you could have avoided at modelling time.

**Terminology:**
- **API** = Primary Port (left) — exposes the module's use cases
- **SPI** = Secondary Port (right) — interfaces for the dependencies (infra + other modules)
- **In-Proc Adapter** = an SPI Adapter that calls another module's API in the same process

```
┌─────────────────────────────────────────────────────────────────┐
│                         THE HIVE                                │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    MODULE A (Booking)                    │  │
│   │                                                          │  │
│   │   Controller ──► Domain Service ──► In-Proc Adapter     │  │
│   │   (left)          (logic)            (right, SPI)        │  │
│   │                                          │               │  │
│   └──────────────────────────────────────────┼───────────────┘  │
│                                              │                  │
│                                              ▼                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    MODULE B (Availability)               │  │
│   │                                                          │  │
│   │   IAvailabilityAPI ──► Domain Service ──► Repository     │  │
│   │   (API = left port)                       (SPI)          │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   "Model once, Deploy as you wish"                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## The structure of a module (hexagon)

```
src/
├── Modules/
│   ├── Booking/                          # Module A
│   │   ├── Booking.Domain/
│   │   │   ├── [Aggregate]/
│   │   │   │   ├── Reservation.cs
│   │   │   │   └── ReservationId.cs
│   │   │   ├── Ports/
│   │   │   │   ├── Api/
│   │   │   │   │   └── IBookingApi.cs    # API Port (left) = use cases
│   │   │   │   └── Spi/
│   │   │   │       ├── IReservationRepository.cs
│   │   │   │       └── IAvailabilityModule.cs  # SPI towards another module
│   │   │   └── Services/
│   │   │       └── BookingService.cs     # Implements IBookingApi
│   │   │
│   │   ├── Booking.Infrastructure/
│   │   │   └── Adapters/
│   │   │       ├── Persistence/
│   │   │       │   └── ReservationRepository.cs
│   │   │       └── InProc/
│   │   │           └── AvailabilityInProcAdapter.cs  # Calls another module's API
│   │   │
│   │   └── Booking.Api/
│   │       └── Controllers/
│   │           └── BookingController.cs  # Left-side adapter
│   │
│   └── Availability/                     # Module B
│       ├── Availability.Domain/
│       │   ├── Ports/
│       │   │   ├── Api/
│       │   │   │   └── IAvailabilityApi.cs
│       │   │   └── Spi/
│       │   │       └── IInventoryRepository.cs
│       │   └── Services/
│       │       └── AvailabilityService.cs
│       └── ...
```

## Templates

### API Port (left) — the module's use cases

```csharp
// Booking.Domain/Ports/Api/IBookingApi.cs
public interface IBookingApi
{
    Task<Result<Reservation>> ReserveAsync(
        TrainId trainId, 
        SeatCount seats, 
        CancellationToken ct);
    
    Task<Result> CancelAsync(ReservationId id, CancellationToken ct);
}
```

### SPI Port (right) — towards another module

```csharp
// Booking.Domain/Ports/Spi/IAvailabilityModule.cs
public interface IAvailabilityModule
{
    Task<IReadOnlyList<RoomAvailability>> GetAvailabilitiesAsync(
        HotelId hotelId, 
        DateRange dates, 
        CancellationToken ct);
}
```

### In-Proc Adapter — calls another module's API

An In-Proc Adapter may hold **orchestration logic** towards several modules.

```csharp
// Booking.Infrastructure/Adapters/InProc/AvailabilityInProcAdapter.cs
public sealed class AvailabilityInProcAdapter(
    IAvailabilityApi availabilityApi  // ◄── Injects the other module's API
) : IAvailabilityModule
{
    public async Task<IReadOnlyList<RoomAvailability>> GetAvailabilitiesAsync(
        HotelId hotelId, 
        DateRange dates, 
        CancellationToken ct)
    {
        // May hold orchestration logic
        var availabilities = await availabilityApi.GetForHotelAsync(hotelId, dates, ct);
        
        // Adaptation/transformation when needed
        return availabilities
            .Where(a => a.IsConfirmed)
            .Select(a => MapToBookingDomain(a))
            .ToList();
    }
}
```

### Domain Service (implements the API port)

```csharp
// Booking.Domain/Services/BookingService.cs
public sealed class BookingService(
    IReservationRepository reservationRepository,
    IAvailabilityModule availabilityModule,  // ◄── SPI towards another module
    IBookingReferenceProvider bookingRefProvider,
    ILogger<BookingService> logger
) : IBookingApi
{
    public async Task<Result<Reservation>> ReserveAsync(
        TrainId trainId, 
        SeatCount seats, 
        CancellationToken ct)
    {
        // Call towards the other module, through the SPI
        var availabilities = await availabilityModule.GetAvailabilitiesAsync(trainId, ct);
        
        if (availabilities.Count < seats.Value)
            return Result.Failure<Reservation>(BookingErrors.NotEnoughAvailability);

        var bookingRef = await bookingRefProvider.GetNextAsync(ct);
        var reservation = Reservation.Create(trainId, seats, bookingRef);
        
        await reservationRepository.SaveAsync(reservation, ct);
        
        logger.LogInformation("Reservation {BookingRef} created", bookingRef);
        return reservation;
    }
}
```

### Controller (left-side adapter)

```csharp
// Booking.Api/Controllers/BookingController.cs
[ApiController]
[Route("api/bookings")]
public sealed class BookingController(
    IBookingApi bookingApi  // ◄── Injects the API port
) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Reserve(ReserveRequest request, CancellationToken ct)
    {
        var result = await bookingApi.ReserveAsync(
            TrainId.From(request.TrainId),
            SeatCount.From(request.SeatCount),
            ct);
        
        return result.Match(
            success: reservation => Created($"/api/bookings/{reservation.Id}", reservation),
            failure: error => Problem(error)
        );
    }
}
```

## Architectural decisions (.NET) — what we avoid

- **No separate Use Case layer.** The use cases **are** the API Port's methods; the Domain Service
  implements them directly.
- **No MediatR by default.** The Controller injects and calls the Domain Service (the API port)
  directly — no `_mediator.Send(...)` indirection.
- **No CQRS by default** (no golden hammer); no unnecessary indirection.
- **Modules coupled only through their API ports** — never through an internal class, a shared
  domain model or direct access to another module's database.

```csharp
// ✅ The Controller injects the API port and calls it directly
public sealed class BookingController(IBookingApi bookingApi) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Book(BookingRequest request, CancellationToken ct)
    {
        var result = await bookingApi.ReserveAsync(...);
        return result.Match(...);
    }
}

// ❌ No MediatR indirection
var result = await _mediator.Send(new BookCommand(...));
```

## Extracting a module

Each module can be extracted into a separate repository:

```
# Before: In-Proc Adapter (same process)
AvailabilityInProcAdapter : IAvailabilityModule
    → calls IAvailabilityApi directly

# After extraction: HTTP Adapter (separate process)
AvailabilityHttpAdapter : IAvailabilityModule
    → calls the Availability microservice over HTTP
```

The Domain Service does not change — only the SPI adapter is swapped.

## Going further

- [The Hive vs Spring Modulith — two different takes on the modular monolith](https://medium.com/@tpierrain/the-hive-vs-spring-modulith-two-different-takes-on-the-modular-monolith-37c60ac91105) — Thomas Pierrain (*Use Case Driven*)
