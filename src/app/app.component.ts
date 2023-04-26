import { Component, OnInit } from '@angular/core';
// import { Auth } from '@angular/fire/auth';
// import { PushNotificationService } from './push-notification.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Be On Top APP';
  // ui : string | undefined=""
  // mesaggeReceived:string | undefined="";


  constructor(
    // private auth:Auth, 
    // private pushNotificationService: PushNotificationService
    ){

    // const userKey = this.auth.currentUser?.uid;
    // console.log("userKey", userKey);
    // this.ui = userKey

    // test FCM
    // pushNotificationService.requestPermission().then(token => {
    //   console.log("token depuis le service injecté dans appComponent", token);
    // })
  }

  ngOnInit(): void {
    // this.pushNotificationService.receiveMessage().subscribe(payload => {
    //   console.log(payload);
    //   this.mesaggeReceived = payload.notification.title;
    // })
  }

}
