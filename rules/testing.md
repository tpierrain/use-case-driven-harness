# Testing — Outside-in Diamond 🔷 TDD + The Hive

> Style de TDD développé par Thomas Pierrain, adapté au pattern Hive

## Discipline TDD — baby steps, PAS test-first batch

**Un seul test à la fois.** Cycle 🔴 red → 🟢 green → ♻️ refactor **complet pour chaque test**, avant d'écrire le test suivant.

- **Interdit** : écrire plusieurs tests d'avance puis implémenter pour tous les faire passer. C'est du *test-first batch*, pas du TDD.
- **Pourquoi** : écrire les tests en lot fige le design en amont (l'API est décrétée avant la moindre ligne d'implémentation) et **tue le design émergent**. En baby steps, chaque test tire le strict minimum de code et la structure se découvre incrément par incrément.
- **En pratique** : test 1 → red → plus petit code qui passe → refactor → test 2 → red → … Chaque pas est le plus petit qui fasse passer le test courant.
- **Le refactor n'est jamais optionnel.** Le pas n'est *terminé* qu'après le ♻️. Il porte **d'abord sur le code d'implémentation** : meilleure structure, mêmes comportements — un refactor **ne change jamais le contrat public** (c'est sa définition : behavior-preserving). Sur les tests, il se limite à les rendre **plus lisibles** (noms, helpers, intention) — **jamais** à affaiblir leurs assertions ni à leur faire vérifier moins de choses. Si un test couvre mal, c'est un *nouveau* test, pas un refactor. Même sans rien à nettoyer, on passe consciemment par l'étape et on le constate (« refactor : RAS »). Sauter le refactor « parce que ça marche » accumule de la dette à chaque cycle — c'est exactement ce que la discipline baby-steps est censée empêcher.
- Vaut pour **tous les langages**, pas seulement le .NET ci-dessous.

## Stack de test .NET

| Lib | Usage | NuGet |
|-----|-------|-------|
| **xUnit** | Framework | `xunit` |
| **NFluent** | Assertions | `NFluent` |
| **NSubstitute** | Stubs | `NSubstitute` |
| **Diverse** | Fuzzers | `Diverse` |

## Philosophie Outside-in Diamond + Hive

- **Plus de tests d'acceptance (coarse-grained) que de tests fins**
- Les tests d'acceptance manipulent **l'adaptateur gauche** (Controller)
- Le **Builder** retourne le **Domain Service** (port API) avec les vrais In-Proc Adapters
- Le **test** instancie le Controller en injectant le Domain Service
- **Vertical slicing** : chaque module est testable en isolation, extractable à tout moment
- **Blazing fast** : sub-milliseconde à 400ms max par test
- **Isolés et autonomes** : pas de [Setup], pas de champs mutables partagés

## Périmètre de test d'un module dans la Hive

```
┌─────────────────────────────────────────────────────────────────┐
│              TEST D'ACCEPTANCE MODULE A (Booking)               │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    TESTÉ (dans le périmètre)             │  │
│   │                                                          │  │
│   │   Controller ──► Domain Service ──► In-Proc Adapter     │  │
│   │   (gauche)        (logique)          (SPI)               │  │
│   │                                          │               │  │
│   │   La logique d'orchestration de         │               │  │
│   │   l'In-Proc Adapter est testée !        │               │  │
│   │                                          │               │  │
│   └──────────────────────────────────────────┼───────────────┘  │
│                                              │                  │
│                                              ▼                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    STUBBÉ                                │  │
│   │                                                          │  │
│   │   Stub IAvailabilityApi   Stub IReservationRepository   │  │
│   │   (API module B)          (SPI infra)                    │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ✅ Testé : Controller + Domain Service + In-Proc Adapters   │
│   ❌ Stubbé : Ports API des autres modules + SPI infra        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Le Builder : cœur du pattern

Le Builder :
1. Exprime des **intentions métier** (jamais de détails techniques publics)
2. Configure les stubs des **ports API des autres modules** de la ruche
3. Configure les stubs des **SPI infra** (repositories, services externes)
4. Instancie les **vrais In-Proc Adapters** (avec la logique d'orchestration)
5. Retourne le **Domain Service** (qui implémente le port API)

```csharp
public class BookingServiceBuilder
{
    private readonly List<HotelSpecification> _affiliatedHotels = [];
    private readonly HashSet<HotelSpecification> _fullyBookedHotels = [];
    
    // ══════════════════════════════════════════════════════════════
    // API Domain-Driven — intentions métier uniquement
    // ══════════════════════════════════════════════════════════════
    
    public BookingServiceBuilder WithAffiliatedHotels(params HotelSpecification[] hotels)
    {
        _affiliatedHotels.AddRange(hotels);
        return this;
    }
    
