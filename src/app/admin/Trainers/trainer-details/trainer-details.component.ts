import { Component, OnInit } from '@angular/core';
import { TrainersService } from '../../trainers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../../students.service';
// import { StudentDetailsComponent } from '../../Students/student-details/student-details.component';
// import { pipe } from 'rxjs';



@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.css']
})

export class TrainerDetailsComponent implements OnInit {
  userId: any;
  user: any
  studentsList?: any = []

  constructor(private service: TrainersService, private ac: ActivatedRoute, private router: Router, private studentsService: StudentsService) {
    this.userId = this.ac.snapshot.params["id"];

  }

  ngOnInit(): void {
    // this.getFullIdentity(this.user.students)
    this.service.getTrainer(this.userId)
      .subscribe(data => {
        console.log("data de getTrainer", data);
        this.user = data
        console.log('element!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', this.user.students)
        // option test à revoir
        // if (this.user.students) {
        //   let affectedStudentData;
        //   this.user.students.forEach((element:any) => {            
        //     console.log(element.id, ' => ', element)
        //     affectedStudentData= this.studentsService.getStudentById(element)
        //     this.studentsList.push(affectedStudentData)
        //   });
        // }

       

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
    this.service.deleteTrainer(userId)
    this.router.navigate(['/admin/trainers'])
  }

  ngOnDestroy(): void {
    this.studentsList = []

  }

}
