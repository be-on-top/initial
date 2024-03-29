import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsentService {

  private readonly consentKey = 'userConsent';

  constructor() {}

  getConsent(): boolean {
    const consent = localStorage.getItem(this.consentKey) === 'true';
    console.log('Consentement récupéré du stockage local :', consent);
    return consent;
  }

  setConsent(consent: boolean): void {
    localStorage.setItem(this.consentKey, consent.toString());
    console.log('Consentement enregistré dans le stockage local :', consent);
  }

  clearConsent(): void {
    localStorage.removeItem(this.consentKey);
    console.log('Consentement supprimé du stockage local.');
  }

  hasRefusedConsent(): boolean {
    return localStorage.getItem(this.consentKey) === 'false';
  }
  
}
