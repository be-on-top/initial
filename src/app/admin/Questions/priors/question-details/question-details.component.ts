import { Component, OnInit, Input } from '@angular/core';
// import { Router } from '@angular/router';
import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css']
})
export class QuestionDetailsComponent implements OnInit {

  @Input() q: any;

  questionsMedias: any = []
  responsesMedias: any = []

  constructor(private service: QuestionsService) {
  }

  ngOnInit() {
    // this.allSocialMediaByQid = this.service.getMediaQuestionById(this.q.id)
    this.questionsMedias = this.service.getMediaQuestionById(this.q.id)
    console.log("questionsMedias depuis questions-details", this.questionsMedias);
    this.responsesMedias = this.service.getMediasResponsesById(this.q.id)
  }

  ngOnDestroy(): void {
    this.responsesMedias = []
  }

}
