import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail } from '@angular/fire/auth';
import { collection, doc, docData, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
// import { stringify } from '@firebase/util';
// import { collection, Firestore } from '@angular/fire/firestore';

import { BehaviorSubject, map, Observable, of, Subscription } from 'rxjs';
import { EvaluatorsService } from './evaluators.service';
// import { setPersistence, browserSessionPersistence } from 'firebase/auth';
// import { ConsentService } from '../consent.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  loggedIn: boolean = false;
  currentUser?: any;
  private authStatusSub = new BehaviorSubject(this.currentUser);

  // rappel : on utilise par convention le suffixxe $ pour préciser que c'est un observable
  // user$ :Observable<any>;

  private redirectUrl: string | null = null;

  private currentUserInfoSubject = new BehaviorSubject<{ uid: string, role: string | string[] | null } | null>(null);

  private userRoleSubscription: Subscription | null = null;


  constructor(
    private auth: Auth,
    private evaluatorService: EvaluatorsService,
    private firestore: Firestore,
    private router: Router
    // private consentService: ConsentService
  ) {
    // si finalement, on ne détériore pas l'expérience utilisateur de celui qui n'a pas consenti à l'utilation de cookies
    // const consent: boolean = consentService.getConsent()
    // if (!consent) {
    //   // Configurer la persistance de session au moment de l'initialisation du service
    //   setPersistence(auth, browserSessionPersistence)
    //     .then(() => {
    //       console.log('Session persistence set successfully');
    //     })
    //     .catch((error) => {
    //       console.error('Error setting session persistence:', error);
    //     });
    // }

    // Initialiser la surveillance de l'état d'auth
    // onAuthStateChanged(this.auth, user => {
    //   if (user) {
    //     const uid = user.uid;
    //     const rolesRef = doc(this.firestore, `roles/${uid}`);
    //     docData(rolesRef).subscribe(roleDoc => {
    //       this.currentUserInfoSubject.next({
    //         uid,
    //         role: roleDoc?.['role'] || null,
    //       });
    //     });
    //   } else {
    //     this.currentUserInfoSubject.next(null);
    //   }
    // });

    onAuthStateChanged(this.auth, user => {
      if (this.userRoleSubscription) {
        this.userRoleSubscription.unsubscribe(); // 🔴 Nettoie l'abonnement précédent
        this.userRoleSubscription = null;
      }
  
      if (user) {
        const uid = user.uid;
        const rolesRef = doc(this.firestore, `roles/${uid}`);
  
        this.userRoleSubscription = docData(rolesRef).subscribe(roleDoc => {
          this.currentUserInfoSubject.next({
            uid,
            role: roleDoc?.['role'] || null,
          });
        });
      } else {
        this.currentUserInfoSubject.next(null);
      }
    });

  }

  getCurrentUserInfo(): Observable<{ uid: string, role: string | string[] | null } | null> {
    return this.currentUserInfoSubject.asObservable();
  }
  
  setCurrentUserInfo(userInfo: { uid: string, role: string | string[] | null }) {
    this.currentUserInfoSubject.next(userInfo);
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
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      console.log("User signed in successfully:", result.user.uid);

      // Enregistrer la date de la dernière connexion dans le localStorage
      const lastLoginDate = new Date();
      localStorage.setItem('lastLoginDate', lastLoginDate.toString());

      // Récupérer le rôle de l'utilisateur après la connexion
      const uid = result.user.uid;
      const rolesRef = doc(this.firestore, `roles/${uid}`);
      const roleDoc = await getDoc(rolesRef); // Utiliser getDoc pour une requête unique

      const userRole = roleDoc.exists() ? roleDoc.data()['role'] : null;

      // Mettre à jour le BehaviorSubject pour notifier tous les composants abonnés
      this.setCurrentUserInfo({ uid, role: userRole });

      // Log avant redirection
      console.log("Redirection après login...");

      // Spécifiquement développé pour connexion depuis tradeDetails, mais peut servir globalement
      this.redirectAfterLogin();

      return result;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error; // Vous pouvez gérer les erreurs ici
    }
  }












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




  // Méthode pour envoyer l'email de réinitialisation
  // passwordReset(email: string) {

  //   sendPasswordResetEmail(this.auth, email)
  //     .then(() => {
  //       // Password reset email sent!
  //       // ..
  //     })
  //     .catch((error) => {
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       // ..
  //     })
  // }

  // pour optimiser les retours ++++
  // passwordReset(email: string): Promise<void> {
  //   return sendPasswordResetEmail(this.auth, email)
  //     .then(() => {
  //       console.log('Email de réinitialisation envoyé.');
  //     })
  //     .catch((error) => {
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       console.error('Erreur lors de la réinitialisation :', errorMessage);
  //       throw error; // Relance l'erreur pour être gérée dans le composant
  //     });
  // }

  // Cette version de la méthode passwordReset dans le service met simplement à jour l'URL de redirection vers la page de login. 
  // En ajoutant l’option handleCodeInApp: true, cette configuration indique à Firebase de rediriger l'utilisateur après la réinitialisation réussie du mot de passe.
  passwordReset(email: string) {
    return sendPasswordResetEmail(this.auth, email, {
      url: 'https://be-on-top.io/login', // Redirige directement vers la page de login
      handleCodeInApp: true,
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

    // AuthService.js




  }

  // Fonction pour récupérer la date de dernière connexion de l'utilisateur depuis le localStorage
  getLastLoginDate = () => {
    const lastLoginString = localStorage.getItem('lastLoginDate');
    if (lastLoginString) {
      return new Date(lastLoginString);
    } else {
      // Si aucune date de dernière connexion n'est disponible, retourner null
      return null;
    }
  }

  // Fonction pour comparer la date de dernière connexion avec la date actuelle
  checkLastLoginDate() {
    const lastLoginDate: any = this.getLastLoginDate();
    const currentDate: any = new Date();
    const millisecondsIn15Days = 15 * 24 * 60 * 60 * 1000; // 15 jours en millisecondes

    // Vérifier si la durée écoulée dépasse 15 jours
    if (lastLoginDate && currentDate - lastLoginDate > millisecondsIn15Days) {
      // Déconnecter automatiquement l'utilisateur
      this.logout();
    }
  }





  public setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  public getRedirectUrl(): string | null {
    return this.redirectUrl;
  }



  // private redirectAfterLogin(): void {
  //   const url = this.getRedirectUrl() || '/home';
  //   this.router.navigate([url]);
  // }

  public redirectAfterLogin(): void {
    const url = this.getRedirectUrl() || '/home';
    console.log('Redirection après login vers:', url);

    this.router.navigate([url]).then(() => {
      console.log('Redirection réussie.');
      // Réinitialiser l'URL de redirection après l'utilisation
      this.redirectUrl = null;
    });
  }



  // Méthode pour obtenir l'UID de l'utilisateur connecté (en admin)
  getCurrentUserUid(): string | null {
    const user = this.auth.currentUser;  // Utilise currentUser pour obtenir l'utilisateur actuel
    return user ? user.uid : null;  // Retourne l'UID si l'utilisateur est connecté, sinon null
  }
  // Méthode pour obtenir l'UID de l'utilisateur connecté (en admin)
  getCurrentUserEmail(): string | null {
    const user = this.auth.currentUser;  // Utilise currentUser pour obtenir l'utilisateur actuel
    return user ? user.email : null;  // Retourne l'UID si l'utilisateur est connecté, sinon null
  }

  getCurrentUserRole(): Observable<string | string[] | null> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, user => {
        if (!user) {
          observer.next(null);
          observer.complete();
          return;
        }

        // alert(user.uid)

        const rolesRef = doc(this.firestore, `roles/${user.uid}`);
        docData(rolesRef).subscribe(roleDoc => {
          console.log("Données Firestore :", roleDoc);  // Debug
          if (roleDoc && roleDoc['role']) {
            observer.next(roleDoc['role']); // Retourne le rôle (chaîne ou tableau)
          } else {
            observer.next(null);
          }
          observer.complete();
        });
      });
    });
  }


  // getCurrentUserInfo(): Observable<{ uid: string, role: string | string[] | null } | null> {
  //   return new Observable(observer => {
  //     onAuthStateChanged(this.auth, user => {
  //       if (!user) {
  //         observer.next(null);
  //         observer.complete();
  //         return;
  //       }

  //       const uid = user.uid; // On récupère directement l'UID

  //       const rolesRef = doc(this.firestore, `roles/${uid}`);
  //       docData(rolesRef).subscribe(roleDoc => {
  //         console.log("Données Firestore :", roleDoc); // Debug
  //         observer.next({
  //           uid,
  //           role: roleDoc?.['role'] || null // Récupération du rôle ou `null`
  //         });
  //         observer.complete();
  //       });
  //     });
  //   });
  // }








}

