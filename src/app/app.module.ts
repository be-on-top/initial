import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";

// Firebase
// Trouver l'équivalent des 2 lignes ci-dessous pour l'ajout d'éléments à une collection
// import { AngularFireModule } from '@angular/fire/compat';
// import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { environment } from '../environments/environment';

import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HookComponent } from './hook/hook.component';
import { AdminModule } from './admin/admin.module';
// les 2 lignes ci-dessous, ne sont que pour tests préalables avant d'avoir implémenter un menu de navigation
import { AddEvaluatorComponent } from './admin/Evaluators/add-evaluator/add-evaluator.component';
import { EvaluatorsListComponent } from './admin/Evaluators/evaluators-list/evaluators-list.component';
import { HomeComponent } from './home/home.component';


@NgModule({
  declarations: [
    AppComponent,
    HookComponent,
    AddEvaluatorComponent,
    EvaluatorsListComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AdminModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
