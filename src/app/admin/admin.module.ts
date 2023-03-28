import { NgModule } from '@angular/core';

// à voir
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { EvaluatorsListComponent } from './Evaluators/evaluators-list/evaluators-list.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AddEvaluatorComponent } from './Evaluators/add-evaluator/add-evaluator.component';
import { EvaluatorDetailsComponent } from './Evaluators/evaluator-details/evaluator-details.component';
import { UpdateEvaluatorComponent } from './Evaluators/update-evaluator/update-evaluator.component';
import { PriorFormComponent } from './Questions/priors/prior-form/prior-form.component';
import { QuestionDetailsComponent } from './Questions/priors/question-details/question-details.component';
import { QuestionsListComponent } from './Questions/priors/questions-list/questions-list.component';
import { UpdateQuestionComponents } from './Questions/priors/update-question/update-question.component';
import { SocialFormComponent } from './Questions/socials/social-form/social-form.component';
import { SocialsListComponent } from './Questions/socials/socials-list/socials-list.component';
import { UpdateSocialComponent } from './Questions/socials/update-social/update-social.component';
import { SocialDetailsComponent } from './Questions/socials/social-details/social-details.component';
import { FullFormComponent } from './Questions/fulls/full-form/full-form.component';
import { FullListComponent } from './Questions/fulls/full-list/full-list.component';
import { FullDetailsComponent } from './Questions/fulls/full-details/full-details.component';
import { UpdateFullComponent } from './Questions/fulls/update-full/update-full.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from '../register/register.component';
import { AuthGuardService } from '../auth-guard.service';
import { SearchComponent } from '../search/search.component';

// import { EvaluatorDetailsComponent } from './Evaluators/evaluator-details/evaluator-details.component';


const routesAdmin: Routes = [
  
  {path: 'admin', children:[

    { path: 'evaluators', component: EvaluatorsListComponent },
    { path: 'addEvaluator', component: AddEvaluatorComponent },
    { path: 'evaluator/:id', component: EvaluatorDetailsComponent },
    { path: 'updateEvaluator/:id', component: UpdateEvaluatorComponent },
    { path: 'priorForm', component: PriorFormComponent},
    { path: 'questions', component: QuestionsListComponent },
    { path: 'questionDetails', component: QuestionDetailsComponent },
    { path: 'updateQuestion/:id', component: UpdateQuestionComponents },
    { path: 'socialForm', component: SocialFormComponent },
    { path: 'socials', component: SocialsListComponent },
    { path: 'updateSocial/:id', component: UpdateSocialComponent },
    { path: 'fullForm', component: FullFormComponent },
    { path: 'fullList', component: FullListComponent },
    { path: 'fullDetails', component: FullDetailsComponent },
    { path: 'updateFull/:id', component: UpdateFullComponent}
  ], 
  // canActivate:[AuthGuardService] 
},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent}

];

@NgModule({
  declarations: [
    EvaluatorsListComponent,
    AddEvaluatorComponent,
    EvaluatorDetailsComponent,
    UpdateEvaluatorComponent, PriorFormComponent, QuestionDetailsComponent, QuestionsListComponent, UpdateQuestionComponents, SocialFormComponent, SocialsListComponent, UpdateSocialComponent, SocialDetailsComponent, FullFormComponent, FullListComponent, FullDetailsComponent, UpdateFullComponent, LoginComponent, SearchComponent 
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routesAdmin)
  ]
})

export class AdminModule { }

