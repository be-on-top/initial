import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css']
})
export class QuestionDetailsComponent implements OnInit {

  @Input() responsesMedias: any;


  questions: any[] = []

  constructor(private service: QuestionsService, private router: Router) {

  }

  ngOnInit() {

  }

}
