import { Component, ElementRef, Renderer2, ViewChild, OnInit, AfterViewInit } from '@angular/core';
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
  private hasCheckedInitialStatus = false;



  @ViewChild('collapsibleNavbar') collapsibleNavbar!: ElementRef;

  constructor(
    private renderer: Renderer2,
    private authService: AuthService,
    private auth: Auth,
    private firestore: Firestore,
    private tradeService: SettingsService,
    private router: Router,
    private studentService: StudentsService,
    private networkService: NetworkService) {
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
    });

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


}







