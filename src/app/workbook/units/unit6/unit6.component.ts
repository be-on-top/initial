import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/admin/auth.service';
import { WorkbookService } from '../../workbook.service';
import { WORKBOOK_UNITS } from '../../workbookUnits';

interface Step { id: string; category: string; duration: number; maxScore: number; }

@Component({
  selector: 'app-unit6',
  templateUrl: './unit6.component.html',
  styleUrls: ['./unit6.component.css']
})

export class Unit6Component implements OnInit, OnDestroy {
  private readonly config = WORKBOOK_UNITS.find(unit => unit.id === 'unit6');
  label = this.config?.label || 'Raisonnement logique élémentaire';
  profile = this.config?.profile || 'Profil opérationnel';
  description = this.config?.description || 'Évaluer la logique pratique minimale pour comprendre des consignes et suivre un déroulé pédagogique.';
  
  readonly categories = [
    'Induction (Séries)', 
    'Déduction (Syllogismes)', 
    'Visuo-spatial', 
    'Algorithmique (Procédural)'
  ];

  readonly steps: Step[] = [
    { id: 'ex1', category: this.categories[0], duration: 120, maxScore: 3 }, // Suite numérique
    { id: 'ex2', category: this.categories[0], duration: 120, maxScore: 3 }, // Suite visuelle / symbolique
    { id: 'ex3', category: this.categories[1], duration: 150, maxScore: 3 }, // Syllogisme / Déduction 1
    { id: 'ex4', category: this.categories[1], duration: 150, maxScore: 3 }, // Déduction logique textuelle
    { id: 'ex5', category: this.categories[2], duration: 120, maxScore: 3 }, // Repérage / Orientation spatiale
    { id: 'ex6', category: this.categories[2], duration: 120, maxScore: 3 }, // Correspondance de formes
    { id: 'ex7', category: this.categories[3], duration: 180, maxScore: 4 }, // Algorithme / Ordonnancement de procédure
    { id: 'ex8', category: this.categories[3], duration: 150, maxScore: 3 }  // Arbre de décision simple
  ];

  // Options pour l'exercice 7 (Ordonnancement procédural)
  readonly ex7Labels: Record<string, string> = {
    checkDocs: 'Vérifier les documents de transport',
    loadGoods: 'Charger et caler la marchandise',
    signPaper: 'Faire signer le bon de livraison',
    depart: 'Démarrer la tournée'
  };
  readonly correctEx7 = ['checkDocs', 'loadGoods', 'signPaper', 'depart'];

  // Options des exercices à choix multiples (Radio / Select)
  readonly ex1Options = [
    { value: '10', label: '10' },
    { value: '12', label: '12' },
    { value: '14', label: '14' },
    { value: '16', label: '16' }
  ];

  // readonly ex2Options = [
  //   { value: 'triangle', label: 'Un triangle pointant vers le haut' },
  //   { value: 'square', label: 'Un carré hachuré' },
  //   { value: 'circle', label: 'Un cercle plein' },
  //   { value: 'star', label: 'Une étoile' }
  // ];

  //   readonly ex2Options = [
  //   { value: 'triangle', label: 'Triangle', icon: 'bi-triangle-fill' },
  //   { value: 'square', label: 'Carré', icon: 'bi-square-fill' },
  //   { value: 'circle', label: 'Cercle', icon: 'bi-circle-fill' },
  //   { value: 'star', label: 'Étoile', icon: 'bi-star-fill' }
  // ];

  readonly ex2Options = [
  { value: 'triangle', label: 'Triangle', icon: 'bi-triangle-fill' },
  { value: 'square', label: 'Carré', icon: 'bi-square-fill' },
  { value: 'circle', label: 'Cercle', icon: 'bi-circle-fill' },
  { value: 'star', label: 'Étoile', icon: 'bi-star-fill' }
];

  readonly ex3Options = [
    { value: 'true', label: 'Oui, c’est tout à fait exact' },
    { value: 'false', label: 'Non, on ne peut pas l’affirmer' },
    { value: 'maybe', label: 'C’est possible mais rare' }
  ];

