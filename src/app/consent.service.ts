import { Injectable } from '@angular/core';
import { Analytics, setAnalyticsCollectionEnabled, setUserProperties } from '@angular/fire/analytics';



@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  private readonly consentKey = 'userConsent';
  constructor(private analytics: Analytics) { }



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

  
  // setConsent(consent: boolean): void {
  //   // alert(consent)
  //   localStorage.setItem(this.consentKey, consent.toString())
  //   console.log('Consentement enregistré dans le stockage local :', consent);
  //   // Désactiver la collecte de google analytics
  //   // !consent ? alert('Refus pris en compte') : ''
  //   !consent ? this.deleteAllCookies():''
  //   !consent ? setAnalyticsCollectionEnabled(this.analytics, false):''
  //   // !consent ? (setAnalyticsCollectionEnabled(this.analytics, false), this.deleteCookiesStartingWith('_ga')) : ''
  //   // Désactiver la collecte des signaux de personnalisation des annonces (cookies marketing)
  //   !consent ? setUserProperties(this.analytics, { allow_ad_personalization_signals: false }) : ''
  //   // réactiver la collecte
  //   consent ? (setAnalyticsCollectionEnabled(this.analytics, true)) : ''
  //   consent ? setUserProperties(this.analytics, { allow_ad_personalization_signals: true }) : ''
  //   // sessionStorage.removeItem('userConsent');
  //   sessionStorage.setItem('userConsent', consent.toString())
  // }



  // Charge le script Metapixel
private loadMetapixel(): void {
  // Empêche de recharger si déjà en mémoire ET initialisé
  if ((window as any).fbq && (window as any).fbq.loaded) {
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.async = true;

  script.onload = () => {
    (window as any).fbq = function () {
      (window as any).fbq.callMethod
        ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
        : (window as any).fbq.queue.push(arguments);
    };
    (window as any).fbq.push = (window as any).fbq;
    (window as any).fbq.loaded = true;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.queue = [];

    (window as any).fbq('init', '622453283587163');
    (window as any).fbq('track', 'PageView');
  };

  document.head.appendChild(script);
}




  // Retire le Metapixel (désactive la collecte de données)
  private removeMetapixel(): void {
    (window as any).fbq = function () { }; // Remplace la fonction fbq pour désactiver
    console.log('Metapixel désactivé et retiré');
  }


//  deleteCookiesStartingWith(prefix: any) {
//     const cookies = document.cookie.split(';');
//     console.log("cookies récupérées depuis deleteCookies", cookies);
    

//     cookies.forEach(cookie => {
//       const [name] = cookie.trim().split('=');
//       if (name.startsWith(prefix)) {
//         this.deleteCookie(name);
//       }
//     });
//   }

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



}