import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HookComponent } from './hook/hook.component';
import { AdminModule } from './admin/admin.module';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { RegisterComponent } from './register/register.component';
import { ServiceWorkerModule} from '@angular/service-worker';
import { AccountComponent } from './account/account.component';
// pour appliquer à la lettre la division des tâches. ceci ne me semble pourtant pas très pertinent ici. 
import { UpdateAccountComponent } from './account/update-account/update-account.component';
import { QuizzComponent } from './quizz/quizz.component';
import { SocialFormComponent } from './social/social-form/social-form.component';
import { DetailsComponent } from './quizz/vues/details/details.component';
import { SettingsListComponent } from './admin/settings/settings-list/settings-list.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { KeysPipe } from './quizz/keys.pipe';
import { TradeDetailsComponent } from './trades/trade-details/trade-details.component';
import { StripHtmlPipe } from './strip-html.pipe';
import { AuthGuardService } from './auth-guard.service';
import { FooterComponent } from './footer/footer/footer.component';
import { FirstWordPipe } from './first-word.pipe';

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
    SocialFormComponent,
    DetailsComponent,
    SettingsListComponent,
    KeysPipe,
    TradeDetailsComponent,
    StripHtmlPipe,
    FooterComponent,
    FirstWordPipe,
    // TooltipComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AdminModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(()=>getStorage()),
    provideMessaging(()=>getMessaging()),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
