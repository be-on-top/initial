import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// je ne vois pas l'utilité de cette méthode pour le moment, donc on désactive !!!!
// import { loggedIn } from '@angular/fire/auth-guard';
import { Auth } from '@angular/fire/auth';
// import { of } from 'rxjs';
import { AuthService } from '../admin/auth.service';
import { onAuthStateChanged } from '@angular/fire/auth';

// c'est maintenant le service qui régale !!!
// import { getMessaging, onMessage, getToken } from "@angular/fire/messaging";

// import { PushNotificationService } from '../push-notification.service';
import { SwPush } from '@angular/service-worker';

import { getMessaging } from "firebase/messaging/sw";
// import { onBackgroundMessage } from "firebase/messaging/sw";
// import { getToken } from 'firebase/messaging';
import { SettingsService } from '../admin/settings.service';
// import { Trade } from '../admin/trade';
// import { Observable } from 'rxjs';
import { StudentsService } from '../admin/students.service';
import { Student } from '../admin/Students/student';
import { UpdateService } from '../update.service';
import { filter, map } from 'rxjs';
// import { DomSanitizer } from '@angular/platform-browser';


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

  // et pour VERSION 2 des quizz multiples, on ne peut pas savoir si un quizz est terminé sans interroger tous les quizz, ce qu'on ne veut pas côté template, donc on crée un bolean
  isOneQuizzAchieved: boolean = false;

  // ne sert pas et ne doit pas avoir à être nécessaire. 
  userRole: string = ""

  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue
    console.log(this.searchText);
  }

  // Fonction pour supprimer les accents d'une chaîne de caractères
  removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  constructor(
    // private notificationService: PushNotificationService, 
    private auth: Auth,
    private authService: AuthService,
    private studentService: StudentsService,
    private ac: ActivatedRoute,
    private router: Router,
    private swPush: SwPush,
    private settingsService: SettingsService,
    private updateService: UpdateService) {
    // pour savoir si l'utilisateur est éditeur sans interroger firestore, on peut (?) récupérer userRole livré en paramètre de route
    // this.ac.snapshot.params["userRole"]="editor"?this.isEditor=true:""

    if (this.ac.snapshot.params && this.ac.snapshot.params["userRole"] == "editor") {
      this.isEditor = true
    }

    // console.log("this.ac.snapshot.params", this.ac.snapshot.params !== null)
    // console.log("this.ac.snapshot.params['userRole']", this.ac.snapshot.params["userRole"])
    this.userRole = this.ac.snapshot.params["userRole"]
  }


  ngOnInit(): void {
    // pour tenter de détecter des updates côté template
    this.updateService.checkForUpdates();

    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user.uid
        this.studentService.getStudentById(user.uid).subscribe((data) => {
          this.studentData = data
          this.checkIfQuizzAchieved()

        })
        this.authService.getUserId();
        // retourne this.ui tout de suite après la connexion. undefined plus tard, donc ne convient pas...
        // console.log("log de ui", this.ui);
        // tests ok pour information, mais ne semble pas être très utile 
        this.authService.getToken()?.then(res => console.log("token authentification depuis authService", res.token))
        // fonctionne parfaitement !!!!!!!!!!!!!!!!!!
        this.authService.authStatusListener()

        // to check User offline status
        // basic method : OK
        if (!navigator.onLine) {
          // ici, en lançant l'application avec ng serve, on l rend accessible au navigateur sans passer par le service worker (?)
          alert('merci de vérifier votre connexion internet !!!');
          // alert('please check your internet connection');
        }

        // eventListener
        addEventListener('offline', e => {
          this.offline = true
        })

        addEventListener('online', e => {
          this.offline = false
        })
      }

      // pour le cas où non authentifié
      else {
        // L'utilisateur n'est pas authentifié
        console.log("Utilisateur non authentifié");
        // Rediriger vers la page de connexion si nécessaire
        // this.router.navigate(['/login']);
      }
    })


    // pour récupérer les métiers (sigles) enregistrés en base qui détermineront les différentes zones éditioriales
    this.settingsService.getTrades()
    .pipe(map(data => data.filter(item => item.status && item.status === true)))
    .subscribe(data => {
      this.tradesData = data;
      console.log("this.tradesData", this.tradesData);

      // Charge les images pour chaque métier
      this.tradesData.forEach((trade: any) => {
        this.settingsService.loadImage(trade.id)
          .then((url: string) => {
            trade.imageUrl = url; // Met à jour l'URL de l'image si elle est trouvée
          })
          .catch((error) => {
            if (error.code === 'storage/object-not-found') {
              trade.imageUrl = 'https://dalmont.staticlbi.com/original/images/biens/2/8efa48ae0918f1e8a89684a39abdbdf7/photo_5432049cf11f3071651cb2c30317bd5e.jpg'; // Définir l'URL par défaut en cas d'erreur 404
            } else {
              console.error('Erreur lors du chargement de l\'image pour le métier ' + trade.id, error);
            }
          })
      })
    })

  }


  selectTrade(id: string) {


  }

  navigateToQuizz(trade: string, indexedQuestion: number = 0, score: number = 0) {
    this.studentData.tradeEvaluated && this.studentData.tradeEvaluated == trade ? this.router.navigate(['/quizz', trade, indexedQuestion, score]) : this.router.navigate(['/quizz', trade, 0, 0])
  }


  handleImageError(trade: any) {
    trade.imageUrl = 'https://dalmont.staticlbi.com/original/images/biens/2/8efa48ae0918f1e8a89684a39abdbdf7/photo_5432049cf11f3071651cb2c30317bd5e.jpg';
  }

  wrapFirstWord(text: string): string {
    const words = text.split(' ');
    if (words.length > 1) {
      words[0] = `<span class="first-word">${words[0]}</span>`;
    }
    return words.join(' ');
  }


  redirectToAccount() {
    // Fermez la modale en utilisant Bootstrap
    // const myModal = document.getElementById('myModal');
    // myModal?.dispatchEvent(new Event('hidden.bs.modal'));

    // Redirigez vers la page "account"
    this.router.navigate(['/account']);
  }

  // à l'initialisation pour chercher si il existe UN fullResults indépendant d'un trade
  checkIfQuizzAchieved() {
    for (const key in this.studentData) {
      if (this.studentData[key]?.fullResults) {
        this.isOneQuizzAchieved = true;
        break;  // Sortir de la boucle dès qu'un fullResults est trouvé
      }
    }
  }


  checkQuizzCondition(trade: any) {
    if (this.studentData && this.studentData['quizz_' + trade.sigle] && this.studentData['quizz_' + trade.sigle].fullResults) {
      this.setOneQuizzAchieved();
      return true;
    }
    return false;
  }

  setOneQuizzAchieved() {
    this.isOneQuizzAchieved = true;
  }


  // truncateText(text: string, maxWords: number): string {
  //   const words = text.split(' ');
  //   if (words.length > maxWords) {
  //     return words.slice(0, maxWords).join(' ');
  //   }
  //   return text;
  // }

  truncateText(text: string, limit: number): string {
    if (!text || text.length <= limit) {
      return text;
    }

    const words = text.split(' ');
    let truncatedText = '';

    for (const word of words) {
      if ((truncatedText + word).length <= limit) {
        truncatedText += word + ' ';
      } else {
        break;
      }
    }

    return truncatedText.trim() + '...';
  }


}
