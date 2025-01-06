import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-collapses-alert',
  templateUrl: './collapses-alert.component.html',
  styleUrls: ['./collapses-alert.component.css']
})
export class CollapsesAlertComponent implements OnInit {

    // pour ceux qui ne savent pas qu'un onglet est cliquable
    showCollapsesAlert: boolean = true;

  ngOnInit(): void {
    
    // Vérifie si l'alerte a déjà été affichée
    const isDismissed = localStorage.getItem('alertDismissed');
    if (isDismissed === 'true') {
      this.showCollapsesAlert = false;
    }
  }

  
  dismissAlert(): void {
    this.showCollapsesAlert = false;
    // Enregistre l'état dans le localStorage pour éviter de réafficher l'alerte
    localStorage.setItem('alertDismissed', 'true');
  }


}
