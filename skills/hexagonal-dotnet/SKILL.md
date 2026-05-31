# Skill: Architecture Hexagonale .NET — The Hive Pattern

## Principe fondamental

Chaque module est un **hexagone autonome et extractable** (vertical slicing).
Le pattern Hive compose plusieurs hexagones dans le même process, avec la possibilité de les déployer séparément.

**Heuristique de base : un module = un hexagone = un bounded context** (au sens DDD). C'est
la règle de découpage par défaut, celle qu'on applique sauf raison contraire. Il existe des
variantes (un bounded context plus gros peut se subdiviser, etc.), mais la maille de
référence dans la ruche reste celle-là.

The Hive, c'est l'art du **« Microservices-Ready Modular Monolith »** : on *modélise* le
système comme un monolithe modulaire bien découpé (un module = un hexagone), tout en le
gardant **prêt à être éclaté en microservices** le jour où c'est utile — *« Model once,
deploy as you wish »*.

C'est un pattern de structuration **back-end / côté serveur** : il s'applique aux
**applications, services et APIs** (back-ends métier), là où vivent les Ports API/SPI et
les In-Proc Adapters. Il **ne concerne pas** l'architecture des front-ends / UI, qui
consomment les Ports API des modules sans être eux-mêmes organisés en Hive.

## Les trois piliers de The Hive

The Hive repose sur **trois principes indissociables**. Les respecter, c'est ce qui rend la
promesse *« Model once, deploy as you wish »* réellement tenable.

### 1. Vertical slicing — chaque module est autonome de bout en bout

Un module est une tranche verticale complète, **du contrôleur jusqu'à la base de données**.
On vise une autonomie maximale :

- **Données dédiées par module** : idéalement des **tables dédiées** (schéma séparé) voire
  une **base de données dédiée**. Pas de table partagée entre modules, pas de jointure
  cross-module en base — sinon l'extractabilité est un mensonge.
- **Les tests font partie de la tranche.** Les tests de chaque module sont **autonomes** et
  appartiennent au vertical slice du module : un module qu'on extrait emporte ses tests avec
  lui, verts, sans rien à recâbler. C'est **essentiel**. Deux niveaux se complètent :
    - **Tests d'acceptance** — le gros du harnais. Ils exercent le module de bout en bout
      (Controller → Domain Service → In-Proc Adapters) **en stubbant les autres modules dès
      qu'il en dépend** (leurs Ports API sont substitués) ainsi que les SPI infra. C'est ce
      qui garantit l'autonomie : aucun test ne touche l'implémentation d'un autre module.
    - **Tests de points d'intégration** (*integration tests*) — plus rares, ciblés sur les
      **adaptateurs SPI** qui sortent du module (vers les Ports API d'autres modules, ou vers
      l'infra : DB, HTTP, broker…). Ils vérifient que ces adaptateurs **fonctionnent
      réellement en conditions normales** (vrai branchement, pas de stub), là où les tests
      d'acceptance se contentent de stubs.

Critère de réussite : on peut **extraire un module vers un repo séparé** (code + données +
tests) sans toucher aux autres.

### 2. Ports & adapters entre modules — jamais autrement

Chaque module est une **mini architecture hexagonale**. Toute communication inter-module
passe **exclusivement par des ports et des adaptateurs** (Port API de l'autre module,
appelé via un In-Proc Adapter côté SPI). Aucun couplage direct : pas d'appel à une classe
interne d'un autre module, pas de modèle de domaine partagé, pas d'accès à sa base.

C'est cette discipline qui permet de remplacer un In-Proc Adapter par un client HTTP/AMQP
sans toucher au domaine (cf. [Extractabilité du module](#extractabilité-du-module)).

### 3. Penser réseau dès le début — éviter le chatty

Même quand tout tourne in-proc, on **conçoit les échanges inter-modules comme s'ils
passaient déjà par le réseau**. Les interactions via ports/adapters doivent rester **peu
bavardes** (*not chatty*) : on privilégie des appels à gros grain plutôt qu'une rafale de
petits allers-retours.

Pourquoi : le jour où l'In-Proc Adapter devient un vrai client **HTTP ou AMQP**, une API
trop verbeuse (N+1 appels, granularité trop fine) se traduit en **mauvaises surprises de
performance** (latence réseau × nombre d'appels). On paie alors au runtime un design qu'on
aurait pu éviter dès la modélisation.

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

## Pour aller plus loin

- [The Hive vs Spring Modulith — two different takes on the modular monolith](https://medium.com/@tpierrain/the-hive-vs-spring-modulith-two-different-takes-on-the-modular-monolith-37c60ac91105) — Thomas Pierrain (*Use Case Driven*)
