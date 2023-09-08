import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TutorsService } from '../../tutors.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../../students.service';

@Component({
  selector: 'app-update-tutor',
  templateUrl: './update-tutor.component.html',
  styleUrls: ['./update-tutor.component.css']
})

export class UpdateTutorComponent implements OnInit {

  userId: string = ""
  user: any = {}
  selectedSigles: string[] = []
  // pour affecter des étudiants à son compte
  studentsList: any = []

  constructor(private service: TutorsService, private ac: ActivatedRoute, private router: Router, private studentsService: StudentsService) {
  }

  ngOnInit(): void {
    this.userId = this.ac.snapshot.params["id"];
    // on fait appel à geTutor pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getTutor(this.userId).subscribe((data) => {
      console.log("data depuis update-user component", data);
      this.user = data
    })

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
    this.service.updateTutor(this.userId, form.value)
    // pour notifier le(s) candidat(s) concerné(s)
    // this.notificationsService.notifyStudent(form.value)
    // puis redirection
    this.router.navigate(['/admin/tutor', this.userId])
  }

  // pour affecation métiers
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }

}
