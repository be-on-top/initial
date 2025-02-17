import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/admin/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  showFooter = false; 

  constructor(
    // private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkFooterVisibility();
  }

  private checkFooterVisibility() {
     // Vérifier si l'utilisateur est authentifié

    const hasUserConsent = localStorage.getItem('userConsent') !== null; // Vérifier le consentement

    this.showFooter = hasUserConsent; // Afficher le footer si les 2 conditions sont remplies
  }
}
