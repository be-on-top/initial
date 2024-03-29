import { Component, DoCheck, OnInit } from '@angular/core';
import { ConsentService } from '../consent.service';

@Component({
  selector: 'app-cookie-consent-banner',
  templateUrl: './cookie-consent-banner.component.html',
  styleUrls: ['./cookie-consent-banner.component.css']
})
export class CookieConsentBannerComponent implements OnInit {

  showBanner = true; // Affiche la bannière par défaut
  showOnRegistrationPage = false; // Indique si la bannière doit être affichée dans la page d'inscription


  constructor(public consentService: ConsentService) {

    // Vérifier si l'utilisateur a déjà pris une décision concernant les cookies
    if (this.consentService.getConsent()) {
      this.showBanner = false; // Masquer la bannière si l'utilisateur a déjà donné son consentement
    }

  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur a déjà pris une décision concernant les cookies
    if (this.consentService.getConsent()) {
      this.showBanner = false; // Masquer la bannière si l'utilisateur a déjà donné son consentement
    }
  }

  acceptCookies() {
    this.consentService.setConsent(true);
    // Autres actions nécessaires après avoir accepté les cookies
    this.showBanner = false;
  }

  rejectCookies() {
    this.consentService.setConsent(false);
    console.log('Bannière masquée après refus des cookies');
    // Autres actions nécessaires après avoir refusé les cookies
    this.showBanner = false;
  }

  // Méthode pour afficher la bannière dans la page d'inscription
  showBannerOnRegistrationPage() {
    this.showOnRegistrationPage = true;
    // this.showBanner = true;
  }



}
