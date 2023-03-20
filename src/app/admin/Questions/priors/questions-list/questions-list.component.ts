import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestionsService } from 'src/app/admin/questions.service';


@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})

export class QuestionsListComponent implements OnInit {

  // évaluateurs ne serait pas un tableau de type any mais un observable
  questions: any
  allQuestions?: any

  questionsMedias: any = []
  responsesMedias: any = []
  isMediaQuestion: boolean = true

  videoEnded: boolean = false

  // pour les lister par qid (id d'un document enregistré sur firestore)
  allMediaByQid: any = []
  allQid: any = []

  constructor(private service: QuestionsService) {

  }

  ngOnInit() {
    this.questionsMedias = this.service.getMediasQuestions()
    this.responsesMedias = this.service.getMediasResponses()
    this.service.getQuestions().subscribe(data =>{
      this.allQuestions = data
      this.allQuestions.sort(this.compare)
      })
  }


  compare(a: any, b: any) {

      return a.number - b.number;
  }

  detectMediaLink() {
    console.log(typeof (this.questionsMedias))
  }


  displayResponseIfVideoEnded() {
    this.videoEnded = true
  }


}
