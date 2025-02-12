import { Component, OnInit, OnDestroy, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

import { Router } from '@angular/router';
// je ne vois pas l'utilité de cette méthode pour le moment, donc on désactive !!!!
// import { loggedIn } from '@angular/fire/auth-guard';
import { Auth } from '@angular/fire/auth';
// editeur de texte
import { DomSanitizer } from '@angular/platform-browser';
// import { of } from 'rxjs';
import { AuthService } from '../admin/auth.service';
// on a pu se passer de rxjs, donc on désactive tout pour le moment
// import { Observable, Subscription, switchMap } from 'rxjs';
// import { query, Firestore, where, collection, getDocs } from '@angular/fire/firestore';
import { onAuthStateChanged } from '@angular/fire/auth';
import { StudentsService } from '../admin/students.service';

import { getMessaging, getToken, onMessage } from "@angular/fire/messaging";
import { PushNotificationService } from '../push-notification.service';
import { Evaluation } from '../admin/evaluation';
import { SettingsService } from '../admin/settings.service';
import { Observable, takeUntil, Subject, take, of } from 'rxjs';
import { ConsentService } from '../consent.service';
import { NetworkService } from '../network.service';


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

  // trades: string[] = []; // Stocker ici les compétences pour chaque trade
  // trades: { tradeId: any; competences: string[] }[] = [];
  // trades: { [key: string]: string[] }[] = [];

  tradeIds = []; // Mettre les tradeIds ici
  formattedTrades: { [key: string]: string[] } = {};

  // Utilisez forkJoin pour attendre la résolution de toutes les requêtes
  // observables = this.tradesEvaluated.map((tradeId: any) => this.settingsService.getCompetences(tradeId));

  trades: { [key: string]: string[] } = {};

  firstValuesSum: number = 0

  private destroy$ = new Subject<void>();

  isSocialFormSent: boolean = false

  hasStartedEvaluation: boolean = false

  denominationsMap: Map<string, Observable<string>> = new Map();

  cpEvaluated: string = ""
  getCpNameCalled: boolean = false;

  tradesData?: any

  displayPrices: boolean = true

  public notificationPermissionGranted = false;
  // pour la gestion du consentement à l'utilisation des cookies
  consentStatus: boolean;

  // pour détecter online et offline moins rapidement que NetWorkService
  offline: boolean = false

  // POUR accéder et lire les documents liés au doc de l'utilisateur
  documents: any[] = [];

  // pour ceux qui ne savent pas qu'un onglet est cliquable > transféré au composant enfant
  // showCollapsesAlert: boolean = true;

  // pour les settings application display
  isTrainingTimeMultiple7: boolean = false

  constructor(
    private auth: Auth,
    // private firestore: Firestore, 
    private authService: AuthService,
    private studentService: StudentsService,
    // private activatedRoute: ActivatedRoute, 
    private router: Router,
    private notificationService: PushNotificationService,
    public sanitizer: DomSanitizer,
    private settingsService: SettingsService,
    private consentService: ConsentService,
    private networkService: NetworkService,
    private el: ElementRef, 
    private renderer: Renderer2) {
    // const messaging = getMessaging();
    // onMessage(messaging, (payload) => {
    //   console.log('Message received. ', payload);
    //   // ...
    // });

    // Initialiser l'état du consentement en récupérant la valeur depuis le service
    this.consentStatus = this.consentService.getConsent()

    // Si au lieu d'utiliser networkService pour regiriger illico 
    // on laisse les données en cache s'afficher
    this.offline = !navigator.onLine
  }

  ngOnInit(): void {

    // Récupérer la valeur initiale de displayPrices depuis Firestore
    this.settingsService.getDisplayPrices().subscribe((data: any) => {
      if (data && data.prices !== undefined) {
        this.displayPrices = data.prices;
        // je rajoute de quoi récupérer l'état de l'autre propriété de display
        this.isTrainingTimeMultiple7=data.isMultiple7TrainingTime
        console.log("displayPrices depuis ngOnInit !!!!!!!!!!!!!!!!!!!!!!!", this.displayPrices);
      }
    })

    if (this.offline) {
      alert("Sans connexion réseau vous ne pouvez pas accéder aux dernières mises à jour de vos données. ")
      this.router.navigate(['/home'])
    }

    // this.networkService.getOnlineStatus().subscribe(online => {
    //   if (!online) {
    //     alert("Vous n'avez plus de connexion. L'application vient de passer en mode lecture hors connexion. ")
    //     this.router.navigate(['/home']); // Rediriger vers la page d'accueil lorsque hors ligne
    //   }
    // });
    // this.requestNotificationPermission();
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.user = user.uid;

        this.studentService.getStudentById(user.uid)
          .pipe(
            // take(1),
            takeUntil(this.destroy$)) // Utilisation de takeUntil ici
          .subscribe(data => {
            // console.log("userData from students 0...", data);
            this.userData = data;
            // this.lastIndex = Number(this.userData.lastIndexQuestion);

            this.processStudentData();
          });
      }
    })

    // this.authService.getToken()?.then(res => console.log("token authentification depuis authService", res.token));

    // console.log('this.tradesEvaluated', this.tradesEvaluated);
    // console.log('type of tradesEvaluated', typeof (this.tradesEvaluated));
    if (Notification.permission === 'granted') {
      this.notificationPermissionGranted = true
    }

    // pour récupérer les métiers (sigles) enregistrés en base qui détermineront les maximums couts et durée
    this.settingsService.getTrades().subscribe(data => {
      this.tradesData = data;
      console.log("this.tradesData", this.tradesData)
    })

    // this.checkNotificationPermission()


    // Vérifie si l'alerte a déjà été affichée > transféré au composant enfant...
    // const isDismissed = localStorage.getItem('alertDismissed');
    // if (isDismissed === 'true') {
    //   this.showCollapsesAlert = false;
    // }



  }

  // ngAfterViewInit(): void {
  //   alert('ngAfterViewInit exécuté ✅');
  //   console.log('🔄 ngAfterViewInit exécuté ✅');
  
  //   const alertBox = this.el.nativeElement.querySelector('.assistant');
  //   console.log('📌 Élément trouvé :', alertBox); // Vérifie si alertBox est bien trouvé
  
  //   if (alertBox) {
  //     const images = ["url('/assets/icons/assistant.webp')", "url('/assets/icons/assistante.webp')"];
  //     const randomImage = images[Math.floor(Math.random() * images.length)];
  
  //     console.log('🎲 Image choisie :', randomImage); // Vérifie si le tirage fonctionne
  //     this.renderer.setStyle(alertBox, 'background-image', randomImage);
  //   } else {
  //     console.error('❌ Alerte introuvable !');
  //   }
  // }

  imageAlreadySet:boolean=false

  ngAfterViewChecked(): void {
    const alertBox = this.el.nativeElement.querySelector('.assistant');
    if (alertBox && !this.imageAlreadySet) { 
      this.imageAlreadySet = true; // Pour éviter d’exécuter plusieurs fois
  
      const images = ["url('/assets/icons/assistant.webp')", "url('/assets/icons/assistante.webp')"];
      const randomImage = images[Math.floor(Math.random() * images.length)];
  
      console.log('🎲 Image choisie :', randomImage);
      this.renderer.setStyle(alertBox, 'background-image', randomImage);
    }
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


  // Méthode pour demander la permission de notification
  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("Notification permission granted");
        // Vous pouvez effectuer d'autres actions ici si la permission est accordée
      } else {
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }

  // Méthode principale pour notifier l'utilisateur
  async notifyMe() {
    // Vérifier si la permission est déjà accordée
    if (Notification.permission !== 'granted') {
      await this.requestNotificationPermission();
    }

    // Le reste de votre code pour afficher la notification et enregistrer le token
    try {
      // const notification = new Notification("Coucou, vous venez de demander à être notifié !!! ");
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification("Vous venez de demander à être notifié !");
      }

      const messaging = getMessaging();

      const token = await getToken(messaging, { vapidKey: "BIh4nZeNhn8JfEciZJvgFL96Qd7uVzfZTmaoUp2RFb65SA2Lk2jvujAtmEkttGR5OtyTRIj2_FS49k5mPLl6HsM" });

      console.log(token);
      this.notificationService.registerToken(token, this.userData.id);
      localStorage.setItem('notification-permission', 'granted')
    } catch (error) {
      console.error("Error during notification setup:", error);
    }

    this.notifyMeWithTitleAndBody('Votre Actualité', `Bravo ${this.userData.firstName}, vous êtes dans les starting-blocks ! `);


    // mise à jour la variable pour indiquer que l'autorisation a été accordée
    this.notificationPermissionGranted = true;

    // this.studentService.setRequestNotification(this.userData.id)

  }


  async notifyMeWithTitleAndBody(title: string, body: string) {
    try {
      const options = {
        body: body,
        icon: 'https://be-on-top-beta.web.app/assets/BE-ON-TOP_picto_LOGO.svg', // Remplacez par l'URL de l'icône que vous souhaitez afficher
        // image: 'https://firebasestorage.googleapis.com/v0/b/be-on-top-beta.appspot.com/o/images%2Ftrades%2Fcl_vul.jpeg?alt=media&token=d49e9dea-f9d3-43d8-8b2f-52e71ad792c3',
      }

      // Afficher la notification avec les options
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification(title, options);
      }

      const messaging = getMessaging();
      const token = await getToken(messaging, { vapidKey: "BIh4nZeNhn8JfEciZJvgFL96Qd7uVzfZTmaoUp2RFb65SA2Lk2jvujAtmEkttGR5OtyTRIj2_FS49k5mPLl6HsM" });
      console.log(token);
      this.notificationService.registerToken(token, this.userData.id);
    } catch (error) {
      console.error("Error during notification setup:", error);
    }
  }

  triggerContextualNotification() {

    if (!this.isOneQuizzAchieved && this.hasStartedEvaluation) {
      this.contextualNotification('Suivi personnalisé', "Retrouvez l'état d'avancement de votre questionnaire en cours...", "hasStartedEvaluation");
    }

    if (this.isOneQuizzAchieved && !this.userData.isSocialFormSent && !this.userData.subscriptions) {
      this.contextualNotification('Suivi personnalisé', 'Vos résulats et estimations personnalisées de durée et de coût de formation sont désormais disponibles. Votre inscription formation peut également commencer', 'isOneQuizzAchieved');
    }

    if (this.userData.isSocialFormSent && !this.userData.subscriptions) {
      this.contextualNotification('Suivi personnalisé', 'Le dossier est en cours de traitement. Votre inscription sera bientôt finalisée', 'isSocialFormSent');
    }

    if (this.userData.subscriptions && !this.userData.elearning) {
      this.contextualNotification('Suivi personnalisé', 'Votre inscription est maintenant confirmée !', 'subscriptions');
    }
    if (this.userData.subscriptions && this.userData.elearning) {
      this.contextualNotification('Suivi personnalisé', 'Vous pouvez démarrer votre session e-learning ', 'elearning');
    }

  }

  // si on veut rajouter une logique pour vérifier l'état de la notification dans local Storage
  // async contextualNotification(title: string, body: string, notificationId: string) {
  //   // Vérifier si la permission est déjà accordée
  //   if (Notification.permission === 'granted') {
  //     try {
  //       const options = {
  //         body: body,
  //         icon: 'https://be-on-top-beta.web.app/assets/BE-ON-TOP_picto_LOGO.svg',
  //       }
  //       // Afficher la notification avec les options
  //       const registration = await navigator.serviceWorker.getRegistration();
  //       // alert(registration)
  //       if (registration) {
  //         registration.showNotification(title, options);
  //         // Enregistrer l'identifiant de la notification dans le stockage local
  //         localStorage.setItem(notificationId, 'true');
  //       }
  //     } catch (error) {
  //       console.error("Error during notification setup:", error);
  //     }
  //   }
  // }

  async contextualNotification(title: string, body: string, notificationId: string) {
    // Vérifier si la permission est déjà accordée
    if (Notification.permission === 'granted' && this.checkNotificationPermission()) {
      // Vérifier si la notification a déjà été affichée
      if (!localStorage.getItem(notificationId)) {
        try {
          const options = {
            body: body,
            icon: 'https://be-on-top-beta.web.app/assets/BE-ON-TOP_picto_LOGO.svg',
          }
          // Afficher la notification avec les options
          const registration = await navigator.serviceWorker.getRegistration();
          // alert(registration)
          if (registration) {
            registration.showNotification(title, options);
          }

          // Enregistrer l'identifiant de la notification dans le stockage local
          localStorage.setItem(notificationId, 'true');
        } catch (error) {
          console.error("Error during notification setup:", error);
        }
      }
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
  // Méthode pour récupérer la dénomination du métier côté composant
  denominationMap: Map<string, Observable<string | null>> = new Map();

  getDenomination(trade: string): Observable<string | null> {
    const sigle = trade.replace('quizz_', '');
    if (!this.denominationMap.has(trade)) {
      this.denominationMap.set(trade, this.settingsService.getDenomination(sigle));
    }
    return this.denominationMap.get(trade) || of(null);
  }

  // Méthode pour récupérer la dénomination d'une compétence quand on n'a pas besoin de boucler !

  // getCpName(element: string): void {
  //   const sigle = element.slice(0, -4);
  //   const cp = Number(element.slice(-1));

  //   this.settingsService.getCPName(sigle, cp).subscribe(data => {
  //     console.log(data);
  //     this.cpEvaluated = data;
  //     this.getCpNameCalled = true;
  //   })
  // }

  getCpIndex(element: string): number {

    const cp = Number(element.slice(-1))
    return cp - 1

  }


  // Méthode pour filtrer les évaluations par abonnement
  // getFilteredEvaluationsForSubscription(subscription: string): any[] {
  //   return Object.entries(this.evaluations)
  //     .filter(([key, value]) => value.sigle === subscription)
  //     .map(([key, value]) => ({ key, value }))
  // }

  getFilteredEvaluationsForSubscription(subscription: string): any[] {
    const filteredEvaluations = Object.entries(this.evaluations)
      .filter(([key, value]: [string, any]) => value.sigle === subscription)
      .map(([key, value]: [string, any]) => ({ key, value: value }));

    // Trie les évaluations par compétence en extrayant le chiffre à la fin
    return filteredEvaluations.sort((a, b) => {
      const regex = /\D+/g; // Expression régulière pour extraire les chiffres à la fin
      const aNumber = parseInt((a.value.competence || '').replace(regex, ''), 10);
      const bNumber = parseInt((b.value.competence || '').replace(regex, ''), 10);

      return aNumber - bNumber; // Trie par ordre croissant
    });
  }


  // Méthode pour filtrer les évaluations par abonnement
  // getFilteredTutorialsForSubscription(subscription: string): any[] {
  //   return Object.entries(this.tutorials)
  //     .filter(([key, value]) => value.sigle === subscription)
  //     .map(([key, value]) => ({ key, value }));

  // }

  getFilteredTutorialsForSubscription(subscription: string): any[] {
    const filteredTutorials = Object.entries(this.tutorials)
      .filter(([key, value]: [string, any]) => value.sigle === subscription)
      .map(([key, value]: [string, any]) => ({ key, value: value }));

    // Trie les évaluations par compétence en extrayant le chiffre à la fin
    return filteredTutorials.sort((a, b) => {
      const regex = /\D+/g; // Expression régulière pour extraire les chiffres à la fin
      const aNumber = parseInt((a.value.competence || '').replace(regex, ''), 10);
      const bNumber = parseInt((b.value.competence || '').replace(regex, ''), 10);

      return aNumber - bNumber; // Trie par ordre croissant
    })
  }


  evaluationsState: { [key: number]: boolean } = {};

  toggleCollapse(eIndex: number) {
    this.evaluationsState[eIndex] = !this.evaluationsState[eIndex];
  }

  // Dans mon composant
  totalCost?: number;
  totalTime?: number;

  // Fonction pour mettre à jour le total
  updateTotalCost(relatedResults: any): void {
    this.totalCost = 0;
    this.totalTime = 0;

    // Vérifie si fullResults existe et n'est pas vide
    for (const result of relatedResults) {
      for (const key in result) {
        if (result.hasOwnProperty(key)) {
          this.totalCost += result[key].cost;
          this.totalTime += result[key].duration;
        }
      }
    }

  }


  calculateSubtotal(trade: string): number {
    let subtotalTime = 0;
    // Calcul du sous-total pour le temps
    for (const result of this.userData[trade].fullResults) {
      for (const key in result) {
        if (result.hasOwnProperty(key)) {
          subtotalTime += result[key].duration;
        }
      }
    }


    return subtotalTime;
  }

  calculateSubtotalCost(trade: string): number {
    let subtotalCost = 0
    // Calcul du sous-total pour le coût
    for (const result of this.userData[trade].fullResults) {
      for (const key in result) {
        if (result.hasOwnProperty(key)) {
          subtotalCost += result[key].cost
        }
      }
    }
    // return subtotalCost
    // Arrondir le résultat final à deux décimales
    // return parseFloat(subtotalCost);
    // Arrondir le résultat final à l'entier le plus proche
    return Math.round(subtotalCost);
  }


  calculateTotalTime(trade: string): any {
    const keyTrade = trade.replace('quizz_', '')
    console.log("trade", keyTrade)

    const filteredData = this.tradesData.filter((item: any) => item.sigle === keyTrade);

    console.log('filteredData', filteredData)
    let total = 0
    Object.values(filteredData[0].durations).forEach((value: any) => {
      total += value[0]
    })

    return total

  }


  calculateTotalCost(trade: string): number {
    const keyTrade = trade.replace('quizz_', '');

    // Filtrer les données pour obtenir les informations spécifiques au trade donné
    const filteredData = this.tradesData.find((item: any) => item.sigle === keyTrade);

    if (!filteredData) {
      console.log('Trade non trouvé');
      return 0;
    }

    let maxTotalCost = 0;

    // Parcourir les propriétés dans durations
    for (const durationKey in filteredData.durations) {
      if (durationKey.includes('duration')) {
        const costKey = `cost_${durationKey.substring(durationKey.lastIndexOf('_') + 1)}`; // Construire la clé de coût correspondante
        const maxDuration = Math.max(...filteredData.durations[durationKey]); // Obtenir la durée maximale
        const costValue = filteredData.costs[costKey]; // Obtenir le coût correspondant

        if (costValue !== undefined) {
          const totalCost = maxDuration * costValue; // Calculer le coût total pour cette compétence
          maxTotalCost += totalCost; // Ajouter au coût total maximal
        } else {
          console.log(`Coût non trouvé pour ${durationKey}`);
        }
      }
    }

    // return maxTotalCost;

    // Arrondir le résultat final à deux décimales
    // return parseFloat(maxTotalCost.toFixed(2));
    // Arrondir le résultat final à l'entier le plus proche
    return Math.round(maxTotalCost);
  }


  // Fonction appelée lorsque l'utilisateur souhaite modifier son consentement
  modifyConsent(): void {
    const currentConsent = this.consentService.getConsent();
    // Afficher l'état actuel du consentement de l'utilisateur (par exemple, dans une boîte de dialogue)
    // Laisser l'utilisateur choisir s'il souhaite accepter ou refuser les cookies
    // Mettre à jour le consentement dans le stockage local en fonction de la décision de l'utilisateur
    this.consentStatus = !currentConsent; // Met à jour l'état du consentement dans l'interface utilisateur
    this.consentService.setConsent(this.consentStatus); // Met à jour le consentement dans le stockage local
  }

  sortResultsByKeys(results: any[]): any[] {
    return results.sort((a, b) => {
      const keyA = Object.keys(a)[0];
      const keyB = Object.keys(b)[0];
      const numA = parseInt(keyA.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(keyB.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });
  }

  // Utilisez cette méthode dans le template pour obtenir les résultats triés
  getSortedResults(trade: string): any[] {
    return this.sortResultsByKeys(this.userData[trade].fullResults);
  }

  // Fonction appelée lorsque l'utilisateur souhaite révoquer son consentement à l'utilisation de cookies
  // async modifyNotificationPermission() {
  //   try {
  //     const registration = await navigator.serviceWorker.getRegistration();
  //     if (!registration) {
  //       console.error("Service worker registration not found.");
  //       return;
  //     }

  //     if (!this.notificationPermissionGranted) {
  //       await this.notifyMe();
  //     } else {
  //       await this.notificationService.unregisterToken(this.userData.id);
  //       await registration.unregister();
  //     }

  //     this.notificationPermissionGranted = !this.notificationPermissionGranted; // Met à jour l'état du consentement dans l'interface utilisateur
  //   } catch (error) {
  //     console.error("Error modifying notification permission:", error);
  //   }
  // }

  checkNotificationPermission(): boolean {
    const localPermission = localStorage.getItem('notification-permission');
    if (localPermission === 'granted') {
      return true
    }
    else { return false }
  }

  toggleNotificationPermission(event: any) {
    this.notificationPermissionGranted = event.target.checked;
    localStorage.setItem('notification-permission', this.notificationPermissionGranted ? 'granted' : 'denied');
  }


  private processStudentData(): void {
    if (!this.userData) return;

    // Logique pour obtenir tradesEvaluated + accessoirement documents
    this.tradesEvaluated = [];
    for (const key in this.userData) {
      if (key.includes('quizz')) {
        this.hasStartedEvaluation = true;
        this.tradesEvaluated.push(key);
      }
      // peut-être pas top de l'inclure ici...
      if (key.includes('documents')) {
        this.documents = this.userData.documents
        console.log("documents liés", this.documents);

      }
    }

    // Logique pour obtenir les compétences pour chaque tradeId
    this.tradesEvaluated.forEach(tradeId => {
      this.settingsService.getCompetences(tradeId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(competences => {
          this.trades[tradeId] = competences;
        });
    });

    // Logique pour récupérer isOneQuizzAchieved
    const achievedArray: any[] = [];
    for (const item of this.tradesEvaluated) {
      if (this.userData[item].fullResults) {
        achievedArray.push(item);
        this.isOneQuizzAchieved = true;
      }
    }

    // Logique pour trier les résultats
    for (const item of this.tradesEvaluated) {
      if (this.userData[item].fullResults) {
        this.userData[item].fullResults.sort((a: any, b: any) => {
          const keyA = Object.keys(a)[0];
          const keyB = Object.keys(b)[0];
          return keyA.localeCompare(keyB);
        });
        const relatedResults = this.userData[item].fullResults;
        this.updateTotalCost(relatedResults);
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

    this.triggerContextualNotification();
  }

  // roundToNearestMultipleOf7(duration: number): number {
  //   return Math.round(duration / 7) * 7;
  // }

  // roundToNearestMultipleOf7(duration: number): number {
  //   return Math.floor((duration + 3.5) / 7) * 7;
  // }

  //   roundDownToMultipleOf7(duration: number): number {
  //   return Math.floor(duration / 7) * 7;
  // }

  roundToNearestMultipleOf7(duration: number): number {
    return Math.round((duration + 0.1) / 7) * 7;


  }



  getAdjustedTrainingTime(subtotal: number, total: number): number {
    const rounded = this.roundToNearestMultipleOf7(subtotal);
    return rounded > total ? Math.floor(subtotal / 7) * 7 : rounded;
  }





























  // on va transférer ça à un composant enfant
  // dismissAlert(): void {
  //   this.showCollapsesAlert = false;
  //   // Enregistre l'état dans le localStorage pour éviter de réafficher l'alerte
  //   localStorage.setItem('alertDismissed', 'true');
  // }




}
