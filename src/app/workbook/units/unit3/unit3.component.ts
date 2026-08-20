import { Component } from '@angular/core';
// import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { WorkbookService } from '../../workbook.service';
import { AuthService } from 'src/app/admin/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

interface Step {
  id: string;
  category: string;
  duration?: number;
  maxScore?: number | null;
}

@Component({
  selector: 'app-unit3',
  templateUrl: './unit3.component.html',
  styleUrls: ['./unit3.component.css']
})


export class Unit3Component {

  label: string = "FLE niveau B1 & B2"

  // On déclare en haut du composant
  commentCtrl = new FormControl('');

  // pour authentification à venir
  uid: string = "";
  userRole: string | null = null

  unitData: any = {};

  showFinalMessage: boolean = false;

  isReferentView: boolean = false;

  categories: string[] = ["Compréhension écrite", "Production écrite"]
  // Catégorie entièrement calculée automatiquement
  readonly autoCategory: string = this.categories[0]; // "Compréhension écrite"

  // préconisé si on fait une timeline
  alreadySubmitted = false;
  private intervalId: any = null;
  private timerId: any = null;

  progress = 0;

  aggregateState: Record<string, number> = {};

  /* =====================================================
 * ÉTAPES
 *
 * Les catégories sont volontairement regroupées ici.
 * Elles pourront être ajustées aux 4 catégories définitives
 * de l'unité 3 sans modifier les formulaires.
 * ===================================================== */

  steps: Step[] = [
    { id: 'ex1', category: this.categories[0], duration: 160, maxScore: 1 }, // premier d'une série
    { id: 'ex2', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex3', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex4', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex5', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex6', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex7', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex8', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex9', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex10', category: this.categories[0], duration: 100, maxScore: 1 },
    // à venir ... :
    { id: 'ex11', category: this.categories[0], duration: 160, maxScore: 1 }, // premier d'une série ?
    { id: 'ex12', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex13', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex14', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex15', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex16', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex17', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex18', category: this.categories[0], maxScore: 2 }, // le seul en texte libre
    { id: 'ex19', category: this.categories[0], duration: 120, maxScore: 1 },
    { id: 'ex20', category: this.categories[0], maxScore: 10 }, // autre série

    // à faire...
    { id: 'ex21', category: this.categories[1], maxScore: 10 },
    // { id: 'ex22', category: this.categories[1], maxScore: 11 }
  ];


  currentStep = 0;

  // const step = this.steps[this.currentStep];
  // const category = step.category;

  formEx1!: FormGroup;
  formEx2!: FormGroup;
  formEx3!: FormGroup;
  formEx4!: FormGroup;
  formEx5!: FormGroup;
  formEx6!: FormGroup;
  formEx7!: FormGroup;
  formEx8!: FormGroup;
  formEx9!: FormGroup;
  formEx10!: FormGroup;
  formEx11!: FormGroup;
  formEx12!: FormGroup;
  formEx13!: FormGroup;
  formEx14!: FormGroup;
  formEx15!: FormGroup;

  // ======================================================
  // EXERCICE 4
  // ======================================================

  formEx16!: FormGroup;
  formEx17!: FormGroup;
  formEx18!: FormGroup;
  formEx19!: FormGroup;
  formEx20!: FormGroup;


  // ======================================================
  // EXERCICES 5 ET 6
  // ======================================================

  formEx21!: FormGroup;
  formEx22!: FormGroup;


  correctAnswerEx1 = ['bâtiment'];

  correctAnswerEx2 = ['logement neuf'];

  correctAnswerEx3 = ['fédération', 'française', 'bâtiment'];

  // correctAnswerEx4 = ['entretien', 'amélioration'];
  correctAnswerEx4 = [
    'isoler',
    'isolation',
    'combles',
    'extérieur',
    'intérieur',
    'chauffage',
    'aérothermique',
    'ventilation'
  ];

  // correctAnswerEx5 = ['recul', 'transactions', 'logements anciens'];
  termesRenovationEx5 = [
    'travaux',
    'rénovation',
    'rénover'
  ];

  termesCoutEx5 = [
    'cher',
    'coûte',
    'coût',
    'prix'
  ];

  termesFinancementEx5 = [
    'taux zéro',
    'taux à zéro',
    'ptz',
    'gel'
  ];

  correctAnswerEx6 = ['motion de censure', 'renversement du gouvernement'];

  correctAnswerEx7 = ['-21,9', '21,9'];

  correctAnswerEx8 = ['100 000', '100000'];

  correctAnswerEx9 = ['1,6 million', '1.6 million', '1,6 millions'];

  // correctAnswerEx10 = ['neuve', 'ancienne'];

  termesNeuf10 = ['neuve', 'nouvelle', 'récente'];
  termesAncien10 = ['ancienne', 'vieille'];
  // ajout recherche de comparaison
  termesComparaison10 = [
    'cher',
    'prix',
    'coût',
    'travaux',
    'rénovation',
    'énergie',
    'énergivore',
    'thermique',
    'phonique',
    'performante',
    'habitable',
    'patient',
    'mois',
    'taxe foncière'
  ];

