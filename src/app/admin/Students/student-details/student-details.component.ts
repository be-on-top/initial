import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../students.service';
import { Student } from '../student';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent {

  editMode: boolean = false;
  editedStudent?: Student; 
  editing: boolean = false;
  studentId: string= "";
  // @Input() student: Student;
  student?:Student
  // @Output() deleteStudent = new EventEmitter<Student>();

  constructor(
    private service: StudentsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.studentId = this.route.snapshot.params['id'];
    if (!this.studentId) {
      console.error('studentId is undefined.');
      return;
    }
    this.getStudentDetails(this.studentId);
  }
  
  getStudentDetails(studentId: string) {
    this.service.getStudentById(studentId).subscribe(student => {
      this.student = student;   
      /* console.log(studentId); */
    });
  }

  delete(student: Student) {
    /* console.log(student);   */
    this.service.deleteStudent(student);
  }



}
