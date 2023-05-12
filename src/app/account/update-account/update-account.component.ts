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

  constructor(private service: StudentsService, private router: Router) {

  }

  updateStudent(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      /* console.log('form valid'); */
      return
    }
    /* console.log("form update values", form.value); */
    this.service.updateStudent(this.studentId, form.value)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/student', this.studentId])
  }

}
