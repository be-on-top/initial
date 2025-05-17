import { Component, ViewChild, ViewContainerRef, AfterViewInit, OnInit } from '@angular/core';
import { setAnalyticsCollectionEnabled, Analytics } from '@angular/fire/analytics';
import { Router } from '@angular/router';
// import { ThemeService } from './admin/settings/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: { '[attr.lang]': '"fr"' }
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Be On Top Application de positionnement et de formation métiers';
  consentReaded: boolean = false;

  @ViewChild('banner', { read: ViewContainerRef }) vc1!: ViewContainerRef;
  constructor(
    private analytics:Analytics,
    private router:Router,
    // private themeService:ThemeService
  ){

  }

  ngOnInit(): void {
    this.checkUserConsent();

  }

  ngAfterViewInit(): void {
    if (this.consentReaded) {
      this.loadComponent();
    }
  }

checkUserConsent(): void {
  const consentValue = localStorage.getItem("userConsent");
  console.log('Consentement lu depuis app', consentValue);

  if (consentValue === "false") {
    console.log('Consentement refusé');
    setAnalyticsCollectionEnabled(this.analytics, false);
    this.disableAnalytics(); // Appelle maintenant la bonne méthode
  }

  if (consentValue === null) {
    this.consentReaded = true;
  }
}


  async loadComponent(): Promise<void> {
    let { CookieConsentBannerComponent } = await import('./cookie-consent-banner/cookie-consent-banner.component');
    this.vc1.createComponent(CookieConsentBannerComponent);
  }

disableAnalytics(): void {
  this.deleteCookie('_ga');
  this.deleteCookie('_gid');
  this.deleteCookie('_gat');
  this.deleteCookie('_ga_'); // utile si tu as un GA4 type _ga_XXXXXXX
}

deleteCookie(name: string): void {
  const domain = window.location.hostname;

  // Suppression sur tous les chemins + tous les sous-domaines potentiels
  document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
  document.cookie = `${name}=; Max-Age=0; path=/`;
}


  // transféré à header
  // goToInfoPage() {
  //   this.router.navigate(['/benefits']);
  // }
}
