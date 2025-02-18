import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from 'src/app/admin/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  showFooter = false; 
   userRole:string | string[] | null=null
   private lastScrollTop = 0;  // Dernière position de défilement
   private footerHeight = 50;  // Hauteur du footer par défaut
   public footerStyle = { height: `${this.footerHeight}px` };
   private isScrolling = false; // Ajout d’un flag pour limiter les appels

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

  @HostListener('window:scroll', ['$event'])
  // onScroll(): void {
  //   // Vérifie si on est déjà en train de traiter un scroll pour éviter trop d'exécutions
  //   if (!this.isScrolling) {
  //     this.isScrolling = true; // Bloque les nouveaux appels
  
  //     setTimeout(() => {
  //       // Récupère la position actuelle du scroll
  //       const currentScroll = window.scrollY || document.documentElement.scrollTop;
  
  //       // Si on descend (scroll vers le bas)
  //       if (currentScroll > this.lastScrollTop) {
  //         // Augmente la hauteur du footer (limite max à 100px)
  //         this.footerHeight = Math.min(this.footerHeight + 10, 100);
  //       } else {
  //         // Si on remonte (scroll vers le haut), réduit la hauteur du footer (limite min à 60px)
  //         this.footerHeight = Math.max(this.footerHeight - 10, 50);
  //       }
  
  //       // Met à jour le style du footer
  //       this.footerStyle = { height: `${this.footerHeight}px` };
  
  //       // Stocke la dernière position du scroll (évite les valeurs négatives)
  //       this.lastScrollTop = Math.max(currentScroll, 0);
  
  //       // Débloque les nouveaux appels après le délai
  //       this.isScrolling = false;
  //     }, 200); // Exécute cette logique au maximum une fois toutes les 100ms
  //   }
  // }

  onScroll(): void {
    if (!this.isScrolling) {
      this.isScrolling = true;
  
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY || document.documentElement.scrollTop;
  
        if (currentScroll > this.lastScrollTop) {
          this.footerHeight = Math.min(this.footerHeight + 10, 100);
        } else {
          this.footerHeight = Math.max(this.footerHeight - 10, 50);
        }
  
        this.footerStyle = { height: `${this.footerHeight}px` };
        this.lastScrollTop = Math.max(currentScroll, 0);
  
        this.isScrolling = false;
      });
    }
  }
  
  

}


