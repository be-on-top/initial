import { Component } from '@angular/core';
import { TrainersService } from '../../trainers.service';
import { Router } from '@angular/router';
import { EvaluatorsService } from '../../evaluators.service';
import { NgForm } from '@angular/forms';

import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'app-add-trainer',
  templateUrl: './add-trainer.component.html',
  styleUrls: ['./add-trainer.component.css']
})
export class AddTrainerComponent {

  lastName: string = "active";
  firstName: string = "";
  email: string = "";
  selectedSigles: string[] = []
  registryEvaluators: any[] = []

  feedbackMessages?: any = ""
  isSuccessMessage: boolean = true
  // essai pour personnaliser les messages
  // https://firebase.google.com/docs/auth/admin/errors?hl=fr
  firebaseErrors: any = {
    'auth/user-not-found': 'Aucun utilisateur ne correspond à cet email',
    'auth/email-already-in-use': 'Cet email est déjà utilisé pour un autre compte',
    'auth/wrong-password': 'Le mot de passe est incorrect',
    'auth/invalid-email': 'Aucun enregistrement ne correspond au mail fourni'
  }; // list of firebase error codes to alternate error messages

  constructor(private service: TrainersService, private router: Router, private evaluatorsService: EvaluatorsService, private papa: Papa) { }

  ngOnInit(): void {
    this.evaluatorsService.getEvaluators().subscribe(data => {
      // marche bien mais ne fait pas de double vérification si évaluateur déjà dans les 2 collections...
      // console.log(data);
      // for (let e of data) {
      //   // console.log(this.registryNumbers);
      //   this.registryEvaluators = [...this.registryEvaluators, e]
      //   console.log("result des évaluateurs", this.registryEvaluators);
      // }


      // Vérifier pour chaque évaluateur s'il est déjà formateur !!!!!!!!!
      // Donc double les requêtes... 
      this.service.getTrainers().subscribe(trainers => {
        const trainerIds = trainers.map(t => t.id); // Récupérer les IDs des formateurs
        // Filtrer les évaluateurs qui ne sont pas encore formateurs
        for (let e of data) {
          // console.log(this.registryNumbers);
          this.registryEvaluators = [...this.registryEvaluators, e]
          console.log("result des évaluateurs", this.registryEvaluators);
        }
        this.registryEvaluators = data.filter(e => !trainerIds.includes(e.id));
      });


      // return this.registryNumbers
    })

  }


  async addTrainer(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    console.log("form registration", form.value);
    this.service.createTrainer(form.value).then((userCredential) => {
      // Signed in 
      const user = userCredential;
      this.feedbackMessages = `Enregistrement OK`;

      // alert("registration ok")
      setTimeout(() => {
        this.router.navigate(['/admin/trainers'])
      }, 2000)
      // this.router.navigate(['/admin/trainers']);
      // ...
    })
      .catch((error) => {
        this.feedbackMessages = error.message;
        this.feedbackMessages = this.firebaseErrors[error.code];
        this.isSuccessMessage = false;
        console.log(this.feedbackMessages);

        // ..};
      })
    // form.reset();
    // redirige vers la vue de détail 
    // this.router.navigate(['/admin/trainers']);

  }

