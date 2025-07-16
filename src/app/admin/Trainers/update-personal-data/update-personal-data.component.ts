import { Component, EventEmitter, Input} from '@angular/core';
import { NgForm } from '@angular/forms';
import { TrainersService } from '../../trainers.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-personal-data',
  templateUrl: './update-personal-data.component.html',
  styleUrls: ['./update-personal-data.component.css']
})
export class UpdatePersonalDataComponent {

  studentId: any
  // student va ici être procuré par trainerDetails en tant que parent
  // va recevoir la data de student depuis trainerDetails 
  @Input() trainer: any;

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

  constructor(private service: TrainersService, private router: Router) {
    this.currentPassword = ''
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

  updatePerso(form: NgForm) {
    if (!form.valid) {
      return;
    }

    console.log("Form value before sending to service !:", form.value);

    this.service.updateTrainer(this.trainer.id, form.value)

      .then(() => {
        console.log("Update successful");
      })
      .catch((error) => {
        console.error("Update failed", error);
      });
  }

}
