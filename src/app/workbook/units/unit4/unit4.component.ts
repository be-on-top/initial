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
  'Géométrie'
];
  alreadySubmitted = false;

  private intervalId: any = null;
  private timerId: any = null;

  progress = 0;

  aggregateState: Record<string, any> = {};

  // ======================================================
  // ÉTAPES
  // Barèmes et durées PROVISOIRES dans l'attente
  // des documents officiels.
  // ======================================================

  steps: Step[] = [
    { id: 'ex1', category: this.categories[0], duration: 100, maxScore: 2 },
    { id: 'ex2', category: this.categories[0], duration: 100, maxScore: 2 },
    { id: 'ex3', category: this.categories[0], duration: 100, maxScore: 2 },
    { id: 'ex4', category: this.categories[0], duration: 200, maxScore: 8 },

  // PROVISOIRE - Unités de mesure
  { id: 'ex5', category: this.categories[1], duration: 100, maxScore: 4 },
  { id: 'ex6', category: this.categories[1], duration: 100, maxScore: null },
  { id: 'ex7', category: this.categories[1], duration: 150, maxScore: 6 },
  { id: 'ex8', category: this.categories[1], duration: 150, maxScore: 3 },
  { id: 'ex9', category: this.categories[1], duration: 150, maxScore: 3 },

  // PROVISOIRE - Géométrie
  { id: 'ex10', category: this.categories[2], duration: 150, maxScore: 5 },
  { id: 'ex11', category: this.categories[2], duration: 100, maxScore: 1 },
  { id: 'ex12', category: this.categories[2], duration: 100, maxScore: 1 },
  { id: 'ex13', category: this.categories[2], duration: 150, maxScore: 1 }
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
// DONNÉES / RÉPONSES ATTENDUES — EXERCICES 5 À 13
// PROVISOIRE : transposition du support source.
// Référentiel, niveau, barèmes et durées à confirmer.
// ======================================================


// ------------------------------------------------------
// EXERCICE 5 — Bonne unité de masse
// ------------------------------------------------------

// Les chemins d'images seront renseignés lors de la
// réalisation du template.
ex5Items = [
  { id: 1, label: 'Gomme', image: 'assets/img/unit4/gomme.webp' },
  { id: 2, label: 'Oiseau', image: 'assets/img/unit4/oiseau.webp' },
  { id: 3, label: 'Éléphant', image: 'assets/img/unit4/elephant.webp' },
  { id: 4, label: 'Crayon', image: 'assets/img/unit4/crayon.webp' }
];

ex5Options = [
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 't', label: 't' }
];

// À confirmer précisément à partir du support source
// avant implémentation de la correction.
correctAnswersEx5: { [key: number]: string } = {
  1: 'g',
  2: 'g',
  3: 't',
  4: 'g'
};


// ------------------------------------------------------
// EXERCICE 6 — Unités de longueur
// Réinterprétation du nuage sous forme de checkboxes.
// ------------------------------------------------------

ex6Options = [
  { value: 'km', label: 'km' },
  { value: 'dam', label: 'dam' },
  { value: 'dm', label: 'dm' },
  { value: 'cm', label: 'cm' },
  { value: 'mm', label: 'mm' },

  // Fausses propositions issues du nuage source.
  // Liste à ajuster au plus près du document original.
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'mg', label: 'mg' },
  { value: 'l', label: 'l' },
  { value: 'cl', label: 'cl' },
  { value: 'ml', label: 'ml' },
  { value: 'hl', label: 'hl' }
];

correctAnswersEx6 = [
  'km',
  'dam',
  'dm',
  'cm',
  'mm'
];


// ------------------------------------------------------
// EXERCICE 7 — Associer une grandeur à sa mesure
// ------------------------------------------------------

ex7Items = [
  { id: 1, label: 'Tasse à café' },
  { id: 2, label: 'Livre' },
  { id: 3, label: 'Feuille' },
  { id: 4, label: 'Éléphant' },
  { id: 5, label: 'Baignoire' },
  { id: 6, label: 'Voiture' }
];

// Valeurs exactes à reprendre du support source.
// On pose la structure maintenant sans inventer
// les mesures absentes du cadrage fonctionnel.
ex7Options: { value: string; label: string }[] = [];

correctAnswersEx7: { [key: number]: string } = {};


// ------------------------------------------------------
// EXERCICE 8 — Conversions avec choix de réponse
// ------------------------------------------------------

ex8Items = [
  {
    id: 1,
    source: '1 km',
    options: [] as { value: string; label: string }[]
  },
  {
    id: 2,
    source: '36520 mm',
    options: [] as { value: string; label: string }[]
  },
  {
    id: 3,
    source: '54,75 dam',
    options: [] as { value: string; label: string }[]
  }
];

// Les valeurs de conversion et les pièges doivent être
// repris du support avant de figer la correction.
correctAnswersEx8: { [key: number]: string } = {};


// ------------------------------------------------------
// EXERCICE 9 — Conversions de capacités
// Trois champs de saisie.
// ------------------------------------------------------

correctAnswersEx9 = {
  answer1: 1000,      // 1 l -> ml
  answer2: 2594,      // 25,94 dal -> dl
  answer3: 540000     // 54 hl -> cl
};


// ------------------------------------------------------
// EXERCICE 10 — Associer un objet à une forme géométrique
// Une image + un choix pour chaque item.
// ------------------------------------------------------

// Noms et chemins à ajuster aux visuels retenus.
ex10Items = [
  { id: 1, image: 'assets/img/unit4/forme1.webp' },
  { id: 2, image: 'assets/img/unit4/forme2.webp' },
  { id: 3, image: 'assets/img/unit4/forme3.webp' },
  { id: 4, image: 'assets/img/unit4/forme4.webp' },
  { id: 5, image: 'assets/img/unit4/forme5.webp' }
];

ex10Options = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'trapeze', label: 'Trapèze' },
  { value: 'cercle', label: 'Cercle' },
  { value: 'carre', label: 'Carré' },
  { value: 'triangle', label: 'Triangle' }
];

// À raccorder aux images définitives.
correctAnswersEx10: { [key: number]: string } = {};


// ------------------------------------------------------
// EXERCICE 11 — Périmètre d'un carré
// ------------------------------------------------------

ex11Options = [
  { value: 'cote_cote', label: 'côté × côté' },
  { value: 'cote_4', label: 'côté × 4' },
  { value: '4_4', label: '4 × 4' }
];

correctAnswerEx11 = 'cote_4';


// ------------------------------------------------------
// EXERCICE 12 — Périmètre d'un rectangle
// ------------------------------------------------------

ex12Options = [
  { value: 'l_plus_l_fois_2', label: '(L + l) × 2' },
  { value: 'l_fois_l', label: 'L × l' },
  { value: 'l_fois_4', label: 'L × 4' }
];

correctAnswerEx12 = 'l_plus_l_fois_2';


// ------------------------------------------------------
// EXERCICE 13 — Périmètre du triangle
// 3,20 + 4 + 7 = 14,20 m
// ------------------------------------------------------

correctAnswerEx13 = 14.2;




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
