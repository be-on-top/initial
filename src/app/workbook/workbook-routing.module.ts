import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Unit1Component } from './units/unit1/unit1.component';
import { Unit2Component } from './units/unit2/unit2.component';
import { Unit3Component } from './units/unit3/unit3.component';


const routes: Routes = [
  { path: 'unit1', component: Unit1Component },
  // pour pouvoir accéder  à  : http://localhost:4200/workbook/unit1/GEzJgCWOeTa7O7xKCDzXeDVHNc23
  { path: 'unit1/:uid', component: Unit1Component },
  { path: 'unit2', component: Unit2Component },
  // pour pouvoir accéder  à  : http://localhost:4200/workbook/unit2/GEzJgCWOeTa7O7xKCDzXeDVHNc23
  { path: 'unit2/:uid', component: Unit2Component },
  { path: 'unit3', component: Unit3Component },
  // pour pouvoir accéder  à  : http://localhost:4200/workbook/unit3/GEzJgCWOeTa7O7xKCDzXeDVHNc23
  { path: 'unit3/:uid', component: Unit3Component },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkbookRoutingModule { }
