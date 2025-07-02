import { Component, DoCheck, Input, OnInit } from '@angular/core';

import { ConsentService } from '../consent.service';

import { Auth, browserSessionPersistence, setPersistence } from '@angular/fire/auth';

import { persistentLocalCache } from 'firebase/firestore';

// import { Analytics, setAnalyticsCollectionEnabled, setUserProperties } from '@angular/fire/analytics';





@Component({

  selector: 'app-cookie-consent-banner',

  templateUrl: './cookie-consent-banner.component.html',

  styleUrls: ['./cookie-consent-banner.component.css']

})

export class CookieConsentBannerComponent implements OnInit {

  showBanner = true; // Affiche la bannière par défaut

  showOnRegistrationPage = false; // Indique si la bannière doit être affichée dans la page d'inscription

  @Input() integratedBanner: boolean = false;

  // Flag pour empêcher plusieurs chargements
  private metaPixelLoaded = false;


  constructor(public consentService: ConsentService, private auth: Auth) {


    // Vérifier si l'utilisateur a déjà pris une décision concernant les cookies

    if (this.consentService.getConsent()) {

      setPersistence(auth, browserSessionPersistence)

        .then(() => {
          sessionStorage.setItem('userConsent', 'true')

        })

        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
        });
    }

  }


  ngOnInit(): void {
    if (this.consentService.getConsent()) {
      this.showBanner = false;
      // Recharger si consentement déjà donné
      // this.loadMetaPixel(); 
    }
  }

  // fonctionne mais META PIXEL HELPER ne le détecte qu'en localhost
  //   acceptCookies() {
  //     this.consentService.setConsent(true);
  //     // Autres actions nécessaires après avoir accepté les cookies
  //     this.showBanner = false;
  //     // Charger Meta Pixel seulement après consentement
  //     this.loadMetaPixel();
  //  }
  
// acceptCookies() {
//   this.consentService.setConsent(true);
//   this.showBanner = false;

//   // Initialiser Meta Pixel avec un léger délai
//   setTimeout(() => {
//     if (!(window as any).fbq) {
//       console.warn('Meta Pixel script non chargé ou bloqué');
//       return;
//     }

//     (window as any).fbq('init', '622453283587163');
//     (window as any).fbq('track', 'PageView');
//     console.log('✅ fbq PageView envoyé (manuel avec délai)');
//   }, 100); // ← délai de 100ms (ajustable si besoin)
// }
acceptCookies() {
  this.consentService.setConsent(true);
  this.showBanner = false;

  // Définir fbq manuellement avant le chargement
  if (!(window as any).fbq) {
    (window as any).fbq = function () {
      (window as any).fbq.callMethod
        ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
        : (window as any).fbq.queue.push(arguments);
    };
    (window as any).fbq.queue = [];
    (window as any).fbq.loaded = true;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.push = (window as any).fbq;
  }

  // Charger dynamiquement le script
  const script = document.createElement('script');
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.async = true;
  script.onload = () => {
    (window as any).fbq('init', '622453283587163');
    (window as any).fbq('track', 'PageView');
    console.log('✅ fbq chargé et PageView envoyé');
  };
  script.onerror = () => {
    console.error('❌ Erreur chargement fbevents.js');
  };

  document.head.appendChild(script);
}







  rejectCookies() {
    this.consentService.setConsent(false);
    console.log('Bannière masquée après refus des cookies')

    // Autres actions nécessaires après avoir refusé les cookies
    this.showBanner = false;
    this.consentService.deleteCookiesStartingWith("_ga")
    // this.consentService.deleteCookiesStartingWith("_ga_C9M2VS675H")
    this.consentService.deleteCookiesStartingWith("_fbp");

    // Désactiver et retirer le Metapixel si l'utilisateur a refusé les cookies
    this.consentService.removeMetapixel(); // Appel à la méthode qui désactive le Pixel
  }


  // Méthode pour afficher la bannière dans la page d'inscription
  showBannerOnRegistrationPage() {
    this.showOnRegistrationPage = true;
    // this.showBanner = true;
  }

  // fonctionne mais uniquement localhost
  // loadMetaPixel(): void {
  //   // Si le pixel est déjà chargé, pas besoin de le recharger
  //   if ((window as any).fbq) {
  //     return;
  //   }

  //   // 1. Initialisation immédiate AVANT de charger le script (mécanisme de queue)
  //   (window as any).fbq = function () {
  //     (window as any).fbq.callMethod
  //       ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
  //       : (window as any).fbq.queue.push(arguments);
  //   };
  //   (window as any).fbq.push = (window as any).fbq;
  //   (window as any).fbq.loaded = true;
  //   (window as any).fbq.version = '2.0';
  //   (window as any).fbq.queue = [];

  //   // 2. Charger ensuite le script Facebook avec onload pour s'assurer qu'il est bien chargé avant d'appeler init/track
  //   const script = document.createElement('script');
  //   script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  //   script.async = true;

  //   // Une fois le script chargé, on peut appeler fbq
  //   script.onload = () => {
  // console.log('📦 Meta Pixel script chargé');
  // (window as any).fbq('init', '622453283587163');
  // (window as any).fbq('track', 'PageView');
  // console.log('✅ fbq PageView envoyé');
  //   };

  //   document.head.appendChild(script);
  // }
  // loadMetaPixel(): void {
  //   // Supprimer une éventuelle ancienne instance pour éviter les conflits
  //   if ((window as any).fbq) {
  //     delete (window as any).fbq;
  //   }

  //   // Charger le script toujours, mais sans init tant que pas de consentement
  //   if ((window as any).fbq && (window as any).fbq.loaded) return;

  //   (window as any).fbq = function () {
  //     (window as any).fbq.callMethod
  //       ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
  //       : (window as any).fbq.queue.push(arguments);
  //   };
  //   (window as any).fbq.push = (window as any).fbq;
  //   (window as any).fbq.loaded = false;
  //   (window as any).fbq.version = '2.0';
  //   (window as any).fbq.queue = [];

  //   const script = document.createElement('script');
  //   script.src = 'https://connect.facebook.net/en_US/fbevents.js?ngsw-bypass=true'; // ✅ LA ligne clé
  //   script.async = true;

  //   script.onload = () => {
  //     console.log('📦 Meta Pixel script chargé');
  //     (window as any).fbq.loaded = true;

  //     // Si consentement déjà donné, alors on initialise
  //     if (this.consentService.getConsent()) {
  //       (window as any).fbq('init', '622453283587163');
  //       (window as any).fbq('track', 'PageView');
  //       console.log('✅ fbq PageView envoyé');
  //     }
  //   };

  //   document.head.appendChild(script);
  // }

  loadMetaPixel(): void {
    // Vérifie si le script est chargé (via index.html)
    if (!(window as any).fbq) {
      console.warn('⚠️ fbq non défini — script Meta Pixel absent ou bloqué');
      return;
    }

    try {
      (window as any).fbq('init', '622453283587163'); // Ton ID pixel
      (window as any).fbq('track', 'userConsentOk');
      console.log('✅ fbq PageView envoyé');
    } catch (e) {
      console.error('❌ Erreur lors de init du Meta Pixel :', e);
    }
  }






}