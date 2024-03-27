import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsentService {

  private readonly consentKey = 'userConsent';

  constructor() {}

  getConsent(): boolean {
    return localStorage.getItem(this.consentKey) === 'true';
  }

  setConsent(consent: boolean): void {
    localStorage.setItem(this.consentKey, consent.toString());
  }

  clearConsent(): void {
    localStorage.removeItem(this.consentKey);
  }
  
}
