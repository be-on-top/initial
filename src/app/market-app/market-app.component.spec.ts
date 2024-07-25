import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketAppComponent } from './market-app.component';

describe('MarketAppComponent', () => {
  let component: MarketAppComponent;
  let fixture: ComponentFixture<MarketAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
