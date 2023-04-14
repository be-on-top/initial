import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './admin/auth.service';


// A route can have more than one canActivate guard.
// If all guards returns true, navigation to the route will continue
// If any one of the guard returns false, navigation will be cancelled.
// If any one of the guard returns a UrlTree, current navigation will be cancelled and a new navigation will be kicked off to the UrlTree returned from the guard.

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  user?: any;

  constructor(private authService: AuthService, private router: Router, private auth: Auth) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // onAuthStateChanged(this.auth, (user: any) => {
    //   if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = this.auth.currentUser?.uid
    //   }
    // })

    if (this.user) {
      alert('salut user')
      return true
    } else {
      this.router.navigate(['/login'])
      return false
    }

  }

}






