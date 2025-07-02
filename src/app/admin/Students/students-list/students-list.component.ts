import { AfterViewInit, Component, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { Student } from '../student';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subscription, tap } from 'rxjs';
import { SettingsService } from '../../settings.service';
import { Trade } from '../../trade';
import { Users } from '../../Users/users';
import { AuthService } from '../../auth.service';
import { User } from 'firebase/auth';
import { TrainersService } from '../../trainers.service';
import { UsersService } from '../../users.service';
import { CentersService } from '../../centers.service';

@Component({
  selector: 'app-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.css']
})
export class StudentsListComponent implements OnInit, AfterViewInit {

  // Nouvelle propriété pour stocker les données brutes
  collectionStudents: any[] = [];

  allStudents: any[] = [];
  studentsWithToken: any[] = [];



  // pour différencier la vue si user external
  userRouterLinks: any;

  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  // pour récupérer les métiers et en faire des filtres
  trades: string[] = []

  // pour récupérer côté composant l'uid dont on va avoir besoin pour le changement de paradigme...
  userUid: string | null = null;
  // si on change de méthode getCurrentUserUid() pour getCurrentUserInfo(). 
  private authSubscription: Subscription | undefined;
  userRole: string | string[] | null = null;
  currentRoute = this.router.url; // récupère la route complète

  filteredStudents: Student[] = []; // Liste des étudiants filtrée

  isSocialFormSentFilter: boolean = false
  noSocialFormSentFilter: boolean = false
  isInnerStudentFilter: boolean = false
  isSubscriptionFilter: boolean = false
  isSubscriptionMissingFilter: boolean = false
  initialStudents: any[] = []; // Copie initiale des étudiants
  contactStudents: any[] = []; // pour les étudiants affectés par referent à contact

  isTradeFilter: boolean = false
  tradesActivated: boolean = false
  isQualifiedFilter: boolean = false
  isPriorFilter: boolean = false
  // puisqu'il faut compliquer
  isTradeQCMStarted: boolean = false
  isTradeFullQCM: boolean = false

  showNoInterestStudents: boolean = false;
  studentsWithNoInterest: any[] = [];

  myCenterStudents: boolean = false

  cpArray: string[] = []
  regions: string[] = []
  departments: string[] = []
  // quelle région l'utilisateur a sélectionné dans l'interface
  selectedRegion: string | null = null;
  selectedDepartment: string | null = null;

  // Déclaration des variables pour lier la sélection à l'état des QCM
  selectedTradeForFullQCM: string | null = null;
  selectedTradeForQCMStarted: string | null = null;
  selectedTradeOnTraining: string | null = null;

  isLoading: boolean = true

  storedValue: any

  constructor(
    private service: StudentsService,
    private activatedRoute: ActivatedRoute,
    private tradeService: SettingsService,
    private authService: AuthService,
    private trainerService: TrainersService,
    private userService: UsersService,
    private regionalService: CentersService,
    private router: Router) {
    this.userRouterLinks = this.activatedRoute.snapshot.data;

    // implémenter la méthode conçue pour les "conseillers projets" qui n'en sont pas puisqu'ils se font concurrence (référents admin)
    // Récupérer l'UID de manière synchrone
    // this.userUid = this.authService.getCurrentUserUid();
    this.authSubscription = this.authService.getCurrentUserInfo().subscribe(userInfo => {
      this.userRole = userInfo?.role ?? null;
      this.userUid = userInfo?.uid ?? "";
    });

    // On peut maintenant utiliser cet UID pour d'autres opérations
    if (this.userUid && this.userRouterLinks.user === 'referent') {
      // Exécuter la méthode interminable pour le changement de paradigme
      this.getCentersAndSocialFormByUserId(this.userUid)
      this.userService.getUser(this.userUid).subscribe(data => this.cpArray = data.cp)

      // Une méthode qui s'en inspière mais va me retourner
      // la liste des formateurs et ceux qui ont le même tableau de cp
      // ou ceux dont un des cp du tableau est contenu dans le tableau des cp du compte authentifié
      // this.getTrainersWithSameCp(this.userUid)

    }

    // pour le cas très spécifique du contact ajouté par un referent
    if (this.userUid && this.userRouterLinks.user === 'referentsContacts') {
      this.userService.getUser(this.userUid).subscribe(data => {
        // console.log("tableau du doc", data.students)
        this.contactStudents = data.students
      }
      )
    }


  }

