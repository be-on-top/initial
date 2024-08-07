import { Component, OnInit } from '@angular/core';
import { Centers } from '../../centers';
import { NgForm } from '@angular/forms';
import { CentersService } from '../../centers.service';
import { debounceTime, distinctUntilChanged, map, of, Subject, switchMap } from 'rxjs';
import { SettingsService } from '../../settings.service';
import { Trade } from '../../trade';
import { LogUpdateService } from 'src/app/log-update.service';

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


  constructor(private service: CentersService, private settingsService: SettingsService) {
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

  capitalizeEachWord(sentence:string) {
    if (!sentence) return ''; // Manejar el caso de cadena vacía
    return sentence.split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }






  // juste pour l'exercice, si on utilisait input avec event

  // onInputPostalCodeChange(event: any) {
  //   const inputValue = event.target.value;
  //   console.log('Valeur de saisie:', inputValue);
  //   // Logique immédiate, comme l'auto-complétion
  // }

}