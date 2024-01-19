import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// je ne vois pas l'utilité de cette méthode pour le moment, donc on désactive !!!!
// import { loggedIn } from '@angular/fire/auth-guard';
import { Auth } from '@angular/fire/auth';
// editeur de texte
import { DomSanitizer } from '@angular/platform-browser';
// import { of } from 'rxjs';
import { AuthService } from '../admin/auth.service';
// on a pu se passer de rxjs, donc on désactive tout pour le moment
// import { Observable, Subscription, switchMap } from 'rxjs';
import { query, Firestore, where, collection, getDocs } from '@angular/fire/firestore';
import { onAuthStateChanged } from '@angular/fire/auth';
import { StudentsService } from '../admin/students.service';

import { getMessaging, getToken, onMessage } from "@angular/fire/messaging";
import { PushNotificationService } from '../push-notification.service';
import { Evaluation } from '../admin/evaluation';
import { SettingsService } from '../admin/settings.service';
import { Observable, forkJoin, combineLatest, concatMap, toArray, tap, takeUntil, Subject, take } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {
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
  // studentData?: any;
  // pour afficher le formulaire d'édition
  editMode: boolean = false

  feedbackMessages: any
  editButtonLabel: string = "Modifier"

  // on n'a plus besoin de s'y référer dès qu'on traite de quizz multiples comme ici dans la V2
  // lastIndex: number = 0

  // pour afficher si on garde cette option fullResuls à l'utilisateur
  fullResults: { [key: string]: { duration: number; cost: number } }[] = [];

  // puisque dans cette VERSION 2 des quizz multiples, tradesEvaluated n'existe pas en base et que tradeEvaluated n'existe plus, on va reconstruire le premier
  // tradesEvaluated: string[] = []
  tradesEvaluated: Array<any> = [];
  // et pour VERSION 2 des quizz multiples, on ne peut pas savoir si un quizz est terminé sans interroger tous les quizz, ce qu'on ne veut pas côté template, donc on crée un bolean
  isOneQuizzAchieved: boolean = false;
  // pour les évaluations de l'étudiant si elles existent
  evaluations: Record<string, Evaluation> = {};
  // pour le suivi tutorial de l'étudiant si il existe
  tutorials: Record<string, Evaluation> = {};

  competencesMap: Map<string, string[]> = new Map();

  // trades: string[] = []; // Vous stockerez ici les compétences pour chaque trade
  // trades: { tradeId: any; competences: string[] }[] = [];
  // trades: { [key: string]: string[] }[] = [];

  tradeIds = []; // Mettez vos tradeIds ici

  formattedTrades: { [key: string]: string[] } = {};

  // Utilisez forkJoin pour attendre la résolution de toutes les requêtes
  // observables = this.tradesEvaluated.map((tradeId: any) => this.settingsService.getCompetences(tradeId));

  trades: { [key: string]: string[] } = {};

  private destroy$ = new Subject<void>();

  isSocialFormSent:boolean=false

  hasStartedEvaluation:boolean=false


  constructor(private auth: Auth, private firestore: Firestore, private authService: AuthService, private studentService: StudentsService, private activatedRoute: ActivatedRoute, private router: Router, private notificationService: PushNotificationService, public sanitizer: DomSanitizer, private settingsService: SettingsService) {
    // const messaging = getMessaging();
    // onMessage(messaging, (payload) => {
    //   console.log('Message received. ', payload);
    //   // ...
    // });

     }

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.user = user.uid;
  
        this.studentService.getStudentById(user.uid)
        .pipe(
          take(1),
          takeUntil(this.destroy$)) // Utilisation de takeUntil ici
        .subscribe(data => {
          console.log("userData from students 0...", data);
          this.userData = data;
          // this.lastIndex = Number(this.userData.lastIndexQuestion);
  
          // Logique pour obtenir tradesEvaluated
          for (const key in this.userData) {
            console.log('key', key.includes('quizz'));
  
            if (key.includes('quizz')) {
              // on peut rajouter hasStartedEvaluation pour conditionner l'affichage de l'onglet QCMS et résulats
              this.hasStartedEvaluation=true;
              this.tradesEvaluated.push(key);
            }
          }
  
          console.log("this.tradesEvaluated after loop:", this.tradesEvaluated);
  
          // Logique pour obtenir les compétences pour chaque tradeId
          this.tradesEvaluated.forEach(tradeId => {
            this.settingsService.getCompetences(tradeId).subscribe(competences => {
                // Ajoutez les compétences dans l'objet trades
                this.trades[tradeId] = competences;
                // Loguez les compétences dans la console
                console.log(`${tradeId}:`, competences);
            });
        });
        
  
          // Logique pour récupérer isOneQuizzAchieved
          const achievedArray: any = [];
          for (const item of this.tradesEvaluated) {
            this.userData[item].fullResults ? achievedArray.push(item) : '';
            achievedArray.length > 0 ? this.isOneQuizzAchieved = true : false;
          }
  
          // Logique pour trier les résultats
          for (const item of this.tradesEvaluated) {
            if (this.userData[item].fullResults) {
              this.userData[item].fullResults.sort((a: any, b: any) => {
                const keyA = Object.keys(a)[0];
                const keyB = Object.keys(b)[0];
                return keyA.localeCompare(keyB);
              });
            }
          }
  
          // Logique pour récupérer evaluations
          if (this.userData.evaluations) {
            this.evaluations = this.userData.evaluations;
          }
  
          // Logique pour récupérer le suivi tutorial
          if (this.userData.tutorials) {
            this.tutorials = this.userData.tutorials;
          }
        });
      }
    });
  
    // this.authService.getToken()?.then(res => console.log("token authentification depuis authService", res.token));
  
    console.log('this.tradesEvaluated', this.tradesEvaluated);
    console.log('type of tradesEvaluated', typeof (this.tradesEvaluated));
  }

  ngOnDestroy() {
    // Détruit le composant
    this.destroy$.next();
    this.destroy$.complete();
  }  

 
  onClick() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/register']);
      })
      .catch(error => console.log(error));
  }


  async notifyMe() {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }
  
    try {
      const permission = await Notification.requestPermission();
  
      if (permission === "granted") {
        const notification = new Notification("Coucou, vous venez de demander à être notifié !!! ");
        const messaging = getMessaging();
        
        const token = await getToken(messaging, { vapidKey: "BIh4nZeNhn8JfEciZJvgFL96Qd7uVzfZTmaoUp2RFb65SA2Lk2jvujAtmEkttGR5OtyTRIj2_FS49k5mPLl6HsM" });
        
        console.log(token);
        this.notificationService.registerToken(token, this.userData.id);
      } else {
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.error("Error during notification setup:", error);
    }
  }
  

  // alternative pour externaliser essai
  // onNotifyClick() {
  //   this.notificationService.requestPermissionAndRegisterToken( this.userData.id).then(
  //     (token) => {
  //       console.log(`Token obtenu : ${token}`);
  //       // Faites ce que vous devez faire avec le token si nécessaire
  //     },
  //     (error) => {
  //       console.error(`Erreur lors de la demande de permission : ${error}`);
  //     }
  //   );
  // }

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
    this.studentService.deleteAccount();
    alert('Compte utilisateur supprimé')
  }

  // pour utiliser le composant de recherche
  onValidFeedback(feedbackMessages: string) {
    this.feedbackMessages = feedbackMessages

  }


  // Fonction pour obtenir les entrées d'un objet
  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }

  // Méthode pour vérifier si tutorials n'est pas vide
  tutorialsNotEmpty(): boolean {
    return Object.keys(this.tutorials).length > 0;
  }

  // Méthode pour vérifier si evaluations n'est pas vide
  evaluationsNotEmpty(): boolean {
    return Object.keys(this.evaluations).length > 0;
  }


}
