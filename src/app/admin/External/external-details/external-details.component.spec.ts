import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalDetailsComponent } from './external-details.component';

describe('ExternalDetailsComponent', () => {
  let component: ExternalDetailsComponent;
  let fixture: ComponentFixture<ExternalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
