import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEvaluatorComponent } from './update-evaluator.component';

describe('UpdateEvaluatorComponent', () => {
  let component: UpdateEvaluatorComponent;
  let fixture: ComponentFixture<UpdateEvaluatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateEvaluatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateEvaluatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
