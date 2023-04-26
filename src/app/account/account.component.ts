import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// je ne vois pas l'utilité de cette méthode pour le moment, donc on désactive !!!!
// import { loggedIn } from '@angular/fire/auth-guard';
import { Auth } from '@angular/fire/auth';
// import { of } from 'rxjs';
import { AuthService } from '../admin/auth.service';
// on a pu se passer de rxjs, donc on désactive tout pour le moment
// import { Observable, Subscription, switchMap } from 'rxjs';
import { query, Firestore, where, collection, getDocs } from '@angular/fire/firestore';
import { onAuthStateChanged } from '@angular/fire/auth';
import { StudentsService } from '../admin/students.service';

import { getMessaging, onMessage } from "@angular/fire/messaging";



@Component({
  selector: 'app-home',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  user?: any;
  // sub: Subscription;
  uid = '';

  ui: string | undefined = ''
  authStatus?: any;
  myData?: any;
  studentId: any;
  student: any
  userData?: any;
  // evaluatorData?: any;
  studentData?: any;


  constructor(private auth: Auth, private firestore: Firestore, private authService: AuthService, private studentService: StudentsService, private activatedRoute: ActivatedRoute, private router: Router) {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // ...
    });
  }


  ngOnInit(): void {

    // https://firebase.google.com/docs/cloud-messaging/js/receive?hl=fr
    // Gérer les messages lorsque l'application Web est au premier plan (l'utilisateur consulte actuellement notre page Web)
    // const messaging = getMessaging();
    // onMessage(messaging, (payload) => {
    //   console.log('Message received. ', payload);
    //   // ...
    // });


    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user.uid
        this.myData = this.studentService.getStudentById(user.uid).subscribe();
        console.log("user.uid", user.uid);
        console.log("user.email", user.email);
        console.log("data", this.myData);

        // méthode au top pour faire des requests mais je n'en ai plus besoin :)
        // this.getStudentsByParam(user.uid)   
        this.studentService.getStudentById(user.uid).subscribe(data => {
          console.log("userData from students 0...", data);
          this.userData = data
        })
        console.log("userData from students 1...", this.userData);
        // y a juste que je n'arrive pas à me la faire livrer par le service !!!
        // this.studentService.getDocsByParam(this.user)
      }
    })

    this.authService.getToken()?.then(res => console.log(res.token))
    // fonctionne parfaitement !!!!!!!!!!!!!!!!!!
    this.authService.authStatusListener()

  }

  onClick() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/register']);
      })
      .catch(error => console.log(error));
  }


  notifyMe() {
    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      // Check whether notification permissions have already been granted;
      // if so, create a notification
      const notification = new Notification("Coucou, vous avez demandé à être notifié !!! ");
      // …
    } else if (Notification.permission !== "denied") {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          const notification = new Notification("Coucou, vous avez demandé à être notifié !!! ");
          // …
        }
      });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them anymore.

  }


}
