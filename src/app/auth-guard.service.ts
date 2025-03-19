import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './admin/auth.service';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';


// A route can have more than one canActivate guard.
// If all guards returns true, navigation to the route will continue
// If any one of the guard returns false, navigation will be cancelled.
// If any one of the guard returns a UrlTree, current navigation will be cancelled and a new navigation will be kicked off to the UrlTree returned from the guard.

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  user?: any;

  // je ne devrais pas avoir à me faire importer onAuthStateChanged et auth ...

  constructor(private authService: AuthService, private router: Router, private auth: Auth, private firestore:Firestore) {

  }

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   onAuthStateChanged(this.auth, (user: any) => {
  //     if (user) {
  //       // User is signed in, see docs for a list of available properties
  //       // https://firebase.google.com/docs/reference/js/firebase.User
  //       this.user = user.uid
  //     }
  //   })

  //   if (this.user) {
  //     alert('salut user')
  //     return true
  //   } else {
  //     this.router.navigate(['/login'])
  //     return false
  //   }

  // }

  // canActivate fonctionnel pour utilisateurs sans bloquer l'accès à account (pas de traitement spécifique)
  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
  //   return new Promise<boolean>((resolve) => {
  //     onAuthStateChanged(this.auth, (user: any) => {
  //       if (user) {
  //         // User is signed in, see docs for a list of available properties
  //         // https://firebase.google.com/docs/reference/js/firebase.User
  //         this.user = user.uid;
  
  //         // Ajouter une condition pour vérifier si la route nécessite une authentification
  //         if (route.data['requiresAuth'] !== false) {
  //           // Si l'utilisateur est authentifié et la route nécessite une authentification,
  //           // laisser la navigation continuer
  //           resolve(true);
  //         } else {
  //           // Si la route ne nécessite pas d'authentification, laisser la navigation continuer
  //           resolve(true);
  //         }
  //       } else {
  //         // Si l'utilisateur n'est pas authentifié et la route nécessite une authentification,
  //         // effectuer la redirection vers la page de connexion
  //         if (route.data['requiresAuth'] !== false) {
  //           this.router.navigate(['/login']);
  //           resolve(false);
  //         } else {
  //           // Si la route ne nécessite pas d'authentification, laisser la navigation continuer
  //           resolve(true);
  //         }
  //       }
  //     });
  //   });

  // }

  // suggestion à l'essai qui bloque l'accès à account pour autres que students mais ne convient pas pour la récupération de l'ensemble des propriétés des autres utilisateurs

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
  //   return new Promise<boolean>((resolve) => {
  //     onAuthStateChanged(this.auth, async (user: any) => {
  //       if (user) {
  //         // Vérifier si la route nécessite un document "student"
  //         if (route.data['requiresStudentDocument']) {
  //           // Vérifier si un document existe dans la collection "students" avec l'ID égal à l'UID de l'utilisateur
  //           const userRef = doc(this.firestore, "students", user.uid); // Utiliser l'UID comme ID
  //           const userSnap = await getDoc(userRef);
  
  //           if (userSnap.exists()) {
  //             resolve(true); // Accès autorisé
  //           } else {
  //             this.router.navigate(['/home']); // Redirection si le document n'existe pas
  //             resolve(false);
  //           }
  //         } else {
  //           resolve(true); // Pas de vérification nécessaire pour cette route
  //         }
  //       } else {
  //         this.router.navigate(['/login']); // Si l'utilisateur n'est pas authentifié, redirection vers login
  //         resolve(false);
  //       }
  //     });
  //   });
  // }

  // nouvel essai on fait comme initialement mais on rajoute une exception
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      onAuthStateChanged(this.auth, async (user: any) => {
        if (user) {
          this.user = user.uid;
  
          // Vérifier si la route nécessite un document "student"
          if (route.data['requiresStudentDocument']) {
            const studentRef = doc(this.firestore, "students", user.uid);
            const studentSnap = await getDoc(studentRef);
  
            if (!studentSnap.exists()) {
              this.router.navigate(['/home']); // Redirection si le document n'existe pas
              return resolve(false);
            }
          }
  
          // Si aucune restriction supplémentaire ou si elle est satisfaite, on laisse passer
          return resolve(true);
        } else {
          // Rediriger les utilisateurs non authentifiés si nécessaire
          if (route.data['requiresAuth'] !== false) {
            this.router.navigate(['/login']);
            return resolve(false);
          } else {
            return resolve(true);
          }
        }
      })
    })
  }
  
  
  

}


