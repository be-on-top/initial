import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExternalComponent } from './add-external.component';

describe('AddExternalComponent', () => {
  let component: AddExternalComponent;
  let fixture: ComponentFixture<AddExternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddExternalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
