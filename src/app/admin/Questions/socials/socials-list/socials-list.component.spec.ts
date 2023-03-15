import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialsListComponent } from './socials-list.component';

describe('SocialsListComponent', () => {
  let component: SocialsListComponent;
  let fixture: ComponentFixture<SocialsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