  // pour affecation métier de l'évaluateur
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }

  addRole(form: NgForm) {
    console.log(form.value.idEval)
    this.service.addRoleToEvaluator(form.value.idEval)

  }


  // gestion des imports en masse
  async importTrainersFromCSV(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      // Lecture du fichier
      const reader = new FileReader();

      // Forcer l'encodage en UTF-8
      // reader.readAsText(file, 'UTF-8'); // Ajout explicite de l'encodage UTF-8 


      reader.onload = () => {
        const csvData = reader.result as string;

        // Parser avec 'Papa'
        const result = this.papa.parse(csvData, {
          header: true,          // Utilise les en-têtes comme clés
          skipEmptyLines: true, // Ignore les lignes vides
        });

        try {
          // Formatage des données
          const trainersToImport = result.data.map((trainer: any) => ({
            lastName: trainer['lastName']?.trim(),
            firstName: trainer['firstName']?.trim(),
            email: trainer['email']?.trim(),
            cp: trainer['cp']?.trim(),
            sigle: trainer['sigles']?.trim(),
            comment: trainer['status']?.trim()
          }));

          console.log('Données formatées :', trainersToImport);

          // Appel à la méthode de création en masse
          this.service.createTrainers(trainersToImport)
            .then(() => {
              console.log('Importation réussie !');
              resolve();
            })
            .catch((error) => {
              console.error('Erreur de création :', error);
              reject(error);
            });
        } catch (error) {
          console.error('Erreur de traitement des données CSV :', error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('Erreur de lecture du fichier :', error);
        reject(error);
      };

      reader.readAsText(file); // Lire le fichier en texte brut
    });

  }

  // pour des tests en console exclusivement
  // async importTrainersFromCSV(file: File): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     // Lecture du fichier
  //     const reader = new FileReader();

  //     reader.onload = () => {
  //       const csvData = reader.result as string;

  //       // Parser avec 'Papa'
  //       const result = this.papa.parse(csvData, {
  //         header: true,          // Utilise les en-têtes comme clés
  //         skipEmptyLines: true, // Ignore les lignes vides
  //       });

  //       try {
  //         // Formatage des données
  //         const trainersToImport = result.data.map((trainer: any) => ({
  //           lastName: trainer['lastName']?.trim(),
  //           firstName: trainer['firstName']?.trim(),
  //           email: trainer['email']?.trim(),
  //           cp: trainer['cp']?.trim(),
  //           sigle: trainer['sigles']?.trim(),
  //         }));

  //         console.log('Données formatées :', trainersToImport);

  //         // TEMPORAIREMENT désactivé pour test
  //         /*
  //         this.service.createTrainers(trainersToImport)
  //           .then(() => {
  //             console.log('Importation réussie !');
  //             resolve();
  //           })
  //           .catch((error) => {
  //             console.error('Erreur de création :', error);
  //             reject(error);
  //           });
  //         */

  //         // Simuler la résolution de la promesse
  //         resolve();
  //       } catch (error) {
  //         console.error('Erreur de traitement des données CSV :', error);
  //         reject(error);
  //       }
  //     };

  //     reader.onerror = (error) => {
  //       console.error('Erreur de lecture du fichier :', error);
  //       reject(error);
  //     };

  //     reader.readAsText(file); // Lire le fichier en texte brut
  //   });
  // }





  selectedFile: File | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadCSV() {
    if (this.selectedFile) {
      this.importTrainersFromCSV(this.selectedFile).then(() => {
        console.log('Import terminé.');
      }).catch((err) => {
        console.error('Erreur lors de l\'import :', err);
      });
    }
  }







  // registryEvaluators: any[] = [];
  selectedEvaluator: any = null;
  isExistingEvaluatorSelected: boolean = false;

  // Sélection d’un évaluateur
  onEvaluatorSelected(evaluatorId: string) {
    this.isExistingEvaluatorSelected = !!evaluatorId;
    this.selectedEvaluator = this.registryEvaluators.find(e => e.id === evaluatorId);
    this.service.addRoleToEvaluator(evaluatorId);

  }

  // Ajouter un évaluateur comme formateur
  async addEvaluatorAsTrainer(form: NgForm) {
    if (!form.valid) return;

    // const evaluatorId = form.value.idEval;
    const evaluator = this.selectedEvaluator;

    try {
      evaluator.sigles = form.value.sigle;
      await this.service.addEvaluatorAsTrainer(evaluator);
      // alert('Évaluateur ajouté en tant que formateur avec succès.');
    } catch (error) {
      console.error(error);
      // alert('Erreur lors de l’ajout.');
    }
  }

  // Mettre à jour les expertises : juste  une mise à jour. Ne convient pas donc...
  // async updateTrainerExpertises(form: NgForm) {
  //   if (!form.valid || !this.selectedEvaluator) return;

  //   const sigles = form.value.sigle;

  //   try {
  //     await this.service.updateTrainerExpertises(this.selectedEvaluator.id, sigles);
  //     alert('Expertises mises à jour avec succès.');
  //   } catch (error) {
  //     console.error(error);
  //     alert('Erreur lors de la mise à jour des expertises.');
  //   }
  // }





}