  readonly ex4Options = [
    { value: 'north', label: 'Nord' },
    { value: 'south', label: 'Sud' },
    { value: 'east', label: 'Est' },
    { value: 'west', label: 'Ouest' }
  ];

  readonly ex5Options = [
    { value: 'posA', label: 'Emplacement A (en haut à gauche)' },
    { value: 'posB', label: 'Emplacement B (au centre)' },
    { value: 'posC', label: 'Emplacement C (en bas à droite)' },
    { value: 'posD', label: 'Emplacement D (hors zone)' }
  ];

  // readonly ex6Options = [
  //   { value: 'shape1', label: 'Figure numéro 1' },
  //   { value: 'shape2', label: 'Figure numéro 2' },
  //   { value: 'shape3', label: 'Figure numéro 3' },
  //   { value: 'shape4', label: 'Figure numéro 4' }
  // ];

  readonly ex6Options = [
    { value: 'shape1', label: 'Position 1', rotation: 'rotate(90deg)' },
    { value: 'shape2', label: 'Position 2', rotation: 'rotate(270deg)' },
    { value: 'shape3', label: 'Position 3', rotation: 'rotate(180deg)' },
    { value: 'shape4', label: 'Position 4', rotation: 'rotate(0deg)' }
  ];




  readonly ex8Options = [
    { value: 'stop', label: 'Je m’arrête immédiatement et j’alerte le responsable' },
    { value: 'ignore', label: 'Je continue, ce n’est qu’un faux contact' },
    { value: 'finish', label: 'Je termine ma course puis je regarde' },
    { value: 'call', label: 'J’appelle un collègue le soir' }
  ];

  readonly forms: FormGroup[] = [];
  formEx1!: FormGroup; formEx2!: FormGroup; formEx3!: FormGroup;
  formEx4!: FormGroup; formEx5!: FormGroup; formEx6!: FormGroup;
  formEx7!: FormGroup; formEx8!: FormGroup;

