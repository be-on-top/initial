import { Component } from '@angular/core';
import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-full-list',
  templateUrl: './full-list.component.html',
  styleUrls: ['./full-list.component.css']
})
export class FullListComponent {

    questions: any[] = []
 
    constructor(private service: QuestionsService) { }
  
    ngOnInit() {
      this.service.getQuestions().subscribe(data => {
        const allQuestions= data;
        this.questions = allQuestions.filter(q=>q.number>20)
        this.questions.sort(this.compare)
      })
    }  
  
    compare(a: any, b: any) {
      if (a.number < b.number) {
        return -1;
      }
      if (a.number > b.number) {
        return 1;
      }
      return 0;
    }  
  
  }


