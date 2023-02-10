import { Component, OnInit} from '@angular/core';
import { QuestionsService } from '../../questions.service';

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css']
})
export class QuestionDetailsComponent implements OnInit {
  questions: any;

  constructor(public service:QuestionsService){
  }

  ngOnInit() {
    this.questions = this.service.getImages()

    
  }







}
