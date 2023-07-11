import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.css']
})
export class SettingsListComponent implements OnInit{

  allSettings?: any
  trades?: any
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''


  constructor(private router: Router, private service: SettingsService) { }

  ngOnInit(): void {
    this.getSettings();
  }

  getSettings() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allEvaluators=this.service.getEvaluators(); devient donc nécessairement
    this.service.getTrades().subscribe(data => {
      console.log("data de getTrades()", data)
      this.trades = data
      // return this.allUsers
    })

  }

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue
    console.log(this.searchText);
  }

}
