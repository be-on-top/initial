import { Component } from '@angular/core';
import { AuthService } from '../admin/auth.service';
import { Student } from '../admin/Students/student';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  userUid?:string

  constructor(private authService:AuthService){
    this.userUid=this.authService.getUserId()
    console.log(this.userUid);
    

  }
  logOut(){
    this.authService.logout()
  }



}
