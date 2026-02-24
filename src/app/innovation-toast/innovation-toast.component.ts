import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { InnovationAwardService } from '../innovation-award.service'; // Service pour gérer l'affichage unique du toast

// Bootstrap JS est chargé globalement, on déclare pour TypeScript
declare var bootstrap: any;

@Component({
  selector: 'app-innovation-toast',                    // Sélecteur du composant
  templateUrl: './innovation-toast.component.html',  // Template HTML
  styleUrls: ['./innovation-toast.component.css']    // CSS du composant
})
export class InnovationToastComponent implements AfterViewInit {

  // Référence au DOM du toast pour pouvoir l'afficher avec Bootstrap JS
  @ViewChild('toastElement') toastElement!: ElementRef;

  // Instance Bootstrap Toast
  private toastInstance: any;

  constructor(private innovationService: InnovationAwardService) { }

  /**
   * Après l'initialisation de la vue
   * - On vérifie si le toast doit s'afficher (via le service)
   * - On attend 1,5s puis on affiche le toast avec autohide
   * - On marque le toast comme "vu" pour ne pas le réafficher
   */
  ngAfterViewInit(): void {
    if (!this.innovationService.shouldDisplay()) {
      return; // Ne pas afficher si déjà vu ou hors période
    }

    // setTimeout(() => {
    //   // Création de l'instance Bootstrap Toast
    //   this.toastInstance = new bootstrap.Toast(
    //     this.toastElement.nativeElement,
    //     {
    //       autohide: true,  // se ferme automatiquement
    //       delay: 6000      // durée affichage en ms (6 secondes)
    //     }
    //   );

    // Affichage immédiat
    this.toastInstance = new bootstrap.Toast(this.toastElement.nativeElement, { autohide: true, delay: 4000 });
    this.toastInstance.show();
    this.innovationService.markAsSeen();


  }

  /**
   * Fermeture manuelle du toast via le bouton
   * - Cache le toast immédiatement
   * - Marque comme vu pour éviter la réapparition
   */
  dismiss(): void {
    if (this.toastInstance) {
      this.toastInstance.hide();
    }
    this.innovationService.markAsSeen();
  }

  /**
   * Ouverture de la modal détaillant le prix
   * - Récupère l'élément DOM de la modal
   * - Crée une instance Bootstrap Modal et l'affiche
   * - Tout reste dans le même composant, pas besoin d'un composant supplémentaire
   */
  openDetails() {
    const modalEl = document.getElementById('innovationDetailModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

}