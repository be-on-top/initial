import { Component, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Evaluation } from '../../evaluation';
import { AnimationKeyframesSequenceMetadata } from '@angular/animations';

@Component({
  selector: 'app-update-student',
  templateUrl: './update-student.component.html',
  styleUrls: ['./update-student.component.css']
})
export class UpdateStudentComponent implements OnInit {

  studentId: any
  student: any = {}
  // selectedSigles: string[] = []
  // et dans l'hypothèse où le formateur utilise ce même composant pour mettre à jour son évaluation
  evaluationToUpdate: Evaluation = { details: '', subject: '', date: '' }
  evaluationKey: string = ""
  userRouterLinks:any


  constructor(private service: StudentsService, private ac: ActivatedRoute, private router: Router) {
    this.userRouterLinks = this.ac.snapshot.data;
  }

  ngOnInit(): void {
    this.studentId = this.ac.snapshot.params["id"]
    this.evaluationKey = this.ac.snapshot.params["evaluationKey"]

    console.log("voici l'ID", this.studentId)
    // on fait appel à getstudent pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getStudentById(this.studentId).subscribe((data) => {
      this.student = data

      if (this.student.evaluations) {
        for (const key in this.student.evaluations) {
          key === this.evaluationKey ? this.evaluationToUpdate = this.student.evaluations[key] : ''
        }
        console.log("evaluationToUpdate", this.evaluationToUpdate)
      }

    })

    this.getUsers()
  }


  updateStudent(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      /* console.log('form valid'); */
      return
    }
    /* console.log("form update values", form.value); */
    this.service.updateStudent(this.studentId, form.value)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/student', this.studentId])
  }

  updateStudentEvaluation(form: NgForm) {
    if (!form.valid) {
      /* console.log('form valid'); */
      return
    }
    /* console.log("form update values", form.value); */
    const updatedEvaluations: any = { evaluations: { ...this.student.evaluations } }
    // updatedEvaluations.evaluations[this.evaluationKey]=form.value
    updatedEvaluations.evaluations[this.evaluationKey] = { "date": this.student.evaluations[this.evaluationKey].date, "details": form.value.details, "subject": form.value.subject }
    console.log("this.student.evaluations après lecture du formulaire d'update", updatedEvaluations)

    this.service.updateStudentEvaluation(this.studentId, updatedEvaluations)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/student', this.studentId])
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
