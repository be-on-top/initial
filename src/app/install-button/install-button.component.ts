// install-button.component.ts
import { Component, NgZone } from '@angular/core';

@Component({
  selector: 'app-install-button',
  templateUrl: './install-button.component.html',
  styleUrls: ['./install-button.component.css']
})
export class InstallButtonComponent {
  deferredPrompt: any;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      this.ngZone.run(() => {
        this.deferredPrompt = event;
      });
    });
  }

  installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();

      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('L\'utilisateur a installé l\'application');
        } else {
          console.log('L\'utilisateur a refusé l\'installation de l\'application');
        }

        this.deferredPrompt = null;
      });
    }
  }
}
