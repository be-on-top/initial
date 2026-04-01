import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketDocFormComponent } from './market-doc-form.component';

describe('MarketDocFormComponent', () => {
  let component: MarketDocFormComponent;
  let fixture: ComponentFixture<MarketDocFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketDocFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketDocFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
