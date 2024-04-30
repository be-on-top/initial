import { Injectable } from '@angular/core';
import { getAuth, Auth, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail } from '@angular/fire/auth';
import { collection, Firestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { stringify } from '@firebase/util';
// import { collection, Firestore } from '@angular/fire/firestore';

import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { EvaluatorsService } from './evaluators.service';
import { setPersistence, browserSessionPersistence } from 'firebase/auth';
import { ConsentService } from '../consent.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn: boolean = false;
  currentUser?: any;
  private authStatusSub = new BehaviorSubject(this.currentUser);

  // rappel : on utilise par convention le suffixxe $ pour préciser que c'est un observable
  // user$ :Observable<any>;

  constructor(private auth: Auth, private evaluatorService: EvaluatorsService, private firestore: Firestore, private router: Router, private consentService:ConsentService) {
    const consent:boolean = consentService.getConsent()
    if (!consent) {      
      // Configurer la persistance de session au moment de l'initialisation du service
      setPersistence(auth, browserSessionPersistence)
        .then(() => {
          console.log('Session persistence set successfully');
        })
        .catch((error) => {
          console.error('Error setting session persistence:', error);
        });
    }

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
        this.router.navigate(['/home'])
        status = ""
      }
    })

  }



  // async login({ email, password }: any) {
  //   this.loggedIn = true;
  //   return signInWithEmailAndPassword(this.auth, email, password);
  // }

  async login({ email, password }: any) {


    const result = await signInWithEmailAndPassword(this.auth, email, password);
    console.log("User signed in successfully:", result.user.uid);
    // if (result.user.uid) {
    //   setPersistence(this.auth, browserSessionPersistence)
    //     .then(() => {
    //       // In memory persistence will be applied to the signed in Google user
    //       // even though the persistence was set to 'none' and a page redirect
    //       // occurred.
    //       return signInWithEmailAndPassword(this.auth, email, password);
    //     })
    //     .catch((error) => {
    //       // Handle Errors here.
    //       const errorCode = error.code;
    //       const errorMessage = error.message;
    //     });

    // }
    return result

  }



  //   async login({ email, password }: any) {
  //     try {
  //         await setPersistence(this.auth, browserSessionPersistence); // Configure la persistance de la session
  //         const result = await signInWithEmailAndPassword(this.auth, email, password); // Authentification de l'utilisateur
  //         console.log("User signed in successfully:", result.user.uid);
  //         return result;
  //     } catch (error) {
  //         console.error('Error during login:', error);
  //         throw error;
  //     }
  // }
  // async login({ email, password }: any) {
  //   try {
  //       await setPersistence(this.auth, browserSessionPersistence); // Configure la persistance de la session
  //       const result = await signInWithEmailAndPassword(this.auth, email, password); // Authentification de l'utilisateur
  //       console.log("User signed in successfully:", result.user.uid);
  //       return result;
  //   } catch (error) {
  //       console.error('Error during login:', error);
  //       throw error;
  //   }
  // }








  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }


  // logout() {
  //   this.loggedIn = false;
  //   return signOut(this.auth);    
  // }

  logout() {
    this.loggedIn = false;
    return signOut(this.auth)
      .then(() => {
        // Déconnexion réussie
      })
      .catch(error => {
        console.error('Error during logout:', error);
      });
  }

  // logout() {
  //   return signOut(this.auth)
  //     .then(() => {
  //       this.loggedIn = false;
  //       this.router.navigate(['/home']);
  //     })
  //     .catch(error => {
  //       console.error('Error during logout:', error);
  //     });
  // }





  passwordReset(email: string) {

    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });


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

  isAuthenticated() {
    return this.loggedIn;

  }

  // login() {
  //   this.isAuthenticated = true;
  // }

  // logout() {
  //   this.isAuthenticated = false;
  // }

  // protected isAuthenticated(): boolean {
  //   return !!this.isAuthenticated;
  // }

  getData(id: any) {
    const dbInstance = collection(this.firestore, 'evaluators');
    const userKey = this.auth.currentUser?.uid;
    let userActif;
    console.log("userKey", userKey);
    this.evaluatorService.getEvaluator(id).subscribe(data => {
      console.log("data de getEvaluator", data);
      userActif = data
      return userActif
    })

    // return userKey

  }





}

