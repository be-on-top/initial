import { Component} from '@angular/core';
// import { Auth } from '@angular/fire/auth';
// import { PushNotificationService } from './push-notification.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {'[attr.lang]': '"fr"'}
})
export class AppComponent {
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




    // const userKey = this.auth.currentUser?.uid;
    // console.log("userKey", userKey);
    // this.ui = userKey

    // test FCM
    // pushNotificationService.requestPermission().then(token => {
    //   console.log("token depuis le service injecté dans appComponent", token);
    // })
  }



  // ngAfterViewInit() {
  //   // Par exemple, afficher toujours la bannière de consentement après le chargement du contenu principal
  //   this.showConsentBanner = true;
  // } 

}
