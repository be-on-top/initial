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
// import { EvaluatorDetailsComponent } from './Evaluators/evaluator-details/evaluator-details.component';
EvaluatorDetailsComponent


const routesAdmin: Routes = [
  { path: 'evaluators', component: EvaluatorsListComponent},
  { path: 'addEvaluator', component: AddEvaluatorComponent },
  { path: 'evaluator/:id', component: EvaluatorDetailsComponent},
  { path: 'updateEvaluator/:id', component: UpdateEvaluatorComponent }

];

@NgModule({
  declarations: [
    EvaluatorsListComponent,
    AddEvaluatorComponent,
    EvaluatorDetailsComponent,  
    UpdateEvaluatorComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild(routesAdmin)
  ]
})
export class AdminModule { }

