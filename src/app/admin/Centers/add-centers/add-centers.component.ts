import { Component, OnInit } from '@angular/core';
import { Centers } from '../../centers';
import { NgForm } from '@angular/forms';
import { CentersService } from '../../centers.service';
import { debounceTime, distinctUntilChanged, map, of, Subject, switchMap } from 'rxjs';
import { SettingsService } from '../../settings.service';
import { Trade } from '../../trade';
import { LogUpdateService } from 'src/app/log-update.service';
// import * as Papa from 'ngx-papaparse'; // Importation de PapaParse pour l'analyse CSV
import { Papa } from 'ngx-papaparse';


@Component({
  selector: 'app-add-centers',
  templateUrl: './add-centers.component.html',
  styleUrls: ['./add-centers.component.css']
})
export class AddCentersComponent implements OnInit {
  status: boolean = true
  selectedCity: string = ""
  cities: any[] = []
  postalCode: string = '';
  // si on veut faire apparaitre une valeur dynamique par défaut
  centerName: string = ""

  // pour récupérer les métiers
  tradesData: Trade[] = []
  selectedSigles: string[] = []

  // Subject pour capturer les changements de code postal
  private postalCodeSubject = new Subject<string>();

  // gestion des messages de retour
  successMessage: string = '';
  errorMessage: string = '';

  // si on envisage l'import csv
  csvFile: File | null = null; // Variable pour stocker le fichier CSV sélectionné
  parsedCenters: any[] = [];   // Tableau pour stocker les données analysées


  constructor(private service: CentersService, private settingsService: SettingsService, private papa: Papa) {
    // Setup RxJS pipeline for capturing postal code changes
    this.postalCodeSubject.pipe(
      debounceTime(300), // Debounce for smoother input handling
      distinctUntilChanged(), // Ignore if the value hasn't changed
      switchMap(postalCode => {
        // Check for a minimum input length
        if (postalCode.length >= 3) {
          return this.service.getCitiesByPartialPostalCode(postalCode);
        } else {
          return of([]); // Return an empty array if input is too short
        }
      })
    ).subscribe(cities => {
      this.cities = cities;
      if (cities.length === 1) {
        this.selectedCity = cities[0].label;
      } else {
        this.selectedCity = '';
      }
    });
  }

  ngOnInit(): void {
    this.settingsService.getTrades()

      .pipe(map(data => data.filter(item => item.status && item.status === true)))

      .subscribe(data => {

        // pour inverser temporairement

        this.tradesData = data.reverse();

        console.log("this.tradesData", this.tradesData);

      })

  }

  addCenters(form: NgForm): void {
    if (form.valid) {
      const formData = form.value;
      // Vérifie si mainCity n'est pas renseigné (null, undefined ou vide) et le remplace par city
      if (!formData.mainCity || formData.mainCity.trim() === '') {
        formData.mainCity = formData.city;
      }
      console.log('Données du formulaire:', formData);

      this.service.createCenter(formData).subscribe({
        next: (response) => {
          console.log('Centre créé avec succès:', response);
          this.successMessage = 'Centre créé avec succès.';
          this.errorMessage = ''; // Clear error message
          form.resetForm(); // Optionally reset the form
        },
        error: (error) => {
          console.error('Erreur lors de la création du centre:', error);
          this.errorMessage = error.message; // Set error message
          this.successMessage = ''; // Clear success message
        },
      });
    } else {
      this.errorMessage = 'Veuillez remplir correctement le formulaire avant de soumettre.';
    }
  }

  // premier essai déprécié
  // onPostalCodeChange(form: NgForm): void {
  //   const postalCode = form.value.cp;
  //   if (postalCode && postalCode.length === 5) {
  //     this.servive.getCitiesByPostalCode(postalCode).subscribe(
  //       (cities) => {
  //         this.cities = cities;
  //         if (cities.length === 1) {
  //           this.selectedCity = cities[0];
  //           form.controls['city'].setValue(this.selectedCity);
  //         } else {
  //           this.selectedCity = '';
  //           form.controls['city'].setValue('');
  //         }
  //       },
  //       (error) => {
  //         console.error('Erreur lors de la récupération des villes', error);
  //         this.cities = [];
  //         this.selectedCity = '';
  //       }
  //     );
  //   } else {
  //     this.cities = [];
  //     this.selectedCity = '';
  //     form.controls['city'].setValue('');
  //   }
  // }

  // alternative 1 
  // onPostalCodeChange(form: NgForm): void {
  //   const postalCode = form.value.cp;
  //   // Vérifie si le code postal est valide (c'est-à-dire, contient exactement 5 chiffres)
  //   console.log(postalCode);

  //   if (postalCode && postalCode.length === 5) {

  //     // Appelle le service pour obtenir les villes correspondant au code postal
  //     this.service.getCitiesByPostalCode(postalCode).subscribe({

  //       // next est déclenché lorsque l'observable émet une valeur (ici, les villes)
  //       next: (cities) => {
  //         // Met à jour la liste des villes avec les données reçues
  //         this.cities = cities;

  //         // Si une seule ville est retournée, elle est automatiquement sélectionnée
  //         if (cities.length === 1) {
  //           this.selectedCity = cities[0].label; // Définit la ville sélectionnée
  //         } else {
  //           this.selectedCity = ''; // Réinitialise la sélection si plusieurs villes sont trouvées
  //         }
  //       },

