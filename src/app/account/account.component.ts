import { Component, OnInit } from '@angular/core';
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
import { Observable, forkJoin, combineLatest, concatMap, toArray, tap } from 'rxjs';

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

  // on n'a plus besoin de s'y référer dès qu'on traite de quizz multiples comme ici dans la V2
  lastIndex: number = 0

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

  constructor(private auth: Auth, private firestore: Firestore, private authService: AuthService, private studentService: StudentsService, private activatedRoute: ActivatedRoute, private router: Router, private notificationService: PushNotificationService, public sanitizer: DomSanitizer, private settingsService: SettingsService) {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // ...
    });
  }


  ngOnInit(): void {

    //  this.settingsService.getTrades().subscribe((data:any)=>{
    //   this.tradeIds=data
    //   console.log("this.tradeIds", this.tradeIds);

    //  })



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
          this.lastIndex = Number(this.userData.lastIndexQuestion)
          // this.userData.fullResults ? this.fullResults = this.userData.fullResults : []


          for (const key in this.userData) {
            console.log('key', key.includes('quizz'));

            if (key.includes('quizz')) {
              this.tradesEvaluated.push(key);
            }
          }

          console.log("this.tradesEvaluated after loop:", this.tradesEvaluated);
          // this.tradesEvaluated.forEach(tradeId => {
          //   console.log('Current tradeId:', tradeId); // Ajoutez cette ligne
          //   this.settingsService.getCompetences(tradeId).subscribe(competences => {
          //     // Ajoutez les compétences dans le tableau trades
          //     this.trades.push(`${tradeId}: ${competences.join(', ')}`);

          //     // Loguez les compétences dans la console
          //     console.log(`${tradeId}:`, competences);
          //   });
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
                this.lastIndex = Number(this.userData.lastIndexQuestion)
                // this.userData.fullResults ? this.fullResults = this.userData.fullResults : []


                for (const key in this.userData) {
                  console.log('key', key.includes('quizz'));

                  if (key.includes('quizz')) {
                    this.tradesEvaluated.push(key);
                  }
                }

                // console.log("this.tradesEvaluated after loop:", this.tradesEvaluated);
                console.log("this.tradesEvaluated after loop:", this.tradesEvaluated);
                this.tradesEvaluated.forEach(tradeId => {
                  console.log('Current tradeId:', tradeId);
                  this.settingsService.getCompetences(tradeId).subscribe(competences => {
                    // Ajoutez les compétences dans l'objet trades
                    this.trades[tradeId] = competences;
                
                    // Loguez les compétences dans la console
                    console.log(`${tradeId}:`, competences);
                  });
                });

                // this.tradesEvaluated.forEach(tradeId => {
                //   console.log('Current tradeId:', tradeId); // Ajoutez cette ligne
                //   this.settingsService.getCompetences(tradeId).subscribe(competences => {
                //     // Ajoutez les compétences dans le tableau trades
                //     this.trades.push({ [tradeId]: competences });
                
                //     // Loguez les compétences dans la console
                //     console.log(`${tradeId}:`, competences);
                //   });
                // });

                
                // this.tradesEvaluated.forEach(tradeId => {
                //   console.log('Current tradeId:', tradeId); // Ajoutez cette ligne
                //   this.settingsService.getCompetences(tradeId).subscribe(competences => {
                //     // Ajoutez les compétences dans le tableau trades
                //     // this.trades.push(`${tradeId}: ${competences.join(', ')}`);
                //     this.trades.push({ tradeId, competences });


                //     // Loguez les compétences dans la console
                //     console.log(`${tradeId}:`, competences);
                //   });
                // });

                // this.tradesEvaluated.forEach(tradeId => {
                //   this.settingsService.getCompetences(tradeId).subscribe(competences => {
                //     // Ajoutez les compétences dans le tableau trades
                //     const tradeEntry = `${tradeId}: ${competences.join(', ')}`;

                //     this.trades.push(tradeEntry);

                //     // Loguez les compétences dans la console
                //     console.log(`${tradeId}:`, competences);

                //     // Reformatez trades en tant qu'objet avec les noms de trades et les compétences associées
                //     const [tradeName, competencesString] = tradeEntry.split(':');
                //     const competencesArray = competencesString.split(',').map(comp => comp.trim());
                //     this.formattedTrades[tradeName.trim()] = competencesArray;

                //     // Maintenant formattedTrades est un objet avec les noms de trades et les compétences associées
                //     console.log(this.formattedTrades);
                //   });
                // });

                // lignes pour récupérer isOneQuizzAchieved
                const achievedArray: any = []
                for (const item of this.tradesEvaluated) {
                  this.userData[item].fullResults ? achievedArray.push(item) : ''
                  achievedArray.length > 0 ? this.isOneQuizzAchieved = true : false

                }

                for (const item of this.tradesEvaluated) {
                  if (this.userData[item].fullResults) {
                    this.userData[item].fullResults.sort((a: any, b: any) => {
                      const keyA = Object.keys(a)[0];
                      const keyB = Object.keys(b)[0];

                      return keyA.localeCompare(keyB);
                    });
                  }
                }


                // lignes pour récupérer evaluations
                if (this.userData.evaluations) {
                  this.evaluations = this.userData.evaluations
                }

                // lignes pour récupérer le suivi tutorial
                if (this.userData.tutorials) {
                  this.tutorials = this.userData.tutorials
                }

              })
              // y a juste que je n'arrive pas à me la faire livrer par le service !!!
              // this.studentService.getDocsByParam(this.user)
            }
          })

          this.authService.getToken()?.then(res => console.log("token authentification depuis authService", res.token))


          console.log('this.tradesEvaluated', this.tradesEvaluated);
          console.log('type of tradesEvaluated', typeof (this.tradesEvaluated));
          // this.tradesEvaluated

          // lignes pour récupérer isOneQuizzAchieved
          const achievedArray: any = []
          for (const item of this.tradesEvaluated) {
            this.userData[item].fullResults ? achievedArray.push(item) : ''
            achievedArray.length > 0 ? this.isOneQuizzAchieved = true : false

          }

          for (const item of this.tradesEvaluated) {
            if (this.userData[item].fullResults) {
              this.userData[item].fullResults.sort((a: any, b: any) => {
                const keyA = Object.keys(a)[0];
                const keyB = Object.keys(b)[0];

                return keyA.localeCompare(keyB);
              });
            }
          }


          // lignes pour récupérer evaluations
          if (this.userData.evaluations) {
            this.evaluations = this.userData.evaluations
          }

          // lignes pour récupérer le suivi tutorial
          if (this.userData.tutorials) {
            this.tutorials = this.userData.tutorials
          }

        })
        // y a juste que je n'arrive pas à me la faire livrer par le service !!!
        // this.studentService.getDocsByParam(this.user)
      }
    })

    this.authService.getToken()?.then(res => console.log("token authentification depuis authService", res.token))


    console.log('this.tradesEvaluated', this.tradesEvaluated);
    console.log('type of tradesEvaluated', typeof (this.tradesEvaluated));
    // this.tradesEvaluated




    // const tradesArray: string[] = this.tradesEvaluated as string[];
    // this.tradesEvaluated.forEach(tradeId => {
    //   console.log('Current tradeId:', tradeId); // Ajoutez cette ligne
    //   this.settingsService.getCompetences(tradeId).subscribe(competences => {
    //     // Ajoutez les compétences dans le tableau trades
    //     this.trades.push(`${tradeId}: ${competences.join(', ')}`);

    //     // Loguez les compétences dans la console
    //     console.log(`${tradeId}:`, competences);
    //   });
    // });

  }

  // const observables = this.tradesEvaluated.map((tradeId:any) =>
  //   this.settingsService.getCompetences(tradeId).pipe(
  //     tap(competences => console.log(`${tradeId} competences:`, competences))
  //   )
  // );

  // forkJoin(observables)
  //   .subscribe({
  //     next: (results: any) => {
  //       const competencesArray = results as string[][]; // Convertir les résultats en tableau de compétences
  //       console.log('competencesArray:', competencesArray);

  //       this.tradesEvaluated.forEach((tradeId:any, index:any) => {
  //         const competences = competencesArray[index];
  //         console.log(`${tradeId}:`, competences);

  //         this.trades.push(`${tradeId}: ${competences.join(', ')}`);
  //       });
  //     },
  //     error: (error: any) => {
  //       console.error('Error fetching competences:', error);
  //     },
  //     complete: () => {
  //       console.log('Competences fetching completed.');
  //     }
  //   });
  // }

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
