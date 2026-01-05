import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentersIndexComponent } from './centers-index.component';

describe('CentersIndexComponent', () => {
  let component: CentersIndexComponent;
  let fixture: ComponentFixture<CentersIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentersIndexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentersIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
