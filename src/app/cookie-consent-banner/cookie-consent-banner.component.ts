import { Component } from '@angular/core';
import { ConsentService } from '../consent.service';

@Component({
  selector: 'app-cookie-consent-banner',
  templateUrl: './cookie-consent-banner.component.html',
  styleUrls: ['./cookie-consent-banner.component.css']
})
export class CookieConsentBannerComponent {

  constructor(public consentService: ConsentService) {}

  acceptCookies() {
    this.consentService.setConsent(true);
    // Autres actions nécessaires après avoir accepté les cookies
  }

  rejectCookies() {
    this.consentService.setConsent(false);
    // Autres actions nécessaires après avoir refusé les cookies
  }

}
