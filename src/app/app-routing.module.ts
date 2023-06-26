import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { QuizzComponent } from './quizz/quizz.component';
import { SocialFormComponent as AdminForm } from './social/social-form/social-form.component';

const routes: Routes = [
  { path: '', component:HomeComponent },
  { path: 'home/:userRole', component:HomeComponent, pathMatch: 'full' },
  { path: 'admin', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'account', component: AccountComponent },
  { path: 'socialregistration', component: AdminForm},
  { path: 'quizz/:id/:indexQuestion/:scoreCounter/:hasStartedEvaluation/:studentId', component: QuizzComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})

export class AppRoutingModule { }
