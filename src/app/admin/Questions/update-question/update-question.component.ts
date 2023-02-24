import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-question',
  templateUrl: './update-question.component.html',
  styleUrls: ['./update-question.component.css']
})
export class UpdateQuestionComponents implements OnInit {
  questionId:number = 0;

  constructor(private ac:ActivatedRoute){

  }

  ngOnInit(): void {

    this.questionId=this.ac.snapshot.params["id"];
    
  }

}
