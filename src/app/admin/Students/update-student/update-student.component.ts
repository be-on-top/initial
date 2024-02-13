import { Component, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Evaluation } from '../../evaluation';
import { SettingsService } from '../../settings.service';
import { formatDate } from '@angular/common';
// import { AnimationKeyframesSequenceMetadata } from '@angular/animations';

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
  evaluationToUpdate: Evaluation = { sigle: '', competence: '', level: '', details: '', subject: '', date: '' }
  evaluationKey: string = ""
  userRouterLinks: any

  // je rajoute (tout en maintenant là aussi le typage qui est rigoureusement le même)
  tutorialToUpdate: Evaluation = { sigle: '', competence: '', level: '', details: '', subject: '', date: '' }
  tutorialKey: string = ""

  // essai pour connecter le tableau des sigles aux documents de la collection sigles destinée aux paramétrages métier
  sigleIds: string[] = []

  levels: string[] = ['beginner', 'intermediate', 'advance', 'pro']


  constructor(private service: StudentsService, private ac: ActivatedRoute, private router: Router, private settingsService: SettingsService) {
    this.userRouterLinks = this.ac.snapshot.data;
  }

  ngOnInit(): void {
    this.studentId = this.ac.snapshot.params["id"]
    this.ac.snapshot.params["evaluationKey"] ? this.evaluationKey = this.ac.snapshot.params["evaluationKey"] : this.evaluationKey = this.ac.snapshot.params["editKey"]
    this.ac.snapshot.params["tutorialKey"] ? this.tutorialKey = this.ac.snapshot.params["tutorialKey"] : this.tutorialKey = this.ac.snapshot.params["editKey"]

    console.log("voici l'ID", this.studentId)
    // on fait appel à getstudent pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getStudentById(this.studentId).subscribe((data) => {
      this.student = data

      if (this.student.evaluations || this.student.tutorials) {
        for (const key in this.student.evaluations) {
          key === this.evaluationKey ? this.evaluationToUpdate = this.student.evaluations[key] : ''
        }
        console.log("evaluationToUpdate", this.evaluationToUpdate)

        for (const key in this.student.tutorials) {
          key === this.tutorialKey ? this.tutorialToUpdate = this.student.tutorials[key] : ''
        } console.log("tutorialToUpdate", this.tutorialToUpdate)
      }


    })

    this.getUsers()
    this.fetchSigleIds()

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
    // pour actualiser la date à l'update
    const currentDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    // updatedEvaluations.evaluations[this.evaluationKey]=form.value
    updatedEvaluations.evaluations[this.evaluationKey] = { "sigle": this.evaluationToUpdate.sigle, "competence": this.evaluationToUpdate.competence, "level": form.value.level, "date": currentDate, "details": form.value.details, "subject": form.value.subject }
    console.log("this.student.evaluations après lecture du formulaire d'update", updatedEvaluations)

    this.service.updateStudentEvaluation(this.studentId, updatedEvaluations)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/myStudentDetails', this.studentId])
  }

  updateStudentTutorial(form: NgForm) {
    if (!form.valid) {
      /* console.log('form valid'); */
      return
    }
    /* console.log("form update values", form.value); */
    const updatedTutorials: any = { tutorials: { ...this.student.tutorials } }
    // pour actualiser la date à l'update
    const currentDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    // updatedEvaluations.evaluations[this.evaluationKey]=form.value
    updatedTutorials.tutorials[this.tutorialKey] = { "sigle": this.tutorialToUpdate.sigle, "competence": this.tutorialToUpdate.competence, "level": form.value.level, "date": currentDate, "details": form.value.details, "subject": form.value.subject }
    console.log("this.student.tutorial après lecture du formulaire d'update", updatedTutorials)
    this.service.updateStudentTutorial(this.studentId, updatedTutorials)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/tutor/myStudentDetails', this.studentId])
  }

  getUsers() {
    if (this.userRouterLinks.user == "trainer") {
      alert("C'est un formateur !!!")
    }
    else if (this.userRouterLinks.user == "tutor") {
      alert("C'est un tuteur !!!")
    }
    else if (this.userRouterLinks.user == "admin") {
      alert("C'est un super administrateur !!!")
    }

  }



  // Utilisation de la fonction du service lorsque nécessaire
  fetchSigleIds() {
    this.settingsService.getSigleIds()
      .then((sigleIds) => {
        this.sigleIds = sigleIds
        console.log(sigleIds);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des IDs de documents :', error);
      });
  }

  subscribeStudent(subscribeStudent: NgForm) {
    // console.log('subscribeStudent.value.sigle', subscribeStudent.value.sigle);
    this.service.activateSubscription(this.studentId, subscribeStudent.value.sigle)

  }

}
