// SOCLE DE DONNÉES — ÉTAPE 1 : PRO-FORMATION initial + apports ASSIFEP.
// EX22 réservé. Formulaires/submit supplémentaires NON développés à cette étape.
// Ne pas utiliser tel quel comme composant final : les étapes ajoutées n’ont pas encore de submit.
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { WorkbookService } from '../../workbook.service';
import { AuthService } from 'src/app/admin/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WORKBOOK_UNITS } from '../../workbookUnits';

interface Step {
  id: string;
  category: string;
  duration?: number;
  maxScore?: number | null;
}

@Component({
  selector: 'app-unit4',
  templateUrl: './unit4.component.html',
  styleUrls: ['./unit4.component.css']
})
export class Unit4Component implements OnInit, OnDestroy {

  label: string = WORKBOOK_UNITS.find(unit => unit.id === 'unit4')!.label;
  profile: string = WORKBOOK_UNITS.find(unit => unit.id === 'unit4')!.profile;
  description: string = WORKBOOK_UNITS.find(unit => unit.id === 'unit4')!.description;

  commentCtrl = new FormControl('');

  uid: string = '';
  lastName: string = '';
  firstName: string = '';
  userRole: string | null = null;

  unitData: any = {};

  showFinalMessage: boolean = false;
  isReferentView: boolean = false;


  currentStep = 11;

  categories: string[] = [
    'Opérations de base',
    'Unités de mesure',
    'Géométrie',
    'Pourcentages'
  ];
  alreadySubmitted = false;

  private intervalId: any = null;
  private timerId: any = null;

  progress = 0;

  aggregateState: Record<string, any> = {};



  // ======================================================
  // UNITÉ 4 — ÉTAPES ET DONNÉES DE CORRECTION
  // Numérotation consolidée PRO-FORMATION / ASSIFEP.
  // EX22 (ASSIFEP Test 6) est mis en réserve : absent de steps[],
  // donc hors navigation, progression et calcul des points.
  // Durées et barèmes : choix de développement, adaptables après tests.
  // ======================================================

