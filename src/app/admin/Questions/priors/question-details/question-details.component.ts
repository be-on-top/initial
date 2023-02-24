import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { QuestionsService } from '../../questions.service';

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css']
})
export class QuestionDetailsComponent implements OnInit {

questions:any[]=[]
  constructor(public service:QuestionsService, private router:Router){

  }

  ngOnInit() {
    
  }

}
