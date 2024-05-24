import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
// je ne vois pas l'utilité de cette méthode pour le moment, donc on désactive !!!!
// import { loggedIn } from '@angular/fire/auth-guard';
import { Auth } from '@angular/fire/auth';
// import { of } from 'rxjs';
import { AuthService } from '../admin/auth.service';
import { onAuthStateChanged } from '@angular/fire/auth';
import { SettingsService } from '../admin/settings.service';
// import { Trade } from '../admin/trade';
// import { Observable } from 'rxjs';
import { StudentsService } from '../admin/students.service';
import { Student } from '../admin/Students/student';
import { UpdateService } from '../update.service';
import { map } from 'rxjs';
import { NetworkService } from '../network.service';
import { PRECONNECT_CHECK_BLOCKLIST } from '@angular/common';
// import { DomSanitizer } from '@angular/platform-browser';


// interface Image {
//   alt?: string;
//   src: string;
//   srcset?: string;
//   sizes?: string;
//   width: number;
//   height: number;
//   fill?: boolean;
//   decoding?: 'sync' | 'async' | 'auto';
//   loading?: 'lazy' | 'eager' | 'auto';
//   fetchPriority?: 'low' | 'high' | 'auto';
//   priority: boolean;
// }


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [
  {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://firebasestorage.googleapis.com'}
],

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

  largeurImage: number = 100
  hauteurImage: number = 100

  dataLoading: boolean = true


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
    private settingsService: SettingsService,
    private updateService: UpdateService,
    private titleService : Title
    // private networkService: NetworkService
  ) {

    this.offline = !navigator.onLine

  }


  ngOnInit(): void {

    this.titleService.setTitle('Accueil - BE-ON-TOP formation application'); // Mettre à jour le titre de la page


    // window.addEventListener('online', () => {   
    if (!this.offline) {
      // alert("on est en ligne")   
      // pour tenter de détecter des updates côté template
      this.updateService.checkForUpdates();
      // pour récupérer le role si il est passé
      this.ac.queryParams.subscribe(params => {
        this.userRole = params['userRole'] || '';
        console.log('UserRole:', this.userRole);
      })

      // pour récupérer la data de l'utilisateur authentifié si c'est un étudiant 
      onAuthStateChanged(this.auth, (user: any) => {
        if (user && (this.userRole == 'student' || this.userRole == '')) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          this.user = user.uid
          this.studentService.getStudentById(user.uid).
            subscribe((data) => {
              // console.log("data", data);
              this.studentData = data
              this.checkIfQuizzAchieved()
              this.dataLoading = false
            })
          this.authService.getUserId();
          // retourne this.ui tout de suite après la connexion. undefined plus tard, donc ne convient pas...
          // console.log("log de ui", this.ui);
          // tests ok pour information, mais ne semble pas être très utile 
          this.authService.getToken()?.then(res => console.log("token authentification depuis authService", res.token))
          // fonctionne parfaitement !!!!!!!!!!!!!!!!!!
          this.authService.authStatusListener()
        }

        // pour le cas où non authentifié
        else {
          // L'utilisateur n'est pas authentifié
          console.log("Utilisateur non authentifié");
          // Rediriger vers la page de connexion si nécessaire
          // this.router.navigate(['/login']);
        }
      })

      //--------------------
      // pour récupérer les métiers (sigles) enregistrés en base qui détermineront les différentes zones éditioriales

      this.settingsService.getTrades()
        .pipe(map(data => data.filter(item => item.status && item.status === true)))
        .subscribe(data => {
          // pour inverser temporairement
          this.tradesData = data.reverse();
          console.log("this.tradesData", this.tradesData);

          // Charge les images pour chaque métier
          this.tradesData.forEach((trade: any) => {
            this.settingsService.loadImageReduced(trade.id)
              .then((url: string) => {
                trade.imageUrl = url; // Met à jour l'URL de l'image si elle est trouvée
              })
              .catch((error) => {
                if (error.code === 'storage/object-not-found') {
                  trade.imageUrl = './assets/images-presentation-metiers-vide.jpg'; // Définir l'URL par défaut en cas d'erreur 404
                } else {
                  console.error('Erreur lors du chargement de l\'image pour le métier ' + trade.id, error);
                }
              })
          })
        })


    }
    else if (this.offline) {

      alert("offline")
      // pour ouvrir la base indexedDB
      const openRequest = window.indexedDB.open('my-database');
      // Pour gérer les évènements à l'ouverture de la base
      openRequest.onsuccess = (event) => {
        const db = openRequest.result;
        const transaction = db.transaction('sigles', 'readonly');
        const objectStore = transaction.objectStore('sigles');
        const getAllRequest = objectStore.getAll();

        // alert(this.tradesData)

        // Traitez les données récupérées ici depuis base de données indexée my-database
        getAllRequest.onsuccess = (event) => {
          this.tradesData = getAllRequest.result;
          console.log("this.tradesData offline", this.tradesData);
          this.tradesData.forEach((trade: any) => {
            trade.imageUrl = `../../assets/${trade.id}.jpeg`
            console.log(trade.imageUrl);

          });
        }

      } // fin de la requête indexedDB

    }


  }


  selectTrade(id: string) {


  }

  navigateToQuizz(trade: string, indexedQuestion: number = 0, score: number = 0) {
    this.studentData.tradeEvaluated && this.studentData.tradeEvaluated == trade ? this.router.navigate(['/quizz', trade, indexedQuestion, score]) : this.router.navigate(['/quizz', trade, 0, 0])
  }


  handleImageError(trade: any) {
    trade.imageUrl = './assets/images-presentation-metiers-vide.jpg';
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


  checkIfQuizzAchieved() {
    this.isOneQuizzAchieved = Object.values(this.studentData).some((data: any) => data?.fullResults);
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

  isLoading: boolean = true

  onImageLoad
    () {
    // alert("bingo")
    this.isLoading = false;
  }

  @ViewChild('image') imageElement!: ElementRef;

  setDimensions(image: HTMLImageElement) {
    const width = image.width;
    const height = image.height;

    this.imageElement.nativeElement.setAttribute('width', width.toString());
    this.imageElement.nativeElement.setAttribute('height', height.toString());
  }


}
  





