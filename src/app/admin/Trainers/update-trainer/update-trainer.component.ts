import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainersService } from '../../trainers.service';
import { StudentsService } from '../../students.service';
// import { getToken, getMessaging } from '@firebase/messaging';
import { PushNotificationService } from 'src/app/push-notification.service';

@Component({
  selector: 'app-update-trainer',
  templateUrl: './update-trainer.component.html',
  styleUrls: ['./update-trainer.component.css']
})
export class UpdateTrainerComponent implements OnInit {
  userId: any
  user: any = {}
  selectedSigles: string[] = []
  // pour affecter des étudiants à son compte
  studentsList: any = []

  constructor(private service: TrainersService, private ac: ActivatedRoute, private router: Router, private studentsService: StudentsService, private notificationsService:PushNotificationService) {
    this.userId = this.ac.snapshot.params["id"];
    // on fait appel à geTrainer pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getTrainer(this.userId).subscribe((data) => {
      console.log("data depuis update-user component", data);
      this.user = data
    })

  }

  ngOnInit(): void {
    // parce que j'ai besoin de récupérer la liste pour les affectations
    this.studentsService.getStudents().subscribe((students) => {
      this.studentsList = students
    })
  }

  updateUser(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form non valid');
      return
    }

    console.log("form update values", form.value);
    this.service.updateTrainer(this.userId, form.value)
    // pour notifier le(s) candidat(s) concerné(s)
    // this.notificationsService.notifyStudent(form.value)
    // puis redirection
    this.router.navigate(['/admin/trainer', this.userId])
  }

  // pour affecation métiers
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }


}