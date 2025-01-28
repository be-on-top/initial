import { Component, Input } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { StudentsService } from 'src/app/admin/students.service';


@Component({
  selector: 'app-update-account',
  templateUrl: './update-account.component.html',
  styleUrls: ['./update-account.component.css']
})
export class UpdateAccountComponent {

  studentId: any
  // student va ici être procuré par account en tant que parent
  // student: any = {}
  // selectedSigles: string[] = []
  // va recevoir la data de student depuis account 
  @Input() student: any;

  // variables à passer à feedbackMessages component pour retours de firebase sur la soumission
  feedbackMessages?: any = ""
  isSuccessMessage: boolean = true
  // essai pour personnaliser les messages
  // https://firebase.google.com/docs/auth/admin/errors?hl=fr
  // firebaseErrors:any = {
  //   'auth/user-not-found': 'Aucun utilisateur ne correspond à cet email',
  //   'auth/email-already-in-use': 'Cet email est déjà utilisé pour un autre compte',
  //   'auth/wrong-password' : 'Le mot de passe est incorrect',
  //   'auth/invalid-email' : 'Aucun enregistrement ne correspond au mail fourni'
  // }; // list of firebase error codes to alternate error messages

  currentPassword?: string
  constructor(private service: StudentsService, private router: Router) {
    this.currentPassword=''

  }

  // updateStudent(form: NgForm) {
  //   if (!form.valid) {
  //     return;
  //   }
  
  //   const currentPassword = this.currentPassword; // Assurez-vous que ce champ est défini dans le composant
  //   this.service.updateStudent(this.student.id, form.value)
  //     .then(() => {
  //       console.log("Update successful");
  //     })
  //     .catch((error) => {
  //       console.error("Update failed", error);
  //     });
  // }

  updateStudent(form: NgForm) {
    if (!form.valid) {
      return;
    }
  
    console.log("Form value before sending to service !!!!!!!!!!!!!!!:", form.value);
  
    this.service.updateStudent(this.student.id, form.value)
      .then(() => {
        console.log("Update successful");
      })
      .catch((error) => {
        console.error("Update failed", error);
      });
  }
  
  
  


}
