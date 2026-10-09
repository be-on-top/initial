import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/admin/auth.service';
import { WorkbookService } from '../../workbook.service';
import { WORKBOOK_UNITS } from '../../workbookUnits';

interface Step { id: string; category: string; duration: number; maxScore: number; }

@Component({ selector: 'app-unit5', templateUrl: './unit5.component.html' })
export class Unit5Component implements OnInit, OnDestroy {
  private readonly config = WORKBOOK_UNITS.find(unit => unit.id === 'unit5');
  label = this.config?.label || 'Connaissances numériques fondamentales';
  profile = this.config?.profile || 'Utilisateur élémentaire';
  description = this.config?.description || 'Utiliser les outils numériques courants dans un contexte de formation et de travail.';
  readonly categories = ['Environnement numérique', 'Fichiers et documents', 'Internet et communication', 'Sécurité et bonnes pratiques'];
  readonly steps: Step[] = [
    { id: 'ex1', category: this.categories[0], duration: 120, maxScore: 4 },
    { id: 'ex2', category: this.categories[0], duration: 120, maxScore: 4 },
    { id: 'ex3', category: this.categories[0], duration: 120, maxScore: 4 },
    { id: 'ex4', category: this.categories[1], duration: 120, maxScore: 3 },
    { id: 'ex5', category: this.categories[1], duration: 120, maxScore: 4 },
    { id: 'ex6', category: this.categories[1], duration: 150, maxScore: 5 },
    { id: 'ex7', category: this.categories[2], duration: 120, maxScore: 3 },
    { id: 'ex8', category: this.categories[2], duration: 180, maxScore: 4 },
    { id: 'ex9', category: this.categories[2], duration: 150, maxScore: 4 },
    { id: 'ex10', category: this.categories[3], duration: 90, maxScore: 2 },
    { id: 'ex11', category: this.categories[3], duration: 150, maxScore: 4 },
    { id: 'ex12', category: this.categories[3], duration: 120, maxScore: 3 }
  ];
  readonly toolOptions = [
    { value: 'texte', label: 'Traitement de texte' }, { value: 'web', label: 'Navigateur Internet' },
    { value: 'mail', label: 'Messagerie électronique' }, { value: 'visio', label: 'Visioconférence' }
  ];
  readonly iconOptions = [
    { value: 'browser', label: 'Navigateur' }, { value: 'folder', label: 'Dossier' },
    { value: 'trash', label: 'Corbeille' }, { value: 'wifi', label: 'Wi-Fi / réseau' }
  ];
  readonly fileOptions = [
    { value: 'pdf', label: 'Document PDF' }, { value: 'image', label: 'Image' },
    { value: 'text', label: 'Document de traitement de texte' }, { value: 'sheet', label: 'Tableur' }
  ];
  readonly ex3Labels: Record<string, string> = {
    password: 'Saisir le mot de passe', open: 'Ouvrir le site',
    connect: 'Cliquer sur « Se connecter »', identifier: 'Saisir son identifiant'
  };
  readonly ex6Labels: Record<string, string> = {
    reply: 'Répondre au message', openFile: 'Ouvrir et vérifier le document',
    send: 'Joindre le document et envoyer', receive: 'Ouvrir le message reçu',
    download: 'Télécharger la pièce jointe'
  };
  readonly correctEx3 = ['open', 'identifier', 'password', 'connect'];
  readonly correctEx6 = ['receive', 'download', 'openFile', 'reply', 'send'];
  readonly forms: FormGroup[] = [];
  formEx1!: FormGroup; formEx2!: FormGroup; formEx3!: FormGroup;
  formEx4!: FormGroup; formEx5!: FormGroup; formEx6!: FormGroup;
  formEx7!: FormGroup; formEx8!: FormGroup; formEx9!: FormGroup;
  formEx10!: FormGroup; formEx11!: FormGroup; formEx12!: FormGroup;
  commentCtrl = new FormControl('');
  uid = ''; lastName = ''; firstName = ''; userRole: string | null = null;
  unitData: any = {}; currentStep = 0; showFinalMessage = false;
  isReferentView = false; alreadySubmitted = false; progress = 0;
  aggregateState: Record<string, any> = {};
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private timerId: ReturnType<typeof setTimeout> | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService,
    private service: WorkbookService, private route: ActivatedRoute, private router: Router) {
    this.initForms();
  }

  initForms(): void {
    this.formEx1 = this.fb.group({ letter: [''], site: [''], email: [''], meeting: [''] });
    this.formEx2 = this.fb.group({ globe: [''], folder: [''], trash: [''], wifi: [''] });
    this.formEx3 = this.fb.group({ order: [['password', 'open', 'connect', 'identifier']] });
    this.formEx4 = this.fb.group({ selected: [''] });
    this.formEx5 = this.fb.group({ cv: [''], photo: [''], letter: [''], sheet: [''] });
    this.formEx6 = this.fb.group({ order: [['reply', 'openFile', 'send', 'receive', 'download']] });
    this.formEx7 = this.fb.group({ answer: [''] });
    this.formEx8 = this.fb.group({ recipient: [''], subject: [''], attachment: [''] });
    this.formEx9 = this.fb.group({ answer: [''] });
    this.formEx10 = this.fb.group({ answer: [''] });
    this.formEx11 = this.fb.group({ sender: [false], urgency: [false], password: [false], link: [false], logo: [false], signature: [false] });
    this.formEx12 = this.fb.group({ answer: [''] });
    this.forms.push(this.formEx1, this.formEx2, this.formEx3, this.formEx4, this.formEx5, this.formEx6,
      this.formEx7, this.formEx8, this.formEx9, this.formEx10, this.formEx11, this.formEx12);
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
  isSubmitted(exId: string): boolean { return !!this.unitData?.[`units.unit5.${exId}`]?.submitted; }

  moveOrder(index: number, direction: number, exercise: 3 | 6): void {
    if (this.isReferentView) return;
    const form = exercise === 3 ? this.formEx3 : this.formEx6;
    const order = [...(form.value.order as string[])];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    form.patchValue({ order });
  }
  getOrder(exercise: 3 | 6): string[] {
    return (exercise === 3 ? this.formEx3 : this.formEx6).value.order || [];
  }
  private countMatches(answers: Record<string, any>, expected: Record<string, string>): number {
    return Object.keys(expected).reduce((sum, key) => sum + (answers[key] === expected[key] ? 1 : 0), 0);
  }
  private countOrder(order: string[], correct: string[]): number {
    return correct.reduce((sum, value, i) => sum + (order?.[i] === value ? 1 : 0), 0);
  }
  private normalized(value: unknown): string { return String(value ?? '').trim().toLowerCase(); }

  submitEx1(): void { this.saveExercise(0, this.countMatches(this.formEx1.value,
    { letter: 'texte', site: 'web', email: 'mail', meeting: 'visio' })); }
  submitEx2(): void { this.saveExercise(1, this.countMatches(this.formEx2.value,
    { globe: 'browser', folder: 'folder', trash: 'trash', wifi: 'wifi' })); }
  submitEx3(): void { this.saveExercise(2, this.countOrder(this.formEx3.value.order, this.correctEx3)); }
  submitEx4(): void { this.saveExercise(3, this.formEx4.value.selected === 'convocations' ? 3 : 0); }
  submitEx5(): void { this.saveExercise(4, this.countMatches(this.formEx5.value,
    { cv: 'pdf', photo: 'image', letter: 'text', sheet: 'sheet' })); }
  submitEx6(): void { this.saveExercise(5, this.countOrder(this.formEx6.value.order, this.correctEx6)); }
  submitEx7(): void { this.saveExercise(6, this.formEx7.value.answer === 'precise' ? 3 : 0); }
  submitEx8(): void {
    const a = this.formEx8.value;
    const score = (this.normalized(a.recipient) === 'formation@exemple.fr' ? 1 : 0)
      + (this.normalized(a.subject) === 'cv - candidature' ? 1 : 0)
      + (a.attachment === 'cv' ? 2 : 0);
    this.saveExercise(7, score);
  }
  submitEx9(): void { this.saveExercise(8, this.formEx9.value.answer === 'join' ? 4 : 0); }
  submitEx10(): void { this.saveExercise(9, this.formEx10.value.answer === 'strong' ? 2 : 0); }
  submitEx11(): void {
    const a = this.formEx11.value;
    const correct = ['sender', 'urgency', 'password', 'link'].filter(k => a[k]).length;
    const errors = ['logo', 'signature'].filter(k => a[k]).length;
    this.saveExercise(10, Math.max(0, correct - errors));
  }
  submitEx12(): void { this.saveExercise(11, this.formEx12.value.answer === 'verify' ? 3 : 0); }
  submitCurrent(): void {
    if (this.alreadySubmitted || this.showFinalMessage || !this.isStudent) return;
    const handlers = [this.submitEx1, this.submitEx2, this.submitEx3, this.submitEx4,
      this.submitEx5, this.submitEx6, this.submitEx7, this.submitEx8, this.submitEx9,
      this.submitEx10, this.submitEx11, this.submitEx12];
    handlers[this.currentStep]?.call(this);
  }
  private saveExercise(index: number, score: number): void {
    if (this.alreadySubmitted || this.showFinalMessage || !this.isStudent) return;
    this.alreadySubmitted = true;
    const step = this.steps[index];
    this.service.saveUnitFlat(this.uid, 'unit5', step.id, this.forms[index], score, step.category);
    this.unitData[`units.unit5.${step.id}`] = { answers: this.forms[index].value, score, submitted: true };
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
    this.intervalId = setInterval(() => { elapsed++; this.progress = Math.min(100, elapsed / total * 100); }, 1000);
    this.timerId = setTimeout(() => this.submitCurrent(), total * 1000);
  }
  clearTimers(): void {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    if (this.timerId !== null) clearTimeout(this.timerId);
    this.intervalId = null; this.timerId = null;
  }
  syncStep(): void {
    this.currentStep = 0;
    while (this.currentStep < this.steps.length && this.isSubmitted(this.steps[this.currentStep].id)) this.currentStep++;
    if (this.currentStep === this.steps.length) {
      this.currentStep = this.steps.length - 1;
      this.showFinalMessage = true; this.clearTimers(); return;
    }
    this.showFinalMessage = false; this.startTimer();
  }
  private aggregate(category: string, score: number): void {
    this.aggregateState[category] = (Number(this.aggregateState[category]) || 0) + score;
  }
  rebuildAggregateFromUnitData(): void {
    const rebuilt: Record<string, number> = {};
    for (const step of this.steps) {
      const saved = this.unitData?.[`units.unit5.${step.id}`];
      if (saved?.submitted) rebuilt[step.category] = (rebuilt[step.category] || 0) + (Number(saved.score) || 0);
    }
    this.aggregateState = rebuilt;
  }
  loadData(): void {
    this.service.getUnit(this.uid).subscribe(data => {
      this.unitData = data ?? {};
      this.patchForms(); this.rebuildAggregateFromUnitData();
      const result = this.unitData?.['units.unit5.result'];
      if (result?.aggregateState) this.aggregateState = { ...result.aggregateState };
      if (result?.isFinal || this.aggregateState['isFinal']) {
        this.aggregateState['isFinal'] = true; this.commentCtrl.disable();
      }
    });
  }
  patchForms(): void {
    this.steps.forEach((step, index) => {
      const answers = this.unitData?.[`units.unit5.${step.id}`]?.answers;
      if (answers) this.forms[index].patchValue(answers);
    });
    const comment = this.unitData?.['units.unit5.commentReferent'];
    if (comment !== undefined && comment !== null) this.commentCtrl.setValue(comment);
  }
  getCurrentScore(index: number): number {
    if (this.isReferentView) return Number(this.unitData?.[`units.unit5.${this.steps[index].id}`]?.score) || 0;
    return Number(this.aggregateState[this.getCurrentCategory()]) || 0;
  }
  getCategoryMaxScore(category: string): number {
    return this.steps.filter(s => s.category === category).reduce((total, s) => total + s.maxScore, 0);
  }
  getGlobalScore(): { obtenu: number; max: number } | null {
    const active = this.categories.filter(c => this.aggregateState[c] !== undefined && this.aggregateState[c] !== null);
    if (!active.length) return null;
    return { obtenu: active.reduce((s, c) => s + Number(this.aggregateState[c] || 0), 0),
      max: active.reduce((s, c) => s + this.getCategoryMaxScore(c), 0) };
  }
  getGlobalNoteOn20(): number | null {
    const global = this.getGlobalScore();
    return global?.max ? Math.round(global.obtenu / global.max * 40) / 2 : null;
  }
  editStepScore(index: number): void {
    if (!this.isReferentView || this.aggregateState['isFinal']) return;
    const step = this.steps[index];
    const response = prompt(`Note de l'exercice ${index + 1} (max. ${step.maxScore}) :`, String(this.getCurrentScore(index)));
    if (response === null || !response.trim()) return;
    const score = Number(response.replace(',', '.'));
    if (!Number.isFinite(score) || score < 0 || score > step.maxScore) { alert('Note invalide.'); return; }
    const key = `units.unit5.${step.id}`;
    this.unitData[key] = { ...(this.unitData[key] || {}), score, submitted: true };
    this.aggregateState[step.category] = this.steps.filter(s => s.category === step.category)
      .reduce((sum, s) => sum + (Number(this.unitData[`units.unit5.${s.id}`]?.score) || 0), 0);
    this.service.saveUnitFlat(this.uid, 'unit5', step.id, this.forms[index], score, step.category);
    this.service.saveUnitResultUpdate(this.uid, 'unit5', this.aggregateState)
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
    this.service.saveUnitResultUpdate(this.uid, 'unit5', this.aggregateState)
      .catch(err => { console.error(err); alert("Erreur d'enregistrement."); });
  }
  saveCommentReferent(): void {
    if (!this.isReferentView || this.aggregateState['isFinal']) return;
    this.service.updateUnitComment(this.uid, 'unit5', this.commentCtrl.value?.trim() || '');
  }
  async cloturerEvaluation(): Promise<void> {
    if (!this.isReferentView || this.aggregateState['isFinal']) return;
    const allSubmitted = this.steps.every(s => this.isSubmitted(s.id));
    if (!allSubmitted) { alert('Tous les exercices doivent être soumis avant la clôture.'); return; }
    try {
      await this.service.finalizeUnit(this.uid, 'unit5', this.aggregateState,
        Number(this.getGlobalNoteOn20()) || 0, this.label, this.commentCtrl.value?.trim() || '');
      this.aggregateState['isFinal'] = true; this.commentCtrl.disable();
      alert('Évaluation clôturée.');
    } catch (err) { console.error(err); alert('Erreur lors de la clôture.'); }
  }
  printPage(): void {
    const oldTitle = document.title;
    document.title = `BE-ON-TOP_Evaluation_Unit5_${this.uid}`;
    window.print(); document.title = oldTitle;
  }
  getCandidateIdentity(uid: string): void {
    this.service.getStudentById(uid).subscribe(data => {
      if (data) { this.firstName = data.firstName; this.lastName = data.lastName; }
    });
  }
}
