import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { EvaluatorsService } from './admin/evaluators.service';
import { Firestore, doc, docData } from '@angular/fire/firestore';
Firestore

@Injectable({
  providedIn: 'root'
})
export class RoleGuardGuard implements CanActivate {

  // https://www.youtube.com/watch?v=g3pq8WamEmE&t=3s

  constructor(private auth: Auth, private evaluatorService: EvaluatorsService, private firestore: Firestore) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    // return true;
    return this.isAuthorized(route)
  }

  private isAuthorized(route: any) {

    // const roles: any = []
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {

        console.log("log user uid depuis role guard", user.uid);
        // à finir...
        // this.getRole(user.uid).subscribe(data => {
        //   console.log("data de l'utilisateur depuis header", data);
        //   console.log("roles depuis role guard", data.role);


        //   const expectedRoles = route.data['expectedRoles']
        //   console.log(expectedRoles);
          
        //   const rolesMatches = data.role.findIndex((role: any) => expectedRoles.indexOf(role))
        //   rolesMatches < 0 || rolesMatches ? false : true

        //   console.log(rolesMatches);
          

        // })

      }
    })

  }

  getRole(id: any) {
    // finalement, compte tenu du fait que les evaluators peuvent potentiellement aussi être des tuteurs (formateurs) roles sera un tableau
    // au niveau de getRole, cela ne change pas grand chose
    let $roleRef = doc(this.firestore, "roles/" + id)
    return docData($roleRef) as Observable<any>;

  }

}
