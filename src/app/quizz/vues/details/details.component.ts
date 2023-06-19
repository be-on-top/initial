import { NumberFormatStyle } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
// import { Firestore, collection, orderBy, startAt, startAfter, query, where, limit } from '@angular/fire/firestore';
// import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {


  // counter: number = 0
  @Input() counter: number = 0
  // faut qu'il provienne du  parent... incrémenté depuis le parent
  // counterQuestionNumber: number=0

  // puisqu'on a décidé de ne comptabiliser les bonnes réponses qu'à la condition qu'elles soient TOUTES bonnes, 
  // il va falloir au fur et à mesure qu'une bonne réponse est cliquée, l'ajouter à un compteur de bonnes réponses. 
  // Si au final, la valeur de ce compteur de bonnes réponses cliquées est équivalent à la valeur du compteur des bonnes réponses en base, alors on raffle la mise
  @Input() fullOptScoringTrue: any
  @Input() totalAnswersAvailable: any
  @Input() fullGoodAnswersClicked: any
  @Input() fullAnswersClicked: any
  @Output() resetFullAnswersClicked = new EventEmitter<void>();
  // fullAnswersClicked:number

  @Input() q: any
  @Input() questionsMedias: any
  @Input() responsesMedias: any
  @Input() studentCompetences: any
  // @Input() hasStartedEvaluation: any
  // pour prévenir le parent qu'au minimum un clic a été détecté donc une réponse donnée (quelle que soit sa valeur)
  isCompleted: boolean = false
  isIncremented: boolean = false
  isDecremented: boolean = false

  @Output() hasBeenClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Output() hasBeenUpdated: EventEmitter<number> = new EventEmitter<number>();
  @Output() hasBeenUpdated: EventEmitter<{ counter: number, evaluatedCompetence: string, isIncremented: boolean, isDecremented: boolean }> = new EventEmitter<{ counter: number, evaluatedCompetence: string, isIncremented: boolean, isDecremented: boolean }>();

  constructor() {
    // this.fullAnswersClicked=0
  }

  ngOnInit() {
    // console.log("this.fullOptScoringArray initial", this.fullOptScoringTrue)
    // console.log("this.totalAnswersAvailable initial", this.totalAnswersAvailable)
    // console.log("this.fullAnswersClicked initial", this.fullAnswersClicked)
    // console.log("this.fullGoodAnswersClicked: initial", this.fullGoodAnswersClicked)

    // // on initialise la valeur réelle de fullOptScoringArray pour avoir un point de comparaison
    // this.q.optScoring1 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    // this.q.optScoring2 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    // this.q.optScoring3 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    // this.q.optScoring4 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    // console.log("this.fullOptScoringArray", this.fullOptScoringTrue)

    // // on initialise la valeur réelle de totalAnswersAvailable pour la limite à 2, 3 ou 4 réponses max
    // this.q.optScoring1 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    // this.q.optScoring2 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    // this.q.optScoring3 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    // this.q.optScoring4 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    // console.log("this.totalAnswersAvailable", this.totalAnswersAvailable)

  }


  // ngAfterViewInit() {
  //   alert("julie")
  // }

  ngOnDestroy(): void {
    this.responsesMedias = []
  }

  choice(optScoring: any) {
    // on incrémente le nombre total de réponses cliquées (ou cochées)
    this.fullAnswersClicked++

    alert(optScoring)



    if (optScoring === 'true') {
      // on incrémente le nombre de bonnes réponses données
      this.fullGoodAnswersClicked++
      console.log("this.fullGoodAnswersClicked", this.fullGoodAnswersClicked);
      this.fullGoodAnswersClicked === this.fullOptScoringTrue ? this.counter = Number(this.counter) + Number(this.q.notation) : ""
      this.fullGoodAnswersClicked === this.fullOptScoringTrue ? this.isIncremented = true : this.isIncremented = false
      // this.fullGoodAnswersClicked>this.fullOptScoringTrue?alert("Vous devez faire un choix. Toutes les réponses ne peuvent être bonnes"): ""    
      console.log("this.fullAnswersClicked", this.fullAnswersClicked)
      // alert(Number(this.counter))

      // this.fullAnswersClicked >= this.totalAnswersAvailable ? (alert("Vous ne pouvez pas cocher toutes les réponses. Il faut faire une sélection"), this.fullAnswersClicked = 0, this.fullGoodAnswersClicked = 0, this.counter -= Number(this.q.notation), this.isIncremented = false, this.isDecremented = true) : ""
      // // ici, on enregistrera sûrement en base !!!!

    } else {

      this.isIncremented = false


    }
    this.fullAnswersClicked >= this.totalAnswersAvailable ? (alert("Vous ne pouvez pas cocher toutes les réponses. Il faut faire une sélection"), this.fullAnswersClicked = 0, this.fullGoodAnswersClicked = 0, this.counter -= Number(this.q.notation), this.isIncremented = false, this.isDecremented = true) : ""


    // on fait remonter l'information : une réponse a bien été cliquée (au minimum), ce qui en soit suffit pour pouvoir passer à la suivante ! 
    this.isCompleted = true
    this.hasBeenClicked.emit(this.isCompleted)
    // // À un certain endroit de votre composant enfant...
    // this.variablesRemontees.emit({ variable1: 'valeur1', variable2: 42 });
    this.hasBeenUpdated.emit({ counter: Number(this.counter), evaluatedCompetence: this.q.competence, isIncremented: this.isIncremented, isDecremented: this.isDecremented })

  }

  // Méthode pour réinitialiser le compteur
  reset() {
    this.fullAnswersClicked = 0;
    this.fullGoodAnswersClicked = 0
  }

}