  ngOnInit() {

    // pour le cas très spécifique du referent qu'a rien à foutre ici
    if (this.userUid && this.userRole === 'referent' && this.currentRoute.endsWith('/leads')) // récupère la route complète) 
    {
      alert('Accès refusé : cette page n\'est pas accessible avec votre profil utilisateur.');
      this.router.navigate(['/']); // redirige vers la page d’accueil     
    }

    this.getStudents();
    this.onSearchTextEntered("")

    this.regionalService.getAllRegions().subscribe(regions => {
      this.regions = regions
      // console.log('regions récupérées', this.regions);
    })

    this.regionalService.getAllDepartments().subscribe(departments => {
      this.departments = departments
      // console.log('départements récupérées', this.departments);
    })

    this.storedValue = localStorage.getItem('filter')
  }

  ngAfterViewInit() {
    this.tradeService.getTrades().subscribe(data => {
      data.forEach(element => {
        this.trades.push(element.sigle)
      });
    })

  }

  // getStudents() {
  //   this.service.getStudents().subscribe(students => {
  //     this.allStudents = students
  //     console.log('this.allStudents', this.allStudents)
  //   })

  // }


  // getStudents() {
  //   this.service.getStudents().pipe(
  //     map(students => students.filter(student => this.hasFullResults(student)))
  //   ).subscribe(filteredStudents => {
  //     this.allStudents = filteredStudents;
  //     console.log('this.allStudents', this.allStudents);
  //   });
  // }

  // getStudents() {
  //   this.service.getStudents().pipe(
  //     map(students => students.filter(student => this.hasFullResults(student)))
  //   ).subscribe(filteredStudents => {
  //     this.initialStudents = filteredStudents; // Stocker la liste initiale
  //     this.allStudents = [...this.initialStudents]; // Initialiser allStudents
  //     this.applyFilters();
  //   });
  // }

  ascending = false; // Variable pour gérer l'ordre de tri

  // pour intégrer l'état de ascending, et collecter les données brutes pour les totaux OK
  // getStudents() {
  //   const order = this.ascending ? 'asc' : 'desc';
  //   this.service.getStudents(order).pipe(
  //     tap(students => {
  //       // Stocker les données brutes avant toute transformation
  //       this.collectionStudents = students;
  //       console.log('Données brutes (collectionStudents) :', this.collectionStudents);
  //     }),
  //     map(students => students.filter(student => this.hasFullResults(student)))
  //   ).subscribe(filteredStudents => {
  //     this.initialStudents = filteredStudents; // Stocker la liste initiale
  //     this.allStudents = [...this.initialStudents]; // Initialiser allStudents
  //     this.applyFilters();
  //   });
  // }

  //  pour faire toutes les requêtes nécessaires illico si c'est le referent qui est connecté
  // fonctionne bien sans faire de distinguo selon l'utilisateur
  // getStudents() {
  //   const order = this.ascending ? 'asc' : 'desc';
  //   const referentUid = this.authService.getCurrentUserUid(); // UID du référent.

  //   if (!referentUid) {
  //     console.error('Impossible de récupérer UID du référent.');
  //     return;
  //   }

  //   // Étape 1 : Charger tous les étudiants
  //   this.service.getStudents(order).subscribe(allStudents => {
  //     console.log('Tous les étudiants chargés :', allStudents);

  //     // Étape 2 : Récupérer les étudiants prior (via service)
  //     this.service.getCentersAndSocialFormByUserId(referentUid)
  //       .subscribe(returnedPriors => {
  //         console.log('IDs prior récupérés :', returnedPriors);

  //         // Filtrer les étudiants en fonction de deux critères (référent + prior)
  //         const filteredStudents = allStudents.filter(student => 
  //           student.referent === referentUid || returnedPriors.includes(student.id)
  //         );
  //         console.log('Étudiants filtrés (référent + prior) :', filteredStudents);

