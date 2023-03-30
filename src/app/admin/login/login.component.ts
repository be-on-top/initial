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
        alert("Login Success ! ");
        // isAuthentificated ne sert plus à rien. c'est l'uid qui conditionne l'affichage du bouton de login ou logout
        // this.isAuthentificated = true;
        // console.log("isAuthenticated", this.isAuthentificated);
        this.router.navigate(['']);
      })
      .catch(error => console.log(error));
  }

  onClick() {
    this.service.loginWithGoogle()
      .then(response => {
        console.log(response);
        this.router.navigate(['']);
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
    this.router.navigate(['']);

  }

  


}
