import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { StudentsService } from '../admin/students.service';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

   // variables à passer à feedbackMessages component pour retours de firebase sur la soumission
   feedbackMessages?:any=""
   isSuccessMessage:boolean=true
   // essai pour personnaliser les messages
   // https://firebase.google.com/docs/auth/admin/errors?hl=fr
   firebaseErrors:any = {
     'auth/user-not-found': 'Aucun utilisateur ne correspond à cet email',
     'auth/email-already-in-use': 'Cet email est déjà utilisé pour un autre compte',
     'auth/wrong-password' : 'Le mot de passe est incorrect',
     'auth/invalid-email' : 'Aucun enregistrement ne correspond au mail fourni'
   }; // list of firebase error codes to alternate error messages
 

  // recuperation code sv
  constructor(private service: StudentsService, private router:Router) { }

  async addStudent(form: any) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    console.log("form registration", form.value);
    this.service.register(form.value).then((userCredential) => {
      // Signed in 
      const user = userCredential;
      this.feedbackMessages = `Enregistrement OK`;
      this.isSuccessMessage = true
      setTimeout(() => {
        this.router.navigate([''])
      }, 2000)
    })
      .catch((error) => {
        this.feedbackMessages = error.message;
        this.feedbackMessages=this.firebaseErrors[error.code];
        this.isSuccessMessage = false;
        console.log(this.feedbackMessages);

        // ..};
      })
    // form.reset();
    // redirige vers la vue de détail 
    // this.router.navigate(['/admin/evaluators']);

  }

  // addStudent(form: NgForm) {
  //   /* console.log(form.value); */

  //   // fait doublon avec les propriétés d'Angular combinées à bootstrap, html5...
  //   // if (!this.validateEmail(form.value.email)) { // vérifier si l'adresse e-mail est valide
  //   //   alert("Adresse e-mail non valide!");
  //   // } else 
  //   if (form.value.studentPw.length < 8) { // tester si le mot de passe contient au moins 8 caractères
  //     alert("Attention: Le mot de passe doit contenir au moins 8 caractères!");
  //   } else if (/\s/.test(form.value.studentPw)) { // vérifier si le mot de passe ne contient pas d'espace
  //     alert("Attention: Le mot de passe ne doit pas contenir d'espaces vides!");
  //   } else {
  //   this.service.createStudent(form.value).catch((error)=>{
  //     this.feedbackMessages=error.code;
  //     this.isSuccessMessage=false

  //   })
    
  //   // form.reset();
  //   this.router.navigate(['']);
  //   }
  // }

  valid: boolean = false;

  validateEmail(mailInput: any) { //fonction de vérification d'e-mail, retourne vrai ou faux !
    const regex = /\S+@\S+\.\S+/;
    this.valid = regex.test(mailInput);

    return this.valid;
  }

  showPassword: boolean = false;

  // toggleDisplayPassword(event:any) {
  //   this.showPassword = !this.showPassword;
  // }

  // validateField(textInput: any) {
  //   if (textInput.invalid) {
  //     this.valid = false;
  //   } else {
  //     this.valid = true;
  //   }

  // }

  // whatever(e:any){
  //   console.log(e);    

  // }

  

}