  //       // error est déclenché si l'observable rencontre une erreur
  //       error: (error) => {
  //         console.error('Erreur lors de la récupération des villes', error);
  //         // Réinitialise la liste des villes et la sélection en cas d'erreur
  //         this.cities = [];
  //         this.selectedCity = '';
  //       },

  //       // complete est appelé lorsque l'observable termine son émission de valeurs
  //       complete: () => {
  //         console.log('Récupération des villes terminée');
  //         // Vous pouvez ajouter ici toute logique supplémentaire nécessaire après la complétion
  //       }
  //     });
  //   } else {
  //     // Si le code postal n'est pas valide, réinitialise la liste des villes et la sélection
  //     this.cities = [];
  //     this.selectedCity = '';
  //   }
  // }

  // alternative 2 si subject en amont
  onPostalCodeChange(postalCode: string): void {

    this.postalCodeSubject.next(postalCode);

  }

  onSelectCity(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast l'objet target en HTMLSelectElement
    const selectedLabel = target.value; // Accède à la valeur sélectionnée

    // Trouver la ville correspondante dans la liste des villes
    const selectedCity = this.cities.find(city => city.label === selectedLabel);

    if (selectedCity) {
      this.selectedCity = selectedCity.label;

      this.postalCode = selectedCity.zip_code; // Met à jour le code postal
      // this.centerName = `Centre de ${selectedCity.label}`
      this.centerName = `Centre de ${this.capitalizeEachWord(selectedCity.label)}`

    }
  }

  capitalizeEachWord(sentence: string) {
    if (!sentence) return ''; // Manejar el caso de cadena vacía
    return sentence.split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
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

    // Analyse du fichier CSV grâce à PapaParse. 
    this.papa.parse(this.csvFile, {
      // Considère la première ligne comme des en-têtes
      header: true,
      skipEmptyLines: true, // Ignore les lignes vides !!!
      complete: (result) => {
        // Filtrage des objets vides ou des champs manquants
        this.parsedCenters = result.data.filter((center: any) => {
          return center.name && center.address && center.cp && center.sigles && center.city && center.tel && center.contact;
        }).map((center: any) => {
          // Transformation de la colonne sigles en tableau
          center.sigles = center.sigles.split(',').map((sigle: string) => sigle.trim()); // Nettoyage des espaces
          return center; // On retourne l'objet modifié
        });

        console.log('Données analysées:', this.parsedCenters);
        this.uploadCentersToFirestore();
      },
      error: (error) => {
        console.error('Erreur lors de l\'analyse du fichier CSV:', error);
        this.errorMessage = 'Erreur lors de l\'analyse du fichier CSV.';
      }
    });
  }



  // Fonction pour télécharger les données vers Firestore
  uploadCentersToFirestore(): void {
    if (this.parsedCenters.length === 0) {
      console.log("aucune donnée à importer");

      this.errorMessage = 'Aucune donnée à importer depuis le fichier CSV.';
      return;
    }

    this.parsedCenters.forEach(center => {

      this.service.createCenter(center).subscribe({
        next: (response) => {
          console.log('Centre créé avec succès:', response);
          this.successMessage = 'Centres importés avec succès.';
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Erreur lors de la création du centre:', error);
          this.errorMessage = `Erreur lors de l'importation de certains centres: ${error.message}`;
        }
      });
    });
  }






  // juste pour l'exercice, si on utilisait input avec event

  // onInputPostalCodeChange(event: any) {
  //   const inputValue = event.target.value;
  //   console.log('Valeur de saisie:', inputValue);
  //   // Logique immédiate, comme l'auto-complétion
  // }



  // Méthode appelée lors du changement de fichier dans l'input de type file
  // onFileChange(event: any): void {
  //   // Récupère le premier fichier sélectionné par l'utilisateur
  //   const file = event.target.files[0];

  //   // Vérifie si un fichier a été sélectionné
  //   if (file) {
  //     // Création d'une instance de FileReader pour lire le contenu du fichier
  //     const reader = new FileReader();

  //     // Définit un gestionnaire d'événement lorsque le fichier est complètement chargé
  //     reader.onload = (e) => {
  //       // Convertit le résultat de la lecture en chaîne de caractères (le contenu du fichier CSV)
  //       const text = e.target?.result as string;

  //       // Appelle la fonction parseCSV pour traiter le texte CSV
  //       this.parseCSV(text);
  //     };

  //     // Lit le contenu du fichier en tant que texte brut
  //     reader.readAsText(file);
  //   }
  // }

  // Fonction pour analyser le contenu CSV
  // parseCSV(data: string): void {
  //   // Divise le texte CSV en lignes, chaque ligne représentant un enregistrement
  //   const lines = data.split('\n');

  //   // Supposons que la première ligne contient les en-têtes des colonnes
  //   const headers = lines[0].split(',');

  //   // Initialise le tableau des centres analysés à partir des lignes restantes
  //   this.parsedCenters = lines.slice(1).map(line => {
  //     // Divise chaque ligne en valeurs séparées par des virgules
  //     const values = line.split(',');

  //     // Crée un objet centre où chaque clé est un en-tête et chaque valeur est un élément de la ligne
  //     const center: any = {};

  //     // Associe chaque valeur à son en-tête correspondant
  //     headers.forEach((header, index) => {
  //       // Enlève les espaces blancs autour des noms de champs et des valeurs
  //       center[header.trim()] = values[index].trim();
  //     });

  //     // Retourne l'objet représentant le centre
  //     return center;
  //   });

  //   // Affiche dans la console les données analysées
  //   console.log('Données analysées:', this.parsedCenters);
  // }


}