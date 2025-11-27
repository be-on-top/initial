import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingStatsComponent } from './training-stats.component';

describe('TrainingStatsComponent', () => {
  let component: TrainingStatsComponent;
  let fixture: ComponentFixture<TrainingStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
