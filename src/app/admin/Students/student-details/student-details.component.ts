import { Component, Input, Output, EventEmitter } from '@angular/core';
// pour interpréter les balises HTML enregistrées en base avec un éditeur de text
import { DomSanitizer } from '@angular/platform-browser';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../students.service';
import { Student } from '../student';
import { Evaluation } from '../../evaluation';
import { QuizDetails } from '../../quizzDetails';
import { SettingsService } from '../../settings.service';
import { Observable, forkJoin, map, of } from 'rxjs';
// pour anticiper des essais de chart.js
import { ChartService } from '../../chart.service';




@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})

export class StudentDetailsComponent {
  title: string = ""

  editMode: boolean = false;
  editedStudent?: Student;
  editing: boolean = false;
  studentId: string = "";
  // @Input() student: Student;
  // student: any = {};
  student: Student = {} as Student;
  // @Output() deleteStudent = new EventEmitter<Student>();


  lastIndex: number = 0
  // pour afficher si on garde cette option fullResults à l'administrateur
  fullResults: { [key: string]: { duration: number; cost: number } }[] = [];
  tradesEvaluated: string[] = []
  userRouterLinks: any
  // userFollowUpEvaluations: Record<string, Evaluation> = {};
  evaluations: Record<string, Evaluation> = {};
  // tutorialas, ajouté ultérieurement, est rigoureusement identique !
  tutorials: Record<string, Evaluation> = {};
  // pour récupérer la dénomination complète d'un trade via son sigle
  tradeName: string = ""
  // Dans le composant
  // tradeNames: { [key: string]: string } = {};
  hoveredTrade: string | null = null;

  // en modularisant la logique d'affichage de l'info-bulle
  moreInfo: string = ''; // pour définir une propriété très générique

  // c'est totalement dingue, mais on ne peut pas se référer à Object directement dans un template angular
  // donc si je veux un affichage conditionné côté template, me faut une méthode pour vérifier si evaluations n'est pas vide

  subscriptions?: any
  achievedTrainings?: any

  trades: { [key: string]: string[] } = {};
  // pour les compétences évaluées

  cpEvaluated: string = ""
  getCpNameCalled: boolean = false;

  // pour rajouter une classe au formulaire si c'est l'admin qui regarde
  isReadOnly = false;


  // pour récupérer durées max si exigé
  // tradesData?: any

  constructor(
    private service: StudentsService,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    public sanitizer: DomSanitizer,
    // private chartService:ChartService
  ) {

    this.userRouterLinks = this.route.snapshot.data;
  }

  ngOnInit() {
    this.studentId = this.route.snapshot.params['id']
    if (!this.studentId) {
      console.error('studentId is undefined.')
      return;
    }
    this.getStudentDetails(this.studentId)
    this.getUsers()

    // pour récupérer les métiers (sigles) enregistrés en base qui détermineront les maximums couts et durée si exigé !!!!!!!!!!!!
    // this.settingsService.getTrades().subscribe(data => {
    //   this.tradesData = data;
    //   console.log("this.tradesData", this.tradesData)
    // })

  }

  getStudentDetails(studentId: string) {
    this.service.getStudentById(studentId).subscribe(student => {
      this.student = student
      /* console.log(studentId); */
      this.subscriptions = this.student.subscriptions
      this.achievedTrainings = this.student.endedSubscriptions

      // essai pour alimenter la data de graph.js
      // this.getfirstCpForGraph()

      // console.log('student return by service', this.student);
      // Utilisation d'un Set pour stocker les tradesEvaluated uniques
      const tradesEvaluatedSet = new Set<string>();

      for (const key in this.student) {
        if (key.includes('quizz')) {
          tradesEvaluatedSet.add(key)
        }

        // if (key.includes('evaluations')) {
        //   this.userFollowUpEvaluations=this.student[key]          
        // }

        if (this.student.evaluations) {
          // this.userFollowUpEvaluations = this.student.evaluations;
          this.evaluations = this.student.evaluations;
          // console.log("this.evaluations", this.evaluations)

          // essai pour alimenter la data de graph.js date 2
          // this.chartService.getSecundCpForGraph(this.evaluations)

        }

        if (this.student.tutorials) {
          this.tutorials = this.student.tutorials;
          // console.log("this.tutorials", this.tutorials)
          // essai pour alimenter la data de graph.js date 2<
          // this.chartService.getThirdCpForGraph(this.tutorials)
        }

      }


      // Convertir le Set en tableau avec l'opérateur spread (...)
      this.tradesEvaluated = [...tradesEvaluatedSet]
      console.log('tradesEvaluated construit avec getStudentDetails dans studentDetailsComponent', this.tradesEvaluated)

      // Logique pour obtenir les compétences pour chaque tradeId
      this.tradesEvaluated.forEach(tradeId => {
        this.settingsService.getCompetences(tradeId).subscribe(competences => {
          // Ajoutez les compétences dans l'objet trades
          this.trades[tradeId] = competences;
          // Loguez les compétences dans la console
          console.log(`${tradeId}:`, competences);
        });
      });

      // Logique pour trier les résultats
      for (const item of this.tradesEvaluated) {
        if (this.student[item].fullResults) {
          this.student[item].fullResults.sort((a: any, b: any) => {
            const keyA = Object.keys(a)[0];
            const keyB = Object.keys(b)[0];
            return keyA.localeCompare(keyB);
          });
        }
      }
    })


  }

