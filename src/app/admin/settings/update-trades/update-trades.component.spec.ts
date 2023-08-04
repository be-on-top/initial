import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTradesComponent } from './update-trades.component';

describe('UpdateTradesComponent', () => {
  let component: UpdateTradesComponent;
  let fixture: ComponentFixture<UpdateTradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateTradesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
