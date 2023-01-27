import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluatorDetailsComponent } from './evaluator-details.component';

describe('EvaluatorDetailsComponent', () => {
  let component: EvaluatorDetailsComponent;
  let fixture: ComponentFixture<EvaluatorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluatorDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluatorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
