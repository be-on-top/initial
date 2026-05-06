import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Unit1Component } from './units/unit1/unit1.component';

const routes: Routes = [
  { path: 'unit1', component: Unit1Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkbookRoutingModule {}
