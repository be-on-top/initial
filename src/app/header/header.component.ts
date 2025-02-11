import { Component, ElementRef, Renderer2, ViewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { AuthService } from '../admin/auth.service';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth, reload } from '@angular/fire/auth';
import { Firestore, docData, doc } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs'
import { Trade } from '../admin/trade';
import { SettingsService } from '../admin/settings.service';
import { Router } from '@angular/router';
import { StudentsService } from '../admin/students.service';
import { Student } from '../admin/Students/student';
import { Partner } from '../admin/partner';
import { NetworkService } from '../network.service';
import { SlugService } from '../slug.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  userUid?: any
  userRole: string = ""
  trades?: any

  isMenuOpen = false;
  isNavbarOpen = false;

  studentData?: Student
  isOneQuizzAchieved: boolean = false

  offline: boolean = false
  filteredTrades: Trade[] = []
  partners: Partner[] = []

  // utilisation de networkService pour détecter le retour du réseau
  onlineStatus: boolean = true;
  private networkSubscription: Subscription | null = null; // Initialisé à null
  // private hasCheckedInitialStatus = false;

  // groupedTrades: any[] = [];  // Pour les métiers avec parentCategory
  ungroupedTrades: any[] = [];  // Pour les métiers sans parentCategory
  groupedTrades: Map<string, Trade[]> = new Map();

  // groupedTrades: Map<string, Trade[]> = new Map();




  @ViewChild('collapsibleNavbar') collapsibleNavbar!: ElementRef;

  constructor(
    // private renderer: Renderer2,
    private authService: AuthService,
    private auth: Auth,
    private firestore: Firestore,
    private tradeService: SettingsService,
    private router: Router,
    private studentService: StudentsService,
    private networkService: NetworkService,
    public slugService: SlugService) {
    // this.userUid=this.authService.getUserId()
    // this.offline = !navigator.onLine
    // Si on passe par networkService pour une détection plus rapide
    // this.networkService.getOnlineStatus().subscribe(online => {
    //   if (!online) {
    //     alert("Vous n'avez plus de connexion. Nous ne pourrons plus charger les données du questionnaire ou détails du compte utilisateur. Merci de réessayer ultérieurement")
    //     this.router.navigate(['/home']); // Rediriger vers la page d'accueil lorsque hors ligne
    //   }
    // });
  }

  ngOnInit(): void {


    this.networkSubscription = this.networkService.getOnlineStatus().subscribe(online => {
      if (!online) {
        alert("Connexion réseeau perdue.");
        this.offline = true; // Mettre à jour le flag pour indiquer que nous sommes hors ligne
      } else if (this.offline) {
        alert("Connexion réseau rétablie. Vous pouvez continuer à utiliser l'application.");
        location.reload();  // Rafraîchir la page pour recharger les données
        this.offline = false; // Réinitialiser le flag après la reconnexion
      }
    })

    // Appeler la fonction de vérification au démarrage de l'application
    this.authService.checkLastLoginDate();

    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.userUid = user.uid
        console.log("log user uid depuis le header", user.uid);
        this.getRole(this.userUid).subscribe(data => {
          console.log("data de l'utilisateur depuis header", data);
          // si on a un tableau de rôles, c'est data.role[0]
          this.userRole = data.role
          console.log("roles depuis header", data.role);
          this.studentService.getStudentById(user.uid).subscribe(data => {
            this.studentData = data
            this.checkIfQuizzAchieved()
          })

        })

      }
      console.log("pas d'utilisateur authentifié")
    })

    //  onAuthStateChanged(this.auth, (user: any) => {
    //    if (user) {
    //      this.getRole( user.uid).subscribe((data)=>{
    //        this.userRole=data.role
    //    }) }

    //  })

    if (navigator.onLine) {
      this.tradeService.getTradesWithStatusTrue().subscribe(data => {
        // alert(data)
        this.trades = data
        // je n'ai plus besoin puisque je filtre à la source :
        // this.filterTradesByStatus()
        this.groupTrades();
      })
    } else {
      const openRequest = window.indexedDB.open('my-database');
      // Pour gérer les évènements à l'ouverture de la base
      openRequest.onsuccess = (event) => {
        const db = openRequest.result;
        const transaction = db.transaction('sigles', 'readonly');
        const objectStore = transaction.objectStore('sigles');
        const getAllRequest = objectStore.getAll();

        // alert(this.tradesData)

        // Traite les données récupérées ici depuis base de données indexée my-database
        getAllRequest.onsuccess = (event) => {
          console.log("métier récupéré depuis indexedDB")
          this.trades = getAllRequest.result
        }
      }

    }

    this.groupedTrades = this.groupTradesByCategory(this.trades);
  }

  groupTradesByCategory(trades: Trade[]): Map<string, Trade[]> {
    const grouped = new Map<string, Trade[]>();

    trades.forEach(trade => {
        const category = trade.parentCategory || ''; // Catégorie vide pour les non-groupés
        if (!grouped.has(category)) {
            grouped.set(category, []);
        }
        grouped.get(category)?.push(trade);
    });

    return grouped;
}

  ngAfterViewInit(): void {
    this.tradeService.fetchPartners().subscribe(data => {
      this.partners = data
      console.log("partenaires récupérés", this.partners);

    })

    // this.resetNavbar()
  }

  getRole(id: any) {
    // finalement, compte tenu du fait que les evaluators peuvent potentiellement aussi être des tuteurs (formateurs) roles sera un tableau
    // au niveau de getRole, cela ne change pas grand chose
    let $roleRef = doc(this.firestore, "roles/" + id)
    return docData($roleRef) as Observable<any>;

  }

  logOut() {
    this.authService.logout()
    window.location.reload();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // toggleMenu() {
  //   this.isMenuOpen = !this.isMenuOpen;
  // }

  // toggleMenu() {
  //   this.isMenuOpen = !this.isMenuOpen;

  //   // Ajoutez un délai pour cacher l'icône burger après l'ouverture du menu
  //   if (this.isMenuOpen) {
  //       this.hideBurgerIcon = true;
  //       setTimeout(() => {
  //           this.hideBurgerIcon = false;
  //       }, 500);
  //   }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeNavbar() {

    // Fermez la navbar en utilisant la référence obtenue via ViewChild
    setTimeout(() => {
      this.collapsibleNavbar.nativeElement.classList.remove('show');
      this.isMenuOpen = !this.isMenuOpen;
    }, 300)
  }
  resetNavbar() {
    // Fermez la navbar en utilisant la référence obtenue via ViewChild
    setTimeout(() => {
      this.collapsibleNavbar.nativeElement.classList.remove('show');
      this.isMenuOpen = false
    }, 300)
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

  // Vous pouvez appeler cette fonction lorsque vous avez besoin de filtrer les métiers
  filterTradesByStatus() {
    this.filteredTrades = this.trades.filter((trade: any) => trade.status === true);
  }

  ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe(); // Vérification explicite pour null
    }
  }



  groupTrades() {
    console.log("Trades initiaux:", this.trades);
   
    const grouped = new Map<string, any[]>();
 
    this.trades.forEach((trade:any) => {
      if (trade.parentCategory) {
        if (!grouped.has(trade.parentCategory)) {
          grouped.set(trade.parentCategory, []);
        }
        grouped.get(trade.parentCategory)?.push(trade);
      } else {
        this.ungroupedTrades.push(trade);
      }
    });
 
    this.groupedTrades = grouped;
    console.log("Métiers regroupés:", this.groupedTrades);
    console.log("Métiers non groupés:", this.ungroupedTrades);
  }


    // Fonction pour ajouter une cassure avant la parenthèse
    getFormattedMenuItem(item: string): string {
      return item.replace('(', '&shy;(');  // Ajoute une soft hyphen avant la parenthèse
    }


    // goToInfoPage() {
    //   if (this.userRole.includes('referent')) {
    //     // Rediriger vers un lien externe
    //     window.location.href = 'https://xd.adobe.com/view/75e0818e-ab1b-4464-8b05-ff2988454cba-20b3/?fullscreen';
    //   } else {
    //     // Rediriger vers une route interne de l'application
    //     this.router.navigate(['/benefits']);
    //   }
    // }

    goToInfoPage() {
      if (this.userRole.includes('referent')) {
        // Ouvrir un lien externe dans une nouvelle fenêtre ou un nouvel onglet
        window.open('https://xd.adobe.com/view/75e0818e-ab1b-4464-8b05-ff2988454cba-20b3/?fullscreen', '_blank');
      } else if(this.userRole.includes('trainer'))  {
        // Rediriger vers support Formateurs
        window.open('https://xd.adobe.com/view/a41e35e0-6af3-4001-8ba8-3c856993d99a-f14d/?fullscreen', '_blank');
      } else {
        // Rediriger vers une route interne de l'application
        this.router.navigate(['/benefits']);
      }
    }




    formatCategoryTitle(category: string): { main: string, subtitle: string } {
      const index = category.indexOf('(');
      if (index === -1) {
          return { main: category, subtitle: '' };
      }
      return { main: category.slice(0, index), subtitle: category.slice(index) };
  }

//   @HostListener('click', ['$event'])
// onDropdownClick(event: Event) {
//     event.stopPropagation();
// }

onDropdownClick(event: Event) {
  event.preventDefault(); // Empêche le lien de naviguer
  event.stopPropagation(); // Empêche la fermeture immédiate du menu

  const element = (event.target as HTMLElement).parentElement;
  
  if (element?.classList.contains("show")) {
      element.classList.remove("show"); // Cache le sous-menu
  } else {
      // Fermer tous les autres sous-menus
      document.querySelectorAll(".dropdown-submenu").forEach(submenu => {
          submenu.classList.remove("show");
      });

      element?.classList.add("show"); // Affiche le sous-menu cliqué
  }
}

  



    
    



}







