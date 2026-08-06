import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePartnersComponent } from './update-partners.component';

describe('UpdatePartnersComponent', () => {
  let component: UpdatePartnersComponent;
  let fixture: ComponentFixture<UpdatePartnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatePartnersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
