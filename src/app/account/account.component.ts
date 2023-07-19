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

import { getMessaging, getToken, onMessage } from "@angular/fire/messaging";
import { PushNotificationService } from '../push-notification.service';

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
  userData: any = {};
  // evaluatorData?: any;
  studentData?: any;
  // pour afficher le formulaire d'édition
  editMode: boolean = false

  feedbackMessages: any
  editButtonLabel: string = "Modifier"

  lastIndex: number = 0

  // pour afficher si on garde cette option fullResuls à l'utilisateur
  fullResults: { [key: string]: { duration: number; cost: number } }[] = [];


  constructor(private auth: Auth, private firestore: Firestore, private authService: AuthService, private studentService: StudentsService, private activatedRoute: ActivatedRoute, private router: Router, private notificationService: PushNotificationService) {
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
      // impeccable
      // console.log("this.user dispensé par onAuthStateChanged", this.auth.currentUser);
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user.uid


        this.studentService.getStudentById(user.uid).subscribe(data => {
          console.log("userData from students 0...", data);
          this.userData = data
          this.lastIndex=Number(this.userData.lastIndexQuestion)
          this.userData.fullResults?this.fullResults=this.userData.fullResults:[]
        })
        // y a juste que je n'arrive pas à me la faire livrer par le service !!!
        // this.studentService.getDocsByParam(this.user)
      }
    })

    this.authService.getToken()?.then(res => console.log("token authentification depuis authService", res.token))
  }

  onClick() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/register']);
      })
      .catch(error => console.log(error));
  }


  notifyMe() {
    // alert("coucou")

    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      // Check whether notification permissions have already been granted 
      // if so, create a notification
      const notification = new Notification("Coucou, vous avez déjà demandé à être notifié. Votre demande a été prise en compte !!! ");
      alert(`Notification permission OK : already registered`);

      // c'est là qu'on peut mettre à jour registrationTokens
      getToken(getMessaging(), { vapidKey: "BOLK9wQoeo2ycP0yK1yTLQG8DlIYM1GnRLe09u3tdnCERUSOwW7iv_QV671oU8Xa4njllE64DbVvHPnrzsgRdpc" })
        .then((value) => {
          const newToken: string = value;
          this.notificationService.registerToken(newToken, this.userData.id)
        })

      // …
    } else if (Notification.permission !== "denied") {
      // We need to ask the user for permission
      alert('notification request for push notification')
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          alert("nouveau !!!!")
          const notification = new Notification("Coucou, vous venez de demander à être notifié !!! ");
          // c'est là qu'on peut mettre à jour registrationTokens
          getToken(getMessaging(), { vapidKey: "BOLK9wQoeo2ycP0yK1yTLQG8DlIYM1GnRLe09u3tdnCERUSOwW7iv_QV671oU8Xa4njllE64DbVvHPnrzsgRdpc" })
            .then((value) => {
              const newToken: string = value;
              console.log(newToken);
              this.notificationService.registerToken(newToken, this.userData.id)
            });
        }
      });
    }
  }

  focus() {
    let myDoc: any = document.querySelector("#demo");
    myDoc.focus()
  }

  toogleItem(item: string) {
    let x: any = document.getElementById(item);
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }

  }

  toogleText() {
    // you should set this values to their default for finishing loading state
    // you can either do this in a another method which you run on the success or fail scenarios for subscribtion.
    // Or you can use setTimeout to set back to default values after a certain time.

    this.editButtonLabel == 'Modifier' ? this.editButtonLabel = 'Annuler' : this.editButtonLabel = 'Modifier';
    /*
    setTimeout(() => {
      this.loading = false;
      this.subscribeButtonLabel = 'Subscribe';
    }, 1000); // sets back to default values after 1 sec.
    */
  }
  edit() {
    this.editMode = true
  }

  delete() {
    /* console.log("data à supprimer", userData);   */
    // this.studentService.deleteAccount();
  }

  // pour utiliser le composant de recherche
  onValidFeedback(feedbackMessages: string) {
    this.feedbackMessages = feedbackMessages

  }



  getObjectProperties(obj: any): any[] {
    return Object.entries(obj);
  }

}
