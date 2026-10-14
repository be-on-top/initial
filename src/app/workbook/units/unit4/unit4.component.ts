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


  currentStep = 0;

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

    // ASSIFEP — Test 5 : 1 300 g en kg

    { id: 'ex11', category: this.categories[1], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 5 : 500 kg en tonnes

    { id: 'ex12', category: this.categories[1], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 5 : 1,75 t en kg

    { id: 'ex13', category: this.categories[1], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 5 : 3 kg en grammes

    { id: 'ex14', category: this.categories[1], duration: 100, maxScore: 1 },

    // PRO-FORMATION — ancien EX10 : formes géométriques

    { id: 'ex15', category: this.categories[2], duration: 150, maxScore: 5 },

    // PRO-FORMATION — ancien EX11 : périmètre carré

    { id: 'ex16', category: this.categories[2], duration: 100, maxScore: 1 },

    // PRO-FORMATION — ancien EX12 : périmètre rectangle

    { id: 'ex17', category: this.categories[2], duration: 100, maxScore: 1 },

    // PRO-FORMATION — ancien EX13 : périmètre triangle

    { id: 'ex18', category: this.categories[2], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 6 : surface palette

    { id: 'ex19', category: this.categories[2], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 6 : surface remorque

    { id: 'ex20', category: this.categories[2], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 6 : volume remorque

    { id: 'ex21', category: this.categories[2], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 7 : voix liste B

    { id: 'ex23', category: this.categories[3], duration: 150, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 1

    { id: 'ex24', category: this.categories[3], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 2

    { id: 'ex25', category: this.categories[3], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 3

    { id: 'ex26', category: this.categories[3], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 4

    { id: 'ex27', category: this.categories[3], duration: 100, maxScore: 1 },

    // ASSIFEP — Test 8 : affirmation 5

    { id: 'ex28', category: this.categories[3], duration: 100, maxScore: 1 }

  ];

  // ======================================================

  // FORMULAIRES

  // ======================================================

  formEx1!: FormGroup;

  formEx2!: FormGroup;

  formEx3!: FormGroup;

  formEx4!: FormGroup;

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

  // EX15 — PRO-FORMATION (ancien EX10)

  // Associer un objet à une forme géométrique

  // 5 images — 5 selects — score maximal : 5 points

  // ======================================================

  // Les images définitives seront intégrées au template.

  // Ordre de présentation figé pour la correction automatique.
  // Les fichiers d'images devront représenter les objets indiqués.

  ex15Items = [

    { id: 1, label: 'Réfrigérateur', image: 'assets/img/unit4/forme1.webp' },

    { id: 2, label: 'Panier', image: 'assets/img/unit4/forme2.webp' },

    { id: 3, label: 'Ballon', image: 'assets/img/unit4/forme3.webp' },

    { id: 4, label: 'Dés', image: 'assets/img/unit4/forme4.webp' },

    { id: 5, label: 'Guirlande triangulaire', image: 'assets/img/unit4/forme5.webp' }

  ];

  // Options communes aux cinq listes déroulantes.

  ex15Options = [

    { value: 'rectangle', label: 'Rectangle' },

    { value: 'trapeze', label: 'Trapèze' },

    { value: 'cercle', label: 'Cercle' },

    { value: 'carre', label: 'Carré' },

    { value: 'triangle', label: 'Triangle' }

  ];

  // Réponses attendues — correction automatique.

  correctAnswersEx15: { [key: number]: string } = {

    1: 'rectangle', // Réfrigérateur

    2: 'trapeze',   // Panier

    3: 'cercle',    // Ballon

    4: 'carre',     // Dés

    5: 'triangle'   // Guirlande triangulaire

  };

  // ------------------------------------------------------

  // EX16 — PRO-FORMATION (ancien EX11) : périmètre d'un carré

  // ------------------------------------------------------

  ex16Options = [

    { value: 'cote_cote', label: 'côté × côté' },

    { value: 'cote_4', label: 'côté × 4' },

    { value: '4_4', label: '4 × 4' }

  ];

  correctAnswerEx16 = 'cote_4';

  // ------------------------------------------------------

  // EX17 — PRO-FORMATION (ancien EX12) : périmètre d'un rectangle

  // ------------------------------------------------------

  ex17Options = [

    { value: 'l_plus_l_fois_2', label: '(L + l) × 2' },

    { value: 'l_fois_l', label: 'L × l' },

    { value: 'l_fois_4', label: 'L × 4' }

  ];

  correctAnswerEx17 = 'l_plus_l_fois_2';

  // ------------------------------------------------------

  // EX18 — PRO-FORMATION (ancien EX13) : périmètre du triangle

  // 3,20 + 4 + 7 = 14,20 m

  // ------------------------------------------------------

  correctAnswerEx18 = 14.2;

  // ======================================================

  // ASSIFEP — DONNÉES ET RÉPONSES ATTENDUES (CONSOLIDATION)

  // Chaque question autonome ASSIFEP a son propre identifiant.
  // Ce bloc ne fait que préparer les réponses : pas de nouveaux submits.

  // ======================================================

  // ASSIFEP Test 4 — EX5 : 1 200 colis répartis sur 6 palettes.

  correctAnswerEx5 = 200;

  // ASSIFEP Test 5 — EX11 à EX14 : conversions de masse.

  // Une conversion = un exercice ; saisie numérique prévue.

  correctAnswerEx11 = 1.3;   // 1 300 g = 1,3 kg

  correctAnswerEx12 = 0.5;   // 500 kg = 0,5 t

  correctAnswerEx13 = 1750;  // 1,75 t = 1 750 kg

  correctAnswerEx14 = 3000;  // 3 kg = 3 000 g

  // ASSIFEP Test 6 — Schéma commun : palette 1,20 m × 0,80 m,

  // remorque 13,50 m × 2,44 m, hauteur 4 m.

  // EX19 : surface palette, EX20 : surface remorque,

  // EX21 : volume remorque.

  correctAnswerEx19 = 0.96;   // m²

  correctAnswerEx20 = 32.94;  // m²

  correctAnswerEx21 = 131.76; // m³

  // ASSIFEP Test 6 — EX22 EN RÉSERVE : aucune réponse automatique.

  // L'énoncé ne précise pas les conditions d'empilement des palettes.

  // Exercice volontairement absent de steps[] (navigation et barème).

  // ASSIFEP Test 7 — EX23 : liste A = 40 % = 150 voix ; liste B = 60 %.

  correctAnswerEx23 = 225;

  // ASSIFEP Test 8 — EX24 à EX28 : choix Vrai/Faux uniquement.

  // Une affirmation = un exercice. Pas de champ justification.

  correctAnswerEx24 = false; // 4/200 = 2 %, objectif strictement < 2 %

  correctAnswerEx25 = false; // 250/300 < 85 %, minimum 255

  correctAnswerEx26 = false; // 2 femmes sur 5 suffisent à 40 %

  correctAnswerEx27 = true;  // 22/25 = 88 % >= 85 %

  correctAnswerEx28 = false; // 45/2250 = 2 %, maximum 44


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
  // INITIALISATION DES FORMULAIRES
  // ======================================================

  initForms(): void {

    this.formEx1 = this.fb.group({
      answer: ['']
    });

    this.formEx2 = this.fb.group({
      answer: ['']
    });

    this.formEx3 = this.fb.group({
      answer: ['']
    });

    // Exercice 4 :
    // 7 résultats numériques + 1 opération manquante.
    // Pour l'instant "operation" attend la valeur 30.
    // La représentation HTML exacte (+ affiché ou +30 saisi)
    // sera arrêtée lors de la construction du template.
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

  submitCurrent(): void {

    if (this.alreadySubmitted) return;

    switch (this.currentStep) {
      case 0: this.submitEx1(); break;
      case 1: this.submitEx2(); break;
      case 2: this.submitEx3(); break;
      case 3: this.submitEx4(); break;
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

  patchForms(): void {

    const data = this.unitData;

    if (!data) return;

    if (data['units.unit4.ex1']?.answers) {
      this.formEx1.patchValue(data['units.unit4.ex1'].answers);
    }

    if (data['units.unit4.ex2']?.answers) {
      this.formEx2.patchValue(data['units.unit4.ex2'].answers);
    }

    if (data['units.unit4.ex3']?.answers) {
      this.formEx3.patchValue(data['units.unit4.ex3'].answers);
    }

    if (data['units.unit4.ex4']?.answers) {
      this.formEx4.patchValue(data['units.unit4.ex4'].answers);
    }

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

  private getFormByStepIndex(
    stepIndex: number
  ): FormGroup | null {

    switch (stepIndex) {
      case 0: return this.formEx1;
      case 1: return this.formEx2;
      case 2: return this.formEx3;
      case 3: return this.formEx4;
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
