import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { Firestore, collection, orderBy, startAt, startAfter, query, where, limit } from '@angular/fire/firestore';
// import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {

  counter: number = 0
  // faut qu'il provienne du  parent... incrémenté depuis le parent
  // counterQuestionNumber: number=0

  @Input() q: any;
  @Input() questionsMedias: any
  @Input() responsesMedias: any
  // pour prévenir le parent qu'au minimum un clic a été détecté donc une réponse donnée (quelle que soit sa valeur)
  isCompleted: boolean = false
  @Output() hasBeenClicked: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit() {
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
    // ici, on enregistrera sûrement en base

    // et on fait remonter l'information : une réponse a bien été cliquée ! 
    this.isCompleted = true
    this.hasBeenClicked.emit(this.isCompleted)


  }

}
