import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../students.service';
import { Student } from '../student';
import { Evaluation } from '../../evaluation';

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
  student: any = {};
  // @Output() deleteStudent = new EventEmitter<Student>();


  lastIndex: number = 0
  // pour afficher si on garde cette option fullResuls à l'administrateur
  fullResults: { [key: string]: { duration: number; cost: number } }[] = [];
  tradesEvaluated: any = []
  userRouterLinks: any
  userFollowUpEvaluations: Record<string, Evaluation> = {};



  constructor(
    private service: StudentsService,
    private route: ActivatedRoute,
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

        if (key.includes('evaluations')) {
          this.userFollowUpEvaluations=this.student[key]          
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


}
