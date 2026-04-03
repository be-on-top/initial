import { Component } from '@angular/core';
import { AccessibilityComplianceReportComponent } from '../accessibility-compliance-report/accessibility-compliance-report.component';


@Component({
  selector: 'app-legal-info',
  templateUrl: './legal-info.component.html',
  styleUrls: ['./legal-info.component.css'],
  standalone: true, // <--- AJOUTE ÇA
  imports: [
    AccessibilityComplianceReportComponent
  ]
})
export class LegalInfoComponent {

}
