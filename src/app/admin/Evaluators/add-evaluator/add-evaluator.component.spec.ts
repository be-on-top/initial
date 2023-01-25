import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEvaluatorComponent } from './add-evaluator.component';

describe('AddEvaluatorComponent', () => {
  let component: AddEvaluatorComponent;
  let fixture: ComponentFixture<AddEvaluatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEvaluatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEvaluatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
