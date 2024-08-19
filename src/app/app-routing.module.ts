import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { QuizzComponent } from './quizz/quizz.component';
import { StudentFormComponent as AdminForm } from './student-form/student-form.component';
import { TradeDetailsComponent } from './trades/trade-details/trade-details.component';
// import { LoginComponent } from './admin/login/login.component';
// import { RegisterComponent } from './register/register.component';
import { AuthGuardService } from './auth-guard.service';
import { RgpdComponent } from './rgpd/rgpd.component';
import { PartnersComponent } from './partners/partners.component';
import { historyGuard } from './guards/history.guard';
import { BenefitsComponent } from './benefits/benefits.component';
import { MarketAppComponent } from './market-app/market-app.component';
import { CenterDetailsComponent } from './admin/Centers/center-details/center-details.component';
import { CentersListComponent } from './admin/Centers/centers-list/centers-list.component';
import { ChatComponent } from './chat/chat.component';

// const routes: Routes = [
//   { path: 'home', component: HomeComponent, pathMatch: 'full', canActivate: [AuthGuardService] },
//   // Route par défaut pour la page d'accueil (peut-être redirigée vers une autre route si nécessaire)

//   { path: 'register', component: RegisterComponent },
//   // Routes pour les fonctionnalités d'administration (AdminModule gère l'authentification)
//   // { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
//   // Routes pour les autres fonctionnalités publiques (pas besoin de protection ici)
//   { path: 'account', component: AccountComponent },
//   { path: 'socialregistration', component: AdminForm },
//   { path: 'quizz/:id/:indexQuestion/:scoreCounter/:hasStartedEvaluation/:studentId', component: QuizzComponent },
//   { path: 'trade/:id', component: TradeDetailsComponent },
//   { path: 'home/:userRole', component: HomeComponent, pathMatch: 'full' },
//   { path: 'login', component: LoginComponent },

//     // La route par défaut pour la page d'accueil (peut-être redirigée vers une autre route si nécessaire)
//     { path: '', redirectTo: 'home', pathMatch: 'full' },
  
//     // Redirection des routes inconnues vers la page d'accueil
//     { path: '**', redirectTo: 'home' }
// ];
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'rgpd', component: RgpdComponent },
  { path: 'home/:userRole', component: HomeComponent, pathMatch: 'full' },
  { path: 'partners', component: PartnersComponent },
  // { path: 'admin', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuardService] },
  { path: 'socialregistration', component: AdminForm},
  { path: 'benefits', component: BenefitsComponent},
  { path: 'market-app', component: MarketAppComponent},  
  { path: 'centers', component: CentersListComponent},  
  { path: 'quizz/:id/:indexQuestion/:scoreCounter/:hasStartedEvaluation/:studentId', component: QuizzComponent, canActivate: [AuthGuardService, historyGuard]},
  { path: 'trade/:id/:slug', component: TradeDetailsComponent},
  { path: 'trade/:id', component: TradeDetailsComponent},
  { path: 'formation/:id/:slug', component: TradeDetailsComponent},
  { path: 'formation/:id', component: TradeDetailsComponent},
  { path: 'center/:id', component: CenterDetailsComponent},
  { path: 'chat/:id', component: ChatComponent},


];


@NgModule({
  imports: [RouterModule.forRoot(routes,{
    onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})

export class AppRoutingModule { }
