import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
// pour changer un peu, on va faire des reactiive forms !!!!
import { FormControl, FormGroup } from '@angular/forms';
// je voudrais me le faire importer
import { Auth, onAuthStateChanged } from '@angular/fire/auth';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formLogin: FormGroup;
  // isAuthentificated?:boolean;
  user?: any;
  // variables à passer à feedbackMessages component pour retours de firebase sur la soumission
  feedbackMessages?:any=""
  isSuccessMessage:boolean=true
  // essai pour personnaliser les messages
  // https://firebase.google.com/docs/auth/admin/errors?hl=fr
  firebaseErrors:any = {
    'auth/user-not-found': 'Aucun utilisateur ne correspond à cet email',
    'auth/email-already-in-use': 'Cet email est déjà utilisé pour un autre compte',
    'auth/wrong-password' : 'Le mot de passe est incorrect',
    'auth/invalid-email' : 'Aucun enregistrement ne correspond au mail fourni',
    'auth/invalid-login-credentials' : 'Identifiants de connexion invalides. Veuillez vérifier votre e-mail et votre mot de passe'
  }; // list of firebase error codes to alternate error messages

  // je voudrais me faire importer onAuthStateChanged qui est une méthode de auth depuis le service. A faire plus tard
  // en attendant, j'importe Auth
  constructor(private service: AuthService, private router: Router, private auth:Auth) {
    this.formLogin = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    })

  }
  ngOnInit(): void {
    this.service.currentUser
    // this.userUid=this.service.getUserId()
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user.uid
      }
    })
  }

  onSubmit() {
    this.service.login(this.formLogin.value)
      .then(response => {
        console.log(response);
        // pour ajout confirmation feedback avant redirection
        this.feedbackMessages="Login Success !"
        // alert("Login Success ! ");
        // isAuthentificated ne sert plus à rien. c'est l'uid qui conditionne l'affichage du bouton de login ou logout
        // this.isAuthentificated = true;
        // console.log("isAuthenticated", this.isAuthentificated);
        setTimeout(() => {
          this.router.navigate(['home'])
        }, 2000)
        // this.router.navigate(['']);
      })
      .catch(error => {
        // this.firebaseErrors[error.code] || error.message,
        console.log(error)
        this.feedbackMessages=error;
        // this.feedbackMessages=this.firebaseErrors[error.code];
        this.isSuccessMessage=false;
        // mise à jour variables à passer à feedbackMessags component      
      });
  }

  onClick() {
    this.service.loginWithGoogle()
      .then(response => {
        console.log(response);
        this.router.navigate(['home']);
      })
      .catch(error => console.log(error))
  }
  
  reset(email: string): any {
    this.service.passwordReset(email)    
    // return this.fireAgent.firebase.auth().sendPasswordResetEmail(email, {
    //   url: 'http://localhost:4200/',
    //   handleCodeInApp: true
  }  
  

  logOut(){
    this.service.logout()
    alert("Déconnection ok")
    this.router.navigate(['home']);
  } 


}
