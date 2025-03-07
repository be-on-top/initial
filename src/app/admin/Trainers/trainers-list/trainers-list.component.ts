import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { Trainers } from '../../evaluators';
import { TrainersService } from '../../trainers.service';
import { SettingsService } from '../../settings.service';
import { CentersService } from '../../centers.service';
import { UsersService } from '../../users.service';
import { AuthService } from '../../auth.service';
import { Centers } from '../../centers';
import { Trainer } from '../../trainer';

@Component({
  selector: 'app-trainers-list',
  // templateUrl: '../../shared/users-list.component.html',
  templateUrl: './trainers-list.component.html',
  styleUrls: ['./trainers-list.component.css']
})
export class TrainersListComponent {


  // allUsers: Trainer[] = []
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  trainersList: Trainer[] = []

  // pour récupérer côté composant l'uid dont on va avoir besoin pour le changement de paradigme...
  userUid: string | null = '';


  // pour différencier la vue si user referent
  userRouterLinks: any

  constructor(
    private router: Router,
    private service: TrainersService,
    // private settingsService: SettingsService,
    private centersService: CentersService,
    // private usersService: UsersService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {

    this.userRouterLinks = this.activatedRoute.snapshot.data;

  }

  ngOnInit(): void {

    // Récupérer l'UID de manière synchrone

    this.userUid = this.authService.getCurrentUserUid();

    console.log('UID de l\'utilisateur authentifié dans le composant §§§§§§§§§§§§§§§§§§§§§§§§§ :', this.userUid);

    // On peut maintenant utiliser cet UID pour d'autres opérations

    if (this.userUid) {

      // logique totalement opérationnelle jusqu'au 04/03/2025
      // this.userRouterLinks.user == 'referent' ? this.getTrainersWithSameCp(this.userUid) : this.getTrainers()


      // ++ logique qui semble opérationnelle si traitment différencié :
      this.getTrainersWithSameCpAndTrades(this.userUid)

    }


  }

