import { Component, OnChanges, OnInit } from '@angular/core';
import { AuthService } from '../admin/auth.service';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth, reload } from '@angular/fire/auth';
import { Firestore, docData, doc } from '@angular/fire/firestore';
import {Observable} from 'rxjs'
import { Trade } from '../admin/trade';
import { SettingsService } from '../admin/settings.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userUid?: any
  userRole:string=""
  trades?:any
  constructor(private authService: AuthService, private auth: Auth, private firestore:Firestore, private tradeService:SettingsService) {
    // this.userUid=this.authService.getUserId()
  }

  ngOnInit(): void {

    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.userUid = user.uid
        console.log("log user uid depuis le header", user.uid);   
        this.getRole(this.userUid).subscribe(data=>{
          console.log("data de l'utilisateur depuis header", data);
          // si on a un tableau de rôles, c'est data.role[0]
          this.userRole=data.role
          console.log("roles depuis header", data.role);

      })
    
    }
    console.log("pas d'utilisateur authentifié")
    })
    
    //  onAuthStateChanged(this.auth, (user: any) => {
    //    if (user) {
    //      this.getRole( user.uid).subscribe((data)=>{
    //        this.userRole=data.role
    //    }) }
  
    //  })

    this.tradeService.getTrades().subscribe(data=>{
      // alert(data)
      this.trades=data
    })
   }
  
   getRole(id:any){
    // finalement, compte tenu du fait que les evaluators peuvent potentiellement aussi être des tuteurs (formateurs) roles sera un tableau
    // au niveau de getRole, cela ne change pas grand chose
     let $roleRef = doc(this.firestore, "roles/" + id)
     return docData($roleRef) as Observable <any>;
  
   }

  logOut() {
    this.authService.logout()
    window.location.reload();
  }



}
