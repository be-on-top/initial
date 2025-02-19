import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from 'src/app/admin/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  showFooter = false;
  userRole: string | string[] | null = null;
  private lastScrollTop = 0; // Dernière position de défilement
  private footerHeight = 50; // Hauteur du footer par défaut
  public footerStyle = { height: `${this.footerHeight}px` };
  private isScrolling = false; // Flag pour limiter les appels
  public isBackToTopVisible = false; // Indicateur de visibilité du bouton de retour

  // pour la route mon compte pro paramétrable
  userUid:string=""

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.checkFooterVisibility();

    // this.authService.getCurrentUserRole().subscribe(role => {
    //   this.userRole = role;
    // });

    this.authService.getCurrentUserInfo().subscribe(userInfo => {
      if (userInfo) {
        this.userRole = userInfo.role;
        this.userUid = userInfo.uid; // Stocke l'UID
      }
    });

  }

  private checkFooterVisibility() {
    const hasUserConsent = localStorage.getItem('userConsent') !== null;
    this.showFooter = hasUserConsent;
  }

  @HostListener('window:scroll', ['$event'])
  // fonctionne très bien
  onScroll(): void {
    if (!this.isScrolling) {
      this.isScrolling = true;
  
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY || document.documentElement.scrollTop;

        // Logique pour gérer la hauteur du footer
        if (currentScroll > this.lastScrollTop) {
          this.footerHeight = Math.min(this.footerHeight + 10, 100);
        } else {
          this.footerHeight = Math.max(this.footerHeight - 10, 50);
        }
  
        this.footerStyle = { height: `${this.footerHeight}px` };
        this.lastScrollTop = Math.max(currentScroll, 0);

        // Logique pour afficher ou masquer le bouton "Retour en haut"
        this.isBackToTopVisible = currentScroll > 300; // Affiche le bouton après 300px de scroll
  
        this.isScrolling = false;
      });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



}
