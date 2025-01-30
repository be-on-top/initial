import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { TrainersService } from '../trainers.service';
import { EvaluatorsService } from '../evaluators.service';

@Component({
  selector: 'app-professionals-list',
  templateUrl: './professionals-list.component.html',
  styleUrls: ['./professionals-list.component.css']
})
export class ProfessionalsListComponent implements OnInit {
  totalProAccounts: any[] = [];
  totalProAccountsFiltered: any[] = [];
  isLoading = true; // Indicateur de chargement

  constructor(
    private usersService: UsersService,
    private trainersService: TrainersService,
    private evaluatorsService: EvaluatorsService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    // Récupération des formateurs
    this.trainersService.getTrainers().subscribe(trainers => {
      trainers.forEach(trainer => {
        console.log("Ajout du formateur:", trainer.firstName, trainer.lastName, "UID:", trainer.id, "avec le type: trainer");
        this.totalProAccounts.push({ ...trainer, type: 'trainer' });
      });
    });

    // Récupération des évaluateurs
    this.evaluatorsService.getEvaluators().subscribe(evaluators => {
      evaluators.forEach(evaluator => {
        console.log("Ajout de l'évaluateur:", evaluator.firstname, evaluator.lastname, "UID:", evaluator.id, "avec le type: evaluator");
        this.totalProAccounts.push({ ...evaluator, type: 'evaluator' });
      });
    });

    // Récupération des autres professionnels depuis `users`
    this.usersService.getUsers().subscribe({
      next: (users: any[]) => {
        users.forEach(user => {
          let userType = user.role;
          console.log("Ajout de l'utilisateur:", user.firstName, user.lastName, "UID:", user.id, "avec le type:", userType);

          // Vérifier le contenu de `role` pour chaque utilisateur
          console.log(`Roles de ${user.firstName} ${user.lastName}:`, user.role);

          // Si role est un tableau, alors vérifier les rôles possibles
          if (Array.isArray(user.role)) {
            console.log(`${user.firstName} ${user.lastName} a ces rôles : ${user.role.join(', ')}`);
            user.role.forEach((role:string) => {
              console.log(`Ajout de l'utilisateur avec rôle : ${role}`);
              this.totalProAccounts.push({ ...user, type: role });
            });
          } else {
            this.totalProAccounts.push({ ...user, type: user.role });
          }
        });

        // Vérification de l'ensemble des données
        console.log("✅ TotalProAccounts après ajout des utilisateurs:", this.totalProAccounts);

        // Mettre à jour la liste filtrée
        this.totalProAccountsFiltered = [...this.totalProAccounts];
        this.isLoading = false;
      },
      error: (error) => {
        console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
        this.isLoading = false;
      }
    });
  }

  // Méthode pour obtenir tous les types uniques
  getUniqueTypes(): string[] {
    const uniqueTypes = [...new Set(this.totalProAccounts.map(pro => pro.type))];
    console.log("Types uniques détectés :", uniqueTypes); // Vérifie ce qui est généré
    return uniqueTypes;
  }

  // Méthode pour filtrer selon un type
  filterByType(type: string): void {
    this.totalProAccountsFiltered = this.totalProAccounts.filter(pro => pro.type === type);
  }

  // Méthode pour compter le nombre d'éléments par type
  countByType(type: string): number {
    return this.totalProAccounts.filter(pro => pro.type === type).length;
  }
}
