import { Component } from '@angular/core';
// import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  selector: 'app-unit1',
  templateUrl: './unit1.component.html',
  styleUrls: ['./unit1.component.css']
})


export class Unit1Component {

  // pour authentification à venir
  uid: string = "";
  userRole: string | null = null

  unitData: any = {};

  showFinalMessage: boolean = false;

  isReferentView: boolean = false;

  categories: string[] = ["Se présenter", "Compréhension écrite", "Production écrite", "Structure grammaticale"]

  // préconisé si on fait une timeline
  alreadySubmitted = false;
  private intervalId: any = null;
  private timerId: any = null;

  progress = 0;

  aggregateState: Record<string, number> = {};
  // 👉 Objet de stockage des scores agrégés par catégorie
  // - clé = nom de la catégorie (string)
  // - valeur = score total accumulé (number)
  // Exemple :
  // {
  //   "Se présenter": 5,
  //   "Compréhension écrite": 3
  // }



  // steps: Step[] = [
  //   { id: 'ex1', category: this.categories[0], duration: 160 },
  //   { id: 'ex2', category: this.categories[1], duration: 50 },
  //   { id: 'ex3', category: this.categories[1], duration: 70 },
  //   { id: 'ex4', category: this.categories[1], duration: 60 },
  //   { id: 'ex5', category: this.categories[1], duration: 25 },
  //   { id: 'ex6', category: this.categories[1], duration: 120 },
  //   { id: 'ex7', category: this.categories[2] }, // libre
  //   { id: 'ex8', category: this.categories[3], duration: 180 },
  //   { id: 'ex9', category: this.categories[2] }  // libre
  // ];

  steps: Step[] = [
    { id: 'ex1', category: this.categories[0], duration: 160, maxScore: 10 },  // 6 champs + date + âge
    { id: 'ex2', category: this.categories[1], duration: 50, maxScore: 1 },  // QCM
    { id: 'ex3', category: this.categories[1], duration: 70, maxScore: 1 },  // Tout bon = 1
    { id: 'ex4', category: this.categories[1], duration: 60, maxScore: 2 },  // Q4
    { id: 'ex5', category: this.categories[1], duration: 25, maxScore: 1 },  // Q5
    { id: 'ex6', category: this.categories[1], duration: 120, maxScore: 3 },  // Slots (ex: 4)
    { id: 'ex7', category: this.categories[2], maxScore: 5 },              // Libre / À évaluer sur 5
    { id: 'ex8', category: this.categories[3], duration: 180, maxScore: 10 },  // Items (ex: 5)
    { id: 'ex9', category: this.categories[2], maxScore: 10 }               // Libre / À évaluer sur 10
  ];



  currentStep = 0;

  //   const step = this.steps[this.currentStep];
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

  // EX1
  ex1Fields = [
    { name: 'nom', label: 'Nom', type: 'text' },
    { name: 'prenom', label: 'Prénom', type: 'text' },
    { name: 'dateNaissance', label: 'Date de naissance', type: 'text' },
    { name: 'lieuNaissance', label: 'Lieu de naissance', type: 'text' },
    { name: 'age', label: 'Âge', type: 'number' },
    { name: 'nationalite', label: 'Nationalité', type: 'text' },
    { name: 'adresse', label: 'Adresse', type: 'textarea' },
    { name: 'loisir', label: 'J\'aime (loisirs)', type: 'textarea' }
  ];

  // EX2
  q2Options = [
    { value: 'nourriture', label: 'De la nourriture' },
    { value: 'livres', label: 'Des livres' },
    { value: 'vetements', label: 'Des vêtements' }
  ];

  correctAnswerEx2 = 'livres';

  // EX3
  days = [
    { key: 'lundi', label: 'Lundi', correct: true },
    { key: 'mardi', label: 'Mardi', correct: true },
    { key: 'mercredi', label: 'Mercredi', correct: true },
    { key: 'jeudi', label: 'Jeudi', correct: true },
    { key: 'vendredi', label: 'Vendredi', correct: true },
    { key: 'samedi', label: 'Samedi', correct: false },
    { key: 'dimanche', label: 'Dimanche', correct: false }
  ];

  // EX4
  q4Options = [
    { key: 'lundi17', label: 'Lundi 17h', correct: true },
    { key: 'mardi13', label: 'Mardi 13h', correct: true },
    { key: 'mercredi16', label: 'Mercredi 16h', correct: false },
    { key: 'samedi1230', label: 'Samedi 12h30', correct: false }
  ];

