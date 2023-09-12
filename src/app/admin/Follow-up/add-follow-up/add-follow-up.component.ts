import { AfterViewInit, Component, OnInit,  } from '@angular/core';
import { StudentsService } from '../../students.service';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-follow-up',
  templateUrl: './add-follow-up.component.html',
  styleUrls: ['./add-follow-up.component.css']
})
export class AddFollowUpComponent implements AfterViewInit {

  studentId: string = ""

  // pour l'éditeur de text
  tinymce: any; // Déclaration pour accéder à l'objet tinymce global
  userRouterLinks:string=""

  feedbackMessages?: any = ""
  isSuccessMessage: boolean = true
  // essai pour personnaliser les messages
  // https://firebase.google.com/docs/auth/admin/errors?hl=fr
  firebaseErrors: any = {
    'auth/user-not-found': 'Aucun utilisateur ne correspond à cet email',
    'auth/email-already-in-use': 'Cet email est déjà utilisé pour un autre compte',
    'auth/wrong-password': 'Le mot de passe est incorrect',
    'auth/invalid-email': 'Aucun enregistrement ne correspond au mail fourni'
  }; // list of firebase error codes to alternate error messages
	
	 

  constructor(private service: StudentsService, private activatedRoute: ActivatedRoute, private router:Router) {
    this.studentId = this.activatedRoute.snapshot.params['id']
    this.userRouterLinks = this.activatedRoute.snapshot.data['user']
  }

  // si on opte pour une méthode commune : 
  addFollowUp(studentId: string, evaluation: NgForm) {
    console.log(evaluation.value.date)
    this.userRouterLinks=='tutor'?this.addTutorial(studentId,evaluation):this.addTutorial(studentId, evaluation)
  }

  addEvaluation(studentId: string, evaluation: NgForm) {
    console.log(evaluation.value.date)
    // let evaluations:any={}
    let evalKey: string = 'evaluation-' + evaluation.value.date + Math.floor(Math.random() * 2)
    const evaluations = { [evalKey]: evaluation.value }
    this.service.addFollowUpEvaluation(studentId, { evaluations }).then(() => {

      this.feedbackMessages = `Enregistrement OK`;
      setTimeout(() => {
        this.router.navigate(['/admin/myStudentDetails', studentId])
      }, 2000)
      // this.router.navigate(['/admin/trainers']);
      // ...
    })
      .catch((error) => {
        this.feedbackMessages = error.message;
        // this.feedbackMessages = this.firebaseErrors[error.code];
        this.isSuccessMessage = false;
        console.log(this.feedbackMessages);

        // ..};
      })
    // form.reset();
    // redirige vers la vue de détail 
    // this.router.navigate(['/admin/trainers']);

  
  }

  addTutorial(studentId: string, tutorial: NgForm) {
    console.log(tutorial.value.date)
    // let evaluations:any={}
    let evalKey: string = 'tutorial-' + tutorial.value.date + Math.floor(Math.random() * 2)
    const tutorials = { [evalKey]: tutorial.value }
    this.service.addFollowUpTutorial(studentId, { tutorials })
    .then(() => {

      this.feedbackMessages = `Enregistrement OK`;
      setTimeout(() => {
        this.router.navigate(['/admin/tutor/myStudentDetails', studentId])
      }, 2000)
      // this.router.navigate(['/admin/trainers']);
      // ...
    })
      .catch((error) => {
        this.feedbackMessages = error.message;
        // this.feedbackMessages = this.firebaseErrors[error.code];
        this.isSuccessMessage = false;
        console.log(this.feedbackMessages);

        // ..};
      })
  }

  ngAfterViewInit() {
    this.tinymce.init({
      selector: '#editor', // L'ID de l'élément textarea
      plugins: ['link', 'table', 'image'], // Plugins que vous souhaitez activer
      toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | table image', // Barre d'outils de l'éditeur
    });
  }

}
