import { Component, ViewChild, ViewContainerRef, AfterViewInit} from '@angular/core';
// import { CookieConsentBannerComponent } from './cookie-consent-banner/cookie-consent-banner.component';
// import { Auth } from '@angular/fire/auth';
// import { PushNotificationService } from './push-notification.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {'[attr.lang]': '"fr"'}
})
export class AppComponent implements AfterViewInit {
  title = 'Be On Top Application de positionnement et de formation métiers';
  // ui : string | undefined=""
  // mesaggeReceived:string | undefined="";
  consentReaded:boolean=false

   // Détermine si la bannière de consentement doit être affichée
  // showConsentBanner: boolean = false;


  constructor(
    // private auth:Auth, 
    // private pushNotificationService: PushNotificationService
    ){
      const consentValue = localStorage.getItem("userConsent");
      console.log('Consentement lu depuis app avant de boucler', consentValue);
      
      if (consentValue == null) {
          console.log('Consentement évalué depuis app si null', consentValue);
          this.consentReaded = true;
      } 

  }


@ViewChild('banner', { read: ViewContainerRef }) vc1!: ViewContainerRef;


  ngAfterViewInit(): void {
    this.consentReaded ? this.loadComponent():''
  }
  
  async loadComponent() {
    let { CookieConsentBannerComponent } = await import('./cookie-consent-banner/cookie-consent-banner.component');
    this.vc1.createComponent(CookieConsentBannerComponent);
  }


}
