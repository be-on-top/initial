import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFullComponent } from './update-full.component';

describe('UpdateFullComponent', () => {
  let component: UpdateFullComponent;
  let fixture: ComponentFixture<UpdateFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateFullComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
