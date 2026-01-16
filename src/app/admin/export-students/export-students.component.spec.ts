import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportStudentsComponent } from './export-students.component';

describe('ExportStudentsComponent', () => {
  let component: ExportStudentsComponent;
  let fixture: ComponentFixture<ExportStudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportStudentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
