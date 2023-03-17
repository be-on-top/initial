import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSocialComponent } from './update-social.component';

describe('UpdateSocialComponent', () => {
  let component: UpdateSocialComponent;
  let fixture: ComponentFixture<UpdateSocialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateSocialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSocialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
