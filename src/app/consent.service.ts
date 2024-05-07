import { Injectable } from '@angular/core';
import { Analytics, setAnalyticsCollectionEnabled, setUserProperties } from '@angular/fire/analytics';


@Injectable({
  providedIn: 'root'
})
export class ConsentService {

  private readonly consentKey = 'userConsent';

  constructor(private analytics:Analytics) { }

  // getConsent(): boolean {
  //   const consent = localStorage.getItem(this.consentKey) === 'true';
  //   console.log('Consentement récupéré du stockage local :', consent);
  //   return consent;
  // }

  getConsent(): boolean {
    const consentValue = localStorage.getItem(this.consentKey);
    if (consentValue === 'true') {
      return true;
    } else {
      return false;
    }
  }



  setConsent(consent: boolean): void {
    // alert(consent)
    localStorage.setItem(this.consentKey, consent.toString())
    console.log('Consentement enregistré dans le stockage local :', consent);
        // Désactiver la collecte de google analytics
        !consent?(setAnalyticsCollectionEnabled(this.analytics, false), this.deleteCookiesStartingWith('_ga')):''
        // Désactiver la collecte des signaux de personnalisation des annonces (cookies marketing)
        !consent?setUserProperties(this.analytics, { allow_ad_personalization_signals: false }):''
    // sessionStorage.removeItem('userConsent');
    sessionStorage.setItem('userConsent', consent.toString())
  }

  // clearConsent(): void {
  //   localStorage.removeItem(this.consentKey);
  //   // sessionStorage.removeItem('userConsent')
  //   // Pour vider le sessionStorage
  //   sessionStorage.clear();
  //   console.log('Consentement supprimé de sessionStorage avec toutes les datas enregistrées.');
  //   // console.log('Consentement supprimé du stockage local.');
  // }


  hasRefusedConsent(): boolean {
    return localStorage.getItem(this.consentKey) === 'false';
  }

  // cookies = getAllCookies();
  //   getAllCookies() {
  //     const cookies = document.cookie.split(';');
  //     const cookieList = {};

  //     cookies.forEach(cookie => {
  //         const [name, value] = cookie.trim().split('=');
  //         cookieList[name] = value;
  //     });

  //     console.log(cookies);
  //     return cookieList;
  // }

  // Utilisation


  // Utilisation
  // deleteCookiesStartingWith('_ga');

  deleteCookiesStartingWith(prefix: any) {
    const cookies = document.cookie.split(';');

    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.startsWith(prefix)) {
        this.deleteCookie(name);
      }
    });
  }

  // Fonction pour supprimer un cookie individuel
  deleteCookie(name: string) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }

  deleteAllCookies() {
    const cookies = document.cookie.split(';');

    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      this.deleteCookie(name);
    });
  }





}
