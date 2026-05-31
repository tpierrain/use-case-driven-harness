# Conventions .NET — C# 12 / .NET 8

> Cette rule complète les rules génériques du plugin everything-claude-code.
> **Architecture** : les back-ends s'implémentent en ruche (cf. `architecture.md`) ; le how-to
> .NET (ports API/SPI, In-Proc Adapters, décisions d'archi comme « pas de MediatR / pas de
> couche use-case séparée ») est dans la skill **`hexagonal-dotnet`**. Ce fichier ne couvre
> que les **conventions de langage** C# / .NET.

## Syntaxe moderne obligatoire

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

### Records pour DTOs
```csharp
// ✅
public sealed record ReserveRequest(string TrainId, int SeatCount);

// ❌
public class ReserveRequest { public string TrainId { get; set; } }
```

## Async obligatoire

- Toujours passer `CancellationToken`
- Suffixe `Async` sur les méthodes
- Jamais `.Result` ou `.Wait()`

## Result<T> pour les erreurs métier

```csharp
// ✅ Erreur métier
return Result.Failure<Reservation>(TrainErrors.NotEnoughSeats);

// ❌ Exception pour erreur métier
throw new NotEnoughSeatsException();
```

Exceptions réservées aux erreurs techniques (DB down, network failure, etc.)

## Logging structuré

```csharp
// ✅
logger.LogInformation("Reservation {BookingRef} created on train {TrainId}", 
    bookingRef, trainId);

// ❌
logger.LogInformation($"Reservation {bookingRef} created");
```

## Ce que Claude ne doit PAS faire (langage)

- Ajouter des indirections non nécessaires.
- Utiliser `.Result` / `.Wait()` ou oublier le `CancellationToken`.
- Lever des exceptions pour des erreurs **métier** (réserver `Result<T>` pour celles-ci).

> Les anti-patterns d'**architecture** (MediatR, couche use-case séparée, CQRS par défaut,
> couplage de modules hors ports API) sont dans la skill **`hexagonal-dotnet`**.
