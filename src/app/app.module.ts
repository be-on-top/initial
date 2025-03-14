import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule, Meta } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";
// on test ReactiveFormsModule pour login et logout
import { ReactiveFormsModule } from '@angular/forms';

// Firebase
// Trouver l'équivalent des 2 lignes ci-dessous pour l'ajout d'éléments à une collection
// import { AngularFireModule } from '@angular/fire/compat';
// import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { environment } from '../environments/environment';

import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HookComponent } from './hook/hook.component';
import { AdminModule } from './admin/admin.module';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { RegisterComponent } from './register/register.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AccountComponent } from './account/account.component';
// pour appliquer à la lettre la division des tâches. ceci ne me semble pourtant pas très pertinent ici. 
import { UpdateAccountComponent } from './account/update-account/update-account.component';
import { QuizzComponent } from './quizz/quizz.component';
// import { StudentFormComponent } from './student-form/student-form.component';
import { DetailsComponent } from './quizz/vues/details/details.component';
import { SettingsListComponent } from './admin/settings/settings-list/settings-list.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { KeysPipe } from './quizz/keys.pipe';
import { TradeDetailsComponent } from './trades/trade-details/trade-details.component';
import { StripHtmlPipe } from './strip-html.pipe';
import { AuthGuardService } from './auth-guard.service';
import { FooterComponent } from './footer/footer/footer.component';
import { FirstWordPipe } from './first-word.pipe';
import { InstallButtonComponent } from './install-button/install-button.component';
import { CookieConsentBannerComponent } from './cookie-consent-banner/cookie-consent-banner.component';
import { RgpdComponent } from './rgpd/rgpd.component';
import { PartnersComponent } from './partners/partners.component';
import { ShareButtonComponent } from './share-button/share-button.component';
import { NgOptimizedImage } from '@angular/common';
import { DurationPipe } from './duration.pipe';
import { RoundPipe } from './round.pipe';
import { FaqComponent } from './faq/faq.component';
import { TruncateTitlePipe } from './truncate-title.pipe';
import { BenefitsComponent } from './benefits/benefits.component';
import { LegalInfoComponent } from './legal-info/legal-info.component';
import { AddNbspBeforeQuestionMarkPipe } from './add-nbsp-before-question-mark.pipe';
import { MarketAppComponent } from './market-app/market-app.component';
import { ChatComponent } from './chat/chat.component';
// import { CollapsesAlertComponent } from './collapses-alert/collapses-alert.component';
// import { AutoChangeDirective } from './auto-change.directive';

// import { getMessaging } from 'firebase/messaging';



@NgModule({
  declarations: [
    AppComponent,
    HookComponent,
    HomeComponent,
    HeaderComponent,
    RegisterComponent,
    AccountComponent,
    UpdateAccountComponent,
    QuizzComponent,
    // StudentFormComponent,
    DetailsComponent,
    SettingsListComponent,
    KeysPipe,
    TradeDetailsComponent,
    StripHtmlPipe,
    FooterComponent,
    FirstWordPipe,
    InstallButtonComponent,
    CookieConsentBannerComponent,
    RgpdComponent,
    PartnersComponent,
    ShareButtonComponent,
    DurationPipe,
    RoundPipe,
    FaqComponent,
    TruncateTitlePipe,
    BenefitsComponent,
    LegalInfoComponent,
    AddNbspBeforeQuestionMarkPipe,
    MarketAppComponent,
    ChatComponent,
    // CollapsesAlertComponent,
    // AutoChangeDirective,
    // TooltipComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AdminModule,
    NgOptimizedImage,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideMessaging(() => getMessaging()),
    provideAnalytics(() => getAnalytics(),
    // Désactive les cookies marketing
    //  {
    //   options: {
    //     allow_ad_personalization_signals: false 
    //   }
    // }
  ),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [AuthGuardService, ScreenTrackingService, UserTrackingService, Meta],
  bootstrap: [AppComponent]
})
export class AppModule { }