  // Ex11 = question 1
  ex11Options = [
    { value: 'eole', label: 'Éole' },
    { value: 'eoliennes', label: 'Éoliennes' },
    { value: 'ventilateurs', label: 'Ventilateurs' }
  ];
  correctAnswerEx11 = 'eoliennes';

  // Ex12 = question 2
  ex12Options = [
    { value: 'arret_aumelas', label: "L'arrêt pour 4 mois des éoliennes du parc 'Aumelas" },
    { value: 'arret_valeco', label: "L'arrêt du groupe Valeco" },
    { value: 'arret_oiseaux', label: "L'arrêt du vol des oiseaux en voie de disparition" }
  ];
  correctAnswerEx12 = 'arret_aumelas';

  // Ex13 = question 3
  ex13Options = [
    { value: 'var', label: 'Dans le Var' },
    { value: 'bouches_du_rhone', label: 'Dans les Bouches-du-Rhône' },
    { value: 'herault', label: "Dans l'Hérault" }
  ];
  correctAnswerEx13 = 'herault';

  // Ex14 = question 4
  ex14Options = [
    { value: 'vent', label: "Car il n'y a pas assez de vent pour faire tourner les pales" },
    { value: 'oiseaux', label: "Car responsables de la mort d'oiseaux d'espèces protégées" },
    { value: 'normes', label: "Car pas aux normes pour le respect de l'environnement" }
  ];
  correctAnswerEx14 = 'oiseaux';

  // Ex15 = question 5
  ex15Options = [
    { value: 'conservation', label: "Qui fait l'objet de mesures de conservation" },
    { value: 'disciplinaires', label: "Qui fait l'objet de mesures disciplinaires" },
    { value: 'destruction', label: "Qui fait l'objet de mesures de destruction" }
  ];
  correctAnswerEx15 = 'conservation';

  // Ex16 = question 6
  ex16Options = [
    { value: 'demolition', label: 'La démolition complète des éoliennes' },
    { value: '200000', label: 'Une amende de 200.000 €' },
    { value: '40000', label: 'Une amende de 40.000 €' }
  ];
  correctAnswerEx16 = '200000';

  // Ex17 = question 7
  ex17Options = [
    { value: '30000', label: '30.000 €' },
    { value: '38000', label: '38.000 €' },
    { value: '39000', label: '39.000 €' }
  ];
  correctAnswerEx17 = '39000';

  // Ex19 = question 9

  ex19Options = [
    { value: 'plus_10', label: 'Plus de 10' },
    { value: 'moins_5', label: 'Moins de 5' },
    { value: '6', label: '6' }
  ];

  correctAnswerEx19 = '6';


  constructor(private fb: FormBuilder, private auth: AuthService, private service: WorkbookService, private route: ActivatedRoute, private router: Router) {
    this.initForms();

    const saved = localStorage.getItem('unit3_aggregation');

    if (saved) {
      this.aggregateState = JSON.parse(saved);
    }
  }

  ngOnInit() {
    // 🔎 Vérification si un UID est passé en paramètre
    const routeUid = this.route.snapshot.paramMap.get('uid');

    // if (routeUid) {
    //   this.uid = routeUid;
    //   // 👉 MODE REFERENT      
    //   this.loadData()
    //   this.isReferentView = true
    //   return; // ⛔ on ne passe PAS par auth
    // }

    if (routeUid) {
      this.uid = routeUid;
      this.isReferentView = true; // On active la vue référent

      // 🔒 LE VERROU SÉCURITÉ DIRECTEMENT ICI
      this.auth.getCurrentUserRole().subscribe(userInfo => {
        // 1️⃣ Sécurité : Si le rôle n'est pas encore chargé, on attend l'émission suivante
        if (!userInfo) {
          console.log("⏳ En attente du chargement du rôle...");
          return;
        }

        // 2️⃣ Extraction et Normalisation : On gère le fait que ce soit une string ou un tableau
        const rawRole = Array.isArray(userInfo) ? userInfo[0] : userInfo;
        const cleanedRole = rawRole.trim().toLowerCase();

        console.log("Rôle détecté et nettoyé par le verrou :", cleanedRole);

        // 3️⃣ Le contrôle strict (avec notre fameux &&)
        if (cleanedRole !== 'admin' && cleanedRole !== 'referent') {
          console.warn("🚫 Accès refusé : Rôle insuffisant.", cleanedRole);
          alert(`🚫 Accès refusé : Le rôle "${cleanedRole}" n'a pas les droits.`);
          this.router.navigate(['/home']);
          return;
        }

        // Si on arrive ici, c'est que cleanedRole vaut 'admin' ou 'referent'
        console.log("✅ Accès accordé pour le rôle :", cleanedRole);
        this.loadData();
      });

      return; // ⛔ on ne passe PAS par auth pour la logique student en dessous
    }


    // 🔐 Récupération de l'utilisateur connecté
    this.auth.getCurrentUserInfo().subscribe(userInfo => {

      // ❌ Si aucun utilisateur → on stoppe ici
      if (!userInfo) {
        this.userRole = null;
        this.uid = "";
        return;
      }

      // 👤 Normalisation du rôle utilisateur (array ou string)
      this.userRole = Array.isArray(userInfo.role)
        ? userInfo.role[0]
        : userInfo.role;

      // 🆔 Stockage de l'identifiant utilisateur
      this.uid = userInfo.uid;

      // 🎯 Logique uniquement pour les étudiants
      if (this.userRole === "student") {

        // 📦 Chargement des données de l'unité depuis Firestore
        this.service.getUnit(this.uid).subscribe(data => {

          console.log("DATA FIRESTORE:", data);

          this.unitData = data ?? {};

          // 🔄 Reconstruction du cumul à partir des scores enregistrés en base
          this.rebuildAggregateFromUnitData();

          console.log("UNIT DATA:", this.unitData);

          // 🔄 Reprise au bon exercice
          this.syncStep();

          // Détecte si l'unité est finalisée
          if (this.unitData?.['units.unit3.result']) {
            this.showFinalMessage = true;
          }

        });

      }


    });

    // 🧠 À ce stade :
    // - utilisateur identifié
    // - rôle déterminé
    // - données Firestore chargées (si student)
    // - step synchronisé via syncStep()
  }