  delete(student: Student) {
    /* console.log(student);   */
    this.service.deleteStudent(student)
  }

  // Fonction pour obtenir les entrées d'un objet
  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }

  getUsers() {
    if (this.userRouterLinks.user == "trainer") {
      this.title = "formateur"
      // alert("C'est un formateur !!!")
    }
    else if (this.userRouterLinks.user == "admin") {
      this.title = "super administrateur"
      // alert("C'est un super administrateur !!!")
    }
    else if (this.userRouterLinks.user == "external") {
      this.title = "observateur externe"
      // alert("C'est un super administrateur !!!")
    }
    else if (this.userRouterLinks.user == "referent") {
      this.title = "référent administratif"
      // alert("C'est un super administrateur !!!")
    }
  }


  // Ajoutez une propriété pour stocker le nom du métier sans le préfixe
  tradeWithoutQuizzPrefix: string = '';

  // Ajoutez une méthode pour retirer le préfixe "quizz_"
  removeQuizzPrefix(str: string): string {
    return str.replace('quizz_', ''); // Utilisez la méthode replace pour retirer le préfixe
  }

  getTradeDetails(trade: string) {
    if (this.student && this.student[trade]['fullResults']) {
      // console.log('this.student[trade]', this.student[trade]['fullResults']);
      const relatedResults = this.student[trade]['fullResults']
      this.updateTotalCost(relatedResults)
      this.tradeWithoutQuizzPrefix = this.removeQuizzPrefix(trade);
      this.getTradeName(trade)
      return this.student[trade] as QuizDetails;
    }
    return null;
  }


  // Fonction pour récupérer les noms des métiers en parallèle
  getTradeNames(tradeIds: string[]): Observable<string[]> {
    const observables = tradeIds.map(tradeId => this.getTradeName(tradeId))
    return forkJoin(observables)
  }

  // Fonction pour obtenir le nom d'un métier
  getTradeName(tradeId: string): Observable<string> {
    const cleanedTradeId = tradeId.replace('quizz_', '');
    return this.settingsService.getTradeName(cleanedTradeId).pipe(
      map(data => this.tradeName = data)
    );
  }



  // pour modulariser la méthode de récupération de l'info-bulle avec des termes génériques
  getMoreInfo(tradeId: string) {
    const cleanedTradeId = tradeId.replace('quizz_', '');
    this.settingsService.getTradeName(cleanedTradeId).subscribe(data => {
      this.moreInfo = data;
    });
  }

  // réinitialise simplement la valeur de tradeName à une chaîne vide lorsque le survol se termine, 
  resetTradeName() {
    this.tradeName = "";
  }

  // Dans votre composant
  totalCost: number = 0;
  totalTime: number = 0;

  // Fonction pour mettre à jour le total
  updateTotalCost(relatedResults: any): void {
    this.totalCost = 0;
    this.totalTime = 0;

    // Vérifiez si fullResults existe et n'est pas vide
    for (const result of relatedResults) {
      for (const key in result) {
        if (result.hasOwnProperty(key)) {
          this.totalCost += result[key].cost;
          this.totalTime += result[key].duration;
        }
      }
    }

  }

  nonVide(variable: any): boolean {
    return Object.keys(variable).length > 0;
  }

  // Méthode pour vérifier si tutorials n'est pas vide
  tutorialsNotEmpty(): boolean {
    return Object.keys(this.tutorials).length > 0;
  }

  evaluationsNotEmpty(): boolean {
    return Object.keys(this.evaluations).length > 0;
  }

  getCpName(tradId: string, cpIndex: any) {
    // const trade=tradId.replace('quizz','')
    const cp = Number(cpIndex.replace('quizz_CP', ''))
    return cp
    // console.log('cp',cp);
    // console.log('trade',trade);

    // this.settingsService.getCPName(trade,cp)
  }

  // getCpNameFromEval(element: string): Observable<any> {
  //   const sigle = element.slice(0, -4);
  //   const cp = Number(element.slice(-1));

  //   return this.settingsService.getCPName(sigle, cp);
  // }

  // getCpNameFromEval(element: string): void {
  //   const sigle = element.slice(0, -4);
  //   const cp = Number(element.slice(-1));

  //   this.settingsService.getCPName(sigle, cp).subscribe(data => {
  //     console.log(data);
  //     this.cpEvaluated = data;
  //     this.getCpNameCalled = true;
  //   })
  // }

  getCpIndex(element: string): number {
    const cp = Number(element.slice(-1))
    return cp - 1

  }

  // Méthode pour récupérer la dénomination du métier côté composant
  denominationMap: Map<string, Observable<string | null>> = new Map();

  getDenomination(trade: string): Observable<string | null> {
    const sigle = trade.replace('quizz_', '');
    if (!this.denominationMap.has(trade)) {
      this.denominationMap.set(trade, this.settingsService.getDenomination(sigle));
    }
    return this.denominationMap.get(trade) || of(null);
  }

  // Méthode pour filtrer les évaluations par abonnement
  // getFilteredEvaluationsForSubscription(subscription: string): any[] {
  //   return Object.entries(this.evaluations)
  //     .filter(([key, value]) => value.sigle === subscription)
  //     .map(([key, value]) => ({ key, value }));
  // }

  getFilteredEvaluationsForSubscription(subscription: string): any[] {
    const filteredEvaluations = Object.entries(this.evaluations)
      .filter(([key, value]: [string, any]) => value.sigle === subscription)
      .map(([key, value]: [string, any]) => ({ key, value: value }));

    // Trie les évaluations par compétence en extrayant le chiffre à la fin
    return filteredEvaluations.sort((a, b) => {
      const regex = /\D+/g; // Expression régulière pour extraire les chiffres à la fin
      const aNumber = parseInt((a.value.competence || '').replace(regex, ''), 10);
      const bNumber = parseInt((b.value.competence || '').replace(regex, ''), 10);

      return aNumber - bNumber; // Trie par ordre croissant
    });
  }

  // Méthode pour filtrer les évaluations par abonnement
  // getFilteredTutorialsForSubscription(subscription: string): any[] {
  //   return Object.entries(this.tutorials)
  //     .filter(([key, value]) => value.sigle === subscription)
  //     .map(([key, value]) => ({ key, value }));
  // }
  getFilteredTutorialsForSubscription(subscription: string): any[] {
    const filteredTutorials = Object.entries(this.tutorials)
      .filter(([key, value]: [string, any]) => value.sigle === subscription)
      .map(([key, value]: [string, any]) => ({ key, value: value }));

    // Trie les évaluations par compétence en extrayant le chiffre à la fin
    return filteredTutorials.sort((a, b) => {
      const regex = /\D+/g; // Expression régulière pour extraire les chiffres à la fin
      const aNumber = parseInt((a.value.competence || '').replace(regex, ''), 10);
      const bNumber = parseInt((b.value.competence || '').replace(regex, ''), 10);


      return aNumber - bNumber; // Trie par ordre croissant
    });
  }

  evaluationsState: { [key: number]: boolean } = {};

  toggleCollapse(eIndex: number) {
    this.evaluationsState[eIndex] = !this.evaluationsState[eIndex];
  }

  // conserver !!!
  // getfirstCpForGraph() {
  //   if (this.student.subscriptions) {
  //     for (const iterator of this.student.subscriptions) {
  //       console.log("iterator to getFirstCpForGraph", iterator);

  //       if (this.student && this.student["quizz_" + iterator]['fullResults']) {
  //         console.log('this.student[trade]', this.student["quizz_" + iterator]['fullResults']);
  //         const relatedResult = this.student["quizz_" + iterator]['fullResults']
  //         console.log('relatedResult', relatedResult)

  //         this.chartService.getfirstCpForGraph(relatedResult)

  //       }

  //     }

  //   }

  // }

  print() {
    // Rendre tous les collapses visibles pour l'impression
    // const collapses = document.querySelectorAll('.collapse');
    // collapses.forEach((collapse) => collapse.classList.add('show'));

    // Lancer l'impression
    window.print();

    // Restaurer l'état initial après impression
    // setTimeout(() => {
    //   collapses.forEach((collapse) => collapse.classList.remove('show'));
    // }, 0);
  }

  hideAndPrint() {
    // Sélectionner tous les éléments avec la classe "cost"
    const costElements = document.querySelectorAll('.cost') as NodeListOf<HTMLElement>;

    // Cacher les éléments avec la classe "cost"
    costElements.forEach((el) => (el.style.display = 'none'));

    // Lancer l'impression
    window.print();

    // Restaurer l'état initial après impression
    setTimeout(() => {
      costElements.forEach((el) => (el.style.display = ''));
    }, 0);
  }



  roundToNearestMultipleOf7(duration: number): number {
    return Math.round((duration + 0.1) / 7) * 7;


  }



  getAdjustedTrainingTime(subtotal: number, total: number): number {
    const rounded = this.roundToNearestMultipleOf7(subtotal);
    return rounded > total ? Math.floor(subtotal / 7) * 7 : rounded;
  }

  // si exigé pour récupérer la durée totale max !!!!!!!!!!!
  // calculateTotalTime(trade: string): any {
  //   const keyTrade = trade.replace('quizz_', '')
  //   console.log("trade", keyTrade)

  //   const filteredData = this.tradesData.filter((item: any) => item.sigle === keyTrade);

  //   console.log('filteredData!!!!!!!!!!!!!!!!!', filteredData)
  //   let total = 0
  //   Object.values(filteredData[0].durations).forEach((value: any) => {
  //     total += value[0]
  //   })

  //   return total

  // }



}
