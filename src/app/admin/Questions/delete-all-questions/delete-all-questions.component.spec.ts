import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAllQuestionsComponent } from './delete-all-questions.component';

describe('DeleteAllQuestionsComponent', () => {
  let component: DeleteAllQuestionsComponent;
  let fixture: ComponentFixture<DeleteAllQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteAllQuestionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteAllQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
