# Conventions .NET — C# 12 / .NET 8 + The Hive

> Cette rule complète les rules génériques du plugin everything-claude-code

## Architecture hexagonale — The Hive

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE (Hexagone)                            │
│                                                                 │
│   Controller ──► Domain Service ──► In-Proc Adapter            │
│   (gauche)        (API)              (SPI)                      │
│                                          │                      │
│                                          ▼                      │
│                               Port API d'un autre module        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Terminologie :**
- **API** = Port gauche (primaire) — expose les use cases
- **SPI** = Port droit (secondaire) — dépendances (infra + autres modules)
- **In-Proc Adapter** = Adaptateur SPI qui appelle l'API d'un autre module

**Pas de couche Use Case séparée.** Les use cases sont les méthodes du Port API.

**Pas de MediatR par défaut.** Le controller injecte directement le Domain Service.

```csharp
// ✅ Controller injecte le port API
public sealed class BookingController(IBookingApi bookingApi)
{
    [HttpPost]
    public async Task<IActionResult> Book(BookingRequest request, CancellationToken ct)
    {
        var result = await bookingApi.ReserveAsync(...);
        return result.Match(...);
    }
}

// ❌ Pas d'indirection MediatR
var result = await _mediator.Send(new BookCommand(...));
```

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

## Ce que Claude ne doit PAS faire

- Introduire MediatR sans justification explicite
- Créer une couche Use Case séparée du Domain Service
- Appliquer CQRS par défaut (pas de golden hammer)
- Ajouter des indirections non nécessaires
- Coupler les modules autrement que via leurs ports API