  // EX6
  slots = [
    { key: 'samedi', label: 'Samedi 10h-12h', correct: 'Basket' },
    { key: 'mardi', label: 'Mardi 18h-20h', correct: 'Danse' },
    { key: 'vendredi', label: 'Vendredi 17h-19h', correct: 'Multisports' }
  ];

  options = ['Basket', 'Danse', 'Multisports'];

  // EX8
  ex3Items = [
    { id: 1, image: 'assets/img/unit1/dormir.webp' },
    { id: 2, image: 'assets/img/unit1/shopping.webp' },
    { id: 3, image: 'assets/img/unit1/patiner.webp' },
    { id: 4, image: 'assets/img/unit1/peindre.webp' },
    { id: 5, image: 'assets/img/unit1/mains.webp' },
    { id: 6, image: 'assets/img/unit1/lire.webp' },
    { id: 7, image: 'assets/img/unit1/courir.webp' },
    { id: 8, image: 'assets/img/unit1/danser.webp' },
    { id: 9, image: 'assets/img/unit1/porter.webp' },
    { id: 10, image: 'assets/img/unit1/manger.webp' }
  ];

  verbs = [
    'Dormir',
    'Faire du shopping',
    'Patiner',
    'Peindre',
    'Se serrer la main',
    'Lire',
    'Courir',
    'Danser',
    'Porter',
    'Manger'
  ];

  correctAnswers: { [key: number]: string } = {
    1: 'Dormir',
    2: 'Faire du shopping',
    3: 'Patiner',
    4: 'Peindre',
    5: 'Se serrer la main',
    6: 'Lire',
    7: 'Courir',
    8: 'Danser',
    9: 'Porter',
    10: 'Manger'

  };



