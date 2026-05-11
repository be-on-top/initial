import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewsEditComponent } from './admin-news-edit.component';

describe('AdminNewsEditComponent', () => {
  let component: AdminNewsEditComponent;
  let fixture: ComponentFixture<AdminNewsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminNewsEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNewsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
