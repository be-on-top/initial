import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluatorsListComponent } from './evaluators-list.component';

describe('EvaluatorsListComponent', () => {
  let component: EvaluatorsListComponent;
  let fixture: ComponentFixture<EvaluatorsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluatorsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluatorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
