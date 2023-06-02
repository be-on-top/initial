import { Component, Input } from '@angular/core';
import { Firestore, collection, orderBy, startAt, startAfter, query, where, limit } from '@angular/fire/firestore';
import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {

  counter: number = 0
  // faut qu'il provienne du  parent... incrémenté depuis le parent
  // counterQuestionNumber: number=0
  nextQuestion:any
  // a priori aussi, faut que l'entièreté de la data relative aux médias soit initialisée côté parent
  // questionsMedias: any = []
  // responsesMedias: any = []
  // questionId va être transmis par son parent qui le reçoit lui-même en paramètre de route
  @Input() q: any;
  @Input() questionsMedias:any
  @Input() responsesMedias:any

  constructor(private service: QuestionsService,  private firestore:Firestore) {
  }

  ngOnInit() {
    // this.allSocialMediaByQid = this.service.getMediaQuestionById(this.q.id)
    // this.questionsMedias = this.service.getMediaQuestionById(this.q.id)
    // console.log("questionsMedias depuis questions-details", this.questionsMedias);
    // this.responsesMedias = this.service.getMediasResponsesById(this.q.id)
  }

  // ngOnDestroy(): void {
  //   this.responsesMedias = []
  // }

  choice(optScoring: any) {
    // test OK
    // optScoring == "true" ? alert("Bingo ! ") : alert("Mauvaise réponse ! ")
    if (optScoring == "true") {
      this.counter = this.counter + this.q.notation
      alert(this.counter)

    } else { alert('Aucun point supplémentnaire') }

  }

  // next(){
  //   this.q.number=this.q.number+1
  //   alert(this.q.number)

  //  this.nextQuestion = query(collection(this.firestore, "questions"),
  //  where("number", "==", this.q.number))

  //  console.log(this.nextQuestion);


  // }

  

}
