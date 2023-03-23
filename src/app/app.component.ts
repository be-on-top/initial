import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Be On Top APP';
  ui : string | undefined=""

  constructor(private auth:Auth){

    const userKey = this.auth.currentUser?.uid;
    console.log("userKey", userKey);
    this.ui = userKey
  }

}
