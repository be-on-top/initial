import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-rgpd',
  templateUrl: './rgpd.component.html',
  styleUrls: ['./rgpd.component.css'],
  standalone: true, // <--- AJOUTE ÇA
  imports: [
    CommonModule,              // Indispensable pour le *ngFor et *ngIf que j'ai vus dans votre HTML    
  ]
})
export class RgpdComponent implements AfterViewInit {

  integratedBanner: boolean = false

  constructor() {
    // alert(localStorage.getItem("userConsent"))


  }

  ngAfterViewInit(): void {
    const consentValue = localStorage.getItem("userConsent");
    setTimeout(() => {
      if (consentValue === "false") {
        console.log('Consentement lu du stockage local depuis rgpd vérification : false', consentValue);
        this.integratedBanner = true;
      } else {
        console.log('Aucun consentement trouvé dans le stockage local ou positif');
        this.integratedBanner = false;
      }
    });
  }

}
