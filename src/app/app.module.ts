import { NgModule } from '@angular/core';
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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HookComponent } from './hook/hook.component';
import { AdminModule } from './admin/admin.module';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { RegisterComponent } from './register/register.component';
// import { SocialComponentComponent } from './admin/Questions/social-component/social-component.component';


@NgModule({
  declarations: [
    AppComponent,
    HookComponent,
    // AddEvaluatorComponent,
    // EvaluatorsListComponent,
    // EvaluatorDetailsComponent,
    HomeComponent,
    HeaderComponent,
    RegisterComponent
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
    provideStorage(()=>getStorage())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
