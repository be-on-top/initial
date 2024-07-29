import { Component } from '@angular/core';
import { Centers } from '../../centers';
import { NgForm } from '@angular/forms';
import { CentersService } from '../../centers.service';

@Component({
  selector: 'app-add-centers',
  templateUrl: './add-centers.component.html',
  styleUrls: ['./add-centers.component.css']
})
export class AddCentersComponent {
  status:boolean=true
  selectedCity:string=""
  cities:string[]=[]

  constructor(private service:CentersService){}

  addCenters(form: NgForm): void {
    if (form.valid) {
      const formData = form.value;
      console.log('Données du formulaire:', formData);
      // Ajoutez votre logique ici pour manipuler les données du formulaire
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

  // alternative
  onPostalCodeChange(form: NgForm): void {
    const postalCode = form.value.cp;
    // Vérifie si le code postal est valide (c'est-à-dire, contient exactement 5 chiffres)
    console.log(postalCode);
    
    if (postalCode && postalCode.length === 5) {
      
      // Appelle le service pour obtenir les villes correspondant au code postal
      this.service.getCitiesByPostalCode(postalCode).subscribe({
  
        // next est déclenché lorsque l'observable émet une valeur (ici, les villes)
        next: (cities) => {
          // Met à jour la liste des villes avec les données reçues
          this.cities = cities;
  
          // Si une seule ville est retournée, elle est automatiquement sélectionnée
          if (cities.length === 1) {
            this.selectedCity = cities[0]; // Définit la ville sélectionnée
          } else {
            this.selectedCity = ''; // Réinitialise la sélection si plusieurs villes sont trouvées
          }
        },
  
        // error est déclenché si l'observable rencontre une erreur
        error: (error) => {
          console.error('Erreur lors de la récupération des villes', error);
          // Réinitialise la liste des villes et la sélection en cas d'erreur
          this.cities = [];
          this.selectedCity = '';
        },
  
        // complete est appelé lorsque l'observable termine son émission de valeurs
        complete: () => {
          console.log('Récupération des villes terminée');
          // Vous pouvez ajouter ici toute logique supplémentaire nécessaire après la complétion
        }
      });
    } else {
      // Si le code postal n'est pas valide, réinitialise la liste des villes et la sélection
      this.cities = [];
      this.selectedCity = '';
    }
  }
  
  

  // juste pour l'exercice, si on utilisait input avec event

  // onInputPostalCodeChange(event: any) {
  //   const inputValue = event.target.value;
  //   console.log('Valeur de saisie:', inputValue);
  //   // Logique immédiate, comme l'auto-complétion
  // }

}