  initForms() {


    // ======================================================
    // EXERCICE 1 initial 
    // ======================================================

    // Question 1
    this.formEx1 = this.fb.group({
      answer: ['']
    });

    // Question 2
    this.formEx2 = this.fb.group({
      answer: ['']
    });

    // Question 3
    this.formEx3 = this.fb.group({
      answer: ['']
    });

    // Question 4
    this.formEx4 = this.fb.group({
      answer: ['']
    });

    // Question 5
    this.formEx5 = this.fb.group({
      answer: ['']
    });

    // Question 6
    this.formEx6 = this.fb.group({
      answer: ['']
    });

    // Question 7
    this.formEx7 = this.fb.group({
      answer: ['']
    });


    // ======================================================
    // EXERCICE 3 Partie 1 
    // ======================================================

    // Question 1
    this.formEx8 = this.fb.group({
      answer: ['']
    });

    // Question 2
    this.formEx9 = this.fb.group({
      answer: ['']
    });

    // Question 3
    this.formEx10 = this.fb.group({
      answer: ['']
    });

    // Ex11
    this.formEx11 = this.fb.group({
      answer: ['']
    });

    // Ex12
    this.formEx12 = this.fb.group({
      answer: ['']
    });

    // Ex13
    this.formEx13 = this.fb.group({
      answer: ['']
    });

    // Ex14
    this.formEx14 = this.fb.group({
      answer: ['']
    });

    // Ex15
    this.formEx15 = this.fb.group({
      answer: ['']
    });

    // Ex16
    this.formEx16 = this.fb.group({
      answer: ['']
    });

    // Ex17
    this.formEx17 = this.fb.group({
      answer: ['']
    });

    // Ex18
    this.formEx18 = this.fb.group({
      answer: ['']
    });

    // Ex19
    this.formEx19 = this.fb.group({
      answer: ['']
    });

    // Ex20
    this.formEx20 = this.fb.group({
      answer: ['']
    });

    // Ex21
    this.formEx21 = this.fb.group({
      answer: ['']
    });


  }

