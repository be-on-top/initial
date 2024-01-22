import { Component, NgZone, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-install-button',
  templateUrl: './install-button.component.html',
  styleUrls: ['./install-button.component.css']
})
export class InstallButtonComponent {
  deferredPrompt: any;
  isWeb: boolean = false;
  isSafari: boolean = false;

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.isWeb = isPlatformBrowser(this.platformId);
    this.isSafari = this.detectSafari();
    
    if (this.isWeb && !this.isSafari) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        this.ngZone.run(() => {
          this.deferredPrompt = event;
        });
      });
    }
  }

  detectSafari(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  installPWA() {
    if (this.deferredPrompt) {
      if (this.isSafari) {
        console.log('Installation manuelle pour Safari sur Mac.');
      } else {
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
}
