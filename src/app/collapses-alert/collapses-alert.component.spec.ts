import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsesAlertComponent } from './collapses-alert.component';

describe('CollapsesAlertComponent', () => {
  let component: CollapsesAlertComponent;
  let fixture: ComponentFixture<CollapsesAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollapsesAlertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollapsesAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
