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



    // const consentValue = localStorage.getItem("userConsent");

    // if (consentValue !== null) {

    //     console.log('Consentement récupéré du stockage local si pas null', consentValue);

    //     this.showBanner=false

    // } else {

    //     console.log('Aucun consentement trouvé dans le stockage local.');

    //     this.showBanner=true

    // }



  }



  // ngOnInit(): void {

  //   // Vérifier si l'utilisateur a déjà pris une décision concernant les cookies

  //   // if (this.consentService.getConsent()) {

  //   //   this.showBanner = false; // Masquer la bannière si l'utilisateur a déjà donné son consentement

  //   // }

  // }



  ngOnInit(): void {

    if (this.consentService.getConsent()) {

      this.showBanner = false;

      this.loadMetaPixel(); // Recharger si consentement déjà donné

    }

  }





  acceptCookies() {

    this.consentService.setConsent(true);

    // Autres actions nécessaires après avoir accepté les cookies

    this.showBanner = false;



    // Charger Meta Pixel seulement après consentement

    this.loadMetaPixel();



  }



  rejectCookies() {

    this.consentService.setConsent(false);

    console.log('Bannière masquée après refus des cookies')

    // Autres actions nécessaires après avoir refusé les cookies

    this.showBanner = false;

    this.consentService.deleteCookiesStartingWith("_ga")

    // this.consentService.deleteCookiesStartingWith("_ga_C9M2VS675H")

    this.consentService.deleteCookiesStartingWith("_fbp");

  }



  // Méthode pour afficher la bannière dans la page d'inscription

  showBannerOnRegistrationPage() {

    this.showOnRegistrationPage = true;

    // this.showBanner = true;

  }



  // la base

  // loadMetaPixel() {

  //   const script = document.createElement('script');

  //   script.src = 'https://connect.facebook.net/en_US/fbevents.js';

  //   script.async = true;

  //   script.onload = () => {

  //     // Initialisation une fois que le script est chargé

  //     (window as any).fbq = (window as any).fbq || function () {

  //       (window as any).fbq.callMethod ?

  //         (window as any).fbq.callMethod.apply((window as any).fbq, arguments) : (window as any).fbq.queue.push(arguments);

  //     };

  //     (window as any).fbq('init', '622453283587163');

  //     (window as any).fbq('track', 'PageView');

  //   };

  //   document.head.appendChild(script);

  // }



loadMetaPixel(): void {
  // Si le pixel est déjà chargé, pas besoin de le recharger
  if ((window as any).fbq) {
    return;
  }

  // 1. Initialisation immédiate AVANT de charger le script (mécanisme de queue)
  (window as any).fbq = function () {
    (window as any).fbq.callMethod
      ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
      : (window as any).fbq.queue.push(arguments);
  };
  (window as any).fbq.push = (window as any).fbq;
  (window as any).fbq.loaded = true;
  (window as any).fbq.version = '2.0';
  (window as any).fbq.queue = [];

  // 2. Charger ensuite le script Facebook avec onload pour s'assurer qu'il est bien chargé avant d'appeler init/track
  const script = document.createElement('script');
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.async = true;

  // Une fois le script chargé, on peut appeler fbq
  script.onload = () => {
    // Initialisation du Pixel (ID 622453283587163)
    (window as any).fbq('init', '622453283587163');
    // Enregistrement de l'événement de vue de page
    (window as any).fbq('track', 'PageView');
  };

  document.head.appendChild(script);
}





}