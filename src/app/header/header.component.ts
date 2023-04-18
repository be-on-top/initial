import { Component, OnChanges, OnInit } from '@angular/core';
import { AuthService } from '../admin/auth.service';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth, reload } from '@angular/fire/auth';
import { EvaluatorsService } from '../admin/evaluators.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userUid?: any
  userRole?:any

  constructor(private authService: AuthService, private auth: Auth, private evaluatorService: EvaluatorsService) {
    // this.userUid=this.authService.getUserId()
  }

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.userUid = user.uid
        console.log("log user uid depuis le header", user.uid);   
        this.evaluatorService.getEvaluator(this.userUid).subscribe(data=>{
          console.log("data de getEvaluator depuis header", data);
          this.userRole=data.roles
          console.log("roles depuis header", data.roles);
      })}
    })


  }

  logOut() {
    this.authService.logout()
    window.location.reload();
  }



}
