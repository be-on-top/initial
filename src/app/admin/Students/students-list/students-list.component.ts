import { AfterViewInit, Component, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { Student } from '../student';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.css']
})
export class StudentsListComponent implements OnInit, AfterViewInit {

  allStudents: any[] = [];
  // pour différencier la vue si user external
  userRouterLinks: any;

  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  // on pourrait avoir directement dans le template une méthode  pour réinitialiser le composant

  constructor(private service: StudentsService, private activatedRoute: ActivatedRoute) {
    this.userRouterLinks = this.activatedRoute.snapshot.data;
  }

  ngOnInit() {
    this.getStudents();
    this.onSearchTextEntered("")
  }

  ngAfterViewInit() {
    
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

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    console.log(searchValue);

      this.searchText = searchValue
      console.log(this.searchText);

  }
  


}