  steps: Step[] = [

    // PRO-FORMATION — addition

    { id: 'ex1', category: this.categories[0], duration: 100, maxScore: 2 },

    // PRO-FORMATION — soustraction

    { id: 'ex2', category: this.categories[0], duration: 100, maxScore: 2 },

    // PRO-FORMATION — multiplication

    { id: 'ex3', category: this.categories[0], duration: 100, maxScore: 2 },

    // PRO-FORMATION — chaîne de calculs

    { id: 'ex4', category: this.categories[0], duration: 200, maxScore: 8 },

    // ASSIFEP — Test 4 : division colis/palettes

    { id: 'ex5', category: this.categories[0], duration: 100, maxScore: 1 },

    // PRO-FORMATION — ancien EX5 : unités de masse

    { id: 'ex6', category: this.categories[1], duration: 100, maxScore: 4 },

    // PRO-FORMATION — ancien EX6 : unités de longueur

    { id: 'ex7', category: this.categories[1], duration: 100, maxScore: 5 },

    // PRO-FORMATION — ancien EX7 : association des mesures

    { id: 'ex8', category: this.categories[1], duration: 150, maxScore: 6 },

    // PRO-FORMATION — ancien EX8 : conversions de longueur

    { id: 'ex9', category: this.categories[1], duration: 150, maxScore: 3 },

    // PRO-FORMATION — ancien EX9 : conversions de capacités

    { id: 'ex10', category: this.categories[1], duration: 150, maxScore: 3 },


     // ASSIFEP — Test 5 REFACTO: 4 conversions de masse
    { id: 'ex11', category: this.categories[1], duration: 200, maxScore: 4 },

    // ASSIFEP — Test 5 : 500 kg en tonnes plus d'actualité fusionné avec ex11
    // { id: 'ex12', category: this.categories[1], duration: 100, maxScore: 1 },
    // ASSIFEP — Test 5 : 1,75 t en kg plus d'actualité fusionné avec ex11
    // { id: 'ex13', category: this.categories[1], duration: 100, maxScore: 1 },
    // ASSIFEP — Test 5 : 3 kg en grammes plus d'actualité fusionné avec ex11
    // { id: 'ex14', category: this.categories[1], duration: 100, maxScore: 1 },

    // PRO-FORMATION — ancien EX10 : formes géométriques

    { id: 'ex12', category: this.categories[2], duration: 150, maxScore: 5 },

    // PRO-FORMATION — ancien EX11 : périmètre carré

    { id: 'ex13', category: this.categories[2], duration: 100, maxScore: 1 },

    // PRO-FORMATION — ancien EX12 : périmètre rectangle

    { id: 'ex14', category: this.categories[2], duration: 100, maxScore: 1 },

    // PRO-FORMATION — ancien EX13 : périmètre triangle

    { id: 'ex15', category: this.categories[2], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 6 : surface palette

    { id: 'ex16', category: this.categories[2], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 6 : surface remorque

    { id: 'ex17', category: this.categories[2], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 6 : volume remorque

    { id: 'ex18', category: this.categories[2], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 7 : voix liste B

    { id: 'ex19', category: this.categories[3], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 1

    { id: 'ex20', category: this.categories[3], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 2

    { id: 'ex21', category: this.categories[3], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 3

    { id: 'ex22', category: this.categories[3], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 4

    { id: 'ex23', category: this.categories[3], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 5

    { id: 'ex24', category: this.categories[3], duration: 100, maxScore: 1 }

  ];

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
  formEx22!: FormGroup;

  // EX22 — ASSIFEP Test 6 : en réserve, aucun formulaire

  // Pourcentages : EX23 à EX28
  formEx23!: FormGroup;
  formEx24!: FormGroup;
  formEx25!: FormGroup;
  formEx26!: FormGroup;
  formEx27!: FormGroup;
  formEx28!: FormGroup;

  // ======================================================

  // RÉPONSES ATTENDUES

  // ======================================================

  correctAnswerEx1 = 140;

  correctAnswerEx2 = 1541;

  correctAnswerEx3 = 4.25;

  correctAnswerEx4 = {

    answer1: 48,

    answer2: 144,

    answer3: 44,

    answer4: 22,

    operation: 30,

    answer5: 104,

    answer6: 200,

    answer7: 20

  };

  // ======================================================

  // PRO-FORMATION — DONNÉES ET RÉPONSES ATTENDUES
  // Ancienne numérotation EX5 à EX13 ; nouveaux EX6 à EX18.
  // Les réponses des EX8, EX9 et EX15 sont maintenant renseignées.

  // ======================================================

  // ------------------------------------------------------

  // EX6 — PRO-FORMATION (ancien EX5) : choisir l'unité de masse adaptée

  // ------------------------------------------------------

  // Illustrations propres à prévoir pour le template.
  // Les chemins 'assets/img/unit4/...' restent des emplacements prévus.

  ex6Items = [

    { id: 1, label: 'Gomme', image: 'assets/img/unit4/gomme.webp' },

    { id: 2, label: 'Oiseau', image: 'assets/img/unit4/oiseau.webp' },

    { id: 3, label: 'Éléphant', image: 'assets/img/unit4/elephant.webp' },

    { id: 4, label: 'Crayon', image: 'assets/img/unit4/crayon.webp' }

  ];

  ex6Options = [

    { value: 'mg', label: 'mg' },

    { value: 'g', label: 'g' },

    { value: 'kg', label: 'kg' },

    { value: 't', label: 't' }

  ];

  // Correspondances retenues dans le cadrage PRO-FORMATION : 4 points.
  // Ne pas remplacer ces réponses lors du développement du template.

  correctAnswersEx6: { [key: number]: string } = {

    1: 'g',

    2: 'g',

    3: 't',

    4: 'g'

  };

  // ------------------------------------------------------

  // EX7 — PRO-FORMATION (ancien EX6) : identifier les unités de longueur

  // Cases à cocher : 5 unités correctes, soit 5 points maximum.
  // Lors du submit : +1 par unité correcte cochée, -1 par
  // proposition erronée cochée ; score borné entre 0 et 5.

  // ------------------------------------------------------

  ex7Options = [

    { value: 'km', label: 'km' },

    { value: 'dam', label: 'dam' },

    { value: 'dm', label: 'dm' },

    { value: 'cm', label: 'cm' },

    { value: 'mm', label: 'mm' },

    // Distracteurs (unités de masse/capacité).

    { value: 'g', label: 'g' },

    { value: 'kg', label: 'kg' },

    { value: 'mg', label: 'mg' },

    { value: 'l', label: 'l' },

    { value: 'cl', label: 'cl' },

    { value: 'ml', label: 'ml' },

    { value: 'hl', label: 'hl' }

  ];

  correctAnswersEx7 = [

    'km',

    'dam',

    'dm',

    'cm',

    'mm'

  ];

  // ======================================================

  // EX8 — PRO-FORMATION (ancien EX7)

  // Associer une grandeur à sa mesure

  // 6 associations — 6 selects — score maximal : 6 points

  // ======================================================

  ex8Items = [

    { id: 1, label: "Capacité d'une tasse à café" },

    { id: 2, label: "Épaisseur d'un livre" },

    { id: 3, label: "Épaisseur d'une feuille de papier" },

    { id: 4, label: "Masse d'un éléphant" },

    { id: 5, label: "Volume d'une baignoire" },

    { id: 6, label: "Longueur d'une voiture moyenne" }

  ];

  // Options communes aux 6 listes déroulantes.

  ex8Options = [

    { value: '2,3 t', label: '2,3 t' },

    { value: '20 cl', label: '20 cl' },

    { value: '4,10 m', label: '4,10 m' },

    { value: '3,2 cm', label: '3,2 cm' },

    { value: '1200 l', label: '1 200 l' },

    { value: '0,1 mm', label: '0,1 mm' }

  ];

  // Réponses attendues — correction automatique.

  correctAnswersEx8: { [key: number]: string } = {

    1: '20 cl',

    2: '3,2 cm',

    3: '0,1 mm',

    4: '2,3 t',

    5: '1200 l',

    6: '4,10 m'

  };

  // ======================================================

  // EX9 — PRO-FORMATION (ancien EX8)

  // Conversions de longueur avec choix de réponse

  // 3 conversions — 2 choix par conversion

  // Correction automatique — maximum 3 points

  // ======================================================

  ex9Items = [

    {

      id: 1,

      source: '1 km',

      target: 'm',

      options: [

        { value: '100', label: '100 m' },

        { value: '1000', label: '1 000 m' }

      ]

    },

    {

      id: 2,

      source: '36520 mm',

      target: 'dm',

      options: [

        { value: '365,20', label: '365,20 dm' },

        { value: '36,520', label: '36,520 dm' }

      ]

    },

    {

      id: 3,

      source: '54,75 dam',

      target: 'hm',

      options: [

        { value: '5,475', label: '5,475 hm' },

        { value: '54,75', label: '54,75 hm' }

      ]

    }

  ];

  // Réponses attendues — correction automatique.

  correctAnswersEx9: { [key: number]: string } = {

    1: '1000',

    2: '365,20',

    3: '5,475'

  };

  // ------------------------------------------------------

  // EX10 — PRO-FORMATION (ancien EX9) : conversions de capacités

  // Trois champs de saisie numérique, 1 point chacun (maximum 3).

  // ------------------------------------------------------

  correctAnswersEx10 = {

    answer1: 1000,      // 1 l -> ml

    answer2: 2594,      // 25,94 dal -> dl

    answer3: 540000     // 54 hl -> cl

  };

  
  // ======================================================
  // EX12 — PRO-FORMATION (ancien EX15)
  // Associer un objet à une forme géométrique
  // 5 images — 5 selects — score maximal : 5 points
  // ======================================================

  // Les images définitives seront intégrées au template.
  // Ordre de présentation figé pour la correction automatique.
  // Les fichiers d'images représentent les objets indiqués.

  ex12Items = [
    { id: 1, label: 'Réfrigérateur', image: 'assets/img/unit4/forme1.webp' },
    { id: 2, label: 'Panier', image: 'assets/img/unit4/forme2.webp' },
    { id: 3, label: 'Ballon', image: 'assets/img/unit4/forme3.webp' },
    { id: 4, label: 'Dés', image: 'assets/img/unit4/forme4.webp' },
    { id: 5, label: 'Guirlande triangulaire', image: 'assets/img/unit4/forme5.webp' }
  ];

  // Options communes aux cinq listes déroulantes.

  ex12Options = [
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'trapeze', label: 'Trapèze' },
    { value: 'cercle', label: 'Cercle' },
    { value: 'carre', label: 'Carré' },
    { value: 'triangle', label: 'Triangle' }
  ];

  // Réponses attendues — correction automatique.

  correctAnswersEx12: { [key: number]: string } = {
    1: 'rectangle', // Réfrigérateur
    2: 'trapeze',   // Panier
    3: 'cercle',    // Ballon
    4: 'carre',     // Dés
    5: 'triangle'   // Guirlande triangulaire
  };

  // ------------------------------------------------------
  // EX13 — PRO-FORMATION (ancien EX16)
  // Périmètre d'un carré
  // ------------------------------------------------------

  ex13Options = [
    { value: 'cote_cote', label: 'côté x côté' },
    { value: 'cote_4', label: 'côté x 4' },
    { value: '4_4', label: '4 x 4' }
  ];

  correctAnswerEx13 = 'cote_4';

  // ------------------------------------------------------
  // EX14 — PRO-FORMATION (ancien EX17)
  // Périmètre d'un rectangle
  // ------------------------------------------------------

  ex14Options = [
    { value: 'l_plus_l_fois_2', label: '(L + l) x 2' },
    { value: 'l_fois_l', label: 'L x l' },
    { value: 'l_fois_4', label: 'L x 4' }
  ];

  correctAnswerEx14 = 'l_plus_l_fois_2';

  // ------------------------------------------------------
  // EX15 — PRO-FORMATION (ancien EX18)
  // Périmètre du triangle
  // 3,20 + 4 + 7 = 14,20 m
  // ------------------------------------------------------

  correctAnswerEx15 = 14.2;

  // ======================================================
  // ASSIFEP — DONNÉES ET RÉPONSES ATTENDUES
  // Chaque exercice possède son propre identifiant.
  // Ce bloc prépare les corrections automatiques.
  // Aucune modification des méthodes submit à ce stade.
  // ======================================================

  // ------------------------------------------------------
  // EX5 — ASSIFEP Test 4
  // 1 200 colis répartis sur 6 palettes
  // Inchangé
  // ------------------------------------------------------

  correctAnswerEx5 = 200;

  // ======================================================
  // EX11 — ASSIFEP Test 5
  // Quatre conversions de masse regroupées
  // 4 conversions — 4 points maximum
  // Inchangé depuis la consolidation
  // ======================================================

  correctAnswersEx11 = {
    answer1: 1.3,    // 1 300 g → 1,3 kg
    answer2: 0.5,    // 500 kg → 0,5 t
    answer3: 1750,   // 1,75 t → 1 750 kg
    answer4: 3000    // 3 kg → 3 000 g
  };

  // ======================================================
  // ASSIFEP Test 6
  // Schéma commun :
  // Palette : 1,20 m × 0,80 m
  // Remorque : 13,50 m × 2,44 m
  // Hauteur : 4 m
  // ======================================================

  // ------------------------------------------------------
  // EX16 — Surface palette (ancien EX19)
  // ------------------------------------------------------

  correctAnswerEx16 = 0.96; // m²

  // ------------------------------------------------------
  // EX17 — Surface remorque (ancien EX20)
  // ------------------------------------------------------

  correctAnswerEx17 = 32.94; // m²

  // ------------------------------------------------------
  // EX18 — Volume remorque (ancien EX21)
  // ------------------------------------------------------

  correctAnswerEx18 = 131.76; // m³

  // ======================================================
  // ASSIFEP Test 7
  // ======================================================

  // ------------------------------------------------------
  // EX19 — Liste B (ancien EX23)
  // Liste A = 40 % = 150 voix
  // Liste B = 60 %
  // ------------------------------------------------------

  correctAnswerEx19 = 225;

  // ======================================================
  // ASSIFEP Test 8 — Vrai / Faux
  // EX20 à EX24 (anciens EX24 à EX28)
  // Une affirmation = un exercice.
  // Pas de champ justification.
  // ======================================================

  // EX20 — Affirmation 1 (ancien EX24)
  correctAnswerEx20 = false; // 4/200 = 2 %, objectif strictement < 2 %

  // EX21 — Affirmation 2 (ancien EX25)
  correctAnswerEx21 = false; // 250/300 < 85 %, minimum 255

  // EX22 — Affirmation 3 (ancien EX26)
  correctAnswerEx22 = false; // 2 femmes sur 5 suffisent à 40 %

  // EX23 — Affirmation 4 (ancien EX27)
  correctAnswerEx23 = true;  // 22/25 = 88 % >= 85 %

  // EX24 — Affirmation 5 (ancien EX28)
  correctAnswerEx24 = false; // 45/2250 = 2 %, maximum 44


  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private service: WorkbookService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForms();

    const saved = localStorage.getItem('unit4_aggregation');

    if (saved) {
      this.aggregateState = JSON.parse(saved);
    }
  }

  ngOnInit(): void {

    const routeUid = this.route.snapshot.paramMap.get('uid');

    // ======================================================
    // VUE RÉFÉRENT
    // ======================================================

    if (routeUid) {

      this.uid = routeUid;
      this.isReferentView = true;

      this.auth.getCurrentUserRole().subscribe(userInfo => {

        if (!userInfo) {
          console.log('⏳ En attente du chargement du rôle...');
          return;
        }

        const rawRole = Array.isArray(userInfo) ? userInfo[0] : userInfo;
        const cleanedRole = rawRole.trim().toLowerCase();

        if (cleanedRole !== 'admin' && cleanedRole !== 'referent') {
          console.warn('🚫 Accès refusé : rôle insuffisant.', cleanedRole);
          alert(`🚫 Accès refusé : le rôle "${cleanedRole}" n'a pas les droits.`);
          this.router.navigate(['/home']);
          return;
        }

        this.loadData();
        this.getCandidateIdentity(this.uid);
      });

      return;
    }

    // ======================================================
    // VUE CANDIDAT
    // ======================================================

    this.auth.getCurrentUserInfo().subscribe(userInfo => {

      if (!userInfo) {
        this.userRole = null;
        this.uid = '';
        return;
      }

      this.userRole = Array.isArray(userInfo.role)
        ? userInfo.role[0]
        : userInfo.role;

      this.uid = userInfo.uid;

      if (this.userRole === 'student') {

        this.service.getUnit(this.uid).subscribe(data => {

          this.unitData = data ?? {};

          this.rebuildAggregateFromUnitData();
          this.syncStep();

          if (this.unitData?.['units.unit4.result']) {
            this.showFinalMessage = true;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

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
    // this.formEx11 = this.fb.group({
    //   answer: ['']
    // });

    // SUITE à REFACTO ++++

    this.formEx11 = this.fb.group({
      answer1: [''],
      answer2: [''],
      answer3: [''],
      answer4: ['']
    });


  
    // ======================================================
    // GÉOMÉTRIE / SURFACES / VOLUMES
    // ======================================================

    // EX12 — PRO-FORMATION (ancien EX15)
    // Cinq associations image / forme
    this.formEx12 = this.fb.group({
      answer1: [''],
      answer2: [''],
      answer3: [''],
      answer4: [''],
      answer5: ['']
    });

    // EX13 — PRO-FORMATION (ancien EX16)
    // Périmètre du carré
    this.formEx13 = this.fb.group({
      answer: ['']
    });

    // EX14 — PRO-FORMATION (ancien EX17)
    // Périmètre du rectangle
    this.formEx14 = this.fb.group({
      answer: ['']
    });

    // EX15 — PRO-FORMATION (ancien EX18)
    // Périmètre du triangle
    this.formEx15 = this.fb.group({
      answer: ['']
    });

    // EX16 — ASSIFEP Test 6 (ancien EX19)
    // Surface palette
    this.formEx16 = this.fb.group({
      answer: ['']
    });

    // EX17 — ASSIFEP Test 6 (ancien EX20)
    // Surface remorque
    this.formEx17 = this.fb.group({
      answer: ['']
    });

    // EX18 — ASSIFEP Test 6 (ancien EX21)
    // Volume remorque
    this.formEx18 = this.fb.group({
      answer: ['']
    });

    // ======================================================
    // POURCENTAGES
    // ======================================================

    // EX19 — ASSIFEP Test 7 (ancien EX23)
    // Calcul des voix de la liste B
    this.formEx19 = this.fb.group({
      answer: ['']
    });

    // EX20 — ASSIFEP Test 8 (ancien EX24)
    // Affirmation 1 — Vrai/Faux
    // null = non répondu ; true = Vrai ; false = Faux.
    this.formEx20 = this.fb.group({
      answer: [null]
    });

    // EX21 — ASSIFEP Test 8 (ancien EX25)
    // Affirmation 2 — Vrai/Faux
    this.formEx21 = this.fb.group({
      answer: [null]
    });

    // EX22 — ASSIFEP Test 8 (ancien EX26)
    // Affirmation 3 — Vrai/Faux
    this.formEx22 = this.fb.group({
      answer: [null]
    });

    // EX23 — ASSIFEP Test 8 (ancien EX27)
    // Affirmation 4 — Vrai/Faux
    this.formEx23 = this.fb.group({
      answer: [null]
    });

    // EX24 — ASSIFEP Test 8 (ancien EX28)
    // Affirmation 5 — Vrai/Faux
    this.formEx24 = this.fb.group({
      answer: [null]
    });
  }

  // ======================================================

  // NAVIGATION
  // ======================================================

  next(): void {

    this.clearTimers();

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.startTimer();
      return;
    }

    // Dernier exercice : les réponses ont été enregistrées.
    this.showFinalMessage = true;
  }

  // ======================================================
  // SOUMISSIONS / SCORING AUTOMATIQUE
  // ======================================================

  submitEx1(): void {

    this.alreadySubmitted = true;

    const answer = this.toNumber(this.formEx1.value.answer);
    const score = answer === this.correctAnswerEx1 ? 2 : 0;

    this.saveExercise('ex1', this.formEx1, score);
  }

  submitEx2(): void {

    this.alreadySubmitted = true;

    const answer = this.toNumber(this.formEx2.value.answer);
    const score = answer === this.correctAnswerEx2 ? 2 : 0;

    this.saveExercise('ex2', this.formEx2, score);
  }

  submitEx3(): void {

    this.alreadySubmitted = true;

    const answer = this.toNumber(this.formEx3.value.answer);
    const score = answer === this.correctAnswerEx3 ? 2 : 0;

    this.saveExercise('ex3', this.formEx3, score);
  }

  submitEx4(): void {

    this.alreadySubmitted = true;

    let score = 0;
    const answers = this.formEx4.value;

    if (this.toNumber(answers.answer1) === this.correctAnswerEx4.answer1) score++;
    if (this.toNumber(answers.answer2) === this.correctAnswerEx4.answer2) score++;
    if (this.toNumber(answers.answer3) === this.correctAnswerEx4.answer3) score++;
    if (this.toNumber(answers.answer4) === this.correctAnswerEx4.answer4) score++;

    // La case entre 22 et 52 vaut provisoirement 30,
    // avec le signe "+" destiné à être porté par l'interface.
    if (this.toNumber(answers.operation) === this.correctAnswerEx4.operation) score++;

    if (this.toNumber(answers.answer5) === this.correctAnswerEx4.answer5) score++;
    if (this.toNumber(answers.answer6) === this.correctAnswerEx4.answer6) score++;
    if (this.toNumber(answers.answer7) === this.correctAnswerEx4.answer7) score++;

    this.saveExercise('ex4', this.formEx4, score);
  }

  // ======================================================
  // ÉTAPE 3 — SOUMISSIONS / SCORING AUTOMATIQUE
  // EX1 à EX4 inchangés ; EX22 en réserve (aucun submit).
  // Chaque méthode utilise les correctAnswers consolidés.
  // ======================================================

  // ------------------------------------------------------
  // EX5 — ASSIFEP Test 4 : division de 1 200 colis sur 6 palettes
  // ------------------------------------------------------
  submitEx5(): void {
    if (this.alreadySubmitted) return;

    const answer = this.toNumber(this.formEx5.value.answer);
    const score = answer === this.correctAnswerEx5 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex5', this.formEx5, score);
  }

  // ------------------------------------------------------
  // EX6 — PRO-FORMATION (ancien EX5) : quatre associations objet / unité de masse
  // ------------------------------------------------------
  submitEx6(): void {
    if (this.alreadySubmitted) return;

    // Un point par correspondance correcte, dans la limite du maxScore.
    const answers = this.formEx6.value;
    let score = 0;

    for (const item of this.ex6Items) {
      if (answers[`answer${item.id}`] === this.correctAnswersEx6[item.id]) {
        score++;
      }
    }

    this.alreadySubmitted = true;
    this.saveExercise('ex6', this.formEx6, score);
  }

  // ------------------------------------------------------
  // EX7 — PRO-FORMATION (ancien EX6) : cocher les unités de longueur
  // ------------------------------------------------------
  submitEx7(): void {
    if (this.alreadySubmitted) return;

    // +1 par unité de longueur cochée, -1 par distracteur coché.
    // Score borné à [0, 5] conformément au cadrage du barème.
    const answers = this.formEx7.value;
    let score = 0;

    for (const option of this.ex7Options) {
      if (answers[option.value] === true) {
        score += this.correctAnswersEx7.includes(option.value) ? 1 : -1;
      }
    }

    score = Math.max(0, Math.min(5, score));

    this.alreadySubmitted = true;
    this.saveExercise('ex7', this.formEx7, score);
  }

  // ------------------------------------------------------
  // EX8 — PRO-FORMATION (ancien EX7) : six associations grandeur / mesure
  // ------------------------------------------------------
  submitEx8(): void {
    if (this.alreadySubmitted) return;

    // Un point par correspondance correcte, dans la limite du maxScore.
    const answers = this.formEx8.value;
    let score = 0;

    for (const item of this.ex8Items) {
      if (answers[`answer${item.id}`] === this.correctAnswersEx8[item.id]) {
        score++;
      }
    }

    this.alreadySubmitted = true;
    this.saveExercise('ex8', this.formEx8, score);
  }

  // ------------------------------------------------------
  // EX9 — PRO-FORMATION (ancien EX8) : trois conversions de longueur à choix multiples
  // ------------------------------------------------------
  submitEx9(): void {
    if (this.alreadySubmitted) return;

    // Une bonne réponse par conversion, maximum 3 points.
    const answers = this.formEx9.value;
    let score = 0;

    for (const item of this.ex9Items) {
      if (answers[`answer${item.id}`] === this.correctAnswersEx9[item.id]) {
        score++;
      }
    }

    this.alreadySubmitted = true;
    this.saveExercise('ex9', this.formEx9, score);
  }

  // ------------------------------------------------------
  // EX10 — PRO-FORMATION (ancien EX9) : trois conversions de capacités
  // ------------------------------------------------------
  submitEx10(): void {
    if (this.alreadySubmitted) return;

    // Un point par conversion numérique correcte, maximum 3 points.
    const answers = this.formEx10.value;
    let score = 0;

    if (this.toNumber(answers.answer1) === this.correctAnswersEx10.answer1) score++;
    if (this.toNumber(answers.answer2) === this.correctAnswersEx10.answer2) score++;
    if (this.toNumber(answers.answer3) === this.correctAnswersEx10.answer3) score++;

    this.alreadySubmitted = true;
    this.saveExercise('ex10', this.formEx10, score);
  }

  // ------------------------------------------------------
  // EX11 — ASSIFEP Test 5 : 1 300 g vers kg
  // ------------------------------------------------------
  // submitEx11(): void {
  //   if (this.alreadySubmitted) return;

  //   const answer = this.toNumber(this.formEx11.value.answer);
  //   const score = answer === this.correctAnswerEx11 ? 1 : 0;

  //   this.alreadySubmitted = true;
  //   this.saveExercise('ex11', this.formEx11, score);
  // }

  
  // ------------------------------------------------------
  // EX11 — ASSIFEP Test 5 REFACTO : quatre conversions de masse
  // Regroupement des anciens EX11 à EX14
  // 1 point par réponse correcte — maximum 4 points
  // ------------------------------------------------------
  submitEx11(): void {
    if (this.alreadySubmitted) return;

    const answers = this.formEx11.value;
    let score = 0;

    if (this.toNumber(answers.answer1) === this.correctAnswersEx11.answer1) score++;
    if (this.toNumber(answers.answer2) === this.correctAnswersEx11.answer2) score++;
    if (this.toNumber(answers.answer3) === this.correctAnswersEx11.answer3) score++;
    if (this.toNumber(answers.answer4) === this.correctAnswersEx11.answer4) score++;

    this.alreadySubmitted = true;
    this.saveExercise('ex11', this.formEx11, score);
  }


  
  // ------------------------------------------------------
  // EX12 — PRO-FORMATION (ancien EX15)
  // Cinq associations image / forme géométrique
  // ------------------------------------------------------
  submitEx12(): void {
    if (this.alreadySubmitted) return;

    // Un point par bonne association, maximum 5 points.
    const answers = this.formEx12.value;
    let score = 0;

    for (const item of this.ex12Items) {
      if (answers[`answer${item.id}`] === this.correctAnswersEx12[item.id]) {
        score++;
      }
    }

    this.alreadySubmitted = true;
    this.saveExercise('ex12', this.formEx12, score);
  }

  // ------------------------------------------------------
  // EX13 — PRO-FORMATION (ancien EX16)
  // Périmètre du carré : formule
  // ------------------------------------------------------
  submitEx13(): void {
    if (this.alreadySubmitted) return;

    // Choix unique : comparer la valeur, pas le libellé affiché.
    const answer = this.formEx13.value.answer;
    const score = answer === this.correctAnswerEx13 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex13', this.formEx13, score);
  }

  // ------------------------------------------------------
  // EX14 — PRO-FORMATION (ancien EX17)
  // Périmètre du rectangle : formule
  // ------------------------------------------------------
  submitEx14(): void {
    if (this.alreadySubmitted) return;

    // Choix unique : comparer la valeur, pas le libellé affiché.
    const answer = this.formEx14.value.answer;
    const score = answer === this.correctAnswerEx14 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex14', this.formEx14, score);
  }

  // ------------------------------------------------------
  // EX15 — PRO-FORMATION (ancien EX18)
  // Périmètre du triangle
  // ------------------------------------------------------
  submitEx15(): void {
    if (this.alreadySubmitted) return;

    const answer = this.toNumber(this.formEx15.value.answer);
    const score = answer === this.correctAnswerEx15 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex15', this.formEx15, score);
  }

  // ------------------------------------------------------
  // EX16 — ASSIFEP Test 6 (ancien EX19)
  // Surface de la palette en m²
  // ------------------------------------------------------
  submitEx16(): void {
    if (this.alreadySubmitted) return;

    const answer = this.toNumber(this.formEx16.value.answer);
    const score = answer === this.correctAnswerEx16 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex16', this.formEx16, score);
  }

  // ------------------------------------------------------
  // EX17 — ASSIFEP Test 6 (ancien EX20)
  // Surface de la remorque en m²
  // ------------------------------------------------------
  submitEx17(): void {
    if (this.alreadySubmitted) return;

    const answer = this.toNumber(this.formEx17.value.answer);
    const score = answer === this.correctAnswerEx17 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex17', this.formEx17, score);
  }

  // ------------------------------------------------------
  // EX18 — ASSIFEP Test 6 (ancien EX21)
  // Volume de la remorque en m³
  // ------------------------------------------------------
  submitEx18(): void {
    if (this.alreadySubmitted) return;

    const answer = this.toNumber(this.formEx18.value.answer);
    const score = answer === this.correctAnswerEx18 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex18', this.formEx18, score);
  }

  // ------------------------------------------------------
  // EX19 — ASSIFEP Test 7 (ancien EX23)
  // Voix obtenues par la liste B
  // ------------------------------------------------------
  submitEx19(): void {
    if (this.alreadySubmitted) return;

    const answer = this.toNumber(this.formEx19.value.answer);
    const score = answer === this.correctAnswerEx19 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex19', this.formEx19, score);
  }

  // ------------------------------------------------------
  // EX20 — ASSIFEP Test 8 (ancienne affirmation EX24)
  // Affirmation 1 : choix Vrai / Faux
  // ------------------------------------------------------
  submitEx20(): void {
    if (this.alreadySubmitted) return;

    // Une réponse non sélectionnée (null) ne rapporte aucun point.
    // Accepte les booléens ou les chaînes transmises par des radios HTML.
    const raw = this.formEx20.value.answer;
    const answer: boolean | null = (raw === true || raw === 'true')
      ? true
      : (raw === false || raw === 'false')
        ? false
        : null;

    const score = answer !== null && answer === this.correctAnswerEx20 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex20', this.formEx20, score);
  }

  // ------------------------------------------------------
  // EX21 — ASSIFEP Test 8 (ancienne affirmation EX25)
  // Affirmation 2 : choix Vrai / Faux
  // ------------------------------------------------------
  submitEx21(): void {
    if (this.alreadySubmitted) return;

    // Une réponse non sélectionnée (null) ne rapporte aucun point.
    // Accepte les booléens ou les chaînes transmises par des radios HTML.
    const raw = this.formEx21.value.answer;
    const answer: boolean | null = (raw === true || raw === 'true')
      ? true
      : (raw === false || raw === 'false')
        ? false
        : null;

    const score = answer !== null && answer === this.correctAnswerEx21 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex21', this.formEx21, score);
  }

  // ------------------------------------------------------
  // EX22 — ASSIFEP Test 8 (ancienne affirmation EX26)
  // Affirmation 3 : choix Vrai / Faux
  // ------------------------------------------------------
  submitEx22(): void {
    if (this.alreadySubmitted) return;

    // Une réponse non sélectionnée (null) ne rapporte aucun point.
    // Accepte les booléens ou les chaînes transmises par des radios HTML.
    const raw = this.formEx22.value.answer;
    const answer: boolean | null = (raw === true || raw === 'true')
      ? true
      : (raw === false || raw === 'false')
        ? false
        : null;

    const score = answer !== null && answer === this.correctAnswerEx22 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex22', this.formEx22, score);
  }

  // ------------------------------------------------------
  // EX23 — ASSIFEP Test 8 (ancienne affirmation EX27)
  // Affirmation 4 : choix Vrai / Faux
  // ------------------------------------------------------
  submitEx23(): void {
    if (this.alreadySubmitted) return;

    // Une réponse non sélectionnée (null) ne rapporte aucun point.
    // Accepte les booléens ou les chaînes transmises par des radios HTML.
    const raw = this.formEx23.value.answer;
    const answer: boolean | null = (raw === true || raw === 'true')
      ? true
      : (raw === false || raw === 'false')
        ? false
        : null;

    const score = answer !== null && answer === this.correctAnswerEx23 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex23', this.formEx23, score);
  }

  // ------------------------------------------------------
  // EX24 — ASSIFEP Test 8 (ancienne affirmation EX28)
  // Affirmation 5 : choix Vrai / Faux
  // ------------------------------------------------------
  submitEx24(): void {
    if (this.alreadySubmitted) return;

    // Une réponse non sélectionnée (null) ne rapporte aucun point.
    // Accepte les booléens ou les chaînes transmises par des radios HTML.
    const raw = this.formEx24.value.answer;
    const answer: boolean | null = (raw === true || raw === 'true')
      ? true
      : (raw === false || raw === 'false')
        ? false
        : null;

    const score = answer !== null && answer === this.correctAnswerEx24 ? 1 : 0;

    this.alreadySubmitted = true;
    this.saveExercise('ex24', this.formEx24, score);
  }






  private saveExercise(
    exId: string,
    form: FormGroup,
    score: number
  ): void {

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      'unit4',
      exId,
      form,
      score,
      category
    );

    this.aggregate(category, score);
    this.next();
  }

  /**
   * Accepte aussi bien "4.25" que "4,25".
   * Une saisie vide/non numérique renvoie NaN et ne peut donc
   * pas être considérée comme une bonne réponse.
   */
  private toNumber(value: unknown): number {

    if (value === null || value === undefined) return NaN;

    const normalized = String(value)
      .trim()
      .replace(',', '.')
      .replace(/\s/g, '');

    if (normalized === '') return NaN;

    return Number(normalized);
  }

  // ======================================================
  // CATÉGORIE / AGRÉGATION
  // ======================================================

  getCurrentCategory(): string {
    return this.steps[this.currentStep]?.category || '';
  }

  aggregate(category: string, score: number): void {

    if (this.aggregateState[category] === undefined) {
      this.aggregateState[category] = 0;
    }

    this.aggregateState[category] += score;

    localStorage.setItem(
      'unit4_aggregation',
      JSON.stringify(this.aggregateState)
    );
  }

  rebuildAggregateFromUnitData(): void {

    const rebuilt: Record<string, number> = {};

    this.steps.forEach(step => {

      const key = `units.unit4.${step.id}`;
      const exerciseData = this.unitData?.[key];

      if (!exerciseData?.submitted) return;

      const category = step.category;
      const score = Number(exerciseData.score) || 0;

      if (rebuilt[category] === undefined) {
        rebuilt[category] = 0;
      }

      rebuilt[category] += score;
    });

    this.aggregateState = rebuilt;

    localStorage.setItem(
      'unit4_aggregation',
      JSON.stringify(this.aggregateState)
    );
  }

  // ======================================================
  // TIMER
  // ======================================================

  startTimer(): void {

    const step = this.steps[this.currentStep];

    if (!step?.duration || this.isReferentView) {
      this.progress = 0;
      this.clearTimers();
      return;
    }

    this.clearTimers();

    this.alreadySubmitted = false;
    this.progress = 0;

    const total = step.duration;
    let elapsed = 0;

    this.intervalId = setInterval(() => {

      elapsed++;

      this.progress = Math.min((elapsed / total) * 100, 100);

      if (elapsed >= total) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

    }, 1000);

    this.timerId = setTimeout(() => {
      this.submitCurrent();
    }, total * 1000);
  }

  clearTimers(): void {

    if (this.timerId) clearTimeout(this.timerId);
    if (this.intervalId) clearInterval(this.intervalId);

    this.timerId = null;
    this.intervalId = null;
  }

  // ======================================================
  // ÉTAPE 4 — ROUTAGE DES SOUMISSIONS (timer et validation)
  // Par ID de steps[] : ne jamais confondre indice et n° EX.
  // EX22 est en réserve ; après EX21, l'étape suivante est EX23.
  // ======================================================
  submitCurrent(): void {
    if (this.alreadySubmitted) return;

    const exId = this.steps[this.currentStep]?.id;

    switch (exId) {
      case 'ex1': this.submitEx1(); break;
      case 'ex2': this.submitEx2(); break;
      case 'ex3': this.submitEx3(); break;
      case 'ex4': this.submitEx4(); break;
      case 'ex5': this.submitEx5(); break;
      case 'ex6': this.submitEx6(); break;
      case 'ex7': this.submitEx7(); break;
      case 'ex8': this.submitEx8(); break;
      case 'ex9': this.submitEx9(); break;
      case 'ex10': this.submitEx10(); break;
      case 'ex11': this.submitEx11(); break;
      case 'ex12': this.submitEx12(); break;
      case 'ex13': this.submitEx13(); break;
      case 'ex14': this.submitEx14(); break;
      case 'ex15': this.submitEx15(); break;
      case 'ex16': this.submitEx16(); break;
      case 'ex17': this.submitEx17(); break;
      case 'ex18': this.submitEx18(); break;
      case 'ex19': this.submitEx19(); break;
      case 'ex20': this.submitEx20(); break;
      case 'ex21': this.submitEx21(); break;
      case 'ex23': this.submitEx23(); break;
      case 'ex24': this.submitEx24(); break;

      default:
        console.warn(`Aucune soumission associée à l'étape : ${exId ?? 'inconnue'}`);
        break;
    }
  }

  // ======================================================
  // ÉTAT / REPRISE
  // ======================================================

  get isStudent(): boolean {
    return this.userRole === 'student';
  }

  get isNotAuthenticated(): boolean {
    return !this.uid;
  }

  get isEditable(): boolean {
    return this.userRole === 'student';
  }

  isSubmitted(exId: string): boolean {
    return this.unitData?.[`units.unit4.${exId}`]?.submitted ?? false;
  }

  syncStep(): void {

    while (this.currentStep < this.steps.length) {

      const step = this.steps[this.currentStep];

      if (!this.isSubmitted(step.id)) {
        break;
      }

      this.currentStep++;
    }

    // Tous les exercices sont déjà soumis.
    if (this.currentStep >= this.steps.length) {
      this.currentStep = this.steps.length - 1;
      this.showFinalMessage = true;
      this.clearTimers();
      return;
    }

    this.startTimer();
  }

  // ======================================================
  // CHARGEMENT / PATCH DES FORMULAIRES
  // ======================================================

  loadData(): void {

    this.service.getUnit(this.uid).subscribe(data => {

      this.unitData = data ?? {};

      this.patchForms();
      this.rebuildAggregateFromUnitData();

      const result = this.unitData?.['units.unit4.result'];

      if (result) {

        if (result.aggregateState) {
          this.aggregateState = result.aggregateState;
        }

        if (result.isFinal || this.aggregateState?.['isFinal']) {
          this.aggregateState['isFinal'] = true;
          this.commentCtrl.disable();
        }
      }
    });
  }

  // ======================================================
  // ÉTAPE 4 — RECHARGEMENT DES RÉPONSES EN VUE RÉFÉRENT
  // Ne recharge que les formulaires des exercices actifs.
  // La clé Firestore reste units.unit4.exN (sans EX22).
  // ======================================================
  patchForms(): void {
    const data = this.unitData;
    if (!data) return;

    this.steps.forEach((step, stepIndex) => {
      const answers = data[`units.unit4.${step.id}`]?.answers;
      const form = this.getFormByStepIndex(stepIndex);

      if (answers && form) {
        form.patchValue(answers);
      }
    });

    // Comportement initial conservé : commentaire du référent.
    if (data['units.unit4.commentReferent']) {
      this.commentCtrl.setValue(data['units.unit4.commentReferent']);
    }
  }

  // ======================================================
  // SCORES / SYNTHÈSE
  // ======================================================

  getCurrentScore(stepIndex: number): number {

    if (this.isReferentView) {

      const exId = this.steps[stepIndex].id;

      return Number(
        this.unitData?.[`units.unit4.${exId}`]?.score
      ) || 0;
    }

    const category = this.getCurrentCategory();

    return Number(this.aggregateState[category]) || 0;
  }

  getCategoryMaxScore(categoryName: string): number | null {

    const categorySteps = this.steps.filter(
      s => s.category === categoryName
    );

    const hasScoredExercise = categorySteps.some(
      s => s.maxScore !== undefined && s.maxScore !== null
    );

    if (!hasScoredExercise) return null;

    return categorySteps.reduce(
      (sum, s) => sum + (s.maxScore || 0),
      0
    );
  }

  roundToHalf(score: number, maxScore: number): number {

    const rawNote = (score / maxScore) * 20;

    return Math.round(rawNote * 2) / 2;
  }

  getGlobalScore(): { obtenu: number; max: number } | null {

    if (!this.aggregateState) return null;

    let totalObtenu = 0;
    let totalMax = 0;
    let hasScoredData = false;

    this.categories.forEach(category => {

      const scoreValue = this.aggregateState[category];
      const maxScore = this.getCategoryMaxScore(category);

      if (
        scoreValue !== undefined &&
        scoreValue !== null &&
        maxScore !== null
      ) {
        totalObtenu += Number(scoreValue) || 0;
        totalMax += maxScore;
        hasScoredData = true;
      }
    });

    return hasScoredData
      ? { obtenu: totalObtenu, max: totalMax }
      : null;
  }

  getGlobalNoteOn20(): number | null {

    const globalScore = this.getGlobalScore();

    if (!globalScore || globalScore.max === 0) return null;

    const rawNote =
      (globalScore.obtenu / globalScore.max) * 20;

    return Math.round(rawNote * 2) / 2;
  }

  // ======================================================
  // CORRECTION RÉFÉRENT
  // ======================================================

  editStepScore(stepIndex: number): void {

    if (
      !this.isReferentView ||
      this.aggregateState?.['isFinal']
    ) return;

    const step = this.steps[stepIndex];

    if (!step) return;

    const exId = step.id;
    const max = step.maxScore;

    if (max === undefined || max === null) return;

    const currentScore = this.getCurrentScore(stepIndex);

    const response = prompt(
      `Note pour l'Exercice ${stepIndex + 1} (Max : ${max} pts) :`,
      currentScore.toString()
    );

    if (response === null || response.trim() === '') return;

    const parsedScore = parseFloat(response);

    if (
      isNaN(parsedScore) ||
      parsedScore < 0 ||
      parsedScore > max
    ) {
      alert(`Veuillez entrer une note valide entre 0 et ${max}.`);
      return;
    }

    const key = `units.unit4.${exId}`;

    if (!this.unitData[key]) {
      this.unitData[key] = {};
    }

    this.unitData[key].score = parsedScore;

    const categoryName = step.category;

    let categoryTotal = 0;

    this.steps.forEach(s => {

      if (s.category !== categoryName) return;

      const exKey = `units.unit4.${s.id}`;

      const score =
        s.id === exId
          ? parsedScore
          : Number(this.unitData[exKey]?.score) || 0;

      categoryTotal += score;
    });

    this.aggregateState[categoryName] = categoryTotal;

    this.unitData = { ...this.unitData };
    this.aggregateState = { ...this.aggregateState };

    const formGroup = this.getFormByStepIndex(stepIndex);

    if (!formGroup) {
      console.warn(`Aucun formulaire pour le step ${stepIndex}`);
      return;
    }

    this.service.saveUnitFlat(
      this.uid,
      'unit4',
      exId,
      formGroup,
      parsedScore,
      categoryName
    );

    this.service.saveUnitResultUpdate(
      this.uid,
      'unit4',
      this.aggregateState
    )
      .then(() => {
        console.log(
          `✅ Score Ex ${stepIndex + 1} (${exId}) mis à jour.`
        );
      })
      .catch(err => {
        console.error('Erreur Firestore :', err);
        alert("Erreur lors de l'enregistrement.");
      });
  }

  editCategoryScore(categoryName: string): void {

    if (
      !this.isReferentView ||
      this.aggregateState?.['isFinal']
    ) return;

    const maxPoints = this.getCategoryMaxScore(categoryName);

    if (maxPoints === null || maxPoints === 0) {
      alert(
        `Impossible de récupérer le score maximum pour "${categoryName}".`
      );
      return;
    }

    const currentPoints =
      this.aggregateState[categoryName] ?? '';

    const response = prompt(
      `Entrez le score brut pour "${categoryName}" (Maximum : ${maxPoints} points) :`,
      currentPoints.toString()
    );

    if (response === null) return;

    const parsedScore = parseFloat(response);

    if (
      isNaN(parsedScore) ||
      parsedScore < 0 ||
      parsedScore > maxPoints
    ) {
      alert(
        `Veuillez entrer un score valide entre 0 et ${maxPoints}.`
      );
      return;
    }

    this.aggregateState[categoryName] = parsedScore;

    this.service.saveUnitResultUpdate(
      this.uid,
      'unit4',
      this.aggregateState
    )
      .catch(err => {
        console.error('Erreur Firestore :', err);
        alert("Erreur lors de l'enregistrement.");
      });
  }


  // ======================================================
  // ÉTAPE 4 — FORMULAIRE LIÉ À L'EXERCICE ACTIF
  // stepIndex est un indice 0..26, pas le numéro de l'exercice.
  // Attention : après EX21, index 21 => EX23.
  // ======================================================
  private getFormByStepIndex(stepIndex: number): FormGroup | null {
    const exId = this.steps[stepIndex]?.id;

    switch (exId) {
      case 'ex1': return this.formEx1;
      case 'ex2': return this.formEx2;
      case 'ex3': return this.formEx3;
      case 'ex4': return this.formEx4;
      case 'ex5': return this.formEx5;
      case 'ex6': return this.formEx6;
      case 'ex7': return this.formEx7;
      case 'ex8': return this.formEx8;
      case 'ex9': return this.formEx9;
      case 'ex10': return this.formEx10;
      case 'ex11': return this.formEx11;
      case 'ex12': return this.formEx12;
      case 'ex13': return this.formEx13;
      case 'ex14': return this.formEx14;
      case 'ex15': return this.formEx15;
      case 'ex16': return this.formEx16;
      case 'ex17': return this.formEx17;
      case 'ex18': return this.formEx18;
      case 'ex19': return this.formEx19;
      case 'ex20': return this.formEx20;
      case 'ex21': return this.formEx21;
      case 'ex23': return this.formEx23;
      case 'ex24': return this.formEx24;
      case 'ex25': return this.formEx25;
      case 'ex26': return this.formEx26;
      case 'ex27': return this.formEx27;
      case 'ex28': return this.formEx28;
      default: return null;
    }
  }

  // ======================================================
  // COMMENTAIRE / CLÔTURE / IMPRESSION
  // ======================================================

  saveCommentReferent(): void {

    if (this.aggregateState?.['isFinal']) return;

    const texte = this.commentCtrl.value?.trim() || '';

    this.service.updateUnitComment(
      this.uid,
      'unit4',
      texte
    );
  }

  async cloturerEvaluation(): Promise<void> {

    if (
      !this.isReferentView ||
      this.aggregateState?.['isFinal']
    ) return;

    const texteFinal =
      this.commentCtrl.value?.trim() || '';

    const noteFinale =
      Number(this.getGlobalNoteOn20()) || 0;

    await this.service.finalizeUnit(
      this.uid,
      'unit4',
      this.aggregateState,
      noteFinale,
      this.label,
      texteFinal
    );

    this.aggregateState['isFinal'] = true;
    this.commentCtrl.disable();

    alert('✅ Évaluation clôturée.');
  }

  printPage(): void {

    const originalTitle = document.title;

    const safeLabel = this.label
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    document.title =
      `BE-ON-TOP_Evaluation_${safeLabel}_${this.uid}`;

    window.print();

    document.title = originalTitle;
  }

  // ======================================================
  // IDENTITÉ CANDIDAT
  // ======================================================

  getCandidateIdentity(uid: string): void {

    this.service.getStudentById(uid).subscribe(data => {

      if (!data) return;

      this.firstName = data.firstName;
      this.lastName = data.lastName;
    });
  }
}
