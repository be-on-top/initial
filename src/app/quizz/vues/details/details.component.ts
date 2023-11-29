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
  // pour pouvoir avoir un toggle et l'illusion d'un sélected
  // isToggled: boolean = false
  toggledStates: { [key: string]: boolean } = {};

  @Output() hasBeenClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Output() hasBeenUpdated: EventEmitter<number> = new EventEmitter<number>();
  @Output() hasBeenUpdated: EventEmitter<{ counter: number, evaluatedCompetence: string, isIncremented: boolean, isDecremented: boolean, fullAnswersClicked: number }> = new EventEmitter<{ counter: number, evaluatedCompetence: string, isIncremented: boolean, isDecremented: boolean, fullAnswersClicked:number }>();

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
    // alert("on est dans choice")
    // on incrémente le nombre total de réponses cliquées (ou cochées)
    this.fullAnswersClicked++

    // alert(`est-ce une option à score : ${optScoring}`)

    // this.isIncremented = false
    // this.isDecremented = false



    if (optScoring === true) {

      // on incrémente le nombre de bonnes réponses données
      this.fullGoodAnswersClicked++
      console.log("this.fullGoodAnswersClicked", this.fullGoodAnswersClicked);
      this.fullGoodAnswersClicked === this.fullOptScoringTrue ? this.counter = Number(this.counter) + Number(this.q.notation) : ""
      this.fullGoodAnswersClicked === this.fullOptScoringTrue ? this.isIncremented = true : this.isIncremented = false
      this.fullGoodAnswersClicked === this.fullOptScoringTrue ? this.isDecremented = false : this.isDecremented = true
      // this.fullGoodAnswersClicked>this.fullOptScoringTrue?alert("Vous devez faire un choix. Toutes les réponses ne peuvent être bonnes"): ""    
      console.log("this.fullAnswersClicked", this.fullAnswersClicked)
      // alert(Number(this.counter))

      // this.fullAnswersClicked >= this.totalAnswersAvailable ? (alert("Vous ne pouvez pas cocher toutes les réponses. Il faut faire une sélection"), this.fullAnswersClicked = 0, this.fullGoodAnswersClicked = 0, this.counter -= Number(this.q.notation), this.isIncremented = false, this.isDecremented = true) : ""
      // // ici, on enregistrera sûrement en base !!!!

    } else {

      this.isIncremented = false
      this.isDecremented = false
    }
    
    // this.fullAnswersClicked >= this.totalAnswersAvailable ? (alert("Vous ne pouvez pas cocher toutes les réponses. Il faut faire une sélection"),
    //   this.fullAnswersClicked = 0, this.fullGoodAnswersClicked = 0, this.counter -= Number(this.q.notation), this.isDecremented = true, this.resetToggledStates()) : this.isDecremented = false
this.isDecremented=false

    // on fait remonter l'information : une réponse a bien été cliquée (au minimum), ce qui en soit suffit pour pouvoir passer à la suivante ! 
    this.isCompleted = true
    this.hasBeenClicked.emit(this.isCompleted)
    // // À un certain endroit de votre composant enfant...
    // this.variablesRemontees.emit({ variable1: 'valeur1', variable2: 42 });
    this.hasBeenUpdated.emit({ counter: Number(this.counter), evaluatedCompetence: this.q.competence, isIncremented: this.isIncremented, isDecremented: this.isDecremented, fullAnswersClicked:this.fullAnswersClicked })

  }

  unchoice(optScoring: any) {

    alert(`est-ce que on vient de désélectionner une option à score : ${optScoring}`)
    this.fullAnswersClicked--
    console.log('fullAnswersClicked', this.fullAnswersClicked)


    if (optScoring === true) {
      this.fullGoodAnswersClicked === this.fullOptScoringTrue ? this.isDecremented = true : this.isDecremented = false
      this.isIncremented = false
      // on décrémente le nombre de bonnes réponses données
      this.fullGoodAnswersClicked--

      console.log("this.fullGoodAnswersClicked", this.fullGoodAnswersClicked);
      this.counter = Number(this.counter) - Number(this.q.notation)

      // this.fullGoodAnswersClicked>this.fullOptScoringTrue?alert("Vous devez faire un choix. Toutes les réponses ne peuvent être bonnes"): ""    
      console.log("this.fullAnswersClicked", this.fullAnswersClicked)
      // alert(Number(this.counter))


    } else {

      this.isIncremented = false
      this.isDecremented = false

    }
    // dans le cas du toggle, faut a priori le passer à false si et seulement si fullAnswersClicked = 0
    this.fullAnswersClicked <= 0 ? this.isCompleted = false : this.isCompleted = true
    console.log("(this.isCompleted", this.isCompleted);

    this.hasBeenClicked.emit(this.isCompleted)
    // // À un certain endroit du composant enfant...
    // this.variablesRemontees.emit({ variable1: 'valeur1', variable2: 42 });
    this.hasBeenUpdated.emit({ counter: Number(this.counter), evaluatedCompetence: this.q.competence, isIncremented: this.isIncremented, isDecremented: this.isDecremented, fullAnswersClicked: this.fullAnswersClicked })

  }

  // si on fait du toggle et qu'on déporte la logique de choix choice ()
  toggle(key: string, optScoring: boolean) {
    // this.isToggled = !this.isToggled;
    this.toggledStates[key] = !this.toggledStates[key];
    this.toggledStates[key] === true ? this.choice(optScoring) : this.unchoice(optScoring)
  }

  // Méthode pour réinitialiser le compteur
  reset() {
    this.fullAnswersClicked = 0;
    this.fullGoodAnswersClicked = 0
    // this.isToggled = false
    this.resetToggledStates()
  }

  resetToggledStates() {
    for (let key in this.toggledStates) {
      this.toggledStates[key] = false;
    }
  }

}
