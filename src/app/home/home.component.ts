import { Component, ElementRef, HostListener, OnInit, ViewChild, ChangeDetectorRef, Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
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
import { BehaviorSubject, Subject, combineLatest, distinctUntilChanged, map, takeUntil } from 'rxjs';
// import { NetworkService } from '../network.service';
import { DOCUMENT, PRECONNECT_CHECK_BLOCKLIST } from '@angular/common';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { SlugService } from '../slug.service';
import { Trade } from '../admin/trade';
import { ConsentService } from '../consent.service';
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
export class HomeComponent implements OnInit, OnDestroy {

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
  userRole: any = ""

  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  largeurImage: number = 350
  hauteurImage: number = 145

  dataLoading: boolean = true
  isLoading: boolean = true

  private destroy$ = new Subject<void>();

  catGroup?: any
  isFullCatItemsOpen: boolean = false

  isLargeScreen?: boolean

  groupedTrades: any[] = [];  // Pour les métiers avec parentCategory
  ungroupedTrades: any[] = [];  // Pour les métiers sans parentCategory

  // null signifie qu'aucune catégorie n'est ouverte
  // openCategoryIndex: number | null = null;
  openCategoryIndex: number[] = [];

  private userRole$ = new BehaviorSubject<string>(this.userRole || ''); // valeur initiale

  // Pour ngOnDestroy
  private canonicalTag: HTMLLinkElement | null = null;


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
    private metaService: Meta,
    // private networkService: NetworkService,
    private analytics: Analytics,
    // private networkService: NetworkService
    public slugService: SlugService,
    private cdr: ChangeDetectorRef,
    private consentService: ConsentService,
    @Inject(DOCUMENT) private document: Document,
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

  // Petite méthode pour la canonical
  private setCanonical() {
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', 'https://be-on-top.io/home');
    // link.setAttribute('href', 'https://be-on-top.io/');
    this.canonicalTag = link; // <--- INDISPENSABLE pour le OnDestroy
  }


  ngOnInit(): void {

    this.setCanonical();
    this.titleService.setTitle('Accueil BE-ON-TOP : Evaluation et formations sur-mesure');

    if (!this.offline) {

      this.updateService.checkForUpdates();

      // 🔹 rôle utilisateur
      // this.authService.getCurrentUserInfo().subscribe(userInfo => {
      //   this.userRole = userInfo?.role;
      // });

      // 🔹 auth
      // onAuthStateChanged(this.auth, (user: any) => {
      //   if (user && (this.userRole == 'student' || this.userRole == '')) {
      //     this.user = user.uid;
      //     this.dataLoading = false;

      //     setTimeout(() => {
      //       this.studentService.getStudentById(user.uid)
      //         .subscribe((data) => {
      //           this.studentData = data;
      //           this.checkIfQuizzAchieved();
      //           this.cdr.detectChanges();
      //         });
      //     }, 100);

      //     this.authService.getUserId();

      //   } else if (user && this.userRole !== '') {
      //     this.user = user.uid;
      //   } else {
      //     console.log("Utilisateur non authentifié");
      //   }
      // });
      onAuthStateChanged(this.auth, (user: any) => {

        this.authService.getCurrentUserInfo().subscribe(userInfo => {

          this.userRole = userInfo?.role;

          if (user && (this.userRole == 'student' || this.userRole == '')) {

            this.user = user.uid;
            this.dataLoading = false;

            setTimeout(() => {
              this.studentService.getStudentById(user.uid)
                .subscribe((data) => {
                  this.studentData = data;
                  this.checkIfQuizzAchieved();
                  this.cdr.detectChanges();
                });
            }, 100);

            this.authService.getUserId();

          } else if (user && this.userRole !== '') {

            this.user = user.uid;

          } else {

            console.log("Utilisateur non authentifié");

          }

        });

      });

      // 🔹 récupération des trades
      combineLatest([
        this.settingsService.getTrades(),
        this.authService.getCurrentUserInfo()
      ])
        .pipe(
          map(([data, userInfo]) =>
            userInfo?.role !== 'editor'
              ? data.filter(item => item.status === true)
              : data
          )
        )
        .subscribe(data => {

          this.tradesData = data || [];

          // 🔹 1. catégories
          this.onSearchCat();

          // 🔹 2. regroupement
          this.groupTrades();

          // 🔹 3. chargement images OPTIMISÉ (PARALLÈLE + 1 seul detectChanges)
          const imagePromises = this.tradesData.map((trade: any) =>
            this.settingsService.loadImageReduced(trade.id)
              .then((url: string) => {
                trade.imageUrl = url || './assets/images-presentation-metiers-vide.jpg';
              })
              .catch(() => {
                trade.imageUrl = './assets/images-presentation-metiers-vide.jpg';
              })
          );

          Promise.allSettled(imagePromises).then(() => {
            this.cdr.detectChanges(); // 🔥 UNE SEULE FOIS
          });

          // 🔹 4. filtrage final (inchangé)
          if (this.catGroup?.length) {
            this.tradesData = this.tradesData.filter(
              (item: Trade) => !this.catGroup.includes(item)
            );
          }

          // 🔹 écran
          this.checkScreenSize();

        });

    } else {

      // 🔹 OFFLINE
      const openRequest = window.indexedDB.open('my-database');

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const transaction = db.transaction('sigles', 'readonly');
        const objectStore = transaction.objectStore('sigles');
        const getAllRequest = objectStore.getAll();

        getAllRequest.onsuccess = () => {
          this.tradesData = getAllRequest.result;

          this.tradesData.forEach((trade: any) => {
            trade.imageUrl = `../../assets/${trade.id}.jpeg`;
          });
        };
      };

    }
  }


  showInfo = false;

  toggleInfo() {
    this.showInfo = !this.showInfo;
  }
  showadditional = false;

  toggleInfoAdditional() {
    this.showadditional = !this.showadditional;
  }

  closeInfo() {
    this.showInfo = false;
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
    if (this.studentData) {
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
    // if (this.canonicalTag) {
    //   this.document.head.removeChild(this.canonicalTag);
    // }
    // Nettoie aussi les metas de base si tu en as mis des spécifiques sur la Home
    // this.metaService.removeTag("name='description'");
    // console.log('[SEO-CLEAN] Home nettoyée');
  }

  logStartEvaluationEvent(tradeName: string) {
    // Google Analytics (Firebase)
    logEvent(this.analytics, 'has_started_evaluation_from_home', { trade_name: tradeName });

    // Facebook Pixel — seulement si tracking autorisé
    if (this.consentService.canTrack()) {
      (window as any).fbq('trackCustom', 'has_started_evaluation_from_home', {
        trade_name: tradeName
      });
      console.log('📦 Event "has_started_evaluation_from_home" envoyé à Meta Pixel');
    } else {
      console.warn('⛔ Tracking désactivé ou Meta Pixel non chargé');
    }
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

  // openFullCatItems(index: number): void {
  //   // Si la catégorie cliquée est déjà ouverte, la fermer; sinon, l'ouvrir
  //   this.openCategoryIndex = this.openCategoryIndex === index ? null : index;

  //   // this.isFullCatItemsOpen = !this.isFullCatItemsOpen

  // }
  openFullCatItems(index: number): void {
    if (this.openCategoryIndex.includes(index)) {
      // Si la catégorie est déjà ouverte → la fermer
      this.openCategoryIndex = this.openCategoryIndex.filter(i => i !== index);
    } else {
      // Sinon → l'ouvrir (ajouter l'index)
      this.openCategoryIndex = [...this.openCategoryIndex, index];
    }
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

  // onSearchTextEntered(searchValue: string) {
  //   const normalizedSearchValue = this.removeAccents(searchValue).toLowerCase().trim();
  //   this.searchText = searchValue; // mise à jour pour l'affichage

  //   // Si la recherche est vide, on ferme toutes les catégories
  //   if (!normalizedSearchValue) {
  //     this.openCategoryIndex = null;
  //     return;
  //   }

  //   // Recherche dans chaque groupe : ouvrir le premier groupe où une correspondance est trouvée
  //   const matchingGroupIndex = this.groupedTrades.findIndex((group: any) =>
  //     group[1].some((trade: any) => {
  //       const normalizedDenomination = this.removeAccents(trade.denomination).toLowerCase();
  //       const normalizedDescription = this.removeAccents(trade.description).toLowerCase();
  //       return normalizedDenomination.includes(normalizedSearchValue) ||
  //         normalizedDescription.includes(normalizedSearchValue);
  //     })

  //   );

  //   // Si une correspondance est trouvée et que ce groupe n'est pas déjà ouvert, on l'ouvre
  //   if (matchingGroupIndex !== -1 && this.openCategoryIndex !== matchingGroupIndex) {
  //     this.openFullCatItems(matchingGroupIndex);
  //   }





  //   // console.log("Search Value:", searchValue);
  //   // console.log("Normalized Search Value:", normalizedSearchValue);
  // }

  // onSearchTextEntered(searchValue: string) {
  //   const normalizedSearchValue = this.removeAccents(searchValue).toLowerCase().trim();
  //   this.searchText = searchValue; // mise à jour pour l'affichage

  //   // Si la recherche est vide, on ferme toutes les catégories
  //   // if (!normalizedSearchValue) {
  //   //   this.openCategoryIndex = null;
  //   //   return;
  //   // }

  //   // Trouver tous les groupes contenant une correspondance
  //   const matchingGroupIndexes = this.groupedTrades
  //     .map((group: any, index: number) => {
  //       const hasMatch = group[1].some((trade: any) => {
  //         const normalizedDenomination = this.removeAccents(trade.denomination).toLowerCase();
  //         const normalizedDescription = this.removeAccents(trade.description).toLowerCase();
  //         return normalizedDenomination.includes(normalizedSearchValue) ||
  //                normalizedDescription.includes(normalizedSearchValue);
  //       });
  //       return hasMatch ? index : null;
  //     })
  //     .filter((index: number | null) => index !== null) as number[];

  //   // Ouvrir tous les groupes trouvés
  //   matchingGroupIndexes.forEach(index => {
  //     this.openFullCatItems(index);
  //   });
  // }

  // version optimisée ++
  onSearchTextEntered(searchValue: string) {
    const normalizedSearchValue = this.removeAccents(searchValue).toLowerCase().trim();
    this.searchText = searchValue;

    // Si la recherche est vide → fermer toutes les catégories
    if (!normalizedSearchValue) {
      this.openCategoryIndex = [];
      return;
    }

    // Réinitialiser les catégories ouvertes
    this.openCategoryIndex = [];

    // Scanner chaque groupe de trades
    this.groupedTrades.forEach((group: any, index: number) => {
      const hasMatch = group[1].some((trade: any) => {
        const nom = this.removeAccents(trade.denomination).toLowerCase();
        const desc = this.removeAccents(trade.description).toLowerCase();
        return nom.includes(normalizedSearchValue) || desc.includes(normalizedSearchValue);
      });

      // Si le groupe contient au moins 1 résultat → l'ouvrir
      if (hasMatch) {
        this.openCategoryIndex.push(index);
      }
    });
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
    // console.log('catGroup', this.catGroup)
    // console.log(this.searchText);
  }

  groupTrades() {
    // console.log("Trades initiaux:", this.tradesData);

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
    // console.log("Métiers regroupés:", this.groupedTrades);
    // console.log("Métiers non groupés:", this.ungroupedTrades);

  }

  processDenomination(denomination: string): string {
    const acronymRegex = /(\b[A-Z]+\b)\s?\((.*?)\)/g;

    return denomination.replace(acronymRegex, (match, acronym, meaning) => {
      return `<abbr title="${meaning}">${acronym}</abbr>`;
    });
  }


  // trackAddToCart(): void {
  //   if (this.consentService.canTrack()) {
  //     (window as any).fbq('track', 'AddToCart', {
  //       content_name: 'Produit fictif',
  //       content_ids: ['12345'],
  //       content_type: 'product',
  //       value: 19.99,
  //       currency: 'EUR'
  //     });
  //     console.log('📦 Événement "AddToCart" envoyé à Meta Pixel');
  //   } else {
  //     console.warn('⛔ Tracking désactivé ou Meta Pixel non chargé');
  //   }
  // }



  shouldDisplayCategory(index: number) {
    // Si aucune recherche : tout afficher
    if (!this.searchText || this.searchText.trim() === '') return true;

    // Sinon : n'afficher QUE les catégories ouvertes
    return this.openCategoryIndex.includes(index);
  }




}









