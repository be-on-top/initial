import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '../../questions.service';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})
export class QuestionsListComponent implements OnInit {


  questionsMedias: any = []
  responsesMedias: any = []
  isMediaQuestion: boolean = true;

  constructor(public service: QuestionsService) {

  }

  ngOnInit() {
    this.questionsMedias = this.service.getMediasQuestions()
    this.responsesMedias = this.service.getMediasResponses()
    // this.detectMediaLink()
  }


  detectMediaLink() {
    // console.log(Object.getPrototypeOf(this.questions))
    console.log(typeof (this.questionsMedias))

    // let result = this.questions.filter((item) => {
    //   return item.includes('Question')
    // })

    // console.log(result);



  }
}
