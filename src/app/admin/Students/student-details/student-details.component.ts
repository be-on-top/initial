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

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent {

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
  // pour récupérer la dénomination complète d'un trade via son sigle
  tradeName: string = ""
  // Dans le composant
  // tradeNames: { [key: string]: string } = {};
  hoveredTrade: string | null = null;

  // en modularisant la logique d'affichage de l'info-bulle
  moreInfo: string = ''; // pour définir une propriété très générique

  constructor(
    private service: StudentsService,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    public sanitizer: DomSanitizer
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
  }

  getStudentDetails(studentId: string) {
    this.service.getStudentById(studentId).subscribe(student => {
      this.student = student
      /* console.log(studentId); */

      // Utilisation d'un Set pour stocker les tradesEvaluated uniques
      const tradesEvaluatedSet = new Set<string>();

      for (const key in this.student) {
        if (key.includes('quizz')) {
          tradesEvaluatedSet.add(key);
        }

        // if (key.includes('evaluations')) {
        //   this.userFollowUpEvaluations=this.student[key]          
        // }

        if (this.student.evaluations) {
          // this.userFollowUpEvaluations = this.student.evaluations;
          this.evaluations = this.student.evaluations;
          console.log("this.evaluations", this.evaluations);

        }

      }

      // Convertir le Set en tableau avec l'opérateur spread (...)
      this.tradesEvaluated = [...tradesEvaluatedSet]
      console.log('tradesEvaluated construit avec getStudentDetails dans studentDetailsComponent', this.tradesEvaluated)

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
      alert("C'est un formateur !!!")
    }
    else if (this.userRouterLinks.user == "admin") {
      alert("C'est un super administrateur !!!")
    }
  }

  getTradeDetails(trade: string) {
    if (this.student && this.student[trade]) {
      return this.student[trade] as QuizDetails;
    }
    return null;
  }


  // La méthode replace renvoie une nouvelle chaîne avec les modifications, mais elle ne modifie pas la chaîne originale !!!!
  getTradeName(tradeId: string) {
    const cleanedTradeId = tradeId.replace('quizz_', '');
    this.settingsService.getTradeName(cleanedTradeId).subscribe(data => {
      this.tradeName = data;
    });
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


}
