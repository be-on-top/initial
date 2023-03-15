import { NgModule } from '@angular/core';

// à voir
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { EvaluatorsListComponent } from './Evaluators/evaluators-list/evaluators-list.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddEvaluatorComponent } from './Evaluators/add-evaluator/add-evaluator.component';
import { EvaluatorDetailsComponent } from './Evaluators/evaluator-details/evaluator-details.component';
import { UpdateEvaluatorComponent } from './Evaluators/update-evaluator/update-evaluator.component';
import { PriorFormComponent } from './Questions/priors/prior-form/prior-form.component';
import { QuestionDetailsComponent } from './Questions/priors/question-details/question-details.component';
import { QuestionsListComponent } from './Questions/priors/questions-list/questions-list.component';
import { UpdateQuestionComponents } from './Questions/update-question/update-question.component';
import { SocialFormComponent } from './Questions/socials/social-form/social-form.component';

// import { EvaluatorDetailsComponent } from './Evaluators/evaluator-details/evaluator-details.component';


const routesAdmin: Routes = [
  { path: 'evaluators', component: EvaluatorsListComponent },
  { path: 'addEvaluator', component: AddEvaluatorComponent },
  { path: 'evaluator/:id', component: EvaluatorDetailsComponent },
  { path: 'updateEvaluator/:id', component: UpdateEvaluatorComponent },
  { path: 'priorForm', component: PriorFormComponent },
  { path: 'questions', component: QuestionsListComponent },
  { path: 'questionDetails', component: QuestionDetailsComponent },
  { path: 'socialForm', component: SocialFormComponent },

];

@NgModule({
  declarations: [
    EvaluatorsListComponent,
    AddEvaluatorComponent,
    EvaluatorDetailsComponent,
    UpdateEvaluatorComponent, PriorFormComponent, QuestionDetailsComponent, QuestionsListComponent, UpdateQuestionComponents, SocialFormComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild(routesAdmin)
  ]
})
export class AdminModule { }

