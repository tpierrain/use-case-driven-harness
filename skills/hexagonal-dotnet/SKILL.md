# Skill: Architecture Hexagonale .NET — The Hive Pattern

## Principe fondamental

Chaque module est un **hexagone autonome et extractable** (vertical slicing).
Le pattern Hive compose plusieurs hexagones dans le même process, avec la possibilité de les déployer séparément.

**Terminologie :**
- **API** = Port Primaire (gauche) — expose les use cases du module
- **SPI** = Port Secondaire (droit) — interfaces pour les dépendances (infra + autres modules)
- **In-Proc Adapter** = Adaptateur SPI qui appelle l'API d'un autre module dans le même process

```
┌─────────────────────────────────────────────────────────────────┐
│                         THE HIVE                                │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    MODULE A (Booking)                    │  │
│   │                                                          │  │
│   │   Controller ──► Domain Service ──► In-Proc Adapter     │  │
│   │   (gauche)        (logique)          (SPI droit)         │  │
│   │                                          │               │  │
│   └──────────────────────────────────────────┼───────────────┘  │
│                                              │                  │
│                                              ▼                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    MODULE B (Availability)               │  │
│   │                                                          │  │
│   │   IAvailabilityAPI ──► Domain Service ──► Repository     │  │
│   │   (API = port gauche)                     (SPI)          │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   "Model once, Deploy as you wish"                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Structure d'un module (hexagone)

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
│   │   │   │   │   └── IBookingApi.cs    # Port API (gauche) = use cases
│   │   │   │   └── Spi/
│   │   │   │       ├── IReservationRepository.cs
│   │   │   │       └── IAvailabilityModule.cs  # SPI vers autre module
│   │   │   └── Services/
│   │   │       └── BookingService.cs     # Implémente IBookingApi
│   │   │
│   │   ├── Booking.Infrastructure/
│   │   │   └── Adapters/
│   │   │       ├── Persistence/
│   │   │       │   └── ReservationRepository.cs
│   │   │       └── InProc/
│   │   │           └── AvailabilityInProcAdapter.cs  # Appelle l'API d'un autre module
│   │   │
│   │   └── Booking.Api/
│   │       └── Controllers/
│   │           └── BookingController.cs  # Adaptateur gauche
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

### Port API (gauche) — les use cases du module

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

### Port SPI (droit) — vers un autre module

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

### In-Proc Adapter — appelle l'API d'un autre module

L'In-Proc Adapter peut contenir de la **logique d'orchestration** vers plusieurs modules.

```csharp
// Booking.Infrastructure/Adapters/InProc/AvailabilityInProcAdapter.cs
public sealed class AvailabilityInProcAdapter(
    IAvailabilityApi availabilityApi  // ◄── Injecte l'API de l'autre module
) : IAvailabilityModule
{
    public async Task<IReadOnlyList<RoomAvailability>> GetAvailabilitiesAsync(
        HotelId hotelId, 
        DateRange dates, 
        CancellationToken ct)
    {
        // Peut contenir de la logique d'orchestration
        var availabilities = await availabilityApi.GetForHotelAsync(hotelId, dates, ct);
        
        // Adaptation/transformation si nécessaire
        return availabilities
            .Where(a => a.IsConfirmed)
            .Select(a => MapToBookingDomain(a))
            .ToList();
    }
}
```

### Domain Service (implémente le port API)

```csharp
// Booking.Domain/Services/BookingService.cs
public sealed class BookingService(
    IReservationRepository reservationRepository,
    IAvailabilityModule availabilityModule,  // ◄── SPI vers autre module
    IBookingReferenceProvider bookingRefProvider,
    ILogger<BookingService> logger
) : IBookingApi
{
    public async Task<Result<Reservation>> ReserveAsync(
        TrainId trainId, 
        SeatCount seats, 
        CancellationToken ct)
    {
        // Appel vers l'autre module via le SPI
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

### Controller (adaptateur gauche)

```csharp
// Booking.Api/Controllers/BookingController.cs
[ApiController]
[Route("api/bookings")]
public sealed class BookingController(
    IBookingApi bookingApi  // ◄── Injecte le port API
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

## Extractabilité du module

Chaque module peut être extrait vers un repository séparé :

```
# Avant : In-Proc Adapter (même process)
AvailabilityInProcAdapter : IAvailabilityModule
    → appelle IAvailabilityApi directement

# Après extraction : HTTP Adapter (process séparé)
AvailabilityHttpAdapter : IAvailabilityModule
    → appelle le microservice Availability via HTTP
```

Le Domain Service ne change pas — seul l'adaptateur SPI est remplacé.
