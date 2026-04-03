import { Component } from '@angular/core';
import { AccessibilityComplianceReportComponent } from '../accessibility-compliance-report/accessibility-compliance-report.component';

@Component({
  selector: 'app-rse',
  templateUrl: './rse.component.html',
  styleUrls: ['./rse.component.css'],
   standalone: true, // <--- AJOUTE ÇA
  imports: [
    AccessibilityComplianceReportComponent
  ]
})
export class RseComponent {

}
