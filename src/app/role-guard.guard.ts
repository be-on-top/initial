import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { EvaluatorsService } from './admin/evaluators.service';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardGuard implements CanActivate {

  constructor(private auth: Auth, private evaluatorService: EvaluatorsService, private firestore: Firestore) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAuthorized(route);
  }
  
  private isAuthorized(route: any): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRoles = route.data['expectedRoles'];
    
    return new Observable<boolean>((observer) => {
      onAuthStateChanged(this.auth, (user: any) => {
        if (user) {
          this.getRole(user.uid).subscribe((data) => {
            // Convertir userRole en tableau si c'est une chaîne de caractères
            const userRoles = Array.isArray(data.role) ? data.role : [data.role];
            
            const isAuthorized = userRoles.some((role: string) => expectedRoles.includes(role));
            
            observer.next(isAuthorized);
            observer.complete();
          });
        } else {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
  


  getRole(id: string): Observable<any> {
    let roleRef = doc(this.firestore, `roles/${id}`);
    return docData(roleRef) as Observable<any>;
  }
}
