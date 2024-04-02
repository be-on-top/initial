import { Component } from '@angular/core';
import { UsersService } from '../../users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})

export class AddUserComponent {

  lastName: string = "active";
  firstName: string = "";
  email: string = "";
  selectedSigles: string[] = []
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

  userRouterLinks: any;
  title?: string
  linkToDetails: string = ""
  linkBackToList: string = ""

  constructor(private service: UsersService, private router: Router, private ac:ActivatedRoute) {
    this.userRouterLinks = this.ac.snapshot.data;
   }

  ngOnInit(): void {

    if  (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "managers") {
      this.title = "Manager (Responsable Métiers)"
      this.linkBackToList = '/admin/managers'
    } else if  (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "referents") {
      this.title = "Référents Administratifs"
      this.linkBackToList = '/admin/referents'
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "editors") {
      this.title = "Contributeurs"
      this.linkBackToList = '/admin/editors'
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "externals") {
      this.title = "Observateurs Externes"
      this.linkBackToList = '/admin/externals'
    } 

  }


  async addUser(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }


    console.log("form registration", form.value);    
    this.service.createUser(form.value).then(() => {
      // Signed in 
      // const user = userCredential
      this.feedbackMessages = `Enregistrement OK`;
      // alert("adminReconnected call")

      // alert("registration ok")
      setTimeout(() => {
         this.router.navigate([this.linkBackToList]);
         window.location.reload();
         
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

  }

  // pour affecation métier de l'évaluateur
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }

}
