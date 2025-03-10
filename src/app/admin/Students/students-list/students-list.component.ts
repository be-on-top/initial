import { AfterViewInit, Component, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { Student } from '../student';
import { ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs';
import { SettingsService } from '../../settings.service';
import { Trade } from '../../trade';
import { Users } from '../../Users/users';
import { AuthService } from '../../auth.service';
import { User } from 'firebase/auth';
import { TrainersService } from '../../trainers.service';
import { UsersService } from '../../users.service';

@Component({
  selector: 'app-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.css']
})
export class StudentsListComponent implements OnInit, AfterViewInit {

  // Nouvelle propriété pour stocker les données brutes
  collectionStudents: any[] = [];

  allStudents: any[] = [];



  // pour différencier la vue si user external
  userRouterLinks: any;

  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  // pour récupérer les métiers et en faire des filtres
  trades: string[] = []

  // pour récupérer côté composant l'uid dont on va avoir besoin pour le changement de paradigme...
  userUid: string | null = null;

  filteredStudents: Student[] = []; // Liste des étudiants filtrée

  isSocialFormSentFilter: boolean = false;
  isSubscriptionFilter: boolean = false
  initialStudents: any[] = []; // Copie initiale des étudiants

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

  cpArray:string[]=[]

  constructor(
    private service: StudentsService,
    private activatedRoute: ActivatedRoute,
    private tradeService: SettingsService,
    private authService: AuthService,
    private trainerService: TrainersService,
  private userService:UsersService) {
    this.userRouterLinks = this.activatedRoute.snapshot.data;

    // implémenter la méthode conçue pour les "conseillers projets" qui n'en sont pas puisqu'ils se font concurrence (référents admin)
    // Récupérer l'UID de manière synchrone
    this.userUid = this.authService.getCurrentUserUid();
    console.log('UID de l\'utilisateur authentifié dans le composant :', this.userUid);

    // On peut maintenant utiliser cet UID pour d'autres opérations
    if (this.userUid) {
      // Exécuter la méthode interminable pour le changement de paradigme
      this.getCentersAndSocialFormByUserId(this.userUid)
      this.userService.getUser(this.userUid).subscribe(data=>this.cpArray=data.cp)

      // Une méthode qui s'en inspière mais va me retourner
      // la liste des formateurs et ceux qui ont le même tableau de cp
      // ou ceux dont un des cp du tableau est contenu dans le tableau des cp du compte authentifié
      // this.getTrainersWithSameCp(this.userUid)




    }


  }

  ngOnInit() {

    this.getStudents();
    this.onSearchTextEntered("")

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
          console.log('Données brutes (collectionStudents) :', this.collectionStudents);
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
            console.log('IDs prior récupérés :', returnedPriors);
  
            // Étape 2 : Filtrer les étudiants par référent ou prior (qui a terminé et envoyé le formulaire)
            const filteredStudents = this.allStudents.filter(student =>
              student.referent === referentUid || (returnedPriors.includes(student.id) && student.isSocialFormSent)
            );
            console.log('Étudiants filtrés (référent + prior) :', filteredStudents);
  
            // Initialisation pour le référent
            this.initialStudents = [...filteredStudents]; 
            this.allStudents = [...this.initialStudents];
  
            // Mise à jour des filtres dynamiques pour prior uniquement
            this.filteredStudents = filteredStudents.filter(student => 
              returnedPriors.includes(student.id)
            );
            console.log('Filtered Prior Students :', this.filteredStudents);
  
            this.applyFilters(); // Appliquer les filtres actuels
          });
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

        console.log('Étudiants sans intérêt :', this.studentsWithNoInterest);

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

    if (this.isSocialFormSentFilter) {
      this.allStudents = this.initialStudents.filter(student => student.isSocialFormSent);
    } else if (this.isSubscriptionFilter) {
      this.allStudents = this.initialStudents.filter(student => student.subscriptions);
      this.tradesActivated = true
    } else if (this.isTradeFilter) {
      this.allStudents = this.initialStudents.filter(student => student.subscriptions && student.subscriptions.includes(trade));

    } else if (this.isTradeQCMStarted) {
      this.allStudents = this.initialStudents.filter(student => student['quizz_' + trade] && !student['quizz_' + trade].fullResults);
    }
    else if (this.isTradeFullQCM) {
      this.allStudents = this.initialStudents.filter(student => student['quizz_' + trade] && student['quizz_' + trade].fullResults);
    } else if (this.isQualifiedFilter) {
      this.allStudents = this.initialStudents.filter(student => student.endedSubscriptions);
    } else if (this.isPriorFilter) {
      this.allStudents = this.filteredStudents;
    } else if (this.myCenterStudents) {
      this.allStudents = this.initialStudents.filter(student => student.referent === this.userUid);
    } else {
      this.allStudents = [...this.initialStudents];
      this.tradesActivated = false
    }
  }

  onCheckboxChangePrior(event: any) {
    this.isPriorFilter = event.target.checked;
    this.applyFilters();
  }

  onCheckboxChangeSocial(event: any) {
    this.isSocialFormSentFilter = event.target.checked;
    this.applyFilters();
  }

  onCheckboxChangeSubscriptions(event: any) {
    this.isSubscriptionFilter = event.target.checked;
    this.applyFilters();
  }

  // inititalement destiné aux inscriptions officielles
  onCheckboxChangeTrades(event: any, trade: string) {
    this.isTradeFilter = event.target.checked;
    this.applyFilters(trade);
  }

  // puisqu'il faut compliquer
  onCheckboxChangeTradesForStartedQCM(event: any, trade: string) {
    this.isTradeQCMStarted = event.target.checked;
    this.applyFilters(trade);
  }
  onCheckboxChangeTradesForFullQCM(event: any, trade: string) {
    this.isTradeFullQCM = event.target.checked;
    this.applyFilters(trade);
  }


  onCheckboxChangeEndedTraining(event: any) {
    this.isQualifiedFilter = event.target.checked;
    this.applyFilters();
  }
  onCheckboxChangeMyInitialStudents(event: any) {
    this.myCenterStudents = event.target.checked;
    this.applyFilters();
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
        console.log('ReturnedPriors:', returnedPriors);
        // Après avoir récupéré returnedPriors, on filtre la liste des étudiants
        this.filteredStudents = this.filterStudentsByPriorCenter(this.allStudents, returnedPriors);
        console.log('Filtered Students:', this.filteredStudents);
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
        console.log('Données brutes (collectionStudents) :', this.collectionStudents);
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
  
  


  




}
