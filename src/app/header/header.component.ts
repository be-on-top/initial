import { Component, OnChanges, OnInit } from '@angular/core';
import { AuthService } from '../admin/auth.service';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userUid?: string

  constructor(private authService: AuthService, private auth: Auth) {
    // this.userUid=this.authService.getUserId()
  }

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.userUid = user.uid
      }
    })
  }

  logOut() {
    this.authService.logout()
  }



}
