import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { QuizzComponent } from './quizz/quizz.component';
import { SocialFormComponent as AdminForm } from './social/social-form/social-form.component';
import { TradeDetailsComponent } from './trades/trade-details/trade-details.component';
import { LoginComponent } from './admin/login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuardService } from './auth-guard.service';

const routes: Routes = [
  { path: 'home', component: HomeComponent, pathMatch: 'full', canActivate: [AuthGuardService] },
  // Route par défaut pour la page d'accueil (peut-être redirigée vers une autre route si nécessaire)

  { path: 'register', component: RegisterComponent },
  // Routes pour les fonctionnalités d'administration (AdminModule gère l'authentification)
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  // Routes pour les autres fonctionnalités publiques (pas besoin de protection ici)
  { path: 'account', component: AccountComponent },
  { path: 'socialregistration', component: AdminForm },
  { path: 'quizz/:id/:indexQuestion/:scoreCounter/:hasStartedEvaluation/:studentId', component: QuizzComponent },
  { path: 'trade/:id', component: TradeDetailsComponent },
  { path: 'home/:userRole', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

    // La route par défaut pour la page d'accueil (peut-être redirigée vers une autre route si nécessaire)
    { path: '', redirectTo: 'home', pathMatch: 'full' },
  
    // Redirection des routes inconnues vers la page d'accueil
    { path: '**', redirectTo: 'home' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes,{
    onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})

export class AppRoutingModule { }
