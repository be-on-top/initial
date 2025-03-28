// import { Component, Input, OnInit } from '@angular/core';

// import { BehaviorSubject } from 'rxjs';
// import { QuestionsService } from '../../questions.service';
// import { SettingsService } from '../../settings.service';

// @Component({
//   selector: 'app-delete-all-questions',
//   templateUrl: './delete-all-questions.component.html',
//   styleUrls: ['./delete-all-questions.component.scss']
// })
// export class DeleteAllQuestionsComponent implements OnInit {
//   @Input() selectedSigle!: string | null; // Sigle sélectionné
//   siglesList: string[] = []; // Liste des sigles récupérés depuis Firestore
//   sigleSubject = new BehaviorSubject<string | null>(this.selectedSigle); // Sujet pour gérer la sélection dynamique du sigle

//   constructor(
//     private service: QuestionsService,
//     private sigleService: SettingsService // Le service pour récupérer les sigles
//   ) {}

//   ngOnInit() {
//     // Si selectedSigle est vide dans le localStorage
//     const storedSigle = localStorage.getItem("selectedSigle");
//     if (!storedSigle) {
//       // Récupérer les sigles de la collection "Sigle" si aucun sigle n'est stocké
//       this.sigleService.getSigleIds().then(sigles => {
//         this.siglesList = sigles;
//         console.log("Sigles récupérés : ", this.siglesList);
//       });
//     } else {
//       // Sinon, on initialise le sigle depuis localStorage
//       this.selectedSigle = storedSigle;
//     }
//   }

//   // Fonction pour sélectionner un sigle
//   selectSigle(sigle: string) {
//     this.selectedSigle = sigle;
//     localStorage.setItem("selectedSigle", sigle); // Sauvegarder le sigle dans localStorage
//     this.sigleSubject.next(sigle); // Mettre à jour le sigle sélectionné
//   }

//   async deleteAllQuestions() {
//     if (!this.selectedSigle) {
//       alert("Veuillez sélectionner un sigle.");
//       return;
//     }

//     if (!window.confirm("Êtes-vous certain de vouloir supprimer toutes les questions de ce questionnaire ? Cette action est irrévocable.")) {
//       return;
//     }

//     try {
//       const questionIds = await this.service.getQuestionIdsBySigle(this.selectedSigle);

//       if (questionIds.length === 0) {
//         alert("Aucune question à supprimer !");
//         return;
//       }

//       console.log(`✅ Suppression de ${questionIds.length} questions pour le sigle : ${this.selectedSigle}`);

//       for (const id of questionIds) {
//         await this.service.deleteQuestionById(id);
//       }

//       alert("Toutes les questions ont été supprimées avec succès !");
//     } catch (error) {
//       console.error("❌ Erreur lors de la suppression :", error);
//     }
//   }
// }

import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '../../questions.service';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'app-delete-all-questions',
  templateUrl: './delete-all-questions.component.html',
  styleUrls: ['./delete-all-questions.component.css']
})
export class DeleteAllQuestionsComponent implements OnInit {
  siglesList: string[] = []; // Liste des sigles
  selectedSigle: string | null = null; // Sigle sélectionné
  questionIds: string[] = []; // Liste des IDs des questions à supprimer

  constructor(
    private questionsService: QuestionsService,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    try {
      this.siglesList = await this.settingsService.getSigleIds();
      console.log("📌 Sigles disponibles :", this.siglesList);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des sigles :", error);
    }
  }

  async selectSigle(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedSigle = selectElement.value;
    this.questionIds = [];

    if (this.selectedSigle) {
      try {
        this.questionIds = await this.questionsService.getQuestionIdsBySigle(this.selectedSigle);
        console.log(`📌 ${this.questionIds.length} questions trouvées pour ${this.selectedSigle}.`);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des questions :", error);
      }
    }
  }

  async deleteAllQuestions() {
    if (!this.selectedSigle || this.questionIds.length === 0) {
      alert("Aucune question à supprimer !");
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${this.questionIds.length} questions pour ${this.selectedSigle} ?`)) {
      return;
    }

    try {
      await Promise.all(this.questionIds.map(id => this.questionsService.deleteQuestionById(id)));

      alert("✅ Suppression réussie !");
      this.questionIds = []; // On vide la liste après suppression
    } catch (error) {
      console.error("❌ Erreur lors de la suppression :", error);
    }
  }
}
