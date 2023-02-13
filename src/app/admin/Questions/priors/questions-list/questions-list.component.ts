import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '../../questions.service';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})
export class QuestionsListComponent implements OnInit {

  
questions:any[]=[]
constructor(public service:QuestionsService){

}

ngOnInit() {
 this.questions = this.service.getImages()
  
}

}
