# Étape 2 — Remplacements ciblés

## 1. Remplacer la section FORMULAIRES avant le constructeur

```typescript
  // ======================================================
  // FORMULAIRES — 27 exercices actifs (EX22 en réserve)
  // ======================================================

  // Opérations de base : EX1 à EX5
  formEx1!: FormGroup;
  formEx2!: FormGroup;
  formEx3!: FormGroup;
  formEx4!: FormGroup;
  formEx5!: FormGroup;

  // Unités de mesure : EX6 à EX14
  formEx6!: FormGroup;
  formEx7!: FormGroup;
  formEx8!: FormGroup;
  formEx9!: FormGroup;
  formEx10!: FormGroup;
  formEx11!: FormGroup;
  formEx12!: FormGroup;
  formEx13!: FormGroup;
  formEx14!: FormGroup;

  // Géométrie / surfaces / volumes : EX15 à EX21
  formEx15!: FormGroup;
  formEx16!: FormGroup;
  formEx17!: FormGroup;
  formEx18!: FormGroup;
  formEx19!: FormGroup;
  formEx20!: FormGroup;
  formEx21!: FormGroup;

  // EX22 — ASSIFEP Test 6 : en réserve, aucun formulaire

  // Pourcentages : EX23 à EX28
  formEx23!: FormGroup;
  formEx24!: FormGroup;
  formEx25!: FormGroup;
  formEx26!: FormGroup;
  formEx27!: FormGroup;
  formEx28!: FormGroup;
```

## 2. Remplacer la méthode initForms() complète (après le constructeur)

```typescript
  // ======================================================
  // INITIALISATION DES FORMULAIRES — 27 exercices actifs
  // EX22 en réserve : aucun FormGroup.
  // Appel existant : this.initForms() dans le constructor.
  // ======================================================

  initForms(): void {

    // ===== OPÉRATIONS DE BASE =====

    // EX1 — PRO-FORMATION : addition
    this.formEx1 = this.fb.group({
      answer: ['']
    });

    // EX2 — PRO-FORMATION : soustraction
    this.formEx2 = this.fb.group({
      answer: ['']
    });

    // EX3 — PRO-FORMATION : multiplication
    this.formEx3 = this.fb.group({
      answer: ['']
    });

    // EX4 — PRO-FORMATION : chaîne de calculs, sept résultats et une opération
    this.formEx4 = this.fb.group({
      answer1: [''],
      answer2: [''],
      answer3: [''],
      answer4: [''],
      operation: [''],
      answer5: [''],
      answer6: [''],
      answer7: ['']
    });

    // EX5 — ASSIFEP Test 4 : division de 1 200 colis sur 6 palettes
    this.formEx5 = this.fb.group({
      answer: ['']
    });

    // ===== UNITÉS DE MESURE =====

    // EX6 — PRO-FORMATION (ancien EX5) : quatre associations objet / unité de masse
    this.formEx6 = this.fb.group({
      answer1: [''],
      answer2: [''],
      answer3: [''],
      answer4: ['']
    });

    // EX7 — PRO-FORMATION (ancien EX6) : cases à cocher, unités de longueur
    // false = case non cochée ; le score sera calculé dans submitEx7().
    this.formEx7 = this.fb.group({
      km: [false],
      dam: [false],
      dm: [false],
      cm: [false],
      mm: [false],
      g: [false],
      kg: [false],
      mg: [false],
      l: [false],
      cl: [false],
      ml: [false],
      hl: [false]
    });

    // EX8 — PRO-FORMATION (ancien EX7) : six associations grandeur / mesure
    this.formEx8 = this.fb.group({
      answer1: [''],
      answer2: [''],
      answer3: [''],
      answer4: [''],
      answer5: [''],
      answer6: ['']
    });

    // EX9 — PRO-FORMATION (ancien EX8) : trois conversions à deux propositions
    this.formEx9 = this.fb.group({
      answer1: [''],
      answer2: [''],
      answer3: ['']
    });

    // EX10 — PRO-FORMATION (ancien EX9) : trois conversions de capacités
    this.formEx10 = this.fb.group({
      answer1: [''],
      answer2: [''],
      answer3: ['']
    });

    // EX11 — ASSIFEP Test 5 : 1 300 g en kg
    this.formEx11 = this.fb.group({
      answer: ['']
    });

    // EX12 — ASSIFEP Test 5 : 500 kg en tonnes
    this.formEx12 = this.fb.group({
      answer: ['']
    });

    // EX13 — ASSIFEP Test 5 : 1,75 t en kg
    this.formEx13 = this.fb.group({
      answer: ['']
    });

    // EX14 — ASSIFEP Test 5 : 3 kg en grammes
    this.formEx14 = this.fb.group({
      answer: ['']
    });

    // ===== GÉOMÉTRIE / SURFACES / VOLUMES =====

    // EX15 — PRO-FORMATION (ancien EX10) : cinq associations image / forme
    this.formEx15 = this.fb.group({
      answer1: [''],
      answer2: [''],
      answer3: [''],
      answer4: [''],
      answer5: ['']
    });

    // EX16 — PRO-FORMATION (ancien EX11) : périmètre du carré
    this.formEx16 = this.fb.group({
      answer: ['']
    });

    // EX17 — PRO-FORMATION (ancien EX12) : périmètre du rectangle
    this.formEx17 = this.fb.group({
      answer: ['']
    });

    // EX18 — PRO-FORMATION (ancien EX13) : périmètre du triangle
    this.formEx18 = this.fb.group({
      answer: ['']
    });

    // EX19 — ASSIFEP Test 6 : surface palette
    this.formEx19 = this.fb.group({
      answer: ['']
    });

    // EX20 — ASSIFEP Test 6 : surface remorque
    this.formEx20 = this.fb.group({
      answer: ['']
    });

    // EX21 — ASSIFEP Test 6 : volume remorque
    this.formEx21 = this.fb.group({
      answer: ['']
    });

    // EX22 — ASSIFEP Test 6 : EN RÉSERVE, aucun formulaire.

    // ===== POURCENTAGES =====

    // EX23 — ASSIFEP Test 7 : calcul des voix de la liste B
    this.formEx23 = this.fb.group({
      answer: ['']
    });

    // EX24 — ASSIFEP Test 8 : affirmation 1, Vrai/Faux
    // null = non répondu ; true = Vrai ; false = Faux.
    this.formEx24 = this.fb.group({
      answer: [null]
    });

    // EX25 — ASSIFEP Test 8 : affirmation 2, Vrai/Faux
    // null = non répondu ; true = Vrai ; false = Faux.
    this.formEx25 = this.fb.group({
      answer: [null]
    });

    // EX26 — ASSIFEP Test 8 : affirmation 3, Vrai/Faux
    // null = non répondu ; true = Vrai ; false = Faux.
    this.formEx26 = this.fb.group({
      answer: [null]
    });

    // EX27 — ASSIFEP Test 8 : affirmation 4, Vrai/Faux
    // null = non répondu ; true = Vrai ; false = Faux.
    this.formEx27 = this.fb.group({
      answer: [null]
    });

    // EX28 — ASSIFEP Test 8 : affirmation 5, Vrai/Faux
    // null = non répondu ; true = Vrai ; false = Faux.
    this.formEx28 = this.fb.group({
      answer: [null]
    });
  }
```
