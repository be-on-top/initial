import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from '@angular/fire/auth';
// import { createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) {
  }

  // register({ email, password }: any) {
  //   createUserWithEmailAndPassword(this.auth, email, password);
  // }

  login({ email, password }: any) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    return signOut(this.auth);
  }

  getUserId():any {
    let isAuthenticated:boolean = false;
    let uid;
    onAuthStateChanged(this.auth, (user): any => {
      if (user) {
        // Si utilisateur authentifié, le doc ci-dessous référence toutes les propriétés accessibles
        // https://firebase.google.com/docs/reference/js/firebase.User
        uid = user.uid;
        console.log("uid!!!!!!!!!!!!!!!!!!!", uid);
        isAuthenticated = true;
        return !!uid

      } else {
        console.log("no user");

        // User is signed out
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


}

