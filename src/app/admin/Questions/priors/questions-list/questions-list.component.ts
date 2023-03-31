import { Component, OnInit } from '@angular/core';
import { QuestionsService } from 'src/app/admin/questions.service';


@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})

export class QuestionsListComponent implements OnInit {

  questions: any[] = []

  constructor(private service: QuestionsService) { }

  ngOnInit() {
    this.service.getQuestions().subscribe(data => {
      let allQuestions = data;
      console.log("allQuestions",allQuestions);
      
      this.questions = allQuestions.filter(q => q.number < 21)
      this.questions.sort(this.compare)
    })
  }

  compare(a: any, b: any) {

    return a.number - b.number;
}


  // compare(a: any, b: any) {
  //   if (a.number < b.number) {
  //     return 1;
  //   }
  //   if (a.number > b.number) {
  //     return -1;
  //   }
  //   return 0;
  // }


}
