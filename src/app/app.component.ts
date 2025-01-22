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
    console.log('Consentement lu depuis app avant de boucler', consentValue);

    if (consentValue == null) {
      console.log('Consentement évalué depuis app si null', consentValue);
      this.consentReaded = true;
    }

    if (consentValue==="false") {
      console.log('consentement refusé');
      setAnalyticsCollectionEnabled(this.analytics, false)      
    }

    // Configuration des options pour désactiver la collecte analytic
    this.disableAnalytics();
  }

  async loadComponent(): Promise<void> {
    let { CookieConsentBannerComponent } = await import('./cookie-consent-banner/cookie-consent-banner.component');
    this.vc1.createComponent(CookieConsentBannerComponent);
  }

  disableAnalytics(): void {
    // setAnalyticsCollectionEnabled(this.analytics, false)
    // Set cookies with SameSite=None; Secure attributes
    document.cookie = '__Secure-3PAPISID=value; SameSite=None; Secure';
    document.cookie = '__Secure-3PSID=value; SameSite=None; Secure';
    document.cookie = 'NID=value; SameSite=None; Secure';
    document.cookie = '__Secure-3PSIDTS=value; SameSite=None; Secure';
    document.cookie = '__Secure-3PSIDCC=value; SameSite=None; Secure';
  }

  // transféré à header
  // goToInfoPage() {
  //   this.router.navigate(['/benefits']);
  // }
}
