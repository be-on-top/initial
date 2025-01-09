import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainersService } from '../../trainers.service';
import { StudentsService } from '../../students.service';
// import { getToken, getMessaging } from '@firebase/messaging';
import { PushNotificationService } from 'src/app/push-notification.service';
import { SettingsService } from '../../settings.service';
import { AuthService } from '../../auth.service';
import { Trainer } from '../../trainer';
import { CentersService } from '../../centers.service';
import { UsersService } from '../../users.service';
import { Centers } from '../../centers';
import { Trade } from '../../trade';

@Component({
  selector: 'app-update-trainer',
  templateUrl: './update-trainer.component.html',
  styleUrls: ['./update-trainer.component.css']
})
export class UpdateTrainerComponent implements OnInit {
  userId: any
  user: any = {}
  selectedSigles: string[] = []
  // pour affecter des étudiants à son compte
  studentsList: any = []
  // pour le champs de recherche à intégrer au select
  searchText: string = ''; // Assurez-vous de définir la propriété searchText ici
  selectedStudent: string[] = []; // Déclarer en tant que tableau de chaînes
  // ... Autres propriétés et initialisation ...
  trainersList: any[] = []
  // pour récupérer côté composant l'uid dont on va avoir besoin pour le changement de paradigme...
  userUid: string | null = '';

  // tradesData?: Trade[]=[]
  // si on se contente de récupérer le sigle
  tradesData?: string[] = []



  constructor(
    private service: TrainersService,
    private ac: ActivatedRoute,
    private router: Router,
    private studentsService: StudentsService,
    private settingsService: SettingsService,
    // private authService: AuthService,
    // private trainerService: TrainersService,
    // private centersService: CentersService,
    // private usersService: UsersService,
    private notificationsService: PushNotificationService
  ) {
    this.userId = this.ac.snapshot.params["id"];
  }

  ngOnInit(): void {
    // on fait appel à geTrainer pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getTrainer(this.userId).subscribe((data) => {
      console.log("data depuis update-user component", data);
      this.user = data;
      // pour récupérer ce qui est à l'état de tableau dans le doc firestore
      this.user.cp = data.cp.join(', ')
      this.selectedStudent = this.user.students
    })

    // parce que j'ai besoin de récupérer la liste pour les affectations
    this.studentsService.getStudents().subscribe((students) => {
      this.studentsList = students.filter(student => student.subscriptions);
    })

    // essai > a été transféré à la liste trainersList component...
    // Récupérer l'UID de manière synchrone
    // this.userUid = this.authService.getCurrentUserUid();
    // console.log('UID de l\'utilisateur authentifié dans le composant :', this.userUid);
    // // On peut maintenant utiliser cet UID pour d'autres opérations
    // if (this.userUid) {
    //   this.getTrainersWithSameCp(this.userUid)
    // }


    // essai pour récupérer une liste des métiers 
    this.settingsService.getTrades().subscribe(trades => {
      trades.forEach(trade => this.tradesData?.push(trade.sigle))
    })

  }



  updateUser(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form non valid')
      return
    }

    console.log("form update values", form.value);
    this.service.updateTrainer(this.userId, form.value)
    // pour notifier le(s) candidat(s) concerné(s)
    // this.notificationsService.notifyStudent(form.value)
    // puis redirection
    this.router.navigate(['/admin/trainer', this.userId])
  }

  // pour affecation métiers
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }


  // myCp: string[] = []
  // filteredTrainers: Trainer[] = []

  // getTrainersWithSameCp(userId: string) {
  //   Étape 1 : Récupérer les données du referent en charge
  //   this.trainerService.getReferentData(userId).subscribe(referentData => {
  //     console.log("referentData", referentData);
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
  //       // this.getDedicatedTrainer()
  //     })
  //     this.getCentersWithSameCp(this.userId)
  //   });
  // }


  // filteredCenters: Centers[] = []

  // // fonctionne mais double appel à getReferentData si on garde l'ensemble...
  // getCentersWithSameCp(userId: string) {
  //   // this.trainerService.getReferentData(userId).subscribe(referentData => {
  //   //   console.log("referentData", referentData);
  //   //   // Initialiser myCp comme tableau
  //   //   this.myCp = referentData.cp || [];
  //   //   console.log("Mes codes postaux :", this.myCp);
  //     // Récupérer les centres
  //     this.centersService.getCenters().subscribe(centers => {
  //       // Filtrer les centres
  //       this.filteredCenters = centers.filter((center: any) => {
  //         console.log("center.cp :", center.cp, "Type :", typeof center.cp);
  //         // Vérifie si center.cp (string) est dans myCp (tableau)
  //         return this.myCp.includes(center.cp);
  //       });
  //       console.log("Centers correspondants :", this.filteredCenters);
  //       this.filteredCenters.forEach(center => console.log("Sigles :", center.sigles));
  //     });
  //   // });
  // }


}


