import { Component } from '@angular/core';
import { UsersService } from '../../users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Papa } from 'ngx-papaparse';
import { Users } from '../users';


@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})

export class AddUserComponent {

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

  userRouterLinks: any;
  title?: string
  linkToDetails: string = ""
  linkBackToList: string = ""

  // si on envisage l'import csv
  csvFile: File | null = null; // Variable pour stocker le fichier CSV sélectionné
  parsedReferents: any[] = [];   // Tableau pour stocker les données analysées


  // gestion des messages de retour
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private service: UsersService, private router: Router, private ac: ActivatedRoute, private papa: Papa) {
    this.userRouterLinks = this.ac.snapshot.data;
  }

  ngOnInit(): void {

    if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "managers") {
      this.title = "Manager (Responsable Métiers)"
      this.linkBackToList = '/admin/managers'
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "referents") {
      this.title = "Référents Administratifs"
      this.linkBackToList = '/admin/referents'
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "editors") {
      this.title = "Contributeurs"
      this.linkBackToList = '/admin/editors'
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "externals") {
      this.title = "Observateurs Externes"
      this.linkBackToList = '/admin/externals'
    }

  }


  async addUser(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }


    console.log("form registration", form.value);
    this.service.createUser(form.value).then(() => {
      // Signed in 
      // const user = userCredential
      this.feedbackMessages = `Enregistrement OK`;
      // alert("adminReconnected call")

      // alert("registration ok")
      setTimeout(() => {
        this.router.navigate([this.linkBackToList]);
        window.location.reload();

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

  }

  // pour affecation métier de l'évaluateur
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }

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
        console.log("result data", result.data);
  
        // Objet pour stocker les utilisateurs uniques par email
        const userMap: { [key: string]: any } = {};
  
        result.data.forEach((user: Users) => {
          if (user.email) {
            if (userMap[user.email]) {
              // Si l'email existe déjà, ajouter le cp à la liste des cps
              userMap[user.email].cp.push(user.cp);
            } else {
              // Sinon, créer un nouvel utilisateur avec cp comme tableau
              userMap[user.email] = {
                cp: [user.cp],
                email: user.email,
                firstName:user.firstName,
                lastName:user.lastName,
                role:'referent',
                tel:user.tel
              };
            }
          }
        });
  
        // Convertir l'objet en tableau
        this.parsedReferents = Object.values(userMap);
  
        console.log('Données analysées et fusionnées:', this.parsedReferents);
        this.uploadReferentsToFirestore();
      },
      error: (error) => {
        console.error('Erreur lors de l\'analyse du fichier CSV:', error);
        this.errorMessage = 'Erreur lors de l\'analyse du fichier CSV.';
      }
    });
  }
  


  // Fonction pour télécharger les données vers Firestore
  // uploadReferentsToFirestore(): void {

  //   console.log("on execute uploadReferentsToFirestore");
    
  //   if (this.parsedReferents.length === 0) {
  //     this.errorMessage = 'Aucune donnée à importer depuis le fichier CSV.';
  //     return;
  //   }


  //   this.parsedReferents.forEach((user:Users) => {
  //     // const newReferent={cp:user.cp, role:this.userRouterLinks.data ,tel:user.tel, email:user.email, lastName:user.lastName, firstName:user.firstName}
  //     const newReferent={cp:user.cp, role:user.role ,tel:user.tel, email:user.email, lastName:user.lastName, firstName:user.firstName}
  //     console.log(newReferent);      
      
  //     this.service.createUsers(newReferent)
  //     .then(
  //       (response) => {
  //         console.log('Référent créé avec succès:', response);
  //         this.successMessage = 'Référents importés avec succès.';
  //         this.errorMessage = '';
  //       },
  //       (error) => {
  //         console.error('Erreur lors de la création du référent:', error);
  //         this.errorMessage = `Erreur lors de l'importation de certains centres: ${error.message}`;
  //       }
  //     )

  //   }
  //   );
  // }

  async uploadReferentsToFirestore(): Promise<void> {
    console.log("Exécution de uploadReferentsToFirestore");
  
    if (this.parsedReferents.length === 0) {
      this.errorMessage = 'Aucune donnée à importer depuis le fichier CSV.';
      return;
    }
  
    try {
      await this.service.createUsers(this.parsedReferents);
      this.successMessage = 'Référents importés avec succès.';
      this.errorMessage = '';
    } catch (error: any) {
      console.error('Erreur lors de l\'importation des référents:', error.message);
      this.errorMessage = `Erreur lors de l'importation : ${error.message}`;
    }
  }
  

}
