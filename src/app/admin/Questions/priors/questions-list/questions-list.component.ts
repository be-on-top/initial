import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { QuestionsService } from '../../questions.service';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})
export class QuestionsListComponent implements OnInit {

  // évaluateurs ne serait pas un tableau de type any mais un observable
  questions: any;
  allQuestions?:any


  questionsMedias: any = []
  responsesMedias: any = []
  isMediaQuestion: boolean = true;

  // pour les lister par qid (id d'un document enregistré sur firestore)
  allMediaByQid: any = []
  allQid: any = []

  constructor(public service: QuestionsService) {

  }

  ngOnInit() {
    this.questionsMedias = this.service.getMediasQuestions()
    this.responsesMedias = this.service.getMediasResponses()
    this.getQuestions()


    // this.allQid = this.service.getQuestions()
    // this.allMediaByQid = this.spliteDataByQid(this.questionsMedias, this.responsesMedias, this.allQid )
    // this.detectMediaLink()
  }




  getQuestions() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allEvaluators=this.service.getEvaluators(); devient donc nécessairement
    this.service.getQuestions().subscribe(data => {
      console.log("data de getQuestions()", data)
      this.allQuestions = data;
      this.allQuestions.sort(this.compare)



      return this.allQuestions
    })

  }

        // on ajoute une fonction pour trier par id
        compare( a:any, b:any )
        {
        if ( a.number < b.number){
          return -1;
        }
        if ( a.number > b.number){
          return 1;
        }
        return 0;
       }




  // spliteDataByQid(allQuestions:any[], allResponse:any[], allQid:any[]){
  //   for (let q of allQid){
  //     console.log("un item de allQid", q)
  //   }

  // }


  detectMediaLink() {
    // console.log(Object.getPrototypeOf(this.questions))
    console.log(typeof (this.questionsMedias))

    // let result = this.questions.filter((item) => {
    //   return item.includes('Question')
    // })

    // console.log(result);



  }
}
