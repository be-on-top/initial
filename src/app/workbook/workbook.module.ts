import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { WorkbookRoutingModule } from './workbook-routing.module';
import { Unit1Component } from './units/unit1/unit1.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    Unit1Component
  ],
  imports: [
    CommonModule,
    WorkbookRoutingModule,
    ReactiveFormsModule
  ]
})
export class WorkbookModule { }
