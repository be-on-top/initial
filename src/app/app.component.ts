import { Component, ViewChild, ViewContainerRef, AfterViewInit, OnInit } from '@angular/core';
import { setAnalyticsCollectionEnabled, Analytics } from '@angular/fire/analytics';
// import { Router } from '@angular/router';
import { NotificationsService } from './notifications.service';
import { AuthService } from './admin/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: { '[attr.lang]': '"fr"' }
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Be On Top Application de positionnement et de formation métiers';
  consentReaded: boolean = false;
  notificationPermissionGranted = false;
  isServiceWorkerReady = false;

  @ViewChild('banner', { read: ViewContainerRef }) vc1!: ViewContainerRef;

  constructor(
    private analytics: Analytics,
    // private router: Router,
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkUserConsent();

    const permission = localStorage.getItem('notification-permission');
    this.notificationPermissionGranted = permission === 'granted';

    // ❌ NE PAS appeler la demande de permission ici
    // ✨ Plus propre : délégué au service
    this.notificationsService.isServiceWorkerReady$()
      .pipe(take(1))
      .subscribe(ready => {
        this.isServiceWorkerReady = ready;
      });
  //       this.notificationsService.isServiceWorkerReady$().subscribe((ready) => {
  //   this.isServiceWorkerReady = ready;
  // });


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
      this.disableAnalytics();
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
    this.deleteCookie('_ga_');
  }

  deleteCookie(name: string): void {
    const domain = window.location.hostname;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }

  // ✅ Appelée par le bouton uniquement
  async requestNotificationPermission() {
    const uid = this.authService.getCurrentUserUid();

    if (!uid) {
      console.warn('Aucun utilisateur connecté.');
      return;
    }
    try {
      const token = await this.notificationsService.requestPermissionAndRegisterToken(uid);
      localStorage.setItem('notification-permission', 'granted');
      this.notificationPermissionGranted = true;
      console.log('✅ Notifications activées, token :', token);

      this.notificationsService.receiveMessage().subscribe(payload => {
        console.log('📩 Notification reçue :', payload);
      });
    } catch (err) {
      localStorage.setItem('notification-permission', 'denied');
      console.warn('❌ Refus ou erreur de notification :', err);
    }
  }

  isAuthenticated(): boolean {
    return !!this.authService.getCurrentUserUid();
  }

}
