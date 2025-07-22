import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityComplianceReportComponent } from './accessibility-compliance-report.component';

describe('AccessibilityComplianceReportComponent', () => {
  let component: AccessibilityComplianceReportComponent;
  let fixture: ComponentFixture<AccessibilityComplianceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessibilityComplianceReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessibilityComplianceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
