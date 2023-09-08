import { Component } from '@angular/core';
import { TutorsService } from '../../tutors.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../../students.service';

@Component({
  selector: 'app-tutor-details',
  templateUrl: './tutor-details.component.html',
  styleUrls: ['./tutor-details.component.css']
})
export class TutorDetailsComponent {

  userId: string = "";
  user: any
  studentsList?: any = []

  constructor(private service: TutorsService, private ac: ActivatedRoute, private router: Router, private studentsService: StudentsService) {
    this.userId = this.ac.snapshot.params["id"];

  }

  ngOnInit(): void {
    // this.getFullIdentity(this.user.students)
    this.service.getTutor(this.userId)
      .subscribe(data => {
        console.log("data de getTrainer", data);
        this.user = data
        console.log('this.user.students', this.user.students)     

        // option concluante 
        if (this.user.students) {
          let list: any = [];
          for (let student of this.user.students) {
            console.log('ce que je récupère getLinkedStudentName', this.service.getLinkedStudentName(student));
            this.service.getLinkedStudentName(student).subscribe(dataStudent => list.push(dataStudent.lastName))
          }
          this.studentsList = list
        }

      })


  }


  deleteUser(userId: string) {
    console.log(userId);
    this.service.deleteTutor(userId)
    this.router.navigate(['/admin/trainers'])
  }

  ngOnDestroy(): void {
    this.studentsList = []

  }

}
