import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../../settings.service';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.css']
})
export class SettingsListComponent implements OnInit {

  allSettings?: any
  trades?: any
  cursors: any = {}
  // y en aura plusieurs plus tard...
  maximums: any = {}
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  partners?:any
  displayPrices:boolean=true


  constructor(private router: Router, private service: SettingsService, private themeService:ThemeService) {
        // Initialise la variable avec la couleur actuelle du thème
        this.primaryColor = this.themeService.getPrimaryColor();
   }

  ngOnInit(): void {
    this.getSettings();
  }

  getSettings() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allEvaluators=this.service.getEvaluators(); devient donc nécessairement
    this.service.getTrades().subscribe(data => {
      console.log("data de getTrades()", data)
      this.trades = data
    })

    this.service.getLevelsCursors().subscribe(data => {
      console.log("data de getLevelsCursors()", data)
      for (const key in data) {
        this.cursors[key] = (data[key])
        console.log("cursors array", this.cursors)
      }
    }
    )

    this.service.getMaximums().subscribe(data => {
      console.log("data de getMaximums()", data)
      for (const key in data) {
        this.maximums[key] = (data[key])
        console.log("maximums array", this.maximums)
      }
    }
    )

    this.service.fetchPartners().subscribe(data=>{
      this.partners=data
    })

    // Récupérer la valeur initiale de displayPrices depuis Firestore
    this.service.getDisplayPrices().subscribe((data: any) => {
      if (data && data.prices !== undefined) {
        this.displayPrices = data.prices;
      }
    })

  }

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue
    console.log(this.searchText);
  }

  primaryColor: string='';



  updatePrimaryColor(color: string): void {
    // Mettre à jour la couleur primaire
    this.themeService.setPrimaryColor(color);
  }

  resetColor(): void {
    // Réinitialiser la couleur primaire par défaut
    this.themeService.resetTheme();
    this.primaryColor = this.themeService.getPrimaryColor();
  }

 // Mettre à jour displayPrices dans Firestore
 toggleDisplayPrices(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  this.displayPrices = inputElement.checked;  // Récupère l'état de la checkbox
  console.log("this.displayPrices", this.displayPrices);
  
  this.service.setDisplayPrices(this.displayPrices)
    .then(() => console.log('displayPrices mis à jour dans Firestore'))
    .catch(error => console.error('Erreur de mise à jour', error));
}


}
