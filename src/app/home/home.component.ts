import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// je ne vois pas l'utilité de cette méthode pour le moment, donc on désactive !!!!
// import { loggedIn } from '@angular/fire/auth-guard';
import { Auth } from '@angular/fire/auth';
// import { of } from 'rxjs';
import { AuthService } from '../admin/auth.service';
// EvaluatorsSerive servait initialement à faire des tests qui ont été déportés
// import { EvaluatorsService } from '../admin/evaluators.service';
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
import { SettingsService } from '../admin/settings.service';
import { Trade } from '../admin/trade';
import { Observable } from 'rxjs';
import { StudentsService } from '../admin/students.service';
import { Student } from '../admin/Students/student';


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
  authStatus?: boolean;
  myData?: any;
  // evaluatorId: any;
  // evaluator: any
  // userData?: any;
  // evaluatorData?: any;
  studentData?: any;

  requestToken?: any

  // on en a plus besoin, c'est le service qui régale !!!!
  // messaging: any
  newNotification: any
  // pour détecter online et offline
  offline: boolean = false
  // test transmission d'une liste de jetons d'enregistrement
  registrationTokens?: any

  tradesData?: any

  isEditor: boolean = false
  hasStartedEvaluation: boolean = false
  // ne sert pas et ne doit pas avoir à être nécessaire. 
  // lastIndexQuestion: number = 0

  userRole:string=""

  constructor(private notificationService: PushNotificationService, private auth: Auth, private authService: AuthService, private studentService: StudentsService, private ac: ActivatedRoute, private router: Router, readonly swPush: SwPush, private settingsService: SettingsService) {
    // pour savoir si l'utilisateur est éditeur sans interroger firestore, on peut (?) récupérer userRole livré en paramètre de route
    // this.ac.snapshot.params["userRole"]="editor"?this.isEditor=true:""

    if (this.ac.snapshot.params && this.ac.snapshot.params["userRole"] == "editor") {
      this.isEditor = true
    }

    // console.log("this.ac.snapshot.params", this.ac.snapshot.params !== null)
    // console.log("this.ac.snapshot.params['userRole']", this.ac.snapshot.params["userRole"])
    this.userRole= this.ac.snapshot.params["userRole"]
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
        this.studentService.getStudentById(user.uid).subscribe((data) => this.studentData = data)
        this.studentData && this.studentData.scoreCounter ? this.hasStartedEvaluation == true : ""
        // ne sert et ne doit pas avoir à être nécessaire... c'est qu'il y aurait un problème de typage
        // this.studentData.lastIndexQuestion?this.lastIndexQuestion==Number(this.studentData.lastIndexQuestion):""

        // récupération OK 
        // console.log("student uid récupération", this.studentData.id);
        // console.log("student Email récupération", this.studentData.email);
        // console.log("data", this.studentData.scoreCounter);
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
    //   // ici, en lançant l'application avec ng serve, on l rend accessible au navigateur sans passer par le service worker (?)
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

    // pour récupérer les métiers (sigles) enregistrés en base qui détermineront les différentes zones éditioriales
    this.settingsService.getTrades().subscribe(data => {

      this.tradesData = data,
        console.log("this.tradesData", this.tradesData);

    })
  }

  selectTrade(id: string) {


  }

  navigateToQuizz(trade: string, indexedQuestion: number = 0, score: number = 0) {
    this.studentData.tradeEvaluated && this.studentData.tradeEvaluated == trade ? this.router.navigate(['/quizz', trade, indexedQuestion, score]) : this.router.navigate(['/quizz', trade, 0, 0])
  }


}
