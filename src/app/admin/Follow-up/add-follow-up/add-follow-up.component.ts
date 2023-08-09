import { Component } from '@angular/core';
import { StudentsService } from '../../students.service';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-follow-up',
  templateUrl: './add-follow-up.component.html',
  styleUrls: ['./add-follow-up.component.css']
})
export class AddFollowUpComponent {

  studentId: string = ""

  constructor(private service: StudentsService, private activatedRoute: ActivatedRoute) {
    this.studentId = this.activatedRoute.snapshot.params['id']
  }


  addEvaluation(studentId: string, evaluation: NgForm) {
    console.log(evaluation.value.date)
    // let evaluations:any={}
    let evalKey: string = 'evaluation-' + evaluation.value.date + Math.floor(Math.random() * 2)
    const evaluations = { [evalKey]: evaluation.value }
    this.service.addFollowUpEvaluation(studentId, { evaluations })
  }

}
