import { Component, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { TrainersService } from '../../trainers.service';

@Component({
  selector: 'app-students-list',
  templateUrl: './my-students.component.html',
  styleUrls: ['./my-students.component.css']
})
export class MyStudentsComponent implements OnInit {


  myStudents: any[] = [];
  user?: any
  userLastName?: any

  constructor(private service: StudentsService, private auth: Auth, private trainerService: TrainersService) { }

  ngOnInit() {

    onAuthStateChanged(this.auth, (user: any) => {
      // impeccable
      // console.log("this.user dispensé par onAuthStateChanged", this.auth.currentUser);
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user.uid
        console.log('utilisateur authentifié', this.user)

        // pour récupérer le nom de l'utilisateur authentifié, mais faudra changer ça :
        this.trainerService.getTrainer(user.uid).subscribe(data => {
          console.log("userData from myStudents 0...", data)
          console.log("userData lastName from myStudents...", data.lastName)
          this.userLastName = data.lastName

          // et maintenant qu'on a le lastName
          this.service.getStudents().subscribe(students => {
            students.filter((student): any => {
              console.log('student qu\'on essaie de filtrer', student.trainer)           
              student.trainer.includes(this.userLastName)?this.myStudents.push(student):''
            })
      
            console.log(this.myStudents)
          })


        })

      }

    })



  }

  // getStudents() {
  //   this.service.getStudents().subscribe(students => {
  //     this.myStudents = students.filter((student): any => {
  //       student.trainer = this.userLastName
  //     })

  //     console.log(this.myStudents)
  //   })
  // }

}
