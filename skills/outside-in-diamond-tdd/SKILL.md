---
name: outside-in-diamond-tdd
description: Outside-in Diamond 🔷 TDD — style de TDD de Thomas Pierrain pour services, APIs et applications (back-ends), adapté à The Hive. Tests d'acceptance gros grain pilotés par l'adaptateur gauche, Builder qui retourne le Domain Service, In-Proc Adapters dans le périmètre, ports API des autres modules stubbés. À utiliser pour développer/tester un service, une API ou un module Hive en .NET. Pour du TDD générique (libs, tools), voir la skill tdd-discipline.
origin: use-case-driven-harness
---

# Outside-in Diamond 🔷 TDD + The Hive

Style de TDD développé par Thomas Pierrain, adapté au pattern Hive.

## Périmètre : services / APIs / applications

Outside-in Diamond TDD cible le **développement de services, d'APIs et d'applications**
(back-ends) : on pilote **de l'extérieur** (adaptateur gauche / test d'acceptance) vers
l'intérieur, avec le périmètre de test d'un module Hive.

Ce n'est **pas** la bonne maille pour du code de bas niveau — une petite lib, un simple
tool, un algorithme isolé : là, le **TDD classique** suffit largement (pas d'acceptance
gros grain, pas de Builder, pas de périmètre Hive). La discipline TDD universelle —
red→green→refactor, baby-steps, triangulation, faire échouer le test d'abord, refactor
obligatoire — vit dans la skill **`tdd-discipline`** ; cette skill la **présuppose** et la
**complète** avec les spécificités ci-dessous.

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

**Plus de tests d'acceptance (coarse-grained) que de tests fins.** Le ventre du diamant,
c'est l'acceptance ; les tests fins ne servent qu'à fouiller une logique de domaine
délicate, et les tests d'intégration/contrat ne ciblent que les adaptateurs SPI qui
sortent réellement du module.

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

- Les tests d'acceptance manipulent **l'adaptateur gauche** (Controller).
- Le **Builder** retourne le **Domain Service** (port API) avec les vrais In-Proc Adapters ;
  le **test** instancie le Controller en injectant ce Domain Service.
- La **logique d'orchestration des In-Proc Adapters est dans le périmètre** (testée).
- Les **ports API des autres modules** sont stubbés → garantit l'extractabilité (vertical
  slicing). Les **SPI infra** (repositories, services HTTP externes) sont stubbés aussi.
- **Blazing fast** : sub-milliseconde à 400 ms max par test (stubs, pas d'I/O).
- **Isolés et autonomes** : pas de `[Setup]`, pas de champs mutables partagés.

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

### 2. Le Builder assemble le module et retourne le Domain Service

Le Builder :
1. Exprime des **intentions métier** (jamais de détails techniques publics — pas de « stub »
   dans l'API publique).
2. Configure les stubs des **ports API des autres modules** de la ruche.
3. Configure les stubs des **SPI infra** (repositories, services externes).
4. Instancie les **vrais In-Proc Adapters** (avec leur logique d'orchestration).
5. Retourne le **Domain Service** (qui implémente le port API).

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
        // ... configuration selon les intentions exprimées

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

Pendant que le test d'acceptance est RED, on peut faire des boucles TDD internes sur le
Domain (toujours en baby-steps, un test à la fois) :

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

Jamais optionnel (cf. skill `tdd-discipline`). D'abord sur l'implémentation, puis lisibilité
des tests — sans jamais affaiblir les assertions.

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

    // Helper privé — cache les détails techniques (DTOs, HTTP status, etc.)
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

## Règles du Diamond + Hive

1. **7-15 lignes max par test** — fuzzers + builders + helpers d'assertion.
2. **Domain-Driven** — le test et le builder parlent le langage métier, jamais « stub » en public.
3. **Blazing Fast** — sub-ms à 400 ms max (stubs, pas d'I/O).
4. **Isolé** — pas de `[Setup]`, pas de champs partagés.
5. **Le Builder retourne le Domain Service** (port API), le test instancie le Controller.
6. **In-Proc Adapters dans le périmètre** — leur logique d'orchestration est testée.
7. **Ports API des autres modules stubbés** — extractabilité garantie (vertical slicing).
8. **SPI infra stubbés** — repositories, services externes HTTP, etc.
9. **Helpers d'assertion** — cachent les détails techniques (DTOs, HTTP status…).

## Stack de test .NET

| Lib | Usage | NuGet |
|-----|-------|-------|
| **xUnit** | Framework | `xunit` |
| **NFluent** | Assertions (`Check.That()`) | `NFluent` |
| **NSubstitute** | **Stubs** des ports API et SPI (`Substitute.For<...>()`) | `NSubstitute` |
| **Diverse** | **Fuzzers** / génération de données variées | `Diverse` |

> **Diverse** est la librairie de fuzzing **créée par Thomas** (`tpierrain`). On la privilégie
> pour générer des données de test variées (cf. `new Fuzzer()` dans les exemples ci-dessus)
> plutôt que des valeurs en dur. NuGet : <https://www.nuget.org/packages/Diverse/> · repo :
> <https://github.com/tpierrain/Diverse>.

## Pourquoi cette approche ?

- **Extractabilité** : chaque module peut être extrait vers un repo séparé à tout moment.
- **Tests autonomes** : aucune dépendance vers l'implémentation des autres modules.
- **Logique d'orchestration testée** : les In-Proc Adapters font partie du périmètre.
- **Vertical slicing** : alignement tests / architecture / déploiement.

## Voir aussi

- Skill **`tdd-discipline`** — la discipline TDD universelle (baby-steps, triangulation, RGR).
- Skill **`hexagonal-dotnet`** — l'architecture The Hive (ports API/SPI, In-Proc Adapters).
