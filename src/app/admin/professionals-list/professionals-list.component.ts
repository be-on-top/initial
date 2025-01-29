import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { TrainersService } from '../trainers.service';
import { EvaluatorsService } from '../evaluators.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-professionals-list',
  templateUrl: './professionals-list.component.html',
  styleUrls: ['./professionals-list.component.css']
})
export class ProfessionalsListComponent implements OnInit {

  evaluatorsList: any[] = [];
  trainersList: any[] = [];
  referentsList: any[] = [];
  editorsList: any[] = [];
  externalsList: any[] = [];
  isLoading = true; // Indicateur de chargement

  constructor(
    private usersService: UsersService,
    private trainersService: TrainersService,
    private evaluatorsService: EvaluatorsService
  ) { }

  ngOnInit(): void {
    this.evaluatorsService.getEvaluators().subscribe(evaluators => {
      this.evaluatorsList = evaluators;
    });

    this.trainersService.getTrainers().subscribe(trainers => {
      this.trainersList = trainers;
    });

    // this.usersService.getUsers().subscribe((users: any[]) => {
    //   console.log("🔥 Firestore users:", users); // Vérification des données reçues

    //   if (Array.isArray(users)) {
    //     this.referentsList = users.filter(user => 
    //       Array.isArray(user.roles) ? user.roles.includes('referent') : user.role === 'referent'
    //     );
    //   } else {
    //     console.warn("⚠️ Aucune donnée récupérée ou mauvais format !");
    //   }

    //   this.isLoading = false; // Fin du chargement
    //   console.log("✅ Referents list:", this.referentsList);
    // }, error => {
    //   console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
    //   this.isLoading = false;
    // });

    //   this.usersService.getUsers().subscribe({
    //     next: (users: any[]) => {
    //       console.log("🔥 Firestore users:", users);
    //       this.referentsList = users.filter(user => user.role === 'referent');
    //       this.editorsList = users.filter(user => user.role === 'editor');
    //       this.externalsList = users.filter(user => user.role === 'external');


    //       console.log("✅ Referents list:", this.referentsList);
    //       console.log("✅ Editors List:", this.editorsList);
    //       console.log("✅ Externals List:", this.externalsList);

    //     },
    //     error: (error) => {
    //       console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
    //     },
    //     complete: () => {
    //       console.log("✅ Récupération des utilisateurs terminée.");
    //     }
    //   });

    // }

    // pour faire mieux en une seule boucle
    this.usersService.getUsers().subscribe({
      next: (users: any[]) => {
        console.log("🔥 Firestore users:", users);

        // Réinitialiser les listes avant d'ajouter les nouveaux éléments
        this.referentsList = [];
        this.editorsList = [];
        this.externalsList = [];

        users.forEach(user => {
          if (user.role === 'referent') {
            this.referentsList.push(user);
          } else if (user.role === 'editor') {
            this.editorsList.push(user);
          } else if (user.role === 'external') {
            this.externalsList.push(user);
          }
        });

        console.log("✅ Evaluators List:", this.evaluatorsList);
        console.log("✅ Trainers List:", this.trainersList);
        console.log("✅ Referents List:", this.referentsList);
        console.log("✅ Editors List:", this.editorsList);
        console.log("✅ Externals List:", this.externalsList);
      },
      error: (error) => {
        console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
      },
      complete: () => {
        console.log("✅ Récupération des utilisateurs terminée.");
      }
    });
  }


}
