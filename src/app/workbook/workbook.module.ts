import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { WorkbookRoutingModule } from './workbook-routing.module';
import { Unit1Component } from './units/unit1/unit1.component';
import { Unit2Component } from './units/unit2/unit2.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DocVoisinsComponent } from './units/unit2/doc-voisins/doc-voisins.component';
import { Unit3Component } from './units/unit3/unit3.component';
import { DocumentBatimentComponent } from './units/unit3/document-batiment/document-batiment.component';
import { DocumentEolienComponent } from './units/unit3/document-eolien/document-eolien.component';
import { UnitsListComponent } from './units-list/units-list.component';




@NgModule({
  declarations: [
    Unit1Component,
    Unit2Component,
    DocVoisinsComponent,
    Unit3Component,
    DocumentBatimentComponent,
    DocumentEolienComponent,
    UnitsListComponent
  ],
  imports: [
    CommonModule,
    WorkbookRoutingModule,
    ReactiveFormsModule
  ]
})
export class WorkbookModule { }
