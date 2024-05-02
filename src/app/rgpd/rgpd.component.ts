import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-rgpd',
  templateUrl: './rgpd.component.html',
  styleUrls: ['./rgpd.component.css']
})
export class RgpdComponent implements AfterViewInit {

  integratedBanner:boolean=false

  constructor() {
    // alert(localStorage.getItem("userConsent"))
    

}

ngAfterViewInit(): void {
  const consentValue = localStorage.getItem("userConsent");
    if (consentValue==="false") {
        console.log('Consentement lu du stockage local depuis rgpd vérification : false', consentValue);
        this.integratedBanner=true
    } else {
        console.log('Aucun consentement trouvé dans le stockage local ou positifi');
        this.integratedBanner=false
    }


  }

}
