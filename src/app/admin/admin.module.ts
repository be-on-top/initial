import { NgModule } from '@angular/core';

// à voir
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { EvaluatorsListComponent } from './Evaluators/evaluators-list/evaluators-list.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddEvaluatorComponent } from './Evaluators/add-evaluator/add-evaluator.component';


const routesAdmin: Routes = [
  { path: 'evaluators', component: EvaluatorsListComponent},
  { path: 'addEvaluator', component: AddEvaluatorComponent }
];

@NgModule({
  declarations: [
    // EvaluatorsListComponent,
    // AddEvaluatorComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild(routesAdmin)
  ]
})
export class AdminModule { }

