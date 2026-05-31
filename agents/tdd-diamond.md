---
name: tdd-diamond
description: Guides Outside-in Diamond 🔷 TDD + Hive workflow
tools: ["Read", "Write", "Edit", "Bash"]
model: sonnet
---

# Outside-in Diamond 🔷 TDD + The Hive

Style de TDD développé par Thomas Pierrain, adapté au pattern Hive.

## Le Diamond (pas une pyramide)

```
        ◆ Acceptance Tests (coarse-grained)
       ◆ ◆    Testent le module via l'adaptateur gauche
      ◆   ◆   In-Proc Adapters inclus dans le périmètre
     ◆     ◆  
      ◆   ◆   Fine-grained tests (Domain logic isolée)
       ◆ ◆    
        ◆ Integration/Contract tests
```

## Périmètre de test dans la Hive

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE A (Booking)                           │
│                                                                 │
│   ✅ TESTÉ :                                                    │
│   Controller ──► Domain Service ──► In-Proc Adapter            │
│                                          │                      │
│                                          │ logique              │
│                                          │ d'orchestration      │
│                                          ▼                      │
│   ❌ STUBBÉ :                                                   │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Stub IAvailabilityApi    Stub IReservationRepository    │  │
│   │ (port API module B)      (SPI infra)                    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow

### 1. RED — Test d'acceptance via l'adaptateur gauche

```csharp
[Fact]
public async Task Return_confirmed_reservation_when_rooms_are_available()
{
    // Arrange — Le builder retourne le Domain Service
    var bookingApi = new BookingServiceBuilder()
        .WithAffiliatedHotels(bellagio, otherHotel)
        .WithFullyBookedHotel(otherHotel)
        .WithOneAvailabilityPerSupportedRoomType()
        .Build();  // ◄── Retourne IBookingApi
    
    // Le test instancie le Controller
    var controller = new BookingController(bookingApi);

    // Act — On manipule l'adaptateur gauche
    var response = await controller.Book(request, CancellationToken.None);

    // Assert — Assertion orientée métier
    CheckThatBookingIsConfirmed(response, bellagio);
}
```

### 2. Le Builder assemble le module

```csharp
public class BookingServiceBuilder
{
    // API métier — intentions uniquement
    public BookingServiceBuilder WithAffiliatedHotels(...) { ... }
    public BookingServiceBuilder WithFullyBookedHotel(...) { ... }
    
    public IBookingApi Build()
    {
        // 1. Stub du port API d'un AUTRE module
        var availabilityApi = Substitute.For<IAvailabilityApi>();
        // ... configuration selon intentions
        
        // 2. VRAI In-Proc Adapter (logique d'orchestration testée)
        var availabilityModule = new AvailabilityInProcAdapter(availabilityApi);
        
        // 3. Stubs des SPI infra
        var repository = Substitute.For<IReservationRepository>();
        
        // 4. Retourne le Domain Service
        return new BookingService(repository, availabilityModule, ...);
    }
}
```

### 3. Boucles internes si nécessaire

Pendant que le test d'acceptance est RED, on peut faire des boucles TDD internes sur le Domain :

```csharp
[Fact]
public void Reserve_WhenNotEnoughSeats_ReturnsFailure()
{
    // Test fin sur le Domain uniquement
    var reservation = Reservation.Create(...);
    
    var result = reservation.Confirm(SeatCount.From(5));
    
    Check.That(result.IsFailure).IsTrue();
}
```

### 4. GREEN — Le test d'acceptance passe

### 5. REFACTOR

## Règles du Diamond + Hive

1. **7-15 lignes max par test** — builders + helpers d'assertion
2. **Domain-Driven** — le test parle le langage métier
3. **Blazing Fast** — sub-ms à 400ms max (stubs, pas d'I/O)
4. **Isolé** — pas de [Setup], pas de champs partagés
5. **In-Proc Adapters dans le périmètre** — leur logique est testée
6. **Ports API des autres modules stubbés** — extractabilité garantie
7. **Vertical slicing** — chaque module est autonome

## Stack

- **xUnit** : framework
- **NFluent** : assertions (`Check.That()`)
- **NSubstitute** : stubs des ports API et SPI
- **Diverse** : fuzzers