  constructor(private fb: FormBuilder, private auth: AuthService, private service: WorkbookService, private route: ActivatedRoute, private router: Router) {
    this.initForms();

    const saved = localStorage.getItem('unit1_aggregation');

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

    // 🧹 Reset de l'état local des scores à chaque chargement de l'unité
    // localStorage.removeItem('unit1_aggregation');
    this.aggregateState = {};

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

          // 🔥 Sécurité : si aucune donnée → on ne casse rien
          // if (!data) return;

          console.log("DATA FIRESTORE:", data);

          // ✅ même si vide → on initialise
          this.unitData = data ?? {};

          console.log("UNIT DATA:", this.unitData);

          // 🔄 Synchronisation de l'état :
          // → détermine le step actuel selon les exercices déjà soumis
          this.syncStep();

          // détecte si l'entièreté de l'unité a été finalisée
          if (this.unitData?.['units.unit1.result']) {
            this.showFinalMessage = true;
          }

        });

        // ⚠️ ANCIENNE LOGIQUE (désactivée)
        // this.startTimer();

      }


    });

    // 🧠 À ce stade :
    // - utilisateur identifié
    // - rôle déterminé
    // - données Firestore chargées (si student)
    // - step synchronisé via syncStep()
  }

  initForms() {

    // EX1
    this.formEx1 = this.fb.group({
      nom: [''],
      prenom: [''],
      dateNaissance: [''],
      lieuNaissance: [''],
      age: [''],
      nationalite: [''],
      adresse: [''],
      loisir: ['']
    });

    // Si l'utilisateur n'est pas connecté OU qu'il n'est ni étudiant ni référent en mode vue
    // if (this.isNotAuthenticated || (!this.isStudent && !this.isReferentView)) {
    //   this.formEx1.disable(); // Désactive d'un coup tous les inputs du formulaire
    // }
    // Sécurité : Si ce n'est PAS un étudiant, on verrouille immédiatement
    // if (!this.isStudent) {
    //   this.formEx1.disable();
    // }

    // EX2
    this.formEx2 = this.fb.group({
      q2: ['']
    });

    // EX3
    const group3: any = {};
    this.days.forEach(d => group3[d.key] = [false]);
    this.formEx3 = this.fb.group(group3);

    // EX4
    // this.formEx4 = this.fb.group({
    //   q4: ['']
    // });


    // EX4
    const group4: any = {};
    this.q4Options.forEach(d => group4[d.key] = [false]);
    this.formEx4 = this.fb.group(group4); // 🎯 Bien passer group4 ici !

    // EX5
    // const group5:any = {}// ❌ inutile ici
    this.formEx5 = this.fb.group({
      q5: ['']
    });

    // EX6
    const group6: any = {};
    this.slots.forEach(s => group6[s.key] = ['']);
    this.formEx6 = this.fb.group(group6);

    // EX7
    this.formEx7 = this.fb.group({
      texte: ['']
    });

    // EX8
    const group8: any = {};
    this.ex3Items.forEach(item => group8[item.id] = ['']);
    this.formEx8 = this.fb.group(group8);

    // EX9
    this.formEx9 = this.fb.group({
      texte: ['']
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


  //   submitEx1() {
  //   const answer = this.formEx2.value.q2;

  //   let score = 0;
  //   if (answer === this.correctAnswerEx2) {
  //     score = 1;
  //   }

  //   const category = this.getCurrentCategory();

  //   console.log('Score Ex1:', score, 'Category:', category);

  //   this.next();
  // }
  //   submitEx1() {
  //   const values = this.formEx1.value;

  //   let score = 0;

  //   // Object.values(values).forEach(v => {
  //   //   if (v !== null && v !== '') {
  //   //     score++;
  //   //   }
  //   // });

  //   Object.values(values).forEach(v => {
  //   if (typeof v === 'string') {
  //     if (v.trim() !== '') score++;
  //   } else if (v !== null && v !== undefined) {
  //     score++;
  //   }
  // });

  //   const category = this.getCurrentCategory();

  //   console.log('Score Ex1:', score, 'Category:', category);

  //   this.next();
  // }

  submitEx1() {
    const values = this.formEx1.value;
    this.alreadySubmitted = true;

    let score = 0;

    const AGE_MARGIN = 1;

    const normalFields = [
      'nom',
      'prenom',
      'lieuNaissance',
      'nationalite',
      'adresse',
      'loisir'
    ];

    // 1️⃣ champs classiques : 1 point chacun si rempli
    normalFields.forEach(key => {
      const v = values[key];

      if (typeof v === 'string' && v.trim() !== '') {
        score++;
      }
    });

    // 2️⃣ contrôle dateNaissance (1 point si format OK)
    let birthYear: number | null = null;

    const datePattern = /^(.+[\s\/\-]){2,}\d{2,4}$/;

    if (values.dateNaissance && datePattern.test(values.dateNaissance)) {
      score++;

      const match = values.dateNaissance.match(/(\d{4})$/);
      if (match) birthYear = +match[1];
    }

    // 3️⃣ contrôle âge (1 point si cohérent avec la date)
    if (birthYear && values.age != null) {
      const currentYear = new Date().getFullYear();
      const expectedAge = currentYear - birthYear;

      if (Math.abs(expectedAge - values.age) <= AGE_MARGIN) {
        score++;
      }
    }

    const category = this.getCurrentCategory();

    console.log('Score Ex1:', score, 'Category:', category);

    this.service.saveUnitFlat(
      this.uid,
      "unit1",
      "ex1",
      this.formEx1,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }


  // EX2
  // submitEx2() {
  //   const answer = this.formEx2.value.q2;

  //   let score = 0;

  //   if (answer === this.correctAnswerEx2) {
  //     score = 1;
  //   }

  //   console.log('Score Ex2:', score);

  //   this.next();
  // }

  submitEx2() {
    const answer = this.formEx2.value.q2;
    this.alreadySubmitted = true;
    let score = 0;
    if (answer === this.correctAnswerEx2) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    console.log('Score Ex2:', score, 'Category:', category);

    // FAUT appeler  le service avant d'agréger les points...
    this.service.saveUnitFlat(
      this.uid,
      "unit1",
      "ex2",
      this.formEx2,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  // EX3
  submitEx3() {
    let score = 0;

    const values = this.formEx3.value;

    const allCorrect = this.days.every(d => values[d.key] === d.correct);

    if (allCorrect) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    console.log('Score Ex3:', score, 'Category:', category);

    // FAUT appeler  le service avant d'agréger les points finalement...
    this.service.saveUnitFlat(
      this.uid,
      "unit1",
      "ex3",
      this.formEx3,
      score,
      category
    );


    this.aggregate(category, score);

    this.next();
  }

  // EX4
  // submitEx4() {
  //   const answer = this.formEx4.value.q4;

  //   let score = 0;

  //   if (answer === 'mercredi16h') {
  //     score = 2;
  //   }

  //   console.log('Score Ex4:', score);

  //   this.next();
  // }

  // submitEx4() {
  //   const answer = this.formEx4.value.q4;

  //   const correct = this.q4Options.find(o => o.correct);

  //   this.alreadySubmitted = true;
  //   let score = answer === correct?.value ? 2 : 0;


  //   const category = this.getCurrentCategory();

  //   console.log('Score Ex4:', score, 'Category:', category);

  //   this.service.saveUnitFlat(
  //     this.uid,
  //     "unit1",
  //     "ex4",
  //     this.formEx4,
  //     score,
  //     category
  //   );

  //   this.aggregate(category, score);

  //   this.next();
  // }

 submitEx4() {
    let score = 0;
    let hasError = false;
    let goodAnswersCount = 0;

    const values = this.formEx4.value;

    // On passe en revue chaque option du tableau
    for (const option of this.q4Options) {
      const isChecked = values[option.key] === true;

      if (isChecked) {
        if (option.correct) {
          // Case correcte cochée -> on incrémente le compteur
          goodAnswersCount++;
        } else {
          // Mauvaise case cochée -> signal d'alarme déclenché
          hasError = true;
        }
      }
    }

    // Attribution finale du score
    if (hasError) {
      score = 0; // Une seule erreur annule les points
    } else {
      score = goodAnswersCount; // 1 point par bonne réponse (Max 2)
    }

    const category = this.getCurrentCategory();
    console.log('Score Ex4:', score, 'Category:', category);

    this.service.saveUnitFlat(
      this.uid,
      "unit1",
      "ex4",
      this.formEx4,
      score,
      category
    );

    this.aggregate(category, score);
    this.next();
  }


  // EX5
  submitEx5() {
    const answer = this.formEx5.value.q5;

    this.alreadySubmitted = true;
    let score = 0;

    if (answer === 'non') {
      score = 1;
    }


    const category = this.getCurrentCategory();

    console.log('Score Ex5:', score, 'Category:', category);

    this.service.saveUnitFlat(
      this.uid,
      "unit1",
      "ex5",
      this.formEx5,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  // EX6
  submitEx6() {

    this.alreadySubmitted = true;
    let score = 0;

    this.slots.forEach(slot => {
      if (this.formEx6.value[slot.key] === slot.correct) {
        score++;
      }
    });


    const category = this.getCurrentCategory();

    console.log('Score Ex6:', score, 'Category:', category);

    this.service.saveUnitFlat(
      this.uid,
      "unit1",
      "ex6",
      this.formEx6,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }

  // EX7
  submitEx7() {
    this.alreadySubmitted = true;
    const texte = this.formEx7.value.texte;

    console.log('Texte saisi:', texte);


    const category = this.getCurrentCategory();

    console.log('Category:', category);
    // FAUT appeler  le service avant d'agréger les points...
    this.service.saveUnitFlat(
      this.uid,
      "unit1",
      "ex7",
      this.formEx7,
      null, // ✅ explicite
      category
    );


    this.next();
  }

  // EX8
  submitEx8() {
    this.alreadySubmitted = true;
    let score = 0;

    this.ex3Items.forEach(item => {
      const answer = this.formEx8.value[item.id];

      console.log('réponse', answer);

      if (answer === this.correctAnswers[item.id]) {
        score++;
      }
    });

    const category = this.getCurrentCategory();

    console.log('Score Ex8:', score, 'Category:', category);

    this.service.saveUnitFlat(
      this.uid,
      "unit1",
      "ex8",
      this.formEx8,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();
  }


  // EX9
  // submitEx9() {
  //   this.alreadySubmitted = true;

  //   const texte = this.formEx9.value.texte;
  //   const wordCount = this.countWords(texte);

  //   if (wordCount < 30) {
  //     console.log('Pas assez de mots');
  //     return;
  //   }

  //   console.log('Texte saisi:', texte);

  //   const category = this.getCurrentCategory();
  //   console.log('Category:', category);

  //   this.service.saveUnitFlat(
  //     this.uid,
  //     "unit1",
  //     "ex9",
  //     this.formEx9,
  //     null, // ✅ explicite
  //     category
  //   );

  //   // ⛔ PAS de next → dernier exercice

  //   // this.service.saveUnitResult(
  //   //   this.uid,
  //   //   "unit1",
  //   //   this.aggregateState
  //   // );

  //   this.service.saveUnitResult(
  //     this.uid,
  //     "unit1",
  //     this.aggregateState
  //   ).then(() => {

  //     // ✅ affichage du message UNIQUEMENT après enregistrement OK
  //     this.showFinalMessage = true;

  //   });
  // }
  // EX9
  submitEx9() {
    this.alreadySubmitted = true;

    const texte = this.formEx9.value.texte;
    const wordCount = this.countWords(texte);

    if (wordCount < 30) {
      console.log('Pas assez de mots');
      return;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit1",
      "ex9",
      this.formEx9,
      null, // ✅ explicite
      category
    );

    // 🧠 AVANT D'ENVOYER LES RÉSULTATS : 
    // On s'assure que la catégorie de l'EX9 (et des autres si besoin) 
    // existe dans l'agrégation. Si elle n'a aucun score, on lui attribue explicitement 'null'.
    if (!this.aggregateState[category]) {
      this.aggregateState[category] = null as any; // Maintient la clé en base avec une valeur nulle
    }

    // Si tu as d'autres exercices non scorés (comme l'EX7), et que tu veux être sûr 
    // qu'ils y soient, on peut faire la même vérification pour leur catégorie.

    this.service.saveUnitResult(
      this.uid,
      "unit1",
      this.aggregateState // 👉 Contient maintenant la catégorie avec sa valeur null
    ).then(() => {
      this.showFinalMessage = true;
    });
  }

  // 1. Compter les mots (minimum 30)
  countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  }


  // getCurrentCategory(): string {
  //   return this.steps[this.currentStep]?.category;
  // }


  // getCurrentCategory(stepIndex: number): string {
  //   return this.steps[stepIndex]?.category;
  // }

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
      'unit1_aggregation',
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

      return this.unitData?.[`units.unit1.${exId}`]?.score || 0;
    }

    // MODE STUDENT
    const category = this.getCurrentCategory();

    return this.aggregateState[category] || 0;
  }

  // VERSION OK 
  //   startTimer() {
  //   this.alreadySubmitted = false;

  //   const step = this.steps[this.currentStep];

  //   if (!step.duration) return;

  //   setTimeout(() => {
  //     this.submitCurrent(); // même logique que bouton ?????
  //   }, step.duration * 1000);
  // }
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

      // stop propre de l'interval
      if (elapsed >= total) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }, 1000);

    this.timerId = setTimeout(() => {
      this.submitCurrent();
      this.next();
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
    }
  }

  onEnter(event: Event, currentField: string) {
    const keyboardEvent = event as KeyboardEvent;

    keyboardEvent.preventDefault();

    const fields = this.ex1Fields.map(f => f.name);
    const index = fields.indexOf(currentField);

    const nextField = fields[index + 1];

    if (nextField) {
      const el = document.getElementById(nextField);
      if (el) {
        (el as HTMLElement).focus();
      }
    } else {
      this.submitEx1();
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
    return this.unitData?.[`units.unit1.${exId}`]?.submitted ?? false;
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

  // Nécessaires pour référent

  // loadData() {
  //   this.service.getUnit(this.uid).subscribe(data => {
  //     this.unitData = data ?? {};
  //     this.patchForms();
  //   });
  // }

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

  // patchForms() {

  //   const unit = this.unitData?.units?.unit1;
  //   if (!unit) return;

  //   if (unit.ex1?.answers) {
  //     this.formEx1.patchValue(unit.ex1.answers);
  //     console.log(unit.ex1.answers);

  //   }

  //   if (unit.ex2?.answers) {
  //     this.formEx2.patchValue(unit.ex2.answers);
  //   }


  //   if (unit.ex3?.answers) {
  //     this.formEx3.patchValue(unit.ex3.answers);
  //   }

  //   if (unit.ex4?.answers) {
  //     this.formEx4.patchValue(unit.ex4.answers);
  //   }

  //   if (unit.ex5?.answers) {
  //     this.formEx5.patchValue(unit.ex5.answers);
  //   }

  //   if (unit.ex6?.answers) {
  //     this.formEx6.patchValue(unit.ex6.answers);
  //   }

  //   if (unit.ex7?.answers) {
  //     this.formEx7.patchValue(unit.ex7.answers);
  //   }

  //   if (unit.ex8?.answers) {
  //     this.formEx8.patchValue(unit.ex8.answers);
  //   }

  //   if (unit.ex9?.answers) {
  //     this.formEx9.patchValue(unit.ex9.answers);
  //   }
  // }

  // patchForms() {

  //   // Raccourci local pour lisibilité
  //   const data = this.unitData;

  //   // Sécurité : si aucune donnée → on sort
  //   if (!data) return;

  //   // ⚠️ IMPORTANT :
  //   // On accède aux données via des clés "flat"
  //   // ex: 'units.unit1.ex1' → objet contenant { answers, score, ... }

  //   // EXERCICE 1
  //   if (data['units.unit1.ex1']?.answers) {
  //     this.formEx1.patchValue(data['units.unit1.ex1'].answers);
  //   }

  //   // EXERCICE 2
  //   if (data['units.unit1.ex2']?.answers) {
  //     this.formEx2.patchValue(data['units.unit1.ex2'].answers);
  //   }

  //   // EXERCICE 3
  //   if (data['units.unit1.ex3']?.answers) {
  //     this.formEx3.patchValue(data['units.unit1.ex3'].answers);
  //   }

  //   // EXERCICE 4
  //   if (data['units.unit1.ex4']?.answers) {
  //     this.formEx4.patchValue(data['units.unit1.ex4'].answers);
  //   }

  //   // EXERCICE 5
  //   if (data['units.unit1.ex5']?.answers) {
  //     this.formEx5.patchValue(data['units.unit1.ex5'].answers);
  //   }

  //   // EXERCICE 6
  //   if (data['units.unit1.ex6']?.answers) {
  //     this.formEx6.patchValue(data['units.unit1.ex6'].answers);
  //   }

  //   // EXERCICE 7
  //   if (data['units.unit1.ex7']?.answers) {
  //     this.formEx7.patchValue(data['units.unit1.ex7'].answers);
  //   }

  //   // EXERCICE 8
  //   if (data['units.unit1.ex8']?.answers) {
  //     this.formEx8.patchValue(data['units.unit1.ex8'].answers);
  //   }

  //   // EXERCICE 9
  //   if (data['units.unit1.ex9']?.answers) {
  //     this.formEx9.patchValue(data['units.unit1.ex9'].answers);
  //   }
  // }

  patchForms() {

    // Raccourci local pour lisibilité
    const data = this.unitData;

    // Sécurité : si aucune donnée → on sort
    if (!data) return;

    // ⚠️ IMPORTANT :
    // On accède aux données via des clés "flat"
    // ex: 'units.unit1.ex1' → objet contenant { answers, score, ... }

    // EXERCICE 1
    if (data['units.unit1.ex1']?.answers) {
      this.formEx1.patchValue(data['units.unit1.ex1'].answers);
    }

    // EXERCICE 2
    if (data['units.unit1.ex2']?.answers) {
      this.formEx2.patchValue(data['units.unit1.ex2'].answers);
    }

    // EXERCICE 3
    if (data['units.unit1.ex3']?.answers) {
      this.formEx3.patchValue(data['units.unit1.ex3'].answers);
    }

    // EXERCICE 4
    if (data['units.unit1.ex4']?.answers) {
      this.formEx4.patchValue(data['units.unit1.ex4'].answers);
    }

    // EXERCICE 5
    if (data['units.unit1.ex5']?.answers) {
      this.formEx5.patchValue(data['units.unit1.ex5'].answers);
    }

    // EXERCICE 6
    if (data['units.unit1.ex6']?.answers) {
      this.formEx6.patchValue(data['units.unit1.ex6'].answers);
    }

    // EXERCICE 7
    if (data['units.unit1.ex7']?.answers) {
      this.formEx7.patchValue(data['units.unit1.ex7'].answers);
    }

    // EXERCICE 8
    if (data['units.unit1.ex8']?.answers) {
      this.formEx8.patchValue(data['units.unit1.ex8'].answers);
    }

    // EXERCICE 9
    if (data['units.unit1.ex9']?.answers) {
      this.formEx9.patchValue(data['units.unit1.ex9'].answers);
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
    }

    // On récupère ce que le candidat a enregistré en base à la fin de son EX9
    this.aggregateState = this.unitData['units.unit1.result'] || {};
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
    this.service.saveUnitResultUpdate(this.uid, "unit1", this.aggregateState)
      .then(() => {
        console.log(`✅ Score mis à jour avec succès pour : ${categoryName}`);
      })
      .catch(err => {
        console.error("Erreur Firestore :", err);
        alert("Erreur lors de l'enregistrement.");
      });
  }

}
