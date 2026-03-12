import { Component, HostListener, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/admin/auth.service';
import { Subscription } from 'rxjs';
import { ConsentService } from 'src/app/consent.service';

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
  private consentSubscription: Subscription | undefined; // 👈

  constructor(
    private authService: AuthService,
    private consentService: ConsentService, // 👈
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.consentSubscription = this.consentService.consentStatus$.subscribe(consent => {
      this.showFooter = consent;
      this.cdRef.detectChanges(); // 👈 Assure la mise à jour du DOM
    });

    this.authSubscription = this.authService.getCurrentUserInfo().subscribe(userInfo => {
      this.userRole = userInfo?.role ?? null;
      this.userUid = userInfo?.uid ?? "";
    });
  }

  // @HostListener('window:scroll', ['$event'])

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isScrolling) {
      this.isScrolling = true;
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY || document.documentElement.scrollTop;
        this.footerHeight = currentScroll > this.lastScrollTop
          ? Math.min(this.footerHeight + 10, 100)
          : Math.max(this.footerHeight - 10, 50);
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
    this.authSubscription?.unsubscribe();
    this.consentSubscription?.unsubscribe(); // 👈 proprement
  }
}
