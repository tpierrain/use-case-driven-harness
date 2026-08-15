# .NET conventions — C# 12 / .NET 8

> This rule complements the generic rules of the everything-claude-code plugin.
> **Architecture**: back-ends are built as hives (see `architecture.md`); the .NET how-to (API/SPI
> ports, In-Proc Adapters, architectural decisions such as "no MediatR / no separate use-case
> layer") lives in the **`the-hive-pattern`** skill. This file covers only the C# / .NET
> **language conventions**.

## Modern syntax is mandatory

### Primary Constructors
```csharp
// ✅ 
public sealed class TrainReservationService(
    ITrainRepository repository, 
    IBookingReferenceProvider bookingRefProvider,
    ILogger<TrainReservationService> logger
) : ITrainReservationService

// ❌
public sealed class TrainReservationService
{
    private readonly ITrainRepository _repository;
    public TrainReservationService(ITrainRepository repository) => _repository = repository;
}
```

### Collection Expressions
```csharp
// ✅
List<string> items = ["a", "b", "c"];

// ❌
var items = new List<string> { "a", "b", "c" };
```

### Records for DTOs
```csharp
// ✅
public sealed record ReserveRequest(string TrainId, int SeatCount);

// ❌
public class ReserveRequest { public string TrainId { get; set; } }
```

## Async is mandatory

- Always pass a `CancellationToken`
- `Async` suffix on the methods
- Never `.Result` or `.Wait()`

## Result<T> for business errors

```csharp
// ✅ Business error
return Result.Failure<Reservation>(TrainErrors.NotEnoughSeats);

// ❌ Exception for a business error
throw new NotEnoughSeatsException();
```

Exceptions are reserved for technical errors (DB down, network failure, etc.)

## Structured logging

```csharp
// ✅
logger.LogInformation("Reservation {BookingRef} created on train {TrainId}", 
    bookingRef, trainId);

// ❌
logger.LogInformation($"Reservation {bookingRef} created");
```

## Tests (.NET)

To write **tests first in .NET**, Thomas's preferred stack:

- **xUnit** — test framework (`xunit`).
- **NFluent** — readable assertions (`Check.That(...)`).
- **NSubstitute** — **stubs** for the API and SPI ports (`Substitute.For<...>()`).
- **Diverse** — **fuzzing** / test-data generation. This is **Thomas's own library**
  (`tpierrain`). Prefer it for generating varied data over hard-coded values. NuGet:
  <https://www.nuget.org/packages/Diverse/> · repo: <https://github.com/tpierrain/Diverse>.

> Usage detail and examples (Builder, assertion helpers, Hive perimeter): the
> **`outside-in-diamond-tdd`** skill; testing discipline: the **`test-first-discipline`** skill.

## What Claude must NOT do (language)

- Add unnecessary indirection.
- Use `.Result` / `.Wait()`, or forget the `CancellationToken`.
- Throw exceptions for **business** errors (reserve `Result<T>` for those).

> The **architectural** anti-patterns (MediatR, a separate use-case layer, CQRS by default, coupling
> modules outside the API ports) live in the **`the-hive-pattern`** skill.
