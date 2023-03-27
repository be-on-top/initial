import { Component } from '@angular/core';
import { AuthService } from '../admin/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(private authService:AuthService){

  }
  logOut(){
    this.authService.logout()
  }



}
