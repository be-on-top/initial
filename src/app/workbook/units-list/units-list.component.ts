import { Component } from '@angular/core';
import { WORKBOOK_UNITS } from '../workbookUnits';



@Component({
  selector: 'app-units-list',
  templateUrl: './units-list.component.html',
  styleUrls: ['./units-list.component.css']
})
export class UnitsListComponent {

  units = WORKBOOK_UNITS;

  copyCandidateUrl(candidateRoute: string): void {
    const url = `${window.location.origin}${candidateRoute}`;
    navigator.clipboard.writeText(url);
  }

}
