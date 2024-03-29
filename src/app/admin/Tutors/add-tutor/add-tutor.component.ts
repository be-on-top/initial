import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TutorsService } from '../../tutors.service';
import { Router } from '@angular/router';
import { EvaluatorsService } from '../../evaluators.service';

@Component({
  selector: 'app-add-tutor',
  templateUrl: './add-tutor.component.html',
  styleUrls: ['./add-tutor.component.css']
})

export class AddTutorComponent {
  lastName: string = "active";
  firstName: string = "";
  email: string = "";
  // parce qu'on a des affectations métiers
  selectedSigles: string[] = []
  // parce que le tuteur pourrait (?) être aussi un évaluateur (?)
  registryEvaluators: any[] = []

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

  constructor(private service: TutorsService, private router: Router, private evaluatorsService:EvaluatorsService) { }

  ngOnInit(): void {
    this.evaluatorsService.getEvaluators().subscribe(data => {
      // console.log(data);
      for (let e of data) {
        // console.log(this.registryNumbers);
        this.registryEvaluators = [...this.registryEvaluators, e]
        console.log("result des évaluateurs", this.registryEvaluators);
      }
      // return this.registryNumbers
    })


  }


  async addTutor(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    console.log("form registration", form.value);
    this.service.createTutor(form.value).then((userCredential) => {
      // Signed in 
      const user = userCredential;
      this.feedbackMessages = `Enregistrement OK`;

      // alert("registration ok")
      setTimeout(() => {
        this.router.navigate(['/admin/tutors'])
      }, 2000)
      // this.router.navigate(['/admin/trainers']);
      // ...
    })
      .catch((error) => {
        this.feedbackMessages = error.message;
        this.feedbackMessages = this.firebaseErrors[error.code];
        this.isSuccessMessage = false;
        console.log(this.feedbackMessages);

        // ..};
      })
    // form.reset();
    // redirige vers la vue de détail 
    // this.router.navigate(['/admin/trainers']);

  }

  // pour affecation métier de l'évaluateur
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }

  addRole(form:NgForm){
    console.log(form.value.idEval)    
    this.service.addRoleToEvaluator(form.value.idEval)

  }



}