    public BookingServiceBuilder WithFullyBookedHotel(HotelSpecification hotel)
    {
        _fullyBookedHotels.Add(hotel);
        return this;
    }
    
    public BookingServiceBuilder WithOneAvailabilityPerSupportedRoomType()
    {
        _availabilitiesPerRoomType = 1;
        return this;
    }
    
    // ══════════════════════════════════════════════════════════════
    // Build : assemble le module et retourne le Domain Service
    // ══════════════════════════════════════════════════════════════
    
    public IBookingApi Build()
    {
        // 1. Stub du port API d'un AUTRE module (Availability)
        var availabilityApi = Substitute.For<IAvailabilityApi>();
        foreach (var hotel in _affiliatedHotels)
        {
            if (_fullyBookedHotels.Contains(hotel))
            {
                availabilityApi.GetForHotelAsync(hotel.Id, Arg.Any<CancellationToken>())
                    .Returns(Array.Empty<Availability>());
            }
            else
            {
                availabilityApi.GetForHotelAsync(hotel.Id, Arg.Any<CancellationToken>())
                    .Returns(GenerateAvailabilities(hotel, _availabilitiesPerRoomType));
            }
        }
        
        // 2. VRAI In-Proc Adapter (avec sa logique d'orchestration)
        var availabilityModule = new AvailabilityInProcAdapter(availabilityApi);
        
        // 3. Stubs des SPI infra classiques
        var reservationRepository = Substitute.For<IReservationRepository>();
        var bookingRefProvider = Substitute.For<IBookingReferenceProvider>();
        bookingRefProvider.GetNextAsync(Arg.Any<CancellationToken>())
            .Returns(BookingReference.From(Guid.NewGuid().ToString()));
        
        // 4. Retourne le Domain Service (implémente le port API)
        return new BookingService(
            reservationRepository,
            availabilityModule,  // ◄── Vrai In-Proc Adapter
            bookingRefProvider,
            NullLogger<BookingService>.Instance
        );
    }
}
```

## Exemple complet de test d'acceptance

```csharp
public class BookingControllerShould
{
    [Fact]
    public async Task Return_confirmed_reservation_when_rooms_are_available()
    {
        // Arrange — Fuzzers pour générer des données
        var fuzzer = new Fuzzer();
        var bellagio = fuzzer.GenerateHotelSpecification("Bellagio")
            .WithRoomTypes(fuzzer.GenerateRoomTypes(3));
        var otherHotel = fuzzer.GenerateHotelSpecification("OtherHotel")
            .WithRoomTypes(RoomType.All);
        
        // Builder avec intentions métier — retourne le Domain Service
        var bookingApi = new BookingServiceBuilder()
            .WithAffiliatedHotels(bellagio, otherHotel)
            .WithFullyBookedHotel(otherHotel)
            .WithOneAvailabilityPerSupportedRoomType()
            .Build();
        
        // Le test instancie le Controller
        var controller = new BookingController(bookingApi);
        
        var request = new BookingRequest 
        { 
            HotelId = bellagio.Id.Value,
            RoomType = bellagio.RoomTypes.First()
        };

        // Act — On appelle l'adaptateur gauche
        var response = await controller.Book(request, CancellationToken.None);

        // Assert — One-liner domain-driven
        CheckThatBookingIsConfirmed(response, bellagio);
    }
    
    // Helper method privé — cache les détails techniques
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

## Règles Outside-in Diamond + Hive

1. **7-15 lignes max par test** — fuzzers + builders + helpers d'assertion
2. **Domain-Driven** — le builder parle le langage métier, jamais de "stub" dans l'API publique
3. **Blazing Fast** — sub-ms à 400ms max (stubs, pas d'I/O)
4. **Isolé** — pas de [Setup], pas de champs partagés
5. **Le Builder retourne le Domain Service** (port API), le test instancie le Controller
6. **Les In-Proc Adapters sont dans le périmètre de test** — leur logique d'orchestration est testée
7. **Les ports API des autres modules sont stubbés** — garantit l'extractabilité (vertical slicing)
8. **Les SPI infra sont stubbés** — repositories, services externes HTTP, etc.
9. **Helpers d'assertion** — cachent les détails techniques (DTOs, HTTP status, etc.)

## Pourquoi cette approche ?

- **Extractabilité** : chaque module peut être extrait vers un repo séparé à tout moment
- **Tests autonomes** : aucune dépendance vers l'implémentation d'autres modules
- **Logique d'orchestration testée** : les In-Proc Adapters font partie du périmètre
- **Vertical slicing** : alignement tests / architecture / déploiement