  commentCtrl = new FormControl('');
  uid = ''; lastName = ''; firstName = ''; userRole: string | null = null;
  unitData: any = {}; currentStep = 1; showFinalMessage = false;
  isReferentView = false; alreadySubmitted = false; progress = 0;
  aggregateState: Record<string, any> = {};
  
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private timerId: ReturnType<typeof setTimeout> | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService,
    private service: WorkbookService, private route: ActivatedRoute, private router: Router) {
    this.initForms();
  }

  initForms(): void {
    this.formEx1 = this.fb.group({ answer: [''] });
    this.formEx2 = this.fb.group({ answer: [''] });
    this.formEx3 = this.fb.group({ answer: [''] });
    this.formEx4 = this.fb.group({ answer: [''] });
    this.formEx5 = this.fb.group({ answer: [''] });
    this.formEx6 = this.fb.group({ answer: [''] });
    this.formEx7 = this.fb.group({ order: [['depart', 'loadGoods', 'checkDocs', 'signPaper']] }); // Désordonné initialement
    this.formEx8 = this.fb.group({ answer: [''] });

    this.forms.push(
      this.formEx1, this.formEx2, this.formEx3, this.formEx4, 
      this.formEx5, this.formEx6, this.formEx7, this.formEx8
    );
  }

  ngOnInit(): void {
    const routeUid = this.route.snapshot.paramMap.get('uid');
    if (routeUid) {
      this.uid = routeUid; this.isReferentView = true;
      this.auth.getCurrentUserRole().subscribe(role => {
        if (!role) return;
        const raw = Array.isArray(role) ? role[0] : role;
        const cleaned = String(raw).trim().toLowerCase();
        if (cleaned !== 'admin' && cleaned !== 'referent') {
          this.router.navigate(['/home']); return;
        }
        this.loadData(); this.getCandidateIdentity(this.uid);
      });
      return;
    }
    this.auth.getCurrentUserInfo().subscribe(info => {
      if (!info) { this.uid = ''; this.userRole = null; return; }
      this.userRole = Array.isArray(info.role) ? info.role[0] : info.role;
      this.uid = info.uid;
      if (this.isStudent) {
        this.service.getUnit(this.uid).subscribe(data => {
          this.unitData = data ?? {};
          this.rebuildAggregateFromUnitData();
          this.syncStep();
        });
      }
    });
  }

  ngOnDestroy(): void { this.clearTimers(); }
  get isStudent(): boolean { return this.userRole === 'student'; }
  get isNotAuthenticated(): boolean { return !this.uid; }
  get isEditable(): boolean { return this.isStudent; }
  getCurrentCategory(): string { return this.steps[this.currentStep]?.category || ''; }
  isSubmitted(exId: string): boolean { return !!this.unitData?.[`units.unit6.${exId}`]?.submitted; }

  moveOrder(index: number, direction: number): void {
    if (this.isReferentView) return;
    const order = [...(this.formEx7.value.order as string[])];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    this.formEx7.patchValue({ order });
  }

  getOrder(): string[] {
    return this.formEx7.value.order || [];
  }

  private countOrder(order: string[], correct: string[]): number {
    return correct.reduce((sum, value, i) => sum + (order?.[i] === value ? 1 : 0), 0);
  }

  // SOUMISSIONS PAR EXERCICE
  submitEx1(): void {
    const score = this.formEx1.value.answer === '12' ? this.steps[0].maxScore : 0;
    this.saveExercise(0, score);
  }

  submitEx2(): void {
    const score = this.formEx2.value.answer === 'square' ? this.steps[1].maxScore : 0;
    this.saveExercise(1, score);
  }

  submitEx3(): void {
    const score = this.formEx3.value.answer === 'true' ? this.steps[2].maxScore : 0;
    this.saveExercise(2, score);
  }

  submitEx4(): void {
    const score = this.formEx4.value.answer === 'north' ? this.steps[3].maxScore : 0;
    this.saveExercise(3, score);
  }

  submitEx5(): void {
    const score = this.formEx5.value.answer === 'posB' ? this.steps[4].maxScore : 0;
    this.saveExercise(4, score);
  }

  submitEx6(): void {
    const score = this.formEx6.value.answer === 'shape3' ? this.steps[5].maxScore : 0;
    this.saveExercise(5, score);
  }

  submitEx7(): void {
    const correctCount = this.countOrder(this.formEx7.value.order, this.correctEx7);
    const score = (correctCount / this.correctEx7.length) * this.steps[6].maxScore;
    this.saveExercise(6, score);
  }

  submitEx8(): void {
    if (this.alreadySubmitted || this.showFinalMessage || !this.isStudent) return;

    const score = this.formEx8.value.answer === 'stop' ? this.steps[7].maxScore : 0;
    this.saveExercise(7, score);

    // Clôture et enregistrement global de l'unité 6
    this.service.saveUnitResult(
      this.uid,
      'unit6',
      this.aggregateState
    ).catch(err => {
      console.error("Erreur d'enregistrement de la synthèse :", err);
      alert("Erreur lors de l'enregistrement des résultats.");
    });
  }

  submitCurrent(): void {
    if (this.alreadySubmitted || this.showFinalMessage || !this.isStudent) return;
    const handlers = [
      () => this.submitEx1(), () => this.submitEx2(), 
      () => this.submitEx3(), () => this.submitEx4(),
      () => this.submitEx5(), () => this.submitEx6(), 
      () => this.submitEx7(), () => this.submitEx8()
    ];
    handlers[this.currentStep]?.call(this);
  }

  private saveExercise(index: number, score: number): void {
    if (this.alreadySubmitted || this.showFinalMessage || !this.isStudent) return;
    this.alreadySubmitted = true;
    const step = this.steps[index];
    this.service.saveUnitFlat(this.uid, 'unit6', step.id, this.forms[index], score, step.category);
    this.unitData[`units.unit6.${step.id}`] = { answers: this.forms[index].value, score, submitted: true };
    this.aggregate(step.category, score);
    this.next();
  }

  next(): void {
    this.clearTimers();
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++; this.startTimer();
    } else { this.showFinalMessage = true; }
  }

  startTimer(): void {
    this.clearTimers();
    if (this.isReferentView || this.showFinalMessage || !this.isStudent) return;
    this.alreadySubmitted = false; this.progress = 0;
    const total = this.steps[this.currentStep].duration;
    let elapsed = 0;
    this.intervalId = setInterval(() => { 
      elapsed++; 
      this.progress = Math.min(100, (elapsed / total) * 100); 
    }, 1000);
    this.timerId = setTimeout(() => this.submitCurrent(), total * 1000);
  }

  clearTimers(): void {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    if (this.timerId !== null) clearTimeout(this.timerId);
    this.intervalId = null; this.timerId = null;
  }

  // syncStep(): void {
  //   let nextStep = 0;
  //   while (nextStep < this.steps.length && this.isSubmitted(this.steps[nextStep].id)) {
  //     nextStep++;
  //   }
  //   if (nextStep === this.steps.length) {
  //     this.currentStep = this.steps.length - 1;
  //     this.showFinalMessage = true;
  //     this.clearTimers();
  //     return;
  //   }
  //   const sameStep = this.currentStep === nextStep;
  //   const timerAlreadyRunning = this.timerId !== null;
  //   this.currentStep = nextStep;
  //   this.showFinalMessage = false;
  //   if (!sameStep || !timerAlreadyRunning) {
  //     this.startTimer();
  //   }
  // }

  syncStep(): void {
    let nextStep = 0;

    while (
      nextStep < this.steps.length &&
      this.isSubmitted(this.steps[nextStep].id)
    ) {
      nextStep++;
    }

    if (nextStep === this.steps.length) {
      this.currentStep = this.steps.length - 1;
      this.showFinalMessage = true;
      this.clearTimers();
      return;
    }

    // SI le currentStep a été défini manuellement dans le code à une valeur 
    // supérieure au nextStep de la base (pour tester le rendu visuel), on le respecte !
    if (this.currentStep <= nextStep) {
      this.currentStep = nextStep;
    }

    const sameStep = this.currentStep === nextStep;
    const timerAlreadyRunning = this.timerId !== null;

    this.showFinalMessage = false;

    if (!sameStep || !timerAlreadyRunning) {
      this.startTimer();
    }
  }

  private aggregate(category: string, score: number): void {
    this.aggregateState[category] = (Number(this.aggregateState[category]) || 0) + score;
  }

  rebuildAggregateFromUnitData(): void {
    const rebuilt: Record<string, number> = {};
    for (const step of this.steps) {
      const saved = this.unitData?.[`units.unit6.${step.id}`];
      if (saved?.submitted) rebuilt[step.category] = (rebuilt[step.category] || 0) + (Number(saved.score) || 0);
    }
    this.aggregateState = rebuilt;
  }

  loadData(): void {
    this.service.getUnit(this.uid).subscribe(data => {
      this.unitData = data ?? {};
      this.patchForms(); this.rebuildAggregateFromUnitData();
      const result = this.unitData?.['units.unit6.result'];
      if (result?.aggregateState) this.aggregateState = { ...result.aggregateState };
      if (result?.isFinal || this.aggregateState['isFinal']) {
        this.aggregateState['isFinal'] = true; this.commentCtrl.disable();
      }
    });
  }

  patchForms(): void {
    this.steps.forEach((step, index) => {
      const answers = this.unitData?.[`units.unit6.${step.id}`]?.answers;
      if (answers) this.forms[index].patchValue(answers);
    });
    const comment = this.unitData?.['units.unit6.commentReferent'];
    if (comment !== undefined && comment !== null) this.commentCtrl.setValue(comment);
  }

  getCurrentScore(index: number): number {
    if (this.isReferentView) return Number(this.unitData?.[`units.unit6.${this.steps[index].id}`]?.score) || 0;
    return Number(this.aggregateState[this.getCurrentCategory()]) || 0;
  }

  getCategoryMaxScore(category: string): number {
    return this.steps.filter(s => s.category === category).reduce((total, s) => total + s.maxScore, 0);
  }

  getGlobalScore(): { obtenu: number; max: number } | null {
    const active = this.categories.filter(c => this.aggregateState[c] !== undefined && this.aggregateState[c] !== null);
    if (!active.length) return null;
    return {
      obtenu: active.reduce((s, c) => s + Number(this.aggregateState[c] || 0), 0),
      max: active.reduce((s, c) => s + this.getCategoryMaxScore(c), 0)
    };
  }

  getGlobalNoteOn20(): number | null {
    const global = this.getGlobalScore();
    return global?.max ? Math.round((global.obtenu / global.max) * 40) / 2 : null;
  }

  editStepScore(index: number): void {
    if (!this.isReferentView || this.aggregateState['isFinal']) return;
    const step = this.steps[index];
    const response = prompt(`Note de l'exercice ${index + 1} (max. ${step.maxScore}) :`, String(this.getCurrentScore(index)));
    if (response === null || !response.trim()) return;
    const score = Number(response.replace(',', '.'));
    if (!Number.isFinite(score) || score < 0 || score > step.maxScore) { alert('Note invalide.'); return; }
    
    const key = `units.unit6.${step.id}`;
    this.unitData[key] = { ...(this.unitData[key] || {}), score, submitted: true };
    this.aggregateState[step.category] = this.steps.filter(s => s.category === step.category)
      .reduce((sum, s) => sum + (Number(this.unitData[`units.unit6.${s.id}`]?.score) || 0), 0);

    this.service.saveUnitFlat(
      this.uid, 'unit6', step.id,
      this.forms[index], score, step.category
    ).catch(err => {
      console.error(`Erreur d'enregistrement de ${step.id}`, err);
      alert("Une erreur est survenue lors de l'enregistrement de votre réponse.");
    });

    this.service.saveUnitResultUpdate(this.uid, 'unit6', this.aggregateState)
      .catch(err => { console.error(err); alert("Erreur d'enregistrement."); });
  }

  editCategoryScore(category: string): void {
    if (!this.isReferentView || this.aggregateState['isFinal']) return;
    const max = this.getCategoryMaxScore(category);
    const response = prompt(`Score brut pour « ${category} » (max. ${max}) :`, String(this.aggregateState[category] ?? ''));
    if (response === null || !response.trim()) return;
    const score = Number(response.replace(',', '.'));
    if (!Number.isFinite(score) || score < 0 || score > max) { alert('Score invalide.'); return; }
    this.aggregateState[category] = score;
    this.service.saveUnitResultUpdate(this.uid, 'unit6', this.aggregateState)
      .catch(err => { console.error(err); alert("Erreur d'enregistrement."); });
  }

  saveCommentReferent(): void {
    if (!this.isReferentView || this.aggregateState['isFinal']) return;
    this.service.updateUnitComment(this.uid, 'unit6', this.commentCtrl.value?.trim() || '');
  }

  async cloturerEvaluation(): Promise<void> {
    if (!this.isReferentView || this.aggregateState['isFinal']) return;
    const allSubmitted = this.steps.every(s => this.isSubmitted(s.id));
    if (!allSubmitted) { alert('Tous les exercices doivent être soumis avant la clôture.'); return; }
    try {
      await this.service.finalizeUnit(
        this.uid, 'unit6', this.aggregateState,
        Number(this.getGlobalNoteOn20()) || 0, this.label, this.commentCtrl.value?.trim() || ''
      );
      this.aggregateState['isFinal'] = true; this.commentCtrl.disable();
      alert('Évaluation clôturée.');
    } catch (err) { console.error(err); alert('Erreur lors de la clôture.'); }
  }

  printPage(): void {
    const oldTitle = document.title;
    document.title = `BE-ON-TOP_Evaluation_Unit6_${this.uid}`;
    window.print(); document.title = oldTitle;
  }

  getCandidateIdentity(uid: string): void {
    this.service.getStudentById(uid).subscribe(data => {
      if (data) { this.firstName = data.firstName; this.lastName = data.lastName; }
    });
  }
}