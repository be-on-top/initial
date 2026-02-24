import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnovationToastComponent } from './innovation-toast.component';

describe('InnovationToastComponent', () => {
  let component: InnovationToastComponent;
  let fixture: ComponentFixture<InnovationToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InnovationToastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InnovationToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