  getTrainers() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allEvaluators=this.service.getTrainers(); devient donc nécessairement
    this.service.getTrainers().subscribe(data => {
      console.log("data de getTrainers()", data)
      this.trainersList = data
      return this.trainersList
    })

  }

  deleteUser(trainerid: string) {
    console.log(trainerid);

    this.service.deleteTrainer(trainerid)
    this.router.navigate(['admin/trainers'])
    // .then(()=>{

    // })
    // .catch(()=>{

    // })
  }

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue
    console.log(this.searchText);
  }


  myCp: string[] = []
  // c'était pour tests préalable à la reconaissance de userRouterLink...
  // filteredTrainers: Trainer[] = []

  getTrainersWithSameCp(userId: string) {
    this.service.getReferentData(userId).subscribe(referentData => {
      console.log("referentData", referentData);
      this.myCp = referentData.cp || []; // Garantir que `this.myCp` est un tableau

      console.log("Mes codes postaux :", this.myCp);
      // Étape 2 : Récupérer les formateurs et les filtrer
      this.service.getTrainers().subscribe(trainers => {
        // Appliquer le filtre et assigner le résultat à `filteredTrainers`
        // this.filteredTrainers = trainers.filter((trainer: any) => {
        this.trainersList = trainers.filter((trainer: any) => {
          // Vérifier si le formateur a au moins un code postal correspondant
          return trainer.cp?.some((cp: string) => this.myCp.includes(cp));
        });

        console.log("Trainers correspondants :", this.trainersList);
        // this.getDedicatedTrainer()
        // this.getCentersWithSameCp(userId)
      })

    })

  }


  filteredCenters: Centers[] = []

  // fonctionne mais pas pertinent sur la liste (à voir si exploité pour des filtres côté vue...)
  getCentersWithSameCp(userId: string) {
    // Récupérer les centres
    this.centersService.getCenters().subscribe(centers => {
      // Filtrer les centres
      this.filteredCenters = centers.filter((center: any) => {
        console.log("center.cp :", center.cp, "Type :", typeof center.cp);
        // Vérifie si center.cp (string) est dans myCp (tableau)
        return this.myCp.includes(center.cp);
      });

      console.log("Centers correspondants :", this.filteredCenters);
      this.filteredCenters.forEach(center => console.log("Sigles :", center.sigles));
    })
  }


  dedicatedTrades?: any
  // on essaie une méthode unique pour cumuler deux filtres si centerId est requis
  // getTrainersWithSameCpAndTrades(userId: string) {
  //   // Récupérer les données du référent
  //   this.service.getReferentData(userId).subscribe({
  //     next: referentData => {
  //       console.log("referentData", referentData);

  //       // Récupérer les codes postaux du référent
  //       this.myCp = referentData.cp || []; // Garantir que `this.myCp` est un tableau
  //       console.log("Mes codes postaux :", this.myCp);

  //       // Récupérer les identifiants des centres du référent
  //       const centerIds = referentData.centerId;
  //       if (Array.isArray(centerIds) && centerIds.length > 0) {
  //         console.log('centerId trouvé:', centerIds);

  //         // Récupérer les sigles des centres
  //         this.centersService.getUserCentersSigles(centerIds).subscribe({
  //           next: data => {
  //             console.log('Données reçues pour les centres:', data);
  //             this.dedicatedTrades = data; // Assigner les sigles à dedicatedTrades

  //             // Maintenant récupérer les formateurs
  //             this.service.getTrainers().subscribe(trainers => {
  //               console.log(trainers);

  //               // Filtrer les formateurs en fonction des codes postaux et des sigles
  //               this.trainersList = trainers.filter((trainer: any) => {
  //                 // Vérifier si le formateur a un code postal correspondant
  //                 const matchesCp = trainer.cp?.some((cp: string) => this.myCp.includes(cp));

  //                 // Vérifier si au moins un sigle du formateur existe dans dedicatedTrades
  //                 const matchesSigles = trainer.sigle?.some((sigle: string) => this.dedicatedTrades.includes(sigle));

  //                 // Le formateur est inclus s'il correspond à la fois sur le code postal et les sigles
  //                 return matchesCp && matchesSigles;
  //               });

  //               console.log("Trainers correspondants :", this.trainersList);
  //             });
  //           },
  //           error: error => {
  //             console.error('Erreur dans l\'appel à getUserCentersSigles:', error);
  //           }
  //         });
  //       } else {
  //         console.log('centerId est vide ou invalide');
  //       }
  //     },
  //     error: error => {
  //       console.error('Erreur dans la récupération des données du référent:', error);
  //     }
  //   });
  // } 

  // léger ajustement si dedicatedTrades est vide ou non défini,
  // on ne filtre que sur le code postal. Sinon, on applique les deux critères.
  getTrainersWithSameCpAndTrades(userId: string) {
    this.service.getReferentData(userId).subscribe({
      next: referentData => {
        console.log("referentData", referentData);
  
        this.myCp = referentData.cp || []; // Codes postaux
        const centerIds = referentData.centerId;
  
        if (Array.isArray(centerIds) && centerIds.length > 0) {
          this.centersService.getUserCentersSigles(centerIds).subscribe({
            next: data => {
              this.dedicatedTrades = data; // Métiers liés aux centres
  
              this.service.getTrainers().subscribe(trainers => {
                this.trainersList = trainers.filter((trainer: any) => {
                  const matchesCp = trainer.cp?.some((cp: string) => this.myCp.includes(cp));
                  const matchesSigles = trainer.sigle?.some((sigle: string) => this.dedicatedTrades.includes(sigle));
  
                  return matchesCp && matchesSigles;
                });
  
                console.log("Trainers correspondants :", this.trainersList);
              });
            },
            error: error => console.error('Erreur dans l\'appel à getUserCentersSigles:', error)
          });
        } else {
          // Si centerId est vide ou non défini, on ne filtre que sur les codes postaux
          this.service.getTrainers().subscribe(trainers => {
            this.trainersList = trainers.filter((trainer: any) => {
              return trainer.cp?.some((cp: string) => this.myCp.includes(cp));
            });
  
            console.log("Trainers correspondants :", this.trainersList);
          });
        }
      },
      error: error => console.error('Erreur dans la récupération des données du référent:', error)
    });
  }
  
  



}

