import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateExternalComponent } from './update-external.component';

describe('UpdateExternalComponent', () => {
  let component: UpdateExternalComponent;
  let fixture: ComponentFixture<UpdateExternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateExternalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
