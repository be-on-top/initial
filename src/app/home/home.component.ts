import { Component, ElementRef, HostListener, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
// import { Student } from '../admin/Students/student';
import { UpdateService } from '../update.service';
import { Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';
// import { NetworkService } from '../network.service';
import { PRECONNECT_CHECK_BLOCKLIST } from '@angular/common';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { SlugService } from '../slug.service';
import { Trade } from '../admin/trade';
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
    { provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://firebasestorage.googleapis.com' }
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

  largeurImage: number = 350
  hauteurImage: number = 145

  dataLoading: boolean = true

  private destroy$ = new Subject<void>();

  catGroup?: any
  isFullCatItemsOpen: boolean = false

  isLargeScreen?: boolean


  groupedTrades: any[] = [];  // Pour les métiers avec parentCategory
  ungroupedTrades: any[] = [];  // Pour les métiers sans parentCategory

  // null signifie qu'aucune catégorie n'est ouverte
  openCategoryIndex: number | null = null;


  constructor(
    // private notificationService: PushNotificationService, 
    private auth: Auth,
    private authService: AuthService,
    private studentService: StudentsService,
    private ac: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private updateService: UpdateService,
    private titleService: Title,
    // private networkService: NetworkService,
    private analytics: Analytics,
    // private networkService: NetworkService
    public slugService: SlugService,
    private cdr: ChangeDetectorRef
  ) {

    this.offline = !navigator.onLine

    // Si on passe par networkService pour une détection plus rapide
    // this.networkService.getOnlineStatus().subscribe(online => {
    //   if (!online) {
    //     alert("Vous n'avez plus de réseau. L'application vient de passer en mode hors connexion. ")
    //     this.offline = true
    //   }
    // });

  }


  ngOnInit(): void {
    // alert("coucou!")

    this.titleService.setTitle('Accueil - BE-ON-TOP formation application'); // Mettre à jour le titre de la page

    // this.networkService.getOnlineStatus()
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     distinctUntilChanged()
    //   )
    //   .subscribe(online => {
    //     if (!online) {
    //       this.offline = true
    //     }
    //   });


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

              // Forcer la détection de changement
              this.cdr.detectChanges();
            })
          this.authService.getUserId();
          // retourne this.ui tout de suite après la connexion. undefined plus tard, donc ne convient pas...
          // console.log("log de ui", this.ui);
          // tests ok pour information, mais ne semble pas être très utile 
          this.authService.getToken()?.then(res => console.log("token authentification depuis authService", res.token))
          // fonctionne parfaitement !!!!!!!!!!!!!!!!!!
          this.authService.authStatusListener()
        }

        else if ((user && (this.userRole == 'editor'))) {
          this.isEditor = true

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
          // pour inverser temporairement (retarder l'appariton des CACES si parentCategory inexploitée)
          // this.tradesData = data.reverse();
          this.tradesData = data;
          console.log("this.tradesData", this.tradesData);

          // si on méthode à l'identique de header pour le cas où plusieurs catégories
          this.groupTrades()
          // pour tester regroupement basic
          // this.onSearchCatEntered("caces")

          // pour regroupement par parentCategory
          this.onSearchCat()

          // pour surveiller la taille de l'écran
          this.checkScreenSize();

          // // Étape 1 : Calculer les occurrences de chaque parentCategory
          // const parentCategoryCounts = this.tradesData.reduce((acc: { [key: string]: number }, item: Trade) => {
          //   if (item.parentCategory) {
          //     alert("bingo")
          //     acc[item.parentCategory] = (acc[item.parentCategory] || 0) + 1;
          //   }
          //   return acc;
          // }, {} as { [key: string]: number });

          // console.log('parentCategoryCounts', parentCategoryCounts);


          // // Étape 2 : Filtrer les éléments
          // const filteredItems = this.tradesData.filter((item: Trade) =>
          //   item.parentCategory && parentCategoryCounts[item.parentCategory] > 1
          // );

          // const remainingItems = this.tradesData.filter((item: Trade) =>
          //   !item.parentCategory || parentCategoryCounts[item.parentCategory] === 1
          // );

          // console.log('Filtered Items:', filteredItems);
          // console.log('Remaining Items:', remainingItems);





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

          // on supprime de tradesData ceux qui ont une catégorie commune
          this.tradesData = this.tradesData.filter((item: Trade) => !this.catGroup.includes(item));

        })



    }
    else if (this.offline) {

      // alert("version offline")
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

  // pensé initialement pour des effets de couleurs
  // wrapFirstWord(text: string): string {
  //   const words = text.split(' ');
  //   if (words.length > 1) {
  //     words[0] = `<span class="first-word">${words[0]}</span>`;
  //   }
  //   return words.join(' ');
  // }


  redirectToAccount() {
    // Fermez la modale en utilisant Bootstrap
    // const myModal = document.getElementById('myModal');
    // myModal?.dispatchEvent(new Event('hidden.bs.modal'));

    // Redirigez vers la page "account"
    this.router.navigate(['/account']);
  }


  checkIfQuizzAchieved() {
    if (this.userRole === 'student' && this.studentData) {
      this.isOneQuizzAchieved = Object.values(this.studentData).some((data: any) => data?.fullResults)
    }
  }

  checkQuizzCondition(trade: any) {
    if (this.studentData['quizz_' + trade.sigle] && this.studentData['quizz_' + trade.sigle].fullResults) {
      this.setOneQuizzAchieved();
      return true
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
      // Vérifier si ajouter le prochain mot dépasserait la limite
      if ((truncatedText + (truncatedText ? ' ' : '') + word).length <= limit) {
        truncatedText += (truncatedText ? ' ' : '') + word;
      } else {
        break;
      }
    }

    return truncatedText + '...';
  }


  // mieux pour le nombre de lignes générées
  // truncateText(text: string, limit: number): string {
  //   if (!text || text.length <= limit) {
  //     return text;
  //   }

  //   const words = text.split(' ');
  //   let truncatedText = '';

  //   for (const word of words) {
  //     if ((truncatedText + word).length <= limit) {
  //       truncatedText += word + ' ';
  //     } else {
  //       break;
  //     }
  //   }

  //   return truncatedText.trim() + '...';
  // }
  // truncateText(text: string, limit: number): string {
  //   if (!text || text.length <= limit) {
  //     return text;
  //   }

  //   const words = text.split(' ');
  //   let truncatedText = '';

  //   for (const word of words) {
  //     if ((truncatedText + word).length <= limit) {
  //       truncatedText += word + ' ';
  //     } else {
  //       break;
  //     }
  //   }

  //   return truncatedText.trim() + '...';
  // }
  // truncateText(text: string, limit: number): string {
  //   if (!text || text.length <= limit) {
  //     return text;
  //   }

  //   // Troncature stricte basée sur le nombre de caractères
  //   let truncatedText = text.slice(0, limit).trim();

  //   // Ajouter "..." si le texte a été tronqué
  //   if (text.length > limit) {
  //     truncatedText += '...';
  //   }

  //   return truncatedText;
  // }


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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logStartEvaluationEvent(tradeName: string) {
    // alert(tradeName)
    logEvent(this.analytics, 'has_started_evaluation_from_home', { trade_name: tradeName });
  }

  // generateSlug(denomination: string): string {
  //   return denomination
  //     .toLowerCase()
  //     .replace(/ /g, '_') // Remplace les espaces par des underscores
  //     .replace(/[^\w\u00C0-\u017F]+/g, ''); // Conserve les caractères alphanumériques et les accents
  // }

  // generateSlug(denomination: string): string {
  //   const accentsMap = new Map([
  //     ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'],
  //     ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'],
  //     ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'],
  //     ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'],
  //     ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'],
  //     ['ý', 'y'], ['ÿ', 'y'],
  //     ['ç', 'c'], ['ñ', 'n']
  //   ]);

  //   let slug = denomination
  //     .toLowerCase()
  //     .split('')
  //     .map(char => accentsMap.get(char) || char)
  //     .join('')
  //     .replace(/[^a-z0-9_]+/g, '_');

  //   return slug;
  // }

  // openFullCatItems() {
  //   this.isFullCatItemsOpen = !this.isFullCatItemsOpen
  // }

  openFullCatItems(index: number): void {
    // Si la catégorie cliquée est déjà ouverte, la fermer; sinon, l'ouvrir
    this.openCategoryIndex = this.openCategoryIndex === index ? null : index;
    this.isFullCatItemsOpen = !this.isFullCatItemsOpen

  }

  onSearchCat() {
    // Étape 1 : Calculer les occurrences de chaque parentCategory
    const parentCategoryCounts = this.tradesData.reduce((acc: { [key: string]: number }, item: Trade) => {
      if (item.parentCategory) {
        acc[item.parentCategory] = (acc[item.parentCategory] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    console.log('parentCategoryCounts', parentCategoryCounts);


    // Étape 2 : Filtrer les éléments
    this.catGroup = this.tradesData.filter((item: Trade) =>
      item.parentCategory && parentCategoryCounts[item.parentCategory] > 1
    );

    console.log('catGroup with parentCategoryCounts filter:', this.catGroup);
    // console.log('Remaining Items:', remainingItems);
  }


  checkScreenSize() {
    this.isLargeScreen = window.innerWidth > 720;
  }



  // pour utiliser le composant de recherche
  // onSearchTextEntered(searchValue: string) {
  //   const normalizedSearchValue = this.removeAccents(searchValue).toLowerCase().trim(); // Normalisation de la recherche

  //   // Vérifiez si un élément non visible correspond au terme de recherche

  //   if (!this.isFullCatItemsOpen && this.catGroup.some((trade: any) => {
  //     // Normalisez les descriptions pour la comparaison
  //     const normalizedDenomination = this.removeAccents(trade.denomination).toLowerCase();
  //     const normalizedDescription = this.removeAccents(trade.description).toLowerCase();
  //     console.log(normalizedDescription);


  //     // Comparez avec la valeur de recherche normalisée
  //     return normalizedDenomination.includes(normalizedSearchValue) || normalizedDescription.includes(normalizedSearchValue);
  //   })) {
  //     // Ouvrez si une correspondance est trouvée
  //     this.isFullCatItemsOpen = true;

  //   }

  //   this.searchText = searchValue; // Gardez cela pour l'affichage
  //   console.log("Search Value:", searchValue);
  //   console.log("Normalized Search Value:", normalizedSearchValue);
  // }

  onSearchTextEntered(searchValue: string) {
    const normalizedSearchValue = this.removeAccents(searchValue).toLowerCase().trim();
    this.searchText = searchValue; // mise à jour pour l'affichage
  
    // Si la recherche est vide, on ferme toutes les catégories
    if (!normalizedSearchValue) {
      this.openCategoryIndex = null;
      return;
    }
  
    // Recherche dans chaque groupe : ouvrir le premier groupe où une correspondance est trouvée
    const matchingGroupIndex = this.groupedTrades.findIndex((group: any) =>
      group[1].some((trade: any) => {
        const normalizedDenomination = this.removeAccents(trade.denomination).toLowerCase();
        const normalizedDescription = this.removeAccents(trade.description).toLowerCase();
        return normalizedDenomination.includes(normalizedSearchValue) ||
               normalizedDescription.includes(normalizedSearchValue);
      })
    );
  
    // Si une correspondance est trouvée et que ce groupe n'est pas déjà ouvert, on l'ouvre
    if (matchingGroupIndex !== -1 && this.openCategoryIndex !== matchingGroupIndex) {
      this.openFullCatItems(matchingGroupIndex);
    }
  
    console.log("Search Value:", searchValue);
    console.log("Normalized Search Value:", normalizedSearchValue);
  }
  
  




  // Fonction pour supprimer les accents d'une chaîne de caractères

  // removeAccents(text: string): string {
  //   return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // }

  // removeAccents(text: string): string {
  //   return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // }

  removeAccents(text: string): string {
    return text
      .normalize('NFD')                         // Normalisation
      .replace(/[\u0300-\u036f]/g, '')         // Supprime les accents
      .replace(/®/g, '')                       // Supprime le symbole ®
      .replace(/&reg;/g, '')                   // Supprime la représentation HTML du symbole ®
      .replace(/\s*\(\s*/g, ' ')               // Ignore les parenthèses (enlève les espaces autour)
      .replace(/\s*\)\s*/g, ' ')               // Ignore les parenthèses
      .replace(/\s+/g, ' ')                     // Remplace les espaces multiples par un seul espace
      .trim();                                  // Supprime les espaces de début et de fin
  }



  cleanText(text: string): string {
    return this.removeAccents(text).toLowerCase().replace(/®/g, '');
  }



  // Fonction pour filtrer ceux dont le sigle commence par la valeur de parentCategory (exemple caces)
  onSearchCatEntered(catValue: string) {
    this.catGroup = this.tradesData.filter((trade: Trade) => trade.sigle.includes(catValue))
    console.log('catGroup', this.catGroup)
    // console.log(this.searchText);
  }

  groupTrades() {
    console.log("Trades initiaux:", this.tradesData);

    const grouped = new Map<string, any[]>();

    this.tradesData.forEach((trade: any) => {
      if (trade.parentCategory) {
        if (!grouped.has(trade.parentCategory)) {
          grouped.set(trade.parentCategory, []);
        }
        grouped.get(trade.parentCategory)?.push(trade);
      } else {
        this.ungroupedTrades.push(trade);
      }
    });

    this.groupedTrades = Array.from(grouped.entries());
    // j'obtiens [Array(2)] dont 0 est parentCategory et 1 le tableau d'objets
    console.log("Métiers regroupés:", this.groupedTrades);

    console.log("Métiers non groupés:", this.ungroupedTrades);

  }

  processDenomination(denomination: string): string {
    const acronymRegex = /(\b[A-Z]+\b)\s?\((.*?)\)/g;

    return denomination.replace(acronymRegex, (match, acronym, meaning) => {
      return `<abbr title="${meaning}">${acronym}</abbr>`;
    });
  }




}






