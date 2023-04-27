import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// je ne vois pas l'utilité de cette méthode pour le moment, donc on désactive !!!!
// import { loggedIn } from '@angular/fire/auth-guard';
import { Auth } from '@angular/fire/auth';
// import { of } from 'rxjs';
import { AuthService } from '../admin/auth.service';
import { EvaluatorsService } from '../admin/evaluators.service';
// on a pu se passer de rxjs, donc on désactive tout pour le moment
// import { Observable, Subscription, switchMap } from 'rxjs';
import { query, Firestore, where, collection, getDocs } from '@angular/fire/firestore';
import { onAuthStateChanged } from '@angular/fire/auth';

// import { getMessaging, getToken } from "firebase/messaging"; 
import { getMessaging, onMessage, getToken } from "@angular/fire/messaging";



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user?: any;
  // sub: Subscription;
  uid = '';

  ui: string | undefined = ''
  authStatus?: any;
  myData?: any;
  evaluatorId: any;
  evaluator: any
  userData?: any;
  evaluatorData?: any;
  studentData?: any;

  requestToken?: any

  messaging: any
  newNotification:any



  constructor(private auth: Auth, private firestore: Firestore, private authService: AuthService, private evaluatorService: EvaluatorsService, private activatedRoute: ActivatedRoute, private router: Router) {
    // this.user = this.auth.currentUser
    this.evaluatorId = this.auth.currentUser
    console.log("evaluatorId", this.evaluatorId);

    this.evaluatorService.getEvaluator(this.evaluatorId).subscribe(data => {
      console.log("data de getEvaluator depuis la page", data);
      this.evaluator = data
      return this.evaluator
    })

    // const messaging = getMessaging();
    // onMessage(messaging, (payload) => {
    //   console.log('Message received. ', payload);
    //   // ...
    // });

  }


  ngOnInit(): void {
    // à externaliser
    const messaging = getMessaging()
    getToken(messaging, { vapidKey: "BOLK9wQoeo2ycP0yK1yTLQG8DlIYM1GnRLe09u3tdnCERUSOwW7iv_QV671oU8Xa4njllE64DbVvHPnrzsgRdpc" }).then((currentToken) => {

      if (currentToken) {
        // Send the token to your server and update the UI if necessary 
        console.log('currentToken !!!!!!', currentToken);
        this.messaging = getMessaging();
        onMessage(this.messaging, (payload) => {
          console.log('Message received!!!!!! ', payload.notification);
          // j'essaie de récupérer l'objet notification pour afficher ses proprietés (title, body, image), ce qui permettrait d'afficher dans des emplacements spécifiques le contenu de campagnes de notification (?)
          this.newNotification= payload.notification
          // ...
        });

        // ... 

      } else {
        // Show permission request UI 
        console.log('No registration token available. Request permission to generate one.');
        // ... inclure le notifyMe ici éventuellement, avec une popUp si besoin

      }

    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
      // ... 

    })







    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user.uid
        this.myData = this.evaluatorService.getEvaluator(user.uid).subscribe();
        console.log("dddd", user.uid);
        console.log("www", user.email);
        console.log("data", this.myData);
        // ne fonctionne pas : à creuser éventuellement, mais comme la méthode qui suit est impeccable, ce ne sera qu'un cas d'école
        // this.evaluatorService.getEvaluator(this.evaluatorId).subscribe(data => {
        //   console.log("data de getEvaluator depuis la page", data);
        //   this.evaluator = data
        // })

        // méthode au top pour faire des requests
        this.getEvaluatorsByParam(user.uid)
        this.getStudentsByParam(user.uid)
        console.log("userData from students or evaluators...", this.userData);

        // y a juste que je n'arrive pas à me la faire livrer pa le service !!!
        // this.evaluatorService.getDocsByParam(this.user)

      }
    })

    // getUserId ne sert à priori à rien si on peut récupérer l'id grâce à this.auth.currentUser !!!
    this.authService.getUserId();
    // retourne this.ui tout de suite après la connexion. undefined plus tard, donc ne convient pas...
    // console.log("log de ui", this.ui);
    // tests ok pour information, mais ne semble pas être très utile 
    this.authService.getToken()?.then(res => console.log(res.token))
    // fonctionne parfaitement !!!!!!!!!!!!!!!!!!
    this.authService.authStatusListener()



  }

  // top !!!
  async getStudentsByParam(uid: string) {
    const myData = query(collection(this.firestore, 'students'), where('id', '==', uid));
    const querySnapshot = await getDocs(myData);
    if (querySnapshot) {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
        this.userData = doc.data()
      });
    }
  }

  async getEvaluatorsByParam(uid: string) {
    const myData = query(collection(this.firestore, 'evaluators'), where('id', '==', uid));
    const querySnapshot = await getDocs(myData);
    if (querySnapshot) {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
        this.userData = doc.data()
      });

    }

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
      // Check whether notification permissions have already been granted 
      // if so, create a notification
      const notification = new Notification("Coucou, vous avez demandé à être notifié !!! ");
      alert(`Notification permission OK`);



      // …
    } else if (Notification.permission !== "denied") {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          const notification = new Notification("Coucou, vous avez demandé à être notifié !!! ");
          // …
          //      // à externaliser
          // const messaging = getMessaging()
          // getToken(messaging, { vapidKey: "BOLK9wQoeo2ycP0yK1yTLQG8DlIYM1GnRLe09u3tdnCERUSOwW7iv_QV671oU8Xa4njllE64DbVvHPnrzsgRdpc" }).then((currentToken) => { 

          //   if (currentToken) { 

          //     // Send the token to your server and update the UI if necessary 
          //     console.log('currentToken !!!!!!', currentToken);


          //     // ... 

          //   } else { 

          //     // Show permission request UI 

          //     console.log('No registration token available. Request permission to generate one.'); 

          //     // ... 

          //   } 

          // }).catch((err) => { 

          //   console.log('An error occurred while retrieving token. ', err); 

          //   // ... 

          // }) 


          // …

        }
      });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them anymore.
  }



}