  //         // Initialisation de la base de données
  //         this.initialStudents = [...filteredStudents]; // Base par défaut
  //         this.allStudents = [...this.initialStudents]; // Pré-remplissage pour affichage

  //         // Mise à jour des filtres dynamiques
  //         this.filteredStudents = filteredStudents.filter(student => returnedPriors.includes(student.id)); // Garde uniquement les prior pour filtres dynamiques
  //         console.log('Filtered Prior Students :', this.filteredStudents);

  //         this.applyFilters(); // Appliquer les filtres actuels
  //       });
  //   });
  // }

  // en cours... pour ajouter la détection des roles 
  getStudents() {
    const order = this.ascending ? 'asc' : 'desc';
    const referentUid = this.authService.getCurrentUserUid(); // Récupérer l'UID de l'utilisateur connecté.

    if (!referentUid) {
      console.error('Impossible de récupérer UID de l\'utilisateur.');
      return;
    }

    // Étape 1 : Charger tous les étudiants
    this.service.getStudents(order).pipe(
      tap(students => {
        // Stocker les données brutes avant toute transformation
        this.collectionStudents = students;
        // console.log('Données brutes (collectionStudents) :', this.collectionStudents);
      }),
      // A condition qu'ils aient au minimum terminé UN questionnaire...
      map(students => students.filter(student => this.hasFullResults(student)))
    ).subscribe(filteredStudents => {

      this.initialStudents = filteredStudents; // Stocker la liste initiale
      this.allStudents = [...this.initialStudents]; // Initialiser allStudents

      // Vérifie le rôle utilisateur
      if (this.userRouterLinks.user === 'admin') {
        this.applyFilters();
      }
      else if (this.userRouterLinks.user === 'referent') {
        // Si référent, applique les filtres (référent et prior)
        this.service.getCentersAndSocialFormByUserId(referentUid)
          .subscribe(returnedPriors => {
            // console.log('IDs prior récupérés :', returnedPriors);

            // Étape 2 : Filtrer les étudiants par référent ou prior (qui a terminé et envoyé le formulaire)
            const filteredStudents = this.allStudents.filter(student =>
              student.referent === referentUid || (returnedPriors.includes(student.id) && student.isSocialFormSent)
            );
            // console.log('Étudiants filtrés (référent + prior) :', filteredStudents);

            // Initialisation pour le référent
            this.initialStudents = [...filteredStudents];
            this.allStudents = [...this.initialStudents];

            // Mise à jour des filtres dynamiques pour prior uniquement
            this.filteredStudents = filteredStudents.filter(student =>
              returnedPriors.includes(student.id)
            );
            // console.log('Filtered Prior Students :', this.filteredStudents);
            this.applyFilters(); // Appliquer les filtres actuels                       

          });

        this.isLoading = false
      }
      // pour les contacts ajoutés par referent
      else if (this.contactStudents.length !== 0) {
        const filteredStudents = this.allStudents.filter(student =>
          this.contactStudents.includes(student.id) && student.isSocialFormSent)
        // Initialisation pour le référent
        this.initialStudents = [...filteredStudents];
        this.allStudents = [...this.initialStudents];
      }
    });
  }

  // puisqu'il faut compliquer et théoriquement relancer... 
  // getStudentsWithNoInterest() {
  //   const order = this.ascending ? 'asc' : 'desc';
  //   this.service.getStudents(order).subscribe(data => {
  //     // Soustraction : trouver les étudiants qui ne sont pas dans `initialStudents`
  //     this.studentsWithNoInterest = data.filter(student =>
  //       !this.initialStudents.some(interestedStudent => interestedStudent.id === student.id)
  //     );

  //     console.log('Étudiants sans intérêt :', this.studentsWithNoInterest);

  //     // Mettre à jour l'affichage en fonction du bouton
  //     this.showNoInterestStudents = true;
  //   });
  // }

