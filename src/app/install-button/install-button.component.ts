// install-button.component.ts
import { Component, NgZone, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-install-button',
  templateUrl: './install-button.component.html',
  styleUrls: ['./install-button.component.css']
})
export class InstallButtonComponent {
  // Déclare une variable pour stocker l'événement d'installation différée
  deferredPrompt: any;
  
  // Déclare une variable pour indiquer si l'application est en mode web
  isWeb: boolean = false;

  // Injecte le service PLATFORM_ID pour détecter la plateforme d'exécution
  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Fonction appelée lors de l'initialisation du composant
  ngOnInit() {
    // Vérifie si l'application est exécutée dans un navigateur web
    this.isWeb = isPlatformBrowser(this.platformId);

    // Écoute l'événement 'beforeinstallprompt' uniquement si l'application est en mode web
    if (this.isWeb) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        // Utilise NgZone pour s'assurer que le changement est détecté par Angular
        this.ngZone.run(() => {
          // Stocke l'événement d'installation différée
          this.deferredPrompt = event;
        });
      });
    }
  }

  // Fonction appelée lors du clic sur le bouton d'installation
  installPWA() {
    // Vérifie si l'événement d'installation différée existe
    if (this.deferredPrompt) {
      // Affiche la boîte de dialogue d'installation
      this.deferredPrompt.prompt();

      // Attend la réponse de l'utilisateur à la proposition d'installation
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        // Gère la réponse de l'utilisateur
        if (choiceResult.outcome === 'accepted') {
          console.log('L\'utilisateur a installé l\'application');
        } else {
          console.log('L\'utilisateur a refusé l\'installation de l\'application');
        }

        // Réinitialise l'événement d'installation différée
        this.deferredPrompt = null;
      });
    }
  }
  
}
