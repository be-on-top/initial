import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { StudentsService } from '../admin/students.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  // recuperation code sv
  constructor(private studentAddService: StudentsService) { }

  addStudent(form: NgForm) {
    /* console.log(form.value); */

    if (!this.validateEmail(form.value.email)) { // vérifier si l'adresse e-mail est valide
      alert("Adresse e-mail non valide!");
    } else if (form.value.studentPw.length < 8) { // tester si le mot de passe contient au moins 8 caractères
      alert("Attention: Le mot de passe doit contenir au moins 8 caractères!");
    } else if (/\s/.test(form.value.studentPw)) { // vérifier si le mot de passe ne contient pas d'espace
      alert("Attention: Le mot de passe ne doit pas contenir d'espaces vides!");
    } else {
    this.studentAddService.createStudent(form.value);
    form.reset();
    }
  }

  valid: boolean = false;

  validateEmail(mailInput: any) { //fonction de vérification d'e-mail, retourne vrai ou faux !
    const regex = /\S+@\S+\.\S+/;
    this.valid = regex.test(mailInput);

    return this.valid;
  }

  showPassword: boolean = false;

  toggleDisplayPassword(event:any) {
    this.showPassword = !this.showPassword;
  }

  validateField(textInput: any) {
    if (!textInput.valid) {
      this.valid = false;
    } else {
      this.valid = true;
    }

  }

}
