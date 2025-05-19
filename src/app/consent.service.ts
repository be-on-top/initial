import { Injectable } from '@angular/core';
import { Analytics, setAnalyticsCollectionEnabled, setUserProperties } from '@angular/fire/analytics';
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  private readonly consentKey = 'userConsent';
  constructor(private analytics: Analytics) { }

  // 👇 Le BehaviorSubject avec valeur initiale
  // public consentStatus$ = new BehaviorSubject<boolean>(this.getConsent());
  public consentStatus$ = new BehaviorSubject<boolean>(this.hasStoredConsent());


  // Récupère le consentement depuis le localStorage
  getConsent(): boolean {
    return localStorage.getItem(this.consentKey) === 'true';
  }

  // Récupère si l'utilisateur a refusé les cookies
  hasRefusedConsent(): boolean {
    return localStorage.getItem(this.consentKey) === 'false';
  }

  // Définit le consentement
  setConsent(consent: boolean): void {
    localStorage.setItem(this.consentKey, consent.toString());
    sessionStorage.setItem('userConsent', consent.toString())

    this.consentStatus$.next(true); // 👈 Le choix est fait, on s'en fout si c’est true ou false

    if (!consent) {
      // Refus : tout désactiver (Analytics + Metapixel) et supprimer les cookies
      setAnalyticsCollectionEnabled(this.analytics, false);
      setUserProperties(this.analytics, { allow_ad_personalization_signals: false });
      this.deleteAllCookies();
      // Supprime le Metapixel si refusé
      // this.removeMetapixel(); 
    } else {
      // Consentement accepté : activer Analytics et Metapixel
      setAnalyticsCollectionEnabled(this.analytics, true);
      setUserProperties(this.analytics, { allow_ad_personalization_signals: true });
      // Charge le Metapixel si accepté ici il est de trop ?
      // this.loadMetapixel(); 
    }
  }


  // Retire le Metapixel (désactive la collecte de données)
  removeMetapixel(): void {
    (window as any).fbq = function () { }; // Remplace la fonction fbq pour désactiver
    console.log('Metapixel désactivé et retiré');
  }


  deleteCookiesStartingWith(prefix: string) {
    const cookies = document.cookie.split(';');
    console.log("Cookies récupérés :", cookies);

    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');

      // Accepte : _ga, _ga_, _ga-..., etc. si le prefix est "_ga"
      if (name === prefix || name.startsWith(prefix + '_') || name.startsWith(prefix + '-')) {
        this.deleteCookie(name);
      }
    });

  }


  // Fonction pour supprimer un cookie individuel
  deleteCookie(name: string) {
    // alert(name)
    console.log('Suppression du cookie :', name);
    // document.cookie = name + '=;expires=Thu, 01 Jan 2023 00:00:00 GMT;path=/';
    document.cookie = name + '=;Max-Age=0;path=/';
  }

  deleteAllCookies() {
    const cookies = document.cookie.split(';');

    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      this.deleteCookie(name);
    });

  }

  canTrack(): boolean {
    return this.getConsent() && typeof (window as any).fbq === 'function';
  }

  hasStoredConsent(): boolean {
  return localStorage.getItem(this.consentKey) !== null;
}





}