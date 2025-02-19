import { Component, HostListener, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/admin/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {
  showFooter = false;
  userRole: string | string[] | null = null;
  private lastScrollTop = 0;
  private footerHeight = 50;
  public footerStyle = { height: `${this.footerHeight}px` };
  private isScrolling = false;
  public isBackToTopVisible = false;
  userUid: string = "";
  private authSubscription: Subscription | undefined;

  constructor(private authService: AuthService, private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.checkFooterVisibility();

    // Écoute continue des changements d'état utilisateur
    this.authSubscription = this.authService.getCurrentUserInfo().subscribe(userInfo => {
      this.userRole = userInfo?.role ?? null;
      this.userUid = userInfo?.uid ?? "";
    });
  }

  private checkFooterVisibility() {
    const hasUserConsent = localStorage.getItem('userConsent') !== null;
    this.showFooter = hasUserConsent;
  }

  @HostListener('window:scroll', ['$event'])
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
        this.isBackToTopVisible = currentScroll > 300;

        this.isScrolling = false;
      });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
