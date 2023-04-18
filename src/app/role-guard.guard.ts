import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { EvaluatorsService } from './admin/evaluators.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardGuard implements CanActivate {

  // https://www.youtube.com/watch?v=g3pq8WamEmE&t=3s

  constructor(private auth:Auth, private evaluatorService:EvaluatorsService){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    // return true;
    return this.isAuthorized(route)
  }

  private isAuthorized(route:any){

    const roles:any=[]
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
      
        console.log("log user uid depuis le header", user.uid);   
        this.evaluatorService.getEvaluator(user.uid).subscribe(data=>{
          // let isAuthorized=false
          console.log("data de getEvaluator depuis Role Guard Service", data);
          console.log("roles depuis Role Guard Service", data.roles);
          roles.push(data.roles)
          console.log(roles, "tableau des roles utilisateurs depuis Role Guard");
          
          const expectedRoles=route.data['expectedRoles']
          const rolesMatches = roles.findIndex((role:any)=>expectedRoles.indexOf(role))
          rolesMatches<0||rolesMatches?false:true
      })}
    })


  }
  
}