  getStudentsWithNoInterest() {
    if (this.showNoInterestStudents) {
      // Si les étudiants sans intérêt sont affichés, les masquer
      this.showNoInterestStudents = false;
      this.studentsWithNoInterest = []; // Optionnel : Réinitialiser la liste
    } else {
      // Sinon, les récupérer et les afficher
      const order = this.ascending ? 'asc' : 'desc';
      this.service.getStudents(order).subscribe(data => {
        // Soustraction : trouver les étudiants qui ne sont pas dans `initialStudents`
        this.studentsWithNoInterest = data.filter(student =>
          !this.initialStudents.some(interestedStudent => interestedStudent.id === student.id)
        );

        // console.log('Étudiants sans intérêt :', this.studentsWithNoInterest);
        this.showNoInterestStudents = true;
      });
    }
  }


  // indissociable du précédent

  toggleOrder() {
    this.ascending = !this.ascending; // Inverser l'ordre
    this.getStudents(); // Rafraîchir la liste avec le nouvel ordre
  }


  hasFullResults(obj: any): boolean {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'fullResults') {
          return true;
        }
        if (typeof obj[key] === 'object' && this.hasFullResults(obj[key])) {
          return true;
        }
      }
    }
    return false;
  }


  deleteStudent(student: Student) {
    /* console.log(student); */
    this.service.deleteStudent(student);
    this.getStudents();
  }

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    console.log(searchValue);

    this.searchText = searchValue
    console.log(this.searchText);

  }

  exportStudentsCollection() {
    this.service.exportCollection("students")
  }

  exportCollectionAsCSV() {
    this.service.exportCollectionAsCSV("students")
  }

  // exportInactifsCSV() {
  //   this.service.exportCollectionAsCSV("studentsWithNoInterest")
  // }

  // pour tester la méthode directement dans le composant

  exportInactifsCSV() {
    if (this.studentsWithNoInterest.length === 0) {
      console.warn("Aucune donnée à exporter !");
      return;
    }

    // Construire les données CSV
    const headers = ['Name', 'Firstname', 'Email']; // Titres des colonnes
    const rows = this.studentsWithNoInterest.map(student => [
      student.lastName,
      student.firstName,
      student.email
    ]);

    // Créer une chaîne CSV
    const csvContent = [headers, ...rows]
      .map(e => e.join(',')) // Convertir chaque ligne en texte CSV
      .join('\n'); // Joindre les lignes par des sauts de ligne

    // Créer un fichier Blob pour le téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Etudiants_inactifs.csv');
    document.body.appendChild(link);
    link.click();

    // Nettoyer après le téléchargement
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }




  // isSocialFormSentFilter: boolean = false;
  // isSubscriptionFilter: boolean = false
  // initialStudents: any[] = []; // Copie initiale des étudiants
  // isTradeFilter: boolean = false
  // tradesActivated: boolean = false
  // isQualifiedFilter: boolean = false
  // isPriorFilter:boolean = false

  // applyFilters() {
  //   // Restaurer l'état initial avant de filtrer
  //   this.allStudents = this.initialStudents.filter(student => {
  //     const matchesSearchText = this.searchText === '' || student.lastName.includes(this.searchText) || student.lastName.toLowerCase().includes(this.searchText) || student.firstName.includes(this.searchText) || student.firstName.toLowerCase().includes(this.searchText);
  //     if (this.isSocialFormSentFilter) {
  //       return student.isSocialFormSent && matchesSearchText;
  //     }
  //     return matchesSearchText;
  //   });
  // }

  // onCheckboxChange(event: any) {
  //   this.isSocialFormSentFilter = event.target.checked;
  //   this.applyFilters();
  // }


  applyFilters(trade?: string) {
    // puisqu'il faut désactiver la vue additionnelle des non actifs dès qu'un filtre est actif...
    this.showNoInterestStudents = false

    if (this.isSocialFormSentFilter || this.storedValue === 'socialFormSentFilter') {
      // Si le filtre "formulaire social envoyé" est actif,
      // on ne garde que les étudiants qui ont effectivement envoyé ce formulaire
      this.allStudents = this.initialStudents.filter(student => student.isSocialFormSent);

    } else if (this.noSocialFormSentFilter || this.storedValue === 'noSocialFormSentFilter') {
      // Si le filtre "aucun formulaire social envoyé" est actif,
      // on applique les conditions suivantes :
      this.allStudents = this.initialStudents.filter(student =>

        // 1. L'étudiant a au moins un questionnaire (clé commençant par "quizz_")
        //    avec une propriété fullResults non vide (donc questionnaire finalisé)
        Object.keys(student).some(key =>
          key.startsWith('quizz_') && student[key]?.fullResults?.length > 0
        ) &&

        // 2. L'étudiant n'est pas un candidat interne
        !student.innerStudent &&

        // 3. L'étudiant n'a pas encore envoyé le formulaire social
        !student.isSocialFormSent
      );


      // Extrait les UIDs des étudiants
      // const uids = this.allStudents.map(student => student.id)
      // console.log("all students with no socialFormSent", uids)
      // Passe les UIDs au service pour interroger Firestore (desactivé juste pour test OK)
      //   this.service.checkTokensForStudents(uids).then(tokens => {
      //   // Les tokens trouvés seront stockés ici
      //   this.studentsWithToken = tokens;
      //   console.log(this.studentsWithToken); // Ou fais ce que tu veux avec les tokens
      // });


    } else if (this.isSubscriptionFilter || this.storedValue === 'isSubscriptionFilter') {
      this.allStudents = this.initialStudents.filter(student => student.subscriptions);
      // this.tradesActivated = true
    }

    // missing subscriptions
    else if (this.isSubscriptionMissingFilter || this.storedValue === 'isSubscriptionMissingFilter') {
      this.allStudents = this.initialStudents.filter(student => !student.subscriptions || student.subscriptions.length === 0)

      // this.tradesActivated = true
    }

    else if (this.isTradeFilter) {
      this.allStudents = this.initialStudents.filter(student =>
        Array.isArray(student.subscriptions) &&
        student.subscriptions.includes(trade) &&
        (
          !Array.isArray(student.endedSubscriptions) ||
          !student.endedSubscriptions.some((ended: any) => ended.sigle === trade)
        )
      );

    } else if (this.isInnerStudentFilter || this.storedValue === 'isInnerStudentFilter') {
      this.allStudents = this.initialStudents.filter(student => student.innerStudent);
    } else if (this.isTradeQCMStarted) {
      this.allStudents = this.initialStudents.filter(student => student['quizz_' + trade] && !student['quizz_' + trade].fullResults);
    }
    else if (this.isTradeFullQCM) {
      this.allStudents = this.initialStudents.filter(student => student['quizz_' + trade] && student['quizz_' + trade].fullResults);
    } else if (this.isQualifiedFilter || this.storedValue === 'isQualifiedFilter') {
      this.allStudents = this.initialStudents.filter(student => student.endedSubscriptions);
    } else if (this.isPriorFilter || this.storedValue === 'isPriorFilter') {
      this.allStudents = this.filteredStudents;
    } else if (this.myCenterStudents || this.storedValue === 'myCenterStudentsFilter') {
      this.allStudents = this.initialStudents.filter(student => student.referent === this.userUid);
    } else {
      this.allStudents = [...this.initialStudents];
      this.tradesActivated = false
    }
    //  this.isLoading = false

  }

  onCheckboxChangePrior(event: any) {
    this.resetAllFilters()
    this.isPriorFilter = event.target.checked;
    if (event.target.checked) {
      localStorage.setItem('filter', 'isPriorFilter');
      this.storedValue = 'isPriorFilter'
      this.applyFilters();
    } else {
      localStorage.removeItem('filter')
      this.storedValue = ''
      this.applyFilters()
    }
  }

  onCheckboxChangeSocial(event: any) {
    this.resetAllFilters()
    this.isSocialFormSentFilter = event.target.checked;

    if (event.target.checked) {
      localStorage.setItem('filter', 'socialFormSentFilter');
      this.storedValue = 'socialFormSentFilter'
      this.applyFilters();
    } else {
      localStorage.removeItem('filter')
      this.storedValue = ''
      this.applyFilters()
    }

  }

  onCheckboxChangeNoSocial(event: any) {
    this.resetAllFilters()
    this.noSocialFormSentFilter = event.target.checked;

    if (event.target.checked) {
      localStorage.setItem('filter', 'noSocialFormSentFilter');
      this.storedValue = 'noSocialFormSentFilter'
      this.applyFilters();

    } else {
      localStorage.removeItem('filter');
      this.storedValue = ''
      this.applyFilters();
    }
  }

  onCheckboxChangeSubscriptions(event: any) {
    this.resetAllFilters()
    this.isSubscriptionFilter = event.target.checked;
    if (event.target.checked) {
      localStorage.setItem('filter', 'isSubscriptionFilter');
      this.storedValue = 'isSubscriptionFilter'
      this.applyFilters();

    } else {
      localStorage.removeItem('filter');
      this.storedValue = ''
      this.applyFilters();
    }
  }

  onCheckboxChangeSubscriptionsMissing(event: any) {
    this.resetAllFilters()
    this.isSubscriptionMissingFilter = event.target.checked;
    if (event.target.checked) {
      localStorage.setItem('filter', 'isSubscriptionMissingFilter');
      this.storedValue = 'isSubscriptionMissingFilter'
      this.applyFilters();

    } else {
      localStorage.removeItem('filter');
      this.storedValue = ''
      this.applyFilters();
    }
  }


  onTradeTrainingSelect(trade: string | null) {
    this.resetAllFilters();
    this.isTradeFilter = !!trade;

    const cleanTrade = trade ?? undefined; // convertit null → undefined
    this.applyFilters(cleanTrade);
  }


  onTradeQCMStartedSelect(trade: string | null) {
    this.resetAllFilters();
    this.isTradeQCMStarted = !!trade;

    const cleanTrade = trade ?? undefined; // convertit null → undefined
    this.applyFilters(cleanTrade);
  }


  // Méthode appelée lors de la sélection dans le select
  onTradeFullQCMSelect(trade: string | null) {
    this.resetAllFilters();
    this.isTradeFullQCM = !!trade;  // Si trade est non null, activer le filtre

    const cleanTrade = trade ?? undefined;  // Convertir null → undefined

    // Appliquer les filtres avec la valeur du trade
    this.applyFilters(cleanTrade);
  }

  onCheckboxChangeInner(event: any) {
    this.resetAllFilters()
    this.isInnerStudentFilter = event.target.checked;
 if (event.target.checked) {
      localStorage.setItem('filter', 'isInnerStudentFilter')
      this.storedValue = 'isInnerStudentFilter'
      this.applyFilters()
    } else {
      localStorage.removeItem('filter')
      this.storedValue = ''
      this.applyFilters()
    }
  }

  onCheckboxChangeEndedTraining(event: any) {
    this.resetAllFilters()
    this.isQualifiedFilter = event.target.checked;
    if (event.target.checked) {
      localStorage.setItem('filter', 'isQualifiedFilter')
      this.storedValue = 'isQualifiedFilter'
      this.applyFilters()
    } else {
      localStorage.removeItem('filter')
      this.storedValue = ''
      this.applyFilters()
    }
  }

  //  que j'ai ajoutés
  onCheckboxChangeMyInitialStudents(event: any) {
    this.resetAllFilters()
    this.myCenterStudents = event.target.checked;
    if (event.target.checked) {
      localStorage.setItem('filter', 'myCenterStudentsFilter');
      this.storedValue = 'myCenterStudentsFilter'
      this.applyFilters()
    } else {
      localStorage.removeItem('filter');
      this.storedValue = ''
      this.applyFilters()
    }
  }

    // si on substitue partout où on boucle sur trades un select aux cases à cocher !!! :
  resetAllFilters() {
    this.isSocialFormSentFilter = false;
    this.noSocialFormSentFilter = false;
    this.isSubscriptionFilter = false;
    this.isSubscriptionMissingFilter = false;
    this.isInnerStudentFilter = false;
    this.isTradeFilter = false;
    this.isTradeQCMStarted = false;
    this.isTradeFullQCM = false;
    this.isQualifiedFilter = false;
    this.isPriorFilter = false;
    this.myCenterStudents = false;
    this.tradesActivated = false;
    localStorage.removeItem('filter')
    this.storedValue = ''
  }

  onSelectRegion(region: string | null) {
    this.selectedRegion = region && region !== 'null' ? region : null;
    console.log('Région sélectionnée :', this.selectedRegion);
    this.applyRegionalFilter()
  }

  applyRegionalFilter(): void {
    if (!this.selectedRegion) {
      this.allStudents = [...this.initialStudents];
      return;
    }

    // ➤ Étape 1 : filtrer uniquement les étudiants qui ont envoyé leur SocialForm
    const eligibleStudents = this.initialStudents.filter(s => s.isSocialFormSent);
    const studentIds = eligibleStudents.map(s => s.id);

    // console.log('📥 Étudiants avec formulaire rempli :', studentIds);

    if (studentIds.length === 0) {
      this.allStudents = []; // Aucun formulaire rempli => aucun résultat
      return;
    }

    this.regionalService.getSocialForms(studentIds).subscribe(socialForms => {
      // console.log('📬 Social forms récupérés :', socialForms);

      // const postalCodes = Object.values(socialForms)
      //   .map(form => form.postalCode)
      //   .filter(Boolean); // on garde uniquement les cp valides

      const postalCodes = Object.values(socialForms)
        .map(form => form.postalCode)
        .filter(cp => !!cp); // on garde que les vrais codes

      this.regionalService.getRegionsByPostalCodes(postalCodes).subscribe(mapping => {
        console.log('🗺️ Mapping CP -> Région :', mapping);

        this.allStudents = eligibleStudents.filter(student => {
          const cp = socialForms[student.id]?.postalCode;
          const region = mapping[cp];
          return region === this.selectedRegion;
        });

        console.log('✅ Étudiants après filtre régional :', this.allStudents);
      });
    });
  }

  onSelectDepartment(department: string | null): void {
    this.selectedDepartment = department && department !== 'null' ? department : null;
    console.log('Département sélectionné :', this.selectedDepartment);

    this.applyDepartmentalFilter();
  }


  applyDepartmentalFilter(): void {
    if (!this.selectedDepartment) {
      this.allStudents = [...this.initialStudents];
      return;
    }

    const eligibleStudents = this.initialStudents.filter(s => s.isSocialFormSent);
    const studentIds = eligibleStudents.map(s => s.id);

    if (studentIds.length === 0) {
      this.allStudents = [];
      return;
    }

    this.regionalService.getSocialForms(studentIds).subscribe(socialForms => {
      const postalCodes = Object.values(socialForms)
        .map(form => form.postalCode)
        .filter(cp => !!cp);

      this.regionalService.getDepartmentsByPostalCodes(postalCodes).subscribe(mapping => {
        this.allStudents = eligibleStudents.filter(student => {
          const cp = socialForms[student.id]?.postalCode;
          const dept = mapping[cp];
          return dept === this.selectedDepartment;
        });
      });
    });
  }



  /**
   * Méthode pour vérifier le CP d'un utilisateur par son ID (credential.uid),
   * puis récupérer les centerID et returnedPrior correspondants.
   */
  getCentersAndSocialFormByUserId(userId: string) {
    // Utiliser une méthode de service qui 
    // Récupère le document utilisateur dans la collection 'users' en fonction de l'ID de l'admin  
    // Si le champ CP est renseigné, on boucle sur chaque CP
    // Interroge la collection 'centers' pour chaque CP
    // Récupère les IDs des centres correspondant au CP
    // Interroge la collection 'socialForm' pour les centerIDs obtenus
    // Récupère les IDs des documents de la collection 'socialForm'

    this.service.getCentersAndSocialFormByUserId(userId)
      .subscribe(returnedPriors => {
        // console.log('ReturnedPriors:', returnedPriors);
        // Après avoir récupéré returnedPriors, on filtre la liste des étudiants
        this.filteredStudents = this.filterStudentsByPriorCenter(this.allStudents, returnedPriors);
        // console.log('Filtered Students:', this.filteredStudents);
      })

  }

  filterStudentsByPriorCenter(students: Student[], returnedPriors: string[]): Student[] {
    return students.filter(student => returnedPriors.includes(student.id));
  }

  // si on veut à terme afficher exclusivement les étudiants inscrits par le référent

  getReferentStudents() {
    const order = this.ascending ? 'asc' : 'desc';
    const referentUid = this.authService.getCurrentUserUid(); // Assurez-vous que cette méthode est bien synchrone ou ajustez si asynchrone.

    if (!referentUid) {
      console.error('Impossible de récupérer UID du référent.');
      return;
    }
    this.service.getStudents(order).pipe(
      tap(students => {
        // Stocker les données brutes avant toute transformation
        this.collectionStudents = students;
        // console.log('Données brutes (collectionStudents) :', this.collectionStudents);
      }),
      map(students => students.filter(student => student.referent === referentUid))
    ).subscribe(filteredStudents => {
      this.initialStudents = filteredStudents; // Stocker la liste initiale
      this.allStudents = [...this.initialStudents]; // Initialiser allStudents
      this.applyFilters();
    });
  }

  // myCp: string[] = []
  // filteredTrainers : string[] = []


  // getTrainersWithSameCp(userId: string) {
  //   this.trainerService.getReferentData(userId).subscribe(referentData => {
  //     this.myCp = referentData.cp || []; // Garantir que `this.myCp` est un tableau

  //     console.log("Mes codes postaux :", this.myCp);

  //     // Étape 2 : Récupérer les formateurs et les filtrer
  //     this.trainerService.getTrainers().subscribe(trainers => {
  //       // Appliquer le filtre et assigner le résultat à `filteredTrainers`
  //       this.filteredTrainers = trainers.filter((trainer: any) => {
  //         // Vérifier si le formateur a au moins un code postal correspondant
  //         return trainer.cp?.some((cp: string) => this.myCp.includes(cp));
  //       });

  //       console.log("Trainers correspondants :", this.filteredTrainers);
  //     });
  //   });
  // }



  getMissingSubmitedForm() {
    // Appel à la fonction en cours de développement
    this.service.getStudentsNotSubmitted().subscribe(students => {
      console.log("Étudiants ayant commencé mais pas soumis :", students);

      // Afficher chaque étudiant avec son prénom et nom
      students.forEach(student => {

        // Convertir la date de création en objet Date si nécessaire
        const createdDate = new Date(student.created); // Si 'created' est un string représentant une date

        // Formater la date
        const formattedDate = createdDate.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        console.log(`Nom: ${student.lastName}, Prénom: ${student.firstName}, Date de création :${formattedDate}, Id:${student.id}, email :Id:${student.email} `);
      });
    });
  }


  // onSelectRegion(region: string) {
  //   this.selectedRegion = region;
  //   console.log('Région sélectionnée :', this.selectedRegion);
  // }

  // onSelectRegion(region: string | null) {
  //   this.selectedRegion = region && region !== 'null' ? region : null;
  //   console.log('Région sélectionnée :', this.selectedRegion);
  // }


  exportFilteredStudentsAsCSV(): void {
    try {
      // Utiliser toujours `this.oldStudents` pour l'export
      const headers = ['firstName', 'lastName', 'email'];  // Tu peux définir tes propres headers ici
      const csvContent = this.generateCSVContentFromData(this.allStudents, headers);  // Utiliser `this.oldStudents` pour obtenir les données filtrées

      // const blob = new Blob([csvContent], { type: 'text/csv' });
      const BOM = '\uFEFF'; // Byte Order Mark
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filtered_students_export.csv`;  // Le fichier sera toujours nommé de cette façon
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export des étudiants filtrés :', error);
      throw error;
    }
  }

  generateCSVContentFromData(data: any[], headers: string[]): string {
    const csvRows = [];

    // En-tête
    csvRows.push(headers.join(','));
    //  csvRows.push(headers.join(';'));

    // Données
    for (const item of data) {
      const row = headers.map(header => `"${(item[header] ?? '').toString().replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
      // csvRows.push(row.join(';'));
    }

    return csvRows.join('\n');
  }






}
