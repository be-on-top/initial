import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachStudentModalComponent } from './attach-student-modal.component';

describe('AttachStudentModalComponent', () => {
  let component: AttachStudentModalComponent;
  let fixture: ComponentFixture<AttachStudentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachStudentModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachStudentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
