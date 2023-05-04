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

// c'est maintenant le service qui régale !!!
// import { getMessaging, onMessage, getToken } from "@angular/fire/messaging";
import { PushNotificationService } from '../push-notification.service';
import { SwPush } from '@angular/service-worker';
// import { getMessaging } from '@angular/fire/messaging';

import { getMessaging } from "firebase/messaging/sw";
import { onBackgroundMessage } from "firebase/messaging/sw";
import { getToken } from 'firebase/messaging';




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

  // on en a plus besoin, c'est le service qui régale !!!!
  // messaging: any
  newNotification: any
  // pour détecter online et offline
  offline: boolean = false  
  // test transmission d'une liste de jetons d'enregistrement
  registrationTokens?:any


  constructor(private notificationService: PushNotificationService, private auth: Auth, private firestore: Firestore, private authService: AuthService, private evaluatorService: EvaluatorsService, private activatedRoute: ActivatedRoute, private router: Router, readonly swPush: SwPush) {
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
    // const messaging = getMessaging()
    // fonctionne parfaitement, mais on va utiliser le service dédié qui maintenant sait comment opérer !!!!
    // getToken(messaging, { vapidKey: "BOLK9wQoeo2ycP0yK1yTLQG8DlIYM1GnRLe09u3tdnCERUSOwW7iv_QV671oU8Xa4njllE64DbVvHPnrzsgRdpc" }).then((currentToken) => {
    this.notificationService.requestPermission().then((currentToken) => {

      if (currentToken) {
        // Send the token to your server and update the UI if necessary 
        console.log('currentToken !!!!!!', currentToken);
        // this.messaging = getMessaging();
        // fonctionne parfaitement, mais on va utiliser le service dédié qui maintenant sait comment opérer !!!!!!
        // onMessage(this.messaging, (payload) => {
        //   console.log('Message received!!!!!! ', payload.notification);
        //   // j'essaie de récupérer l'objet notification pour afficher ses proprietés (title, body, image), ce qui permettrait d'afficher dans des emplacements spécifiques le contenu de campagnes de notification (?)
        //   this.newNotification= payload.notification
        // });
 

      

        // tests ok : impeccable !!!
        this.notificationService.receiveMessage().subscribe(data => this.newNotification = data.notification)
        console.log("this.newNotification !!!!!! ", this.newNotification);

        // ... 

      } else {
        // Show permission request UI 
        console.log('No registration token available. Request permission to generate one.');
        // ... inclure le notifyMe ici éventuellement, avec une popUp si besoin

      }

    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);

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
    this.authService.getToken()?.then(res => console.log("token authentification depuis authService", res.token))
    // fonctionne parfaitement !!!!!!!!!!!!!!!!!!
    this.authService.authStatusListener()

    // to check User offline status
    // basic method : OK
    // if (!navigator.onLine) {
    //   // ici, en lançant l'application avec ng serve, on l rend accessible au navigateur sans  passer par le service worker (?)
    //   alert('merci de vérifier votre connexion internet !!!');
    //   // alert('please check your internet connection');
    // }

    // eventListener
    addEventListener('offline', e => {
      this.offline = true
    })

    addEventListener('online', e => {
      this.offline = false
    })

    //  under progress : to do !!!!!!!!!!!!!
    this.subscribeToPush()
    this.getSubscription();
  
  }

  getSubscription() {
    this.swPush.subscription.subscribe(data => console.log("data", data))
  }

  // private async subscribeToPush() {
  async subscribeToPush() {
    // alert("et puis quoi ????????????????? ")
    try {
      const sub = await this.swPush.requestSubscription({
        // serverPublicKey: PUBLIC_VAPID_KEY_OF_SERVER,
        serverPublicKey: 'AIzaSyAtKNEibUci4ru5bsd2Df1quoFBKIqbL-k'
      });


      // TODO: Send to server ?????????????????????????????????????????????????????????????????????????
    } catch (err) {
      console.error('Could not subscribe due to:', err);
    }


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
          this.notificationService.registerToken(newToken)})



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
            
            this.notificationService.registerToken(newToken)
            
            // this.registrationTokens.push(newToken)
          });
          
      
       
          
        
          // …:
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
