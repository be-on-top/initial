import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { InnovationAwardService } from '../innovation-award.service';

// Bootstrap JS est chargé globalement
declare var bootstrap: any;

@Component({
  selector: 'app-innovation-toast',
  templateUrl: './innovation-toast.component.html',
  styleUrls: ['./innovation-toast.component.css']
})
export class InnovationToastComponent implements AfterViewInit {

  @ViewChild('toastElement') toastElement!: ElementRef;
  @ViewChild('innovationModal') innovationModal!: ElementRef;

  private toastInstance: any;
  private modalInstance: any;

  constructor(private innovationService: InnovationAwardService) { }

  ngAfterViewInit(): void {
    if (!this.innovationService.shouldDisplay()) return;

    this.toastInstance = new bootstrap.Toast(this.toastElement.nativeElement, {
      autohide: true,
      delay: 5000
    });
    this.toastInstance.show();
    this.innovationService.markAsSeen();
  }

  // Fermer manuellement le toast
  dismiss(): void {
    if (this.toastInstance) this.toastInstance.hide();
    this.innovationService.markAsSeen();
  }

  // Ouvrir la modal de détails
  openDetails(): void {
    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(this.innovationModal.nativeElement, {
        backdrop: 'static',
        keyboard: true
      });
    }
    this.modalInstance.show();
  }

  // Fermer la modal via le bouton
  closeModal(): void {
    if (this.modalInstance) this.modalInstance.hide();
  }

  // Click sur le lien externe : ferme la modal avant d’ouvrir le lien
  onExternalLinkClick(event: Event): void {
    event.preventDefault(); // Empêche le comportement par défaut pour pouvoir fermer la modal avant
    this.closeModal();
    const target = (event.currentTarget as HTMLAnchorElement).href;
    window.open(target, '_blank', 'noopener,noreferrer'); // ouverture accessible
  }
}