import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorFormComponent } from './prior-form.component';

describe('PriorFormComponent', () => {
  let component: PriorFormComponent;
  let fixture: ComponentFixture<PriorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriorFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
