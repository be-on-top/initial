import { Component } from '@angular/core';
import { StudentsService } from '../../students.service';
import { Router } from '@angular/router';
import { Papa } from 'ngx-papaparse';
import { Student } from '../student';



@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css']
})
export class AddStudentComponent {

  lastName: string = "active";
  firstName: string = "";
  email: string = "";

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

  // si on envisage l'import csv
  csvFile: File | null = null; // Variable pour stocker le fichier CSV sélectionné
  parsedStudents: any[] = [];   // Tableau pour stocker les données analysées

  // gestion des messages de retour
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private service: StudentsService, private router: Router, private papa: Papa) { }

  ngOnInit(): void {

  }


  async addStudent(form: any) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    // juste pour l'exercice à virer !!!
    // form.value.firstName.length<8? alert(`la longueur de ${form.value.firstName} est de ${form.value.firstName.length} alors qu'un minimum de 8 est requis`):""

    console.log("form registration", form.value);
    this.service.createStudent(form.value).then(() => {
      // Signed in 
      // const user = userCredential
      this.feedbackMessages = `Enregistrement OK`;
      setTimeout(() => {
        window.location.reload();

      }, 1000)
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
    // this.router.navigate(['/admin/evaluators']);

  }

  // pour remontée en nombre
  // Fonction pour gérer la sélection de fichier avec PapaParse
  onFileChange(event: any): void {
    const file = event.target.files[0]; // Récupère le fichier sélectionné depuis l'événement
    if (file) {
      this.csvFile = file; // Stocke le fichier dans la variable csvFile
      console.log('Fichier CSV sélectionné:', file.name);
    } else {
      this.csvFile = null;
    }
  }

  // Fonction pour importer et analyser le fichier CSV
  importCSV(): void {
    if (!this.csvFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier CSV avant de procéder.';
      return;
    }

    // Analyse du fichier CSV grâce à PapaParse
    this.papa.parse(this.csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        console.log("Données du fichier CSV analysées :", result.data);

        // Valider et transformer les données du CSV pour correspondre au modèle `Student`
        const studentsToImport: Student[] = result.data.map((student: any) => ({
          firstName: student.firstName?.trim() || '', // Remplacez par les colonnes de votre CSV
          lastName: student.lastName?.trim() || '',
          email: student.email?.trim() || '',
          created: Date.now(),
          trainer: "Attribué ultérieurement",
          innerStudent: true,
          status: true,
        }));

        // Filtrer les entrées invalides (exemple : email manquant)
        this.parsedStudents = studentsToImport.filter(student => student.email);

        console.log('Étudiants analysés et prêts à être ajoutés:', this.parsedStudents);
        this.uploadStudentsToFirestore();
      },
      error: (error) => {
        console.error('Erreur lors de l\'analyse du fichier CSV:', error);
        this.errorMessage = 'Erreur lors de l\'analyse du fichier CSV.';
      }
    });
  }


  // fonctionnait avec createStudent mais faut l'admin n'est pas reconnecté
  // alors on essait createStudents
  uploadStudentsToFirestore(): void {
    if (!this.parsedStudents || this.parsedStudents.length === 0) {
      this.errorMessage = 'Aucun étudiant valide à importer.';
      return;
    }
  
    // Appeler createStudentsFromImport avec l'ensemble des étudiants
    this.service.createStudents(this.parsedStudents)
      .then(() => {
        console.log('Tous les étudiants ont été importés avec succès.');
      })
      .catch(error => {
        console.error('Erreur lors de l\'importation des étudiants :', error.message);
        this.errorMessage = 'Erreur lors de l\'importation des étudiants.';
      });
  }
  


  
  


  // uploadStudentsToFirestore(): void {
  //   if (!this.parsedStudents || this.parsedStudents.length === 0) {
  //     this.errorMessage = 'Aucun étudiant valide à importer.';
  //     return;
  //   }
  
  //   // Préparer les étudiants avant import
  //   const studentsToCreate = this.parsedStudents.map(student => ({
  //     ...student,
  //     created: Date.now(),
  //     role: 'student',
  //     status: true,
  //     trainer: "Attribué ultérieurement",
  //     innerStudent: true,
  //   }));
  
  //   // Appeler la méthode d'import dans le service
  //   this.service.createStudent(studentsToCreate)
  //     .then(() => {
  //       console.log('Tous les étudiants ont été importés, et l\'administrateur est reconnecté.');
  //     })
  //     .catch(error => {
  //       console.error('Erreur lors de l\'importation des étudiants :', error.message);
  //       this.errorMessage = 'Erreur lors de l\'importation des étudiants.';
  //     });
  // }
  


  
  





}
