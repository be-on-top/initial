import { Component } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { FormBuilder, FormGroup } from '@angular/forms';
interface Step {
  id: string;
  category: string;
  duration?: number;
}

@Component({
  selector: 'app-unit1',
  templateUrl: './unit1.component.html',
  styleUrls: ['./unit1.component.css']
})


export class Unit1Component {

  // pour authentification à venir
  uid: string = "";





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



  steps: Step[] = [
    { id: 'ex1', category: this.categories[0], duration: 100 },
    { id: 'ex2', category: this.categories[1], duration: 25 },
    { id: 'ex3', category: this.categories[1], duration: 35 },
    { id: 'ex4', category: this.categories[1], duration: 30 },
    { id: 'ex5', category: this.categories[1], duration: 15 },
    { id: 'ex6', category: this.categories[1], duration: 60 },
    { id: 'ex7', category: this.categories[2] }, // libre
    { id: 'ex8', category: this.categories[3], duration: 100 },
    { id: 'ex9', category: this.categories[2] }  // libre
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
    { value: 'lundi17', label: 'Lundi 17h', correct: false },
    { value: 'mardi13', label: 'Mardi 13h', correct: false },
    { value: 'mercredi16', label: 'Mercredi 16h', correct: true },
    { value: 'samedi1230', label: 'Samedi 12h30', correct: false }
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



  constructor(private fb: FormBuilder, private auth: Auth) {
    this.initForms();

    const saved = localStorage.getItem('unit1_aggregation');

    if (saved) {
      this.aggregateState = JSON.parse(saved);
    }
  }

  ngOnInit() {
    this.startTimer();

    // RESET scoring à chaque chargement
    localStorage.removeItem('unit1_aggregation');
    this.aggregateState = {};


    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.uid = user.uid

        console.log("Utilisateur authentifié !", this.uid);

      }
      else {
        console.log("Personne n'est authentifié actuellement !");
      }
    })
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

    // EX2
    this.formEx2 = this.fb.group({
      q2: ['']
    });

    // EX3
    const group3: any = {};
    this.days.forEach(d => group3[d.key] = [false]);
    this.formEx3 = this.fb.group(group3);

    // EX4
    this.formEx4 = this.fb.group({
      q4: ['']
    });

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

  submitEx4() {
    const answer = this.formEx4.value.q4;

    const correct = this.q4Options.find(o => o.correct);

    this.alreadySubmitted = true;
    let score = answer === correct?.value ? 2 : 0;


    const category = this.getCurrentCategory();

    console.log('Score Ex4:', score, 'Category:', category);
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
    this.aggregate(category, score);

    this.next();
  }


  // EX9
  submitEx9() {
    this.alreadySubmitted = true;

    const texte = this.formEx9.value.texte;
    const wordCount = this.countWords(texte);

    if (wordCount < 30) {
      console.log('Pas assez de mots');
      return;
    }

    console.log('Texte saisi:', texte);

    const category = this.getCurrentCategory();
    console.log('Category:', category);

    // ⛔ PAS de next → dernier exercice
  }

  // 1. Compter les mots (minimum 30)
  countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  }




  getCurrentCategory(): string {
    return this.steps[this.currentStep]?.category;
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

  getCurrentScore(): number {
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

}
