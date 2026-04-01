import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketDocsListComponent } from './market-docs-list.component';

describe('MarketDocsListComponent', () => {
  let component: MarketDocsListComponent;
  let fixture: ComponentFixture<MarketDocsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketDocsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketDocsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
