import { Component } from '@angular/core';
import { StudentsService } from '../../students.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-update-student',
  templateUrl: './update-student.component.html',
  styleUrls: ['./update-student.component.css']
})
export class UpdateStudentComponent {

  studentId: any
  student: any = {}
  // selectedSigles: string[] = []

  constructor(private service: StudentsService, private ac: ActivatedRoute, private router: Router) {

    this.studentId = this.ac.snapshot.params["id"];
    console.log("voici l'ID", this.studentId); 
    // on fait appel à getstudent pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getStudentById(this.studentId).subscribe((data) => {
      /* console.log("data depuis update-student component", data); */
      this.student = data
    })

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
