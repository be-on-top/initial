import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from '@angular/fire/auth';
import { collection, Firestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { stringify } from '@firebase/util';
// import { collection, Firestore } from '@angular/fire/firestore';

import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { EvaluatorsService } from './evaluators.service';
// import { createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser?: any;
  private authStatusSub = new BehaviorSubject(this.currentUser);

  // rappel : on utilise par convention le suffixxe $ pour préciser que c'est un observable
  // user$ :Observable<any>;

  constructor(private auth: Auth, private evaluatorService:EvaluatorsService, private firestore:Firestore, private router:Router) {
   
  }

  // register({ email, password }: any) {
  //   createUserWithEmailAndPassword(this.auth, email, password);
  // }

  // fonctionne bien pour test mais n'est d'aucune utilité ici - archive à supprimer
  getToken() {
    const token = this.auth.currentUser?.getIdTokenResult()
    console.log(token);
    return token
  }

  // quel est le status de l'utilisateur pour test - fait selon moi double emploi avec getUserId ?!!
  authStatusListener() {

    this.auth.onAuthStateChanged((credential) => {
      let status: any;
      if (credential) {
        console.log(credential);
        this.authStatusSub.next(credential);
        console.log('User is logged in with credential', credential.uid);
        status = credential.uid
        return status
      }
      else {
        this.authStatusSub.next(null);
        console.log('User is logged out');
        this.router.navigate(['/login'])
        status = ""
      }
    })

  }



  login({ email, password }: any) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    return signOut(this.auth);
  }

  getUserId(): any {
    let isAuthenticated: boolean = false;
    let uid;
    onAuthStateChanged(this.auth, (user): any => {
      if (user) {
        // Si utilisateur authentifié, le doc ci-dessous référence toutes les propriétés accessibles
        // https://firebase.google.com/docs/reference/js/firebase.User
        uid = user.uid;
        console.log("uid!!!!!!!!!!!!!!!!!!!", uid);
        isAuthenticated = true;
        return uid

      } else {
        console.log("no user");
        // User is signed out
        this.router.navigate(['/login'])
        // ...
      }

    });
  }

  // isAutenticated() {
  //   this.isAuth = true;
  //   console.log(this.isAuth);

  // }

  // login() {
  //   this.isAuthenticated = true;
  // }

  // logout() {
  //   this.isAuthenticated = false;
  // }

  // protected isAuthenticated(): boolean {
  //   return !!this.isAuthenticated;
  // }

  getData(id:any) {
    const dbInstance = collection(this.firestore, 'evaluators');   
    const userKey = this.auth.currentUser?.uid;
    let userActif;
    console.log("userKey", userKey);
    this.evaluatorService.getEvaluator(id).subscribe(data=>{
      console.log("data de getEvaluator", data);
      userActif=data
      return userActif      
    })

    // return userKey

  }


  


}

