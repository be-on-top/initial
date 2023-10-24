import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './admin/auth.service';
import { DialogService } from './dialog/dialog.service';


// A route can have more than one canActivate guard.
// If all guards returns true, navigation to the route will continue
// If any one of the guard returns false, navigation will be cancelled.
// If any one of the guard returns a UrlTree, current navigation will be cancelled and a new navigation will be kicked off to the UrlTree returned from the guard.

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  user?: any;

  constructor(private authService: AuthService, private router: Router, private auth: Auth, private dialogService: DialogService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    alert('AuthGuardService canActivate called');

    // onAuthStateChanged(this.auth, (user: any) => {
    //   if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    // this.user = this.auth.currentUser?.uid
    //   }
    // })

    //   this.user = this.auth.currentUser?.uid
    //   const allowedRoutes: string[] = ['home', '', 'quizz', 'trade']; // Liste des routes autorisées sans authentification
    //   const routePath: string = state.url.replace('/', ''); // Obtenez le chemin de la route sans le slash initial

    //   if (allowedRoutes.includes(routePath)) {
    //     alert("c'est public")
    //     return true; // Autoriser l'accès aux routes spécifiées sans authentification
    //   }

    //   // Vérifier si l'utilisateur est authentifié
    //   if (this.user!=="") {
    //     return true; // Laisser l'accès à la route si l'utilisateur est authentifié
    //   } else {
    //     alert(this.user)
    //     // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    //     this.router.navigate(['/login']);
    //     return false;
    //   }
    // }

    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user.uid
      }
    })

    if (this.user) {
      alert('salut user')
      return true
    } else {
      const message = 'Vous devez être authentifié pour accéder à ce lien. Voulez-vous être redirigé vers la page de connexion ?';
      if (this.dialogService.confirm(message)) {
        this.router.navigate(['/login']);
      }
      return false;
    }
  }

}