  // next() {
  //   this.currentStep++;
  //     this.startTimer(); // 👉 démarre le timer du nouvel écran
  // }
  next() {
    this.clearTimers();

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.startTimer();
    }
  }

  submitEx1() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx1.value.answer;

    if (this.containsKeywords(answer, this.correctAnswerEx1)) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex1",
      this.formEx1,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx2() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx2.value.answer;

    if (this.containsKeywords(answer, this.correctAnswerEx2)) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex2",
      this.formEx2,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx3() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx3.value.answer;

    if (this.containsKeywords(answer, this.correctAnswerEx3)) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex3",
      this.formEx3,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  // submitEx4() {
  //   this.alreadySubmitted = true;

  //   let score = 0;

  //   const answer = this.formEx4.value.answer;

  //   if (this.containsKeywords(answer, this.correctAnswerEx4)) {
  //     score = 1;
  //   }

  //   const category = this.getCurrentCategory();

  //   this.service.saveUnitFlat(
  //     this.uid,
  //     "unit3",
  //     "ex4",
  //     this.formEx4,
  //     score,
  //     category
  //   );

  //   this.aggregate(category, score);

  //   this.next();
  // }

  submitEx4() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx4.value.answer || '';

    const normalizedAnswer = answer
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const hasExpectedElement = this.correctAnswerEx4.some(term =>
      normalizedAnswer.includes(
        term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
    );

    if (hasExpectedElement) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex4",
      this.formEx4,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  // submitEx5() {
  //   this.alreadySubmitted = true;

  //   let score = 0;

  //   const answer = this.formEx5.value.answer;

  //   if (this.containsKeywords(answer, this.correctAnswerEx5)) {
  //     score = 1;
  //   }

  //   const category = this.getCurrentCategory();

  //   this.service.saveUnitFlat(
  //     this.uid,
  //     "unit3",
  //     "ex5",
  //     this.formEx5,
  //     score,
  //     category
  //   );

  //   this.aggregate(category, score);

  //   this.next();
  // }
  submitEx5() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx5.value.answer || '';

    const normalizedAnswer = answer
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const normalize = (term: string) =>
      term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const hasRenovation = this.termesRenovationEx5.some(term =>
      normalizedAnswer.includes(normalize(term))
    );

    const hasCout = this.termesCoutEx5.some(term =>
      normalizedAnswer.includes(normalize(term))
    );

    const hasFinancement = this.termesFinancementEx5.some(term =>
      normalizedAnswer.includes(normalize(term))
    );

    if ((hasRenovation && hasCout) || hasFinancement) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex5",
      this.formEx5,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx6() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx6.value.answer;

    if (this.containsKeywords(answer, this.correctAnswerEx6)) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex6",
      this.formEx6,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx7() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx7.value.answer;

    if (this.containsKeywords(answer, this.correctAnswerEx7)) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex7",
      this.formEx7,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx8() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx8.value.answer;

    if (this.containsKeywords(answer, this.correctAnswerEx8)) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex8",
      this.formEx8,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx9() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx9.value.answer;

    const normalizedAnswer = (answer || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const isCorrect = this.correctAnswerEx9.some(term =>
      normalizedAnswer.includes(
        term
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      )
    );

    if (isCorrect) {
      score = 1;
    }


    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex9",
      this.formEx9,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx10() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx10.value.answer || '';

    const normalizedAnswer = answer
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const hasNeuf = this.termesNeuf10.some(term =>
      normalizedAnswer.includes(
        term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
    );

    const hasAncien = this.termesAncien10.some(term =>
      normalizedAnswer.includes(
        term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
    );

    const hasComparaison = this.termesComparaison10.some(term =>
      normalizedAnswer.includes(
        term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
    );

    // if (hasNeuf && hasAncien) {
    //   score = 1;
    // }

    if (hasNeuf && hasAncien && hasComparaison) {
      score = 1;
    }


    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex10",
      this.formEx10,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx11() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx11.value.answer;

    if (answer === this.correctAnswerEx11) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex11",
      this.formEx11,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx12() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx12.value.answer;

    if (answer === this.correctAnswerEx12) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex12",
      this.formEx12,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx13() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx13.value.answer;

    if (answer === this.correctAnswerEx13) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex13",
      this.formEx13,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx14() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx14.value.answer;

    if (answer === this.correctAnswerEx14) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex14",
      this.formEx14,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx15() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx15.value.answer;

    if (answer === this.correctAnswerEx15) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex15",
      this.formEx15,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx16() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx16.value.answer;

    if (answer === this.correctAnswerEx16) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex16",
      this.formEx16,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx17() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx17.value.answer;

    if (answer === this.correctAnswerEx17) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex17",
      this.formEx17,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx18() {
    this.alreadySubmitted = true;

    const score = 0;

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex18",
      this.formEx18,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx19() {
    this.alreadySubmitted = true;

    let score = 0;

    const answer = this.formEx19.value.answer;

    if (answer === this.correctAnswerEx19) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex19",
      this.formEx19,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  submitEx20() {
    this.alreadySubmitted = true;

    const score = 0;

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex20",
      this.formEx20,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  // EX21 - Dernier exercice de l'unité
  submitEx21() {

    this.alreadySubmitted = true;

    // Production écrite :
    // aucun scoring automatique.
    const score = 0;

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      "ex21",
      this.formEx21,
      score,
      category
    );

    this.aggregate(category, score);

    // Dernier exercice de l'unité :
    // on enregistre les résultats finaux au lieu
    // de passer à l'exercice suivant.

    // S'assure que la catégorie existe dans l'agrégation,
    // même si aucun point n'a été obtenu.
    if (!this.aggregateState[category]) {
      this.aggregateState[category] = null as any;
    }

    this.service.saveUnitResult(
      this.uid,
      "unit3",
      this.aggregateState
    ).then(() => {

      this.showFinalMessage = true;

    });
  }

  // 1. Compter les mots (minimum 60)
  countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  }

  getCurrentCategory(): string {
    // Elle utilise l'index actuel de l'exercice en cours, tout simplement !
    return this.steps[this.currentStep]?.category || '';
  }


  aggregate(category: string, score: number) {
    // 1️⃣ Si la catégorie n'existe pas encore dans l'état local
    // on l'initialise à 0 pour pouvoir additionner ensuite
    if (!this.aggregateState[category]) {
      this.aggregateState[category] = 0;
    }

    // 2️⃣ On ajoute le score de l'exercice à la catégorie concernée
    this.aggregateState[category] += score;

    // 3️⃣ On sauvegarde l'état global dans le localStorage
    // → permet de conserver les scores même après refresh
    localStorage.setItem(
      'unit3_aggregation',
      JSON.stringify(this.aggregateState)
    );

    // 4️⃣ Debug : affichage de l'état actuel des scores par catégorie
    console.log('AGGREGATE =>', this.aggregateState);
  }

  // getCurrentScore(stepIndex: number): number {
  //   const category = this.getCurrentCategory(stepIndex);
  //   return this.aggregateState[category] || 0;
  // }
  getCurrentScore(stepIndex: number): number {

    // MODE REFERENT
    if (this.isReferentView) {

      const exId = this.steps[stepIndex].id;

      // return this.unitData?.[`units.unit1.${exId}`]?.score || 0;
      return this.unitData?.[`units.unit3.${exId}`]?.score || 0;
    }

    // MODE STUDENT
    const category = this.getCurrentCategory();

    return this.aggregateState[category] || 0;
  }


  startTimer() {
    const step = this.steps[this.currentStep];

    // 1. sécurité : pas de durée → aucun timer
    if (!step?.duration) {
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

  clearTimers() {
    if (this.timerId) clearTimeout(this.timerId);
    if (this.intervalId) clearInterval(this.intervalId);

    this.timerId = null;
    this.intervalId = null;
  }



  submitCurrent() {
    if (this.alreadySubmitted) return;

    switch (this.currentStep) {

      case 0: this.submitEx1(); break;
      case 1: this.submitEx2(); break;
      case 2: this.submitEx3(); break;
      case 3: this.submitEx4(); break;
      case 4: this.submitEx5(); break;
      case 5: this.submitEx6(); break;
      case 6: this.submitEx7(); break;
      case 7: this.submitEx8(); break;
      case 8: this.submitEx9(); break;
      case 9: this.submitEx10(); break;
      case 9: this.submitEx10(); break;
      case 10: this.submitEx11(); break;
      case 11: this.submitEx12(); break;
      case 12: this.submitEx13(); break;
      case 13: this.submitEx14(); break;
      case 14: this.submitEx15(); break;
      case 15: this.submitEx16(); break;
      case 16: this.submitEx17(); break;
      case 17: this.submitEx18(); break;
      case 18: this.submitEx19(); break;
      case 19: this.submitEx20(); break;
      case 20: this.submitEx21(); break;


    }



  }



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
    // return this.unitData?.[`units.unit1.${exId}`]?.submitted ?? false;
    return this.unitData?.[`units.unit3.${exId}`]?.submitted ?? false;
  }

  syncStep() {

    // 🔁 On parcourt les steps depuis le step courant
    while (this.currentStep < this.steps.length) {

      // 📌 On récupère le step actuel
      const step = this.steps[this.currentStep];

      // 🆔 Identifiant de l'exercice (ex1, ex2, etc.)
      const exId = step.id;

      // ❗ Si l'exercice n'est PAS encore soumis, on s'arrête ici
      // → c’est le step actif de l’utilisateur
      if (!this.isSubmitted(exId)) {
        break;
      }

      // ⏭️ Sinon l’exercice est déjà soumis → on passe au suivant
      this.currentStep++;
    }

    // ▶️ Une fois le step correct déterminé, on lance le timer associé
    this.startTimer();
  }


  loadData() {

    // Appel au service Firestore pour récupérer le document du candidat via son UID
    this.service.getUnit(this.uid).subscribe(data => {

      // Debug : structure brute telle que renvoyée par Firestore
      // ⚠️ Ici les clés sont FLAT (ex: 'units.unit1.ex1')
      console.log("RAW DATA:", data);

      // On sécurise : si null/undefined → objet vide
      this.unitData = data ?? {};

      // Debug : vérification après assignation
      console.log("UNIT DATA:", this.unitData);

      // ⚠️ volontairement commenté :
      // car avec le modèle FLAT, ces accès n'existent PAS
      // console.log("UNITS:", this.unitData?.units);
      // console.log("UNIT1:", this.unitData?.units?.unit1);

      // Injection des données dans les formulaires Angular
      this.patchForms();
    });
  }


  patchForms() {

    // Raccourci local pour lisibilité
    const data = this.unitData;

    // Sécurité : si aucune donnée → on sort
    if (!data) return;

    // ⚠️ IMPORTANT :
    // On accède aux données via des clés "flat"
    // ex: 'units.unit3.ex1' → objet contenant { answers, score, ... }

    // EXERCICE 1
    if (data['units.unit3.ex1']?.answers) {
      this.formEx1.patchValue(data['units.unit3.ex1'].answers);
    }

    // EXERCICE 2
    if (data['units.unit3.ex2']?.answers) {
      this.formEx2.patchValue(data['units.unit3.ex2'].answers);
    }

    // EXERCICE 3
    if (data['units.unit3.ex3']?.answers) {
      this.formEx3.patchValue(data['units.unit3.ex3'].answers);
    }

    // EXERCICE 4
    if (data['units.unit3.ex4']?.answers) {
      this.formEx4.patchValue(data['units.unit3.ex4'].answers);
    }

    // EXERCICE 5
    if (data['units.unit3.ex5']?.answers) {
      this.formEx5.patchValue(data['units.unit3.ex5'].answers);
    }

    // EXERCICE 6
    if (data['units.unit3.ex6']?.answers) {
      this.formEx6.patchValue(data['units.unit3.ex6'].answers);
    }

    // EXERCICE 7
    if (data['units.unit3.ex7']?.answers) {
      this.formEx7.patchValue(data['units.unit3.ex7'].answers);
    }

    // EXERCICE 8
    if (data['units.unit3.ex8']?.answers) {
      this.formEx8.patchValue(data['units.unit3.ex8'].answers);
    }

    // EXERCICE 9
    if (data['units.unit3.ex9']?.answers) {
      this.formEx9.patchValue(data['units.unit3.ex9'].answers);
    }

    // EXERCICE 10
    if (data['units.unit3.ex10']?.answers) {
      this.formEx10.patchValue(data['units.unit3.ex10'].answers);
    }

    // EXERCICE 11
    if (data['units.unit3.ex11']?.answers) {
      this.formEx11.patchValue(data['units.unit3.ex11'].answers);
    }

    // EXERCICE 12
    if (data['units.unit3.ex12']?.answers) {
      this.formEx12.patchValue(data['units.unit3.ex12'].answers);
    }

    // EXERCICE 13
    if (data['units.unit3.ex13']?.answers) {
      this.formEx13.patchValue(data['units.unit3.ex13'].answers);
    }

    // EXERCICE 14
    if (data['units.unit3.ex14']?.answers) {
      this.formEx14.patchValue(data['units.unit3.ex14'].answers);
    }

    // EXERCICE 15
    if (data['units.unit3.ex15']?.answers) {
      this.formEx15.patchValue(data['units.unit3.ex15'].answers);
    }

    // EXERCICE 16
    if (data['units.unit3.ex16']?.answers) {
      this.formEx16.patchValue(data['units.unit3.ex16'].answers);
    }

    // EXERCICE 17
    if (data['units.unit3.ex17']?.answers) {
      this.formEx17.patchValue(data['units.unit3.ex17'].answers);
    }

    // EXERCICE 18
    if (data['units.unit3.ex18']?.answers) {
      this.formEx18.patchValue(data['units.unit3.ex18'].answers);
    }

    // EXERCICE 19
    if (data['units.unit3.ex19']?.answers) {
      this.formEx19.patchValue(data['units.unit3.ex19'].answers);
    }

    // EXERCICE 20
    if (data['units.unit3.ex20']?.answers) {
      this.formEx20.patchValue(data['units.unit3.ex20'].answers);
    }

    // EXERCICE 21
    if (data['units.unit3.ex21']?.answers) {
      this.formEx21.patchValue(data['units.unit3.ex21'].answers);
    }

    // EXERCICE 22
    if (data['units.unit3.ex22']?.answers) {
      this.formEx22.patchValue(data['units.unit3.ex22'].answers);
    }

    // 👇 ON COUPE LES ACCÈS ICI SI C'EST UN RÉFÉRENT
    if (this.isReferentView) {
      this.formEx1.disable();
      this.formEx2.disable();
      this.formEx3.disable();
      this.formEx4.disable();
      this.formEx5.disable();
      this.formEx6.disable();
      this.formEx7.disable();
      this.formEx8.disable();
      this.formEx9.disable();
      this.formEx10.disable();
      this.formEx11.disable();
      this.formEx12.disable();
      this.formEx13.disable();
      this.formEx14.disable();
      this.formEx15.disable();
      this.formEx16.disable();
      this.formEx17.disable();
      this.formEx18.disable();
      this.formEx19.disable();
      this.formEx20.disable();
      this.formEx21.disable();
    }

    // On récupère ce que le candidat a enregistré en base à la fin de son EX22
    this.aggregateState = this.unitData['units.unit3.result'] || {};



    // 💬 ZONE COMMENTAIRE RÉFÉRENT (Ajout ici)
    // On récupère le commentaire global de l'unité s'il existe déjà dans Firestore
    if (data['units.unit3.commentReferent']) {
      this.commentCtrl.setValue(data['units.unit3.commentReferent']);
    }

  }

  getCategoryMaxScore(categoryName: string): number | null {
    // 1️⃣ On filtre les étapes qui appartiennent à cette catégorie
    const categorySteps = this.steps.filter(s => s.category === categoryName);

    // 2️⃣ On vérifie s'il y a au moins un exercice qui possède un barème numérique
    const hasScoredExercise = categorySteps.some(s => s.maxScore !== undefined && s.maxScore !== null);

    if (!hasScoredExercise) return null;

    // 3️⃣ On additionne les maxScores (en ignorant les null/undefined)
    return categorySteps.reduce((sum, s) => sum + (s.maxScore || 0), 0);
  }

  // 📐 Arrondit une note sur 20 au demi-point le plus proche (ex: 11.1 -> 11 ou 11.3 -> 11.5)
  roundToHalf(score: number, maxScore: number): number {
    const rawNote = (score / maxScore) * 20;
    return Math.round(rawNote * 2) / 2;
  }

  // 🏆 Calcule le score total obtenu sur le total max possible (ex: retourne { obtenu: 14, max: 18 })
  getGlobalScore(): { obtenu: number; max: number } | null {
    if (!this.aggregateState) return null;

    let totalObtenu = 0;
    let totalMax = 0;
    let hasScoredData = false;

    // On parcourt les résultats actuels de l'agrégation
    Object.keys(this.aggregateState).forEach(category => {
      const scoreValue = this.aggregateState[category];
      const maxScore = this.getCategoryMaxScore(category);

      // On ne prend en compte que les catégories qui ont un score numérique
      if (scoreValue !== null && maxScore !== null) {
        totalObtenu += scoreValue;
        totalMax += maxScore;
        hasScoredData = true;
      }
    });

    return hasScoredData ? { obtenu: totalObtenu, max: totalMax } : null;
  }

  // 📐 Convertit le score global en note sur 20 arrondie au demi-point près
  getGlobalNoteOn20(): number | null {
    const globalScore = this.getGlobalScore();
    if (!globalScore || globalScore.max === 0) return null;

    const rawNote = (globalScore.obtenu / globalScore.max) * 20;
    return Math.round(rawNote * 2) / 2; // Arrondi au demi-point (ex: 14.25 -> 14.5)
  }

  // ✍️ Permet au référent d'attribuer une note à une catégorie non scorée (ou de la modifier)
  editCategoryScore(categoryName: string) {
    if (!this.isReferentView) return;

    // A - Interception pour la catégorie automatique
    if (categoryName === this.autoCategory) {
      alert(
        `La catégorie "${categoryName}" est entièrement corrigée et calculée de manière automatique.\n\n` +
        `Il n'est pas nécessaire d'ajuster ce score manuellement.`
      );
      return; // On stoppe l'action ici
    }



    // B - Logique d'édition habituelle pour les autres catégories (ex: "Production écrite")

    // 1️⃣ Le max score est calculé 100% AUTOMATIQUEMENT ici par ta méthode
    const maxPoints = this.getCategoryMaxScore(categoryName);
    if (maxPoints === null || maxPoints === 0) {
      alert(`Impossible de récupérer le score maximum automatique pour la catégorie "${categoryName}".`);
      return;
    }

    // 2️⃣ Récupération du score brut actuel
    const currentPoints = this.aggregateState[categoryName] !== null ? this.aggregateState[categoryName] : '';

    // 3️⃣ L'invite affiche automatiquement la valeur calculée (ex: 15 points)
    const response = prompt(`Entrez le score brut pour "${categoryName}" (Maximum automatique : ${maxPoints} points) :`, currentPoints.toString());
    if (response === null) return; // Annulation

    const parsedScore = parseFloat(response);

    // 4️⃣ Contrôle de la saisie par rapport au max calculé automatiquement
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > maxPoints) {
      alert(`Veuillez entrer un score valide entre 0 et ${maxPoints}.`);
      return;
    }

    // 5️⃣ Mise à jour de ton objet local avec les points saisis
    this.aggregateState[categoryName] = parsedScore;

    // 6️⃣ Sauvegarde exclusive dans le Workbook via la méthode dédiée
    this.service.saveUnitResultUpdate(this.uid, "unit3", this.aggregateState)
      .then(() => {
        console.log(`✅ Score mis à jour avec succès pour : ${categoryName}`);
      })
      .catch(err => {
        console.error("Erreur Firestore :", err);
        alert("Erreur lors de l'enregistrement.");
      });
  }

  async cloturerEvaluation() {
    // 1️⃣ On récupère la valeur actuelle du champ texte (et on nettoie les espaces)
    const texteFinal = this.commentCtrl.value?.trim() || '';

    // On transforme le null en 0 si jamais il n'y a pas encore de note
    const noteFinale = Number(this.getGlobalNoteOn20()) || 0;

    // 2️⃣ On passe 'texteFinal' comme 6ème argument à mon service
    await this.service.finalizeUnit(
      this.uid,
      'unit3',
      this.aggregateState,
      noteFinale,
      this.label,
      texteFinal // 👈 Il est là !
    );

    // 3️⃣ Mise à jour de l'état local et verrouillage de l'interface
    this.aggregateState['isFinal'] = true as any;

    // On désactive le champ texte à l'écran pour que le référent ne puisse plus écrire
    this.commentCtrl.disable();

    alert("✅ Évaluation clôturée.");
  }


  printPage() {
    window.print();
  }


  // 3. La nouvelle méthode de sauvegarde automatique pour le référent :
  saveCommentReferent() {
    const texte = this.commentCtrl.value?.trim() || '';

    // On met à jour directement le document dans Firestore
    // Via une méthode de service qui fait un .update() ou .set(..., {merge: true})
    this.service.updateUnitComment(this.uid, "unit3", texte);
  }

  /**
 * Détermine automatiquement si les options peuvent être affichées
 * horizontalement plutôt que les unes sous les autres.
 *
 * Règle retenue :
 * - au maximum 3 propositions ;
 * - chaque libellé doit être court (8 caractères maximum).
 *
 * Exemples affichés sur une ligne :
 * - Oui / Non
 * - Vrai / Faux
 * - 1 / 2 / 3
 *
 * Si une proposition est plus longue, on conserve un affichage vertical
 * afin de préserver la lisibilité, notamment sur mobile.
 */

  shouldDisplayInline(options: { label: string }[]): boolean {

    return options.length <= 4 &&
      options.every(o => o.label.length <= 30);

  }

  //   shouldDisplayInline(options: { label: string }[]): boolean {
  //   return options.every(o => o.label.length <= 12);
  // }

  editStepScore(stepIndex: number) {
    if (!this.isReferentView || this.aggregateState?.['isFinal']) return;

    const step = this.steps[stepIndex];
    const exId = step.id;
    const max = step.maxScore;
    if (!max) return;

    const currentScore = this.getCurrentScore(stepIndex);

    // 1️⃣ Saisie de la note pour CET exercice
    const response = prompt(`Note pour l'Exercice ${stepIndex + 1} (Max : ${max} pts) :`, currentScore.toString());
    if (response === null || response.trim() === '') return;

    const parsedScore = parseFloat(response);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > max) {
      alert(`Veuillez entrer une note valide entre 0 et ${max}.`);
      return;
    }

    // 2️⃣ Mise à jour locale dans unitData
    const key = `units.unit3.${exId}`;
    if (!this.unitData[key]) {
      this.unitData[key] = {};
    }
    this.unitData[key].score = parsedScore;

    // 3️⃣ Recalcul direct de la catégorie basée sur unitData mis à jour
    const categoryName = step.category;

    // Somme explicite des scores des exercices de cette catégorie
    let categoryTotal = 0;
    this.steps.forEach(s => {
      if (s.category === categoryName) {
        const exKey = `units.unit3.${s.id}`;
        // On prend la nouvelle valeur pour cet exercice ou la valeur existante
        const score = s.id === exId ? parsedScore : (this.unitData[exKey]?.score || 0);
        categoryTotal += score;
      }
    });

    // 4️⃣ EXACTEMENT la même affectation que dans editCategoryScore
    this.aggregateState[categoryName] = categoryTotal;

    // Rafraîchissement des références d'objets pour la détection de changement Angular
    this.unitData = { ...this.unitData };
    this.aggregateState = { ...this.aggregateState };

    // 5️⃣ Sauvegarde de l'exercice (saveUnitFlat)
    const formGroup = stepIndex === 20 ? this.formEx21 : this.formEx22;
    this.service.saveUnitFlat(
      this.uid,
      "unit3",
      exId,
      formGroup,
      parsedScore,
      categoryName
    );

    // 6️⃣ EXACTEMENT le même appel Firestore que dans editCategoryScore
    this.service.saveUnitResultUpdate(this.uid, "unit3", this.aggregateState)
      .then(() => {
        console.log(`✅ Score Ex ${stepIndex + 1} (${exId}) et catégorie "${categoryName}" mis à jour avec succès : ${categoryTotal} pts`);
      })
      .catch(err => {
        console.error("Erreur Firestore :", err);
        alert("Erreur lors de l'enregistrement.");
      });
  }

  // petite méthode générique pour les textarea (des  10 premiers exercices ? )
  private containsKeywords(
    answer: string,
    keywords: string[]
  ): boolean {

    const normalizedAnswer = (answer || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return keywords.every(keyword =>
      normalizedAnswer.includes(
        keyword
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      )
    );
  }

  rebuildAggregateFromUnitData() {
    const rebuilt: Record<string, number> = {};

    this.steps.forEach(step => {
      const key = `units.unit3.${step.id}`;
      const exerciseData = this.unitData?.[key];

      // On ne recompte que les exercices déjà soumis
      if (!exerciseData?.submitted) {
        return;
      }

      const category = step.category;
      const score = Number(exerciseData.score) || 0;

      if (rebuilt[category] === undefined) {
        rebuilt[category] = 0;
      }

      rebuilt[category] += score;
    });

    this.aggregateState = rebuilt;

    // Le localStorage devient simplement un miroir local
    localStorage.setItem(
      'unit3_aggregation',
      JSON.stringify(this.aggregateState)
    );

    console.log('♻️ AGGREGATE RECONSTRUIT =>', this.aggregateState);
  }

}
