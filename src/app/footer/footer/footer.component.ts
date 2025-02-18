import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/admin/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  showFooter = false; 
   userRole:string | string[] | null=null

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkFooterVisibility();

    this.authService.getCurrentUserRole().subscribe(role => {
      this.userRole = role; // Affecte le rôle récupéré
      // alert(this.userRole)
    });


  }

  private checkFooterVisibility() {
     // Vérifier si l'utilisateur est authentifié

    const hasUserConsent = localStorage.getItem('userConsent') !== null; // Vérifier le consentement

    this.showFooter = hasUserConsent; // Afficher le footer si les 2 conditions sont remplies
  }

 

  private getUserRole() {
    this.authService.getCurrentUserRole().subscribe(role => {
      this.userRole = role;
    });
  }

}
