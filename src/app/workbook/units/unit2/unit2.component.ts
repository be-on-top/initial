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
  selector: 'app-unit2',
  templateUrl: './unit2.component.html',
  styleUrls: ['./unit2.component.css']
})


export class Unit2Component {

  label: string = "FLE niveau A2"

  // On déclare en haut du composant
  commentCtrl = new FormControl('');

  // pour authentification à venir
  uid: string = "";
  userRole: string | null = null

  unitData: any = {};

  showFinalMessage: boolean = false;

  isReferentView: boolean = false;

  categories: string[] = ["Compréhension écrite", "Production écrite"]

  // préconisé si on fait une timeline
  alreadySubmitted = false;
  private intervalId: any = null;
  private timerId: any = null;

  progress = 0;

  aggregateState: Record<string, number> = {};


  steps: Step[] = [
    { id: 'ex1', category: this.categories[0], duration: 195, maxScore: 10 },

    { id: 'ex2', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex3', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex4', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex5', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex6', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex7', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex8', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex9', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex10', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex11', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex12', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex13', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex14', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex15', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex16', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex17', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex18', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex19', category: this.categories[0], duration: 50, maxScore: 1 },
    { id: 'ex20', category: this.categories[0], duration: 50, maxScore: 1 },

    { id: 'ex21', category: this.categories[1], maxScore: 12 },
    { id: 'ex22', category: this.categories[1], maxScore: 12 }
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

  ex1Fields = [
    { name: 'nom', label: 'Nom', type: 'text' },
    { name: 'prenom', label: 'Prénom', type: 'text' },
    { name: 'dateNaissance', label: 'Date de naissance', type: 'text' },
    { name: 'lieuNaissance', label: 'Lieu de naissance', type: 'text' },
    { name: 'age', label: 'Âge', type: 'number' },
    { name: 'nationalite', label: 'Nationalité', type: 'text' },
    { name: 'adresse', label: 'Adresse', type: 'textarea' },
    { name: 'profession', label: 'Profession', type: 'text' },
    { name: 'loisir', label: 'Mes loisirs', type: 'textarea' },
    { name: 'aime', label: 'J\'aime', type: 'textarea' }
  ];

  // ------------------------------------------------------
  // Exercice 1 
  // Association annonces / situations
  // ------------------------------------------------------

  ex1Items = [
    {
      id: 1,
      annonce: 'Jeune couple sérieux recherche appartement T2 ou T3, non meublé, secteur centre ou proche transports. Budget raisonnable. Références solides.'
    },
    {
      id: 2,
      annonce: 'Étudiante calme et soigneuse cherche studio ou petit T2, meublé de préférence, proche université. Entrée rapide souhaitée. Garant disponible.'
    },
    {
      id: 3,
      annonce: 'Famille avec un enfant cherche T3 minimum, ascenseur souhaité, écoles à proximité. Budget adapté. Dossier complet.'
    },
    {
      id: 4,
      annonce: 'Salarié en CDI, non-fumeur, sans animaux, recherche appartement 2 pièces lumineux, avec balcon si possible. Quartier calme apprécié.'
    },
    {
      id: 5,
      annonce: 'Retraitée seule, discrète et solvable, recherche petit appartement au calme, rez-de-chaussée ou ascenseur indispensable.'
    },
    {
      id: 6,
      annonce: 'Professionnel muté recherche appartement meublé, T1 ou T2, pour longue durée. Sérieux et disponible immédiatement.'
    }
  ];

  situations = [
    'A. Sophie cherche un appartement pas trop cher. Elle est étudiante.',
    'B. Robert cherche un appartement en ville. Il n\'aime pas le bruit.',
    'C. Germaine, 75 ans, se déplace difficilement et ne veut pas d\'appartement à l\'étage.',
    'D. Sacha et Bénédicte cherchent un appartement avec 2 chambres. Ils ont 1 enfant.',
    'E. Jean change de département et cherche un appartement avec les meubles.',
    'F. Vanille et Fred cherchent un appartement en ville.'
  ];

  correctAnswers: { [key: number]: number } = {
    1: 2,
    2: 4,
    3: 5,
    4: 3,
    5: 6,
    6: 1
  };

  // ------------------------------------------------------
  // Exercice 2 - Question 1 = EX2
  // ------------------------------------------------------

  ex2Options = [
    { value: 'rep1', label: 'Le début des vacances' },
    { value: 'rep2', label: 'La fête des voisins' },
    { value: 'rep3', label: 'Un nouveau locataire' }
  ];

  correctAnswerEx2 = 'rep2';

  // ------------------------------------------------------
  // Exercice 2 - Question 2 = EX3
  // ------------------------------------------------------

  ex3Options = [
    { value: 'rep1', label: 'Dans le parc de la mairie' },
    { value: 'rep2', label: "Dans le hall de l'immeuble" },
    { value: 'rep3', label: "Dans l'appartement d'un voisin" }
  ];

  correctAnswerEx3 = 'rep2';

  // ------------------------------------------------------
  // Exercice 2 - Question 3 = EX4
  // ------------------------------------------------------

  ex4Options = [
    { value: 'rep1', label: 'La quittance de loyer' },
    { value: 'rep2', label: "Papi et mamie" },
    { value: 'rep3', label: "Un plat sucré ou salé" }
  ];

  correctAnswerEx4 = 'rep3';

  // ------------------------------------------------------
  // Exercice 2 - Question 4 = EX5
  // ------------------------------------------------------

  ex5Options = [
    { value: 'rep1', label: "L'automne" },
    { value: 'rep2', label: "L'hiver" },
    { value: 'rep3', label: "Le printemps" },
    { value: 'rep4', label: "L'été" }
  ];

  correctAnswerEx5 = 'rep2';

  // ------------------------------------------------------
  // Exercice 2 - Question 5 = EX6
  // ------------------------------------------------------

  // correctAnswerEx6 = '2026-06-21';
  correctAnswerEx6 = `${new Date().getFullYear()}-06-21`;


  // ------------------------------------------------------
  // Exercice 2 - Question 6 = EX7
  // ------------------------------------------------------

  correctAnswerEx7 = '19:00';

  // ------------------------------------------------------
  // Exercice 3 - Partie 1
  // Question 1 = EX8
  // ------------------------------------------------------

  ex8Options = [
    { value: 'rep1', label: 'Brasserie' },
    { value: 'rep2', label: 'Pizzeria' },
    { value: 'rep3', label: 'Restaurant' }
  ];

  correctAnswerEx8 = 'rep3';

  // ------------------------------------------------------
  // Exercice 3 - Partie 1
  // Question 2 = EX9
  // ------------------------------------------------------

  ex9Options = [
    { value: 'rep1', label: 'Rouges et noirs' },
    { value: 'rep2', label: 'Propres' },
    { value: 'rep3', label: 'Sales' }
  ];

  correctAnswerEx9 = 'rep2';

  // ------------------------------------------------------
  // Exercice 3 - Partie 1
  // Question 3 = EX10
  // ------------------------------------------------------

  ex10Options = [
    { value: true, label: 'Oui' },
    { value: false, label: 'Non' }
  ];

  correctAnswerEx10 = false;

  // ------------------------------------------------------
  // Exercice 3 - Partie 1
  // Question 4 = EX11
  // ------------------------------------------------------

  ex11Options = [
    { value: 'rep1', label: "Protéger l'environnement" },
    { value: 'rep2', label: 'Protéger les voisins' },
    { value: 'rep3', label: 'Protéger les clients et les salariés' }
  ];

  correctAnswerEx11 = 'rep3';


  // ------------------------------------------------------
  // Exercice 3 - Partie 2
  // Question 1 = EX12
  // ------------------------------------------------------

  ex12Options = [
    { value: 'rep1', label: 'elle est partie en vacances' },
    { value: 'rep2', label: ' elle est malade' },
    { value: 'rep3', label: 'elle a quitté son poste pour un autre restaurant' }
  ];

  correctAnswerEx12 = 'rep2';

  // ------------------------------------------------------
  // Exercice 3 - Partie 2
  // Question 2 = EX13
  // ------------------------------------------------------

  ex13Options = [
    { value: 'rep1', label: '10' },
    { value: 'rep2', label: '8' },
    { value: 'rep3', label: '7' }
  ];

  correctAnswerEx13 = 'rep3';

  // ------------------------------------------------------
  // EXERCICE 3 Partie 3 Question 1 = EX14
  // ------------------------------------------------------

  ex14Options = [
    { value: 'chaude', label: 'Que la machine soit chaude' },
    { value: 'fume', label: 'Que la machine fume' },
    { value: 'propre', label: 'Que la machine soit propre' }
  ];

  correctAnswerEx14 = 'propre';

  // ------------------------------------------------------
  // EXERCICE 3 Partie 3 Question 2 = EX15
  // ------------------------------------------------------

  ex15Options = [
    { value: 'cote', label: 'À côté de la machine' },
    { value: 'bec', label: 'Sous le bec verseur' },
    { value: 'plateau', label: 'Sur le plateau client' }
  ];

  correctAnswerEx15 = 'bec';


  // ------------------------------------------------------
  // Question 1
  // ------------------------------------------------------

  correctTitle = 'Salon Maison & Déco';

  // ------------------------------------------------------
  // Question 2 = EX17
  // ------------------------------------------------------

  ex17Options = [
    { value: 'videGrenier', label: "D'un vide-grenier" },
    { value: 'salonMaison', label: "D'un salon Maison & Décoration" },
    { value: 'vetements', label: "D'un magasin de vêtements" }
  ];

  correctAnswerEx17 = 'salonMaison';

  // ------------------------------------------------------
  // Question 3 = EX18
  // ------------------------------------------------------

  ex18Options = [
    { value: 'manger', label: 'Boire et manger' },
    { value: 'crepes', label: 'Apprendre à faire des crêpes' },
    { value: 'decoration', label: 'Voir des stands sur les nouveautés en décoration' }
  ];

  correctAnswerEx18 = 'decoration';

  // ------------------------------------------------------
  // Question 4 = EX19
  // ------------------------------------------------------

  ex19Options = [
    { value: true, label: 'Vrai' },
    { value: false, label: 'Faux' }
  ];

  correctAnswerEx19 = false;

  // ------------------------------------------------------
  // Question 5 = EX20
  // ------------------------------------------------------

  ex20Options = [
    { value: 'amis', label: 'Des ami(e)s' },
    { value: 'specialistes', label: "Des spécialistes de l'aménagement d'intérieur" },
    { value: 'cousins', label: 'Des cousins' }
  ];

  correctAnswerEx20 = 'specialistes';

  // ------------------------------------------------------
  // EX21 + EX22
  // ------------------------------------------------------

  mailFields = [
    { name: 'from', label: 'De', type: 'email' },
    { name: 'to', label: 'À', type: 'email' },
    { name: 'cc', label: 'Cc', type: 'email' },
    { name: 'subject', label: 'Objet', type: 'text' },
    { name: 'message', label: 'Message', type: 'textarea' }
  ];


  constructor(private fb: FormBuilder, private auth: AuthService, private service: WorkbookService, private route: ActivatedRoute, private router: Router) {
    this.initForms();

    const saved = localStorage.getItem('unit2_aggregation');

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
          if (this.unitData?.['units.unit2.result']) {
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

    // ======================================================
    // EXERCICE 1
    // ======================================================

    const group1: any = {};

    this.ex1Items.forEach(item => {
      group1[item.id] = [''];
    });

    this.formEx1 = this.fb.group(group1);

    // ======================================================
    // EXERCICE 2 
    // ======================================================

    // Question 1
    this.formEx2 = this.fb.group({
      answer: ['']
    });

    // Question 2
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

    // Question 4
    this.formEx11 = this.fb.group({
      answer: ['']
    });


    // ======================================================
    // EXERCICE 3 Partie 2 
    // ======================================================

    // Question 1
    this.formEx12 = this.fb.group({
      answer: ['']
    });

    // Question 2
    this.formEx13 = this.fb.group({
      answer: ['']
    });


    // ======================================================
    // EXERCICE 3 Partie 3 
    // ======================================================

    // Question 1
    this.formEx14 = this.fb.group({
      answer: ['']
    });

    // Question 2
    this.formEx15 = this.fb.group({
      answer: ['']
    });

    // ======================================================
    // EXERCICE 4
    // ======================================================

    // Question 1
    this.formEx16 = this.fb.group({
      title: ['']
    });

    // Question 2
    this.formEx17 = this.fb.group({
      answer: ['']
    });

    // Question 3
    this.formEx18 = this.fb.group({
      answer: ['']
    });

    // Question 4
    this.formEx19 = this.fb.group({
      answer: ['']
    });

    // Question 5
    this.formEx20 = this.fb.group({
      answer: ['']
    });

    // EXERCICE 21

    this.formEx21 = this.fb.group({
      from: [''],
      to: [''],
      cc: [''],
      subject: [''],
      message: ['']
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


  // EX1
  submitEx1() {

    this.alreadySubmitted = true;

    let score = 0;

    const answers = this.formEx1.value;

    Object.keys(this.correctAnswers).forEach(key => {

      const situationId = Number(key);

      // Réponse sélectionnée dans le formulaire.
      // Le <select> renvoie une chaîne de caractères,
      // donc on la convertit en nombre.
      const answer = Number(answers[situationId]);

      // Comparaison avec la bonne réponse.
      if (answer === this.correctAnswers[situationId]) {
        score++;
      }

    });

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex1",
      this.formEx1,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }
  // EX2
  submitEx2() {

    // TODO : récupérer les valeurs du formulaire
    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 2
    const answer = this.formEx2.value.answer
    if (answer === this.correctAnswerEx2) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    // TODO : sauvegarde spécifique si nécessaire

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
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

    // TODO : récupérer les valeurs du formulaire

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 3
    const answer = this.formEx3.value.answer
    if (answer === this.correctAnswerEx3) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    // TODO : sauvegarde spécifique si nécessaire

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex3",
      this.formEx3,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }



  // EX4
  submitEx4() {

    // TODO : récupérer les valeurs du formulaire

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 4
    const answer = this.formEx4.value.answer
    if (answer === this.correctAnswerEx4) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    // TODO : sauvegarde spécifique si nécessaire

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
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

    // TODO : récupérer les valeurs du formulaire

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 5
    const answer = this.formEx5.value.answer
    if (answer === this.correctAnswerEx5) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    // TODO : sauvegarde spécifique si nécessaire

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
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

    // TODO : récupérer les valeurs du formulaire

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 8
    const answer = this.formEx6.value.answer
    if (answer === this.correctAnswerEx6) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    // TODO : sauvegarde spécifique si nécessaire

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
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

    // TODO : récupérer les valeurs du formulaire

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 8
    const answer = this.formEx7.value.answer
    if (answer === this.correctAnswerEx7) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    // TODO : sauvegarde spécifique si nécessaire

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex7",
      this.formEx7,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX8
  submitEx8() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 8
    const answer = this.formEx8.value.answer
    if (answer === this.correctAnswerEx8) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex8",
      this.formEx8,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX9
  submitEx9() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 9
    const answer = this.formEx9.value.answer
    if (answer === this.correctAnswerEx9) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex9",
      this.formEx9,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX10
  submitEx10() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 10
    const answer = this.formEx10.value.answer
    if (answer === this.correctAnswerEx10) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex10",
      this.formEx10,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX11
  submitEx11() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 11
    const answer = this.formEx12.value.answer
    if (answer === this.correctAnswerEx11) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex11",
      this.formEx11,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX12
  submitEx12() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 17
    const answer = this.formEx12.value.answer
    if (answer === this.correctAnswerEx12) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex12",
      this.formEx12,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX13
  submitEx13() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 13
    const answer = this.formEx13.value.answer
    if (answer === this.correctAnswerEx13) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex13",
      this.formEx13,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX14
  submitEx14() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 14
    const answer = this.formEx14.value.answer
    if (answer === this.correctAnswerEx14) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex14",
      this.formEx14,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX15
  submitEx15() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 15
    const answer = this.formEx15.value.answer
    if (answer === this.correctAnswerEx15) {
      score = 1;
    }


    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex15",
      this.formEx15,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX16
  submitEx16() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 16
    const title = (this.formEx16.value.title ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'et');

    const expected = this.correctTitle
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'et');

    if (title === expected) {
      score = 1;
    }


    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex16",
      this.formEx16,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX17
  submitEx17() {
    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 17
    const answer = this.formEx17.value.answer
    if (answer === this.correctAnswerEx17) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex17",
      this.formEx17,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX18
  submitEx18() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 18
    // TODO : logique de correction de l'exercice 17
    const answer = this.formEx18.value.answer
    if (answer === this.correctAnswerEx18) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex18",
      this.formEx18,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX19
  submitEx19() {

    this.alreadySubmitted = true;

    let score = 0;



    // Logique de correction de l'exercice 19
    const answer = this.formEx19.value.answer
    console.log(answer, typeof answer);
    console.log(this.correctAnswerEx19, typeof this.correctAnswerEx19);
    if (answer === this.correctAnswerEx19) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex19",
      this.formEx19,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }

  // EX20
  submitEx20() {

    this.alreadySubmitted = true;

    let score = 0;

    // Logique de correction de l'exercice 20
    const answer = this.formEx20.value.answer
    if (answer === this.correctAnswerEx20) {
      score = 1;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex20",
      this.formEx20,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }


  // EX21
  submitEx21() {

    const values = this.formEx21.value;

    const message = values.message || '';

    // Le message doit contenir au minimum 60 mots.
    // Si ce minimum n'est pas atteint, la soumission est bloquée.
    const wordCount = this.countWords(message);

    if (wordCount < 60) {
      return;
    }

    this.alreadySubmitted = true;

    let score = 0;

    // Vérification de la structure générale d'une adresse email.
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email expéditeur : 1 point
    if (regexEmail.test(values.from)) {
      score++;
    }

    // Email destinataire : 1 point
    if (regexEmail.test(values.to)) {
      score++;
    }

    // Email en copie : 1 point
    if (regexEmail.test(values.cc)) {
      score++;
    }

    // Objet renseigné : 1 point
    if (values.subject && values.subject.trim() !== '') {
      score++;
    }

    // Mot-clé attendu dans l'objet : 1 point
    if (
      values.subject &&
      values.subject.toLowerCase().includes('anniversaire')
    ) {
      score++;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex21",
      this.formEx21,
      score,
      category
    );

    this.aggregate(category, score);

    this.next();

  }


  // EX22
  submitEx22() {

    const values = this.formEx22.value;

    const message = values.message || '';

    // Le message doit contenir au minimum 60 mots.
    if (this.countWords(message) < 60) {
      return;
    }

    this.alreadySubmitted = true;

    let score = 0;

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email expéditeur : 1 point
    if (regexEmail.test(values.from)) {
      score++;
    }

    // Email destinataire : 1 point
    if (regexEmail.test(values.to)) {
      score++;
    }

    // Email en copie : 1 point
    if (regexEmail.test(values.cc)) {
      score++;
    }

    // Objet renseigné : 1 point
    if (values.subject && values.subject.trim() !== '') {
      score++;
    }

    // Mot-clé attendu : 1 point
    if (
      values.subject &&
      values.subject.toLowerCase().includes('naissance')
    ) {
      score++;
    }

    const category = this.getCurrentCategory();

    this.service.saveUnitFlat(
      this.uid,
      "unit2",
      "ex22",
      this.formEx22,
      score,
      category
    );

    this.aggregate(category, score);

    // Dernier exercice de l'unité :
    // on enregistre les résultats finaux au lieu de passer à l'exercice suivant.
    this.service.saveUnitResult(
      this.uid,
      "unit2",
      this.aggregateState
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

      // return this.unitData?.[`units.unit1.${exId}`]?.score || 0;
      return this.unitData?.[`units.unit2.${exId}`]?.score || 0;
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

      case 8: this.submitEx9(); break;

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

      case 21: this.submitEx22(); break;



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
    // return this.unitData?.[`units.unit1.${exId}`]?.submitted ?? false;
    return this.unitData?.[`units.unit2.${exId}`]?.submitted ?? false;
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


  patchForms() {

    // Raccourci local pour lisibilité
    const data = this.unitData;

    // Sécurité : si aucune donnée → on sort
    if (!data) return;

    // ⚠️ IMPORTANT :
    // On accède aux données via des clés "flat"
    // ex: 'units.unit2.ex1' → objet contenant { answers, score, ... }

    // EXERCICE 1
    if (data['units.unit2.ex1']?.answers) {
      this.formEx1.patchValue(data['units.unit2.ex1'].answers);
    }

    // EXERCICE 2
    if (data['units.unit2.ex2']?.answers) {
      this.formEx2.patchValue(data['units.unit2.ex2'].answers);
    }

    // EXERCICE 3
    if (data['units.unit2.ex3']?.answers) {
      this.formEx3.patchValue(data['units.unit2.ex3'].answers);
    }

    // EXERCICE 4
    if (data['units.unit2.ex4']?.answers) {
      this.formEx4.patchValue(data['units.unit2.ex4'].answers);
    }

    // EXERCICE 5
    if (data['units.unit2.ex5']?.answers) {
      this.formEx5.patchValue(data['units.unit2.ex5'].answers);
    }

    // EXERCICE 6
    if (data['units.unit2.ex6']?.answers) {
      this.formEx6.patchValue(data['units.unit2.ex6'].answers);
    }

    // EXERCICE 7
    if (data['units.unit2.ex7']?.answers) {
      this.formEx7.patchValue(data['units.unit2.ex7'].answers);
    }

    // EXERCICE 8
    if (data['units.unit2.ex8']?.answers) {
      this.formEx8.patchValue(data['units.unit2.ex8'].answers);
    }

    // EXERCICE 9
    if (data['units.unit2.ex9']?.answers) {
      this.formEx9.patchValue(data['units.unit2.ex9'].answers);
    }

    // EXERCICE 10
    if (data['units.unit2.ex10']?.answers) {
      this.formEx10.patchValue(data['units.unit2.ex10'].answers);
    }

    // EXERCICE 11
    if (data['units.unit2.ex11']?.answers) {
      this.formEx11.patchValue(data['units.unit2.ex11'].answers);
    }

    // EXERCICE 12
    if (data['units.unit2.ex12']?.answers) {
      this.formEx12.patchValue(data['units.unit2.ex12'].answers);
    }

    // EXERCICE 13
    if (data['units.unit2.ex13']?.answers) {
      this.formEx13.patchValue(data['units.unit2.ex13'].answers);
    }

    // EXERCICE 14
    if (data['units.unit2.ex14']?.answers) {
      this.formEx14.patchValue(data['units.unit2.ex14'].answers);
    }

    // EXERCICE 15
    if (data['units.unit2.ex15']?.answers) {
      this.formEx15.patchValue(data['units.unit2.ex15'].answers);
    }

    // EXERCICE 16
    if (data['units.unit2.ex16']?.answers) {
      this.formEx16.patchValue(data['units.unit2.ex16'].answers);
    }

    // EXERCICE 17
    if (data['units.unit2.ex17']?.answers) {
      this.formEx17.patchValue(data['units.unit2.ex17'].answers);
    }

    // EXERCICE 18
    if (data['units.unit2.ex18']?.answers) {
      this.formEx18.patchValue(data['units.unit2.ex18'].answers);
    }

    // EXERCICE 19
    if (data['units.unit2.ex19']?.answers) {
      this.formEx19.patchValue(data['units.unit2.ex19'].answers);
    }

    // EXERCICE 20
    if (data['units.unit2.ex20']?.answers) {
      this.formEx20.patchValue(data['units.unit2.ex20'].answers);
    }

    // EXERCICE 21
    if (data['units.unit2.ex21']?.answers) {
      this.formEx21.patchValue(data['units.unit2.ex21'].answers);
    }

    // EXERCICE 22
    if (data['units.unit2.ex22']?.answers) {
      this.formEx22.patchValue(data['units.unit2.ex22'].answers);
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
      this.formEx22.disable();
    }

    // On récupère ce que le candidat a enregistré en base à la fin de son EX22
    this.aggregateState = this.unitData['units.unit2.result'] || {};



    // 💬 ZONE COMMENTAIRE RÉFÉRENT (Ajout ici)
    // On récupère le commentaire global de l'unité s'il existe déjà dans Firestore
    if (data['units.unit2.commentReferent']) {
      this.commentCtrl.setValue(data['units.unit2.commentReferent']);
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



  async cloturerEvaluation() {
    // 1️⃣ On récupère la valeur actuelle du champ texte (et on nettoie les espaces)
    const texteFinal = this.commentCtrl.value?.trim() || '';

    // On transforme le null en 0 si jamais il n'y a pas encore de note
    const noteFinale = Number(this.getGlobalNoteOn20()) || 0;

    // 2️⃣ On passe 'texteFinal' comme 6ème argument à ton service
    await this.service.finalizeUnit(
      this.uid,
      'unit1',
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
    this.service.updateUnitComment(this.uid, "unit1", texte);
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



}
