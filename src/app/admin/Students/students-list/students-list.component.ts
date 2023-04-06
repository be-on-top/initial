import { Component, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { Student } from '../student';

@Component({
  selector: 'app-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.css']
})
export class StudentsListComponent implements OnInit {

  allStudents: any[] = [];
  constructor(private service: StudentsService) { }

  ngOnInit() {
    this.getStudents();
  }
  getStudents() {
    this.service.getStudents().subscribe(students => {
      this.allStudents = students;
      /* console.log(this.allStudents); */
    });
  }

  deleteStudent(student: Student) {
    /* console.log(student); */  
    this.service.deleteStudent(student);
    this.getStudents();
  }

}
