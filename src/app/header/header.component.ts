import { Component, OnChanges, OnInit } from '@angular/core';
import { AuthService } from '../admin/auth.service';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth, reload } from '@angular/fire/auth';
import { EvaluatorsService } from '../admin/evaluators.service';
import { Firestore, docData, doc } from '@angular/fire/firestore';
import {Observable} from 'rxjs'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userUid?: any
  userRole:any=[]

  constructor(private authService: AuthService, private auth: Auth, private evaluatorService: EvaluatorsService, private firestore:Firestore) {
    // this.userUid=this.authService.getUserId()
  }

  ngOnInit(): void {

    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.userUid = user.uid
        console.log("log user uid depuis le header", user.uid);   
        this.getRole(this.userUid).subscribe(data=>{
          console.log("data de getEvaluator depuis header", data);
          this.userRole=data.role
          console.log("roles depuis header", data.role);

      })}
    })
    
    //  onAuthStateChanged(this.auth, (user: any) => {
    //    if (user) {
    //      this.getRole( user.uid).subscribe((data)=>{
    //        this.userRole=data.role
    //    }) }
  
    //  })
  
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
