import { NumberFormatStyle, NgOptimizedImage } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ElementRef, Renderer2, ViewChild, HostListener, SimpleChanges, OnChanges } from '@angular/core';
// import { Firestore, collection, orderBy, startAt, startAfter, query, where, limit } from '@angular/fire/firestore';
// import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnChanges {


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
  @Input() totalQuestions: any
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
  @Output() hasBeenUpdated: EventEmitter<{ counter: number, evaluatedCompetence: string, isIncremented: boolean, isDecremented: boolean, fullAnswersClicked: number }> = new EventEmitter<{ counter: number, evaluatedCompetence: string, isIncremented: boolean, isDecremented: boolean, fullAnswersClicked: number }>();


  isLoading: boolean = true
  isImageResponseLoading: boolean = true
  screenWidth: number = 0

  threshold = 2; // Seuil de mots pour une réponse "longue"
  applyAdjustBreakpoint = false; // Boolean pour savoir si toutes sont courtes
  options: string[] = []

  // pour zoomer image sur mobile
  @ViewChild('imageElement') imageElement?: ElementRef;
  constructor(private renderer: Renderer2) {
  }

  ngOnInit() {
    this.screenWidth = window.innerWidth;
    // Vérifier si toutes les réponses ont moins de 5 mots

  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes['q'] || changes['responsesMedias']) { // Vérifier si `q` a changé
      // this.updateOptions();
      // Construire le tableau `options` dynamiquement
      this.options = [this.q.option1, this.q.option2, this.q.option3, this.q.option4]
        .filter(option => option && option.trim() !== ''); // Filtrer les valeurs vides ou nulles

      // Vérifier si toutes les réponses sont courtes
      // if(this.options.length%2 == 0){
      //   this.applyAdjustBreakpoint = this.options.every(option => this.getWordCount(option) < this.threshold);

      // }

      if (this.options.length % 2 == 0 && this.responsesMedias.length===0) {
        this.applyAdjustBreakpoint = this.options.every(option => this.getWordCount(option) < this.threshold);
      } else {
        this.applyAdjustBreakpoint = false; // Reset si impair
      }
      
     
    }
  }

    // Fonction pour compter les mots
    getWordCount(answer: string): number {
      return answer ? answer.trim().split(/\s+/).length : 0;
    }



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
      this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked == this.fullOptScoringTrue ? this.counter = Number(this.counter) + Number(this.q.notation) : ""
      this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked == this.fullOptScoringTrue ? this.isIncremented = true : this.isIncremented = false
      this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked == this.fullOptScoringTrue ? this.isDecremented = false : this.isDecremented = false
      // this.fullGoodAnswersClicked>this.fullOptScoringTrue?alert("Vous devez faire un choix. Toutes les réponses ne peuvent être bonnes"): ""    
      console.log("this.fullAnswersClicked", this.fullAnswersClicked)
      // alert(Number(this.counter))

      // // ici, on enregistrera sûrement en base !!!!

    } else {

      this.fullGoodAnswersClicked > 0 && this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked == this.fullOptScoringTrue + 1 ? this.counter = Number(this.counter) - Number(this.q.notation) : ""
      this.fullGoodAnswersClicked > 0 && this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked == this.fullOptScoringTrue + 1 ? this.isIncremented = false : this.isIncremented = false
      this.fullGoodAnswersClicked > 0 && this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked == this.fullOptScoringTrue + 1 ? this.isDecremented = true : this.isDecremented = false
      // this.isIncremented = false
      // this.isDecremented = false
      // this.fullGoodAnswersClicked===this.fullOptScoringTrue && this.fullAnswersClicked!==this.fullOptScoringTrue+1?(alert("y a un mauvais qu'annule"),this.counter -= Number(this.q.notation),this.isDecremented = true):this.isDecremented=false,this.isIncremented = false

      // this.fullGoodAnswersClicked===this.fullOptScoringTrue && this.fullAnswersClicked!==this.fullOptScoringTrue+1 ? (this.counter -= Number(this.q.notation), this.isDecremented = true) : this.isDecremented = false


    }
    // this.fullGoodAnswersClicked===this.fullOptScoringTrue && this.fullAnswersClicked!==this.fullOptScoringTrue+1?(alert("y a un mauvais qu'annule"),this.counter -= Number(this.q.notation),this.isDecremented = true):this.isDecremented=false,this.isIncremented = false


    // on fait remonter l'information : une réponse a bien été cliquée (au minimum), ce qui en soit suffit pour pouvoir passer à la suivante ! 
    this.isCompleted = true
    this.hasBeenClicked.emit(this.isCompleted)
    // // À un certain endroit de votre composant enfant...
    // this.variablesRemontees.emit({ variable1: 'valeur1', variable2: 42 });
    this.hasBeenUpdated.emit({ counter: Number(this.counter), evaluatedCompetence: this.q.competence, isIncremented: this.isIncremented, isDecremented: this.isDecremented, fullAnswersClicked: this.fullAnswersClicked })

  }

  unchoice(optScoring: any) {

    // alert(`est-ce que on vient de désélectionner une option à score : ${optScoring}`)
    this.fullAnswersClicked--
    console.log('fullAnswersClicked', this.fullAnswersClicked)


    if (optScoring === true) {
      this.fullGoodAnswersClicked--

      // on décrémente le nombre de bonnes réponses données


      this.fullGoodAnswersClicked === this.fullOptScoringTrue - 1 && this.fullAnswersClicked === this.fullOptScoringTrue - 1 ? this.counter = Number(this.counter) - Number(this.q.notation) : ''
      this.fullGoodAnswersClicked === this.fullOptScoringTrue - 1 && this.fullAnswersClicked === this.fullOptScoringTrue - 1 ? this.isIncremented = false : this.isIncremented = false
      this.fullGoodAnswersClicked === this.fullOptScoringTrue - 1 && this.fullAnswersClicked === this.fullOptScoringTrue - 1 ? this.isDecremented = true : this.isDecremented = false


      console.log("this.fullGoodAnswersClicked", this.fullGoodAnswersClicked);
      // this.counter = Number(this.counter) - Number(this.q.notation)

      // this.fullGoodAnswersClicked>this.fullOptScoringTrue?alert("Vous devez faire un choix. Toutes les réponses ne peuvent être bonnes"): ""    
      console.log("this.fullAnswersClicked", this.fullAnswersClicked)
      // alert(Number(this.counter))


    } else {


      this.fullGoodAnswersClicked > 0 && this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked === this.fullOptScoringTrue ? this.counter = Number(this.counter) + Number(this.q.notation) : ''
      this.fullGoodAnswersClicked > 0 && this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked === this.fullOptScoringTrue ? this.isIncremented = true : this.isIncremented = false
      this.fullGoodAnswersClicked > 0 && this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked === this.fullOptScoringTrue ? this.isDecremented = false : this.isDecremented = false
      // this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked===this.fullOptScoringTrue ? this.isIncremented = true : ""
      // this.fullGoodAnswersClicked === this.fullOptScoringTrue && this.fullAnswersClicked===this.fullOptScoringTrue ? this.isDecremented = false : ""


      // this.isIncremented = false
      // this.fullGoodAnswersClicked===this.fullOptScoringTrue && this.fullAnswersClicked!==this.fullOptScoringTrue+1?(this.counter -= Number(this.q.notation),this.isDecremented = true):this.isDecremented=false,this.isIncremented = false

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


  // private isZoomed = false;

  onImageLoad
    () {
    // alert("bingo")
    this.isLoading = false;
  }

  onImageResponseLoad
    () {
    // alert("bingo")
    this.isImageResponseLoading = false;
  }




  // handleTouch() {
  //   const imageElement = this.imageElement;

  //   if (imageElement && imageElement.nativeElement) {
  //     const image = imageElement.nativeElement;

  //     // Inverse l'état de zoom
  //     this.isZoomed = !this.isZoomed;

  //     // Ajoute ou retire la classe "zoomed" selon l'état actuel
  //     if (this.isZoomed) {
  //       this.renderer.addClass(image, 'zoomed');
  //     } else {
  //       this.renderer.removeClass(image, 'zoomed');
  //     }
  //   }
  // }

  // @HostListener('document:click', ['$event'])
  // handleDocumentClick(event: Event) {
  //   const imageElement = this.imageElement;

  //   if (imageElement && imageElement.nativeElement) {
  //     const image = imageElement.nativeElement;

  //     // Vérifie si l'élément cliqué est l'élément de l'image
  //     const isClickOnImage = image.contains(event.target as Node);

  //     // Si le clic n'est pas sur l'image et l'image est zoomée, réinitialise
  //     if (!isClickOnImage && this.isZoomed) {
  //       this.isZoomed = false;
  //       this.renderer.removeClass(image, 'zoomed');
  //     }
  //   }
  // }

  aReponseLongue(): boolean {

    let responses = [this.q.option1, this.q.option2, this.q.option3, this.q.option4]
    console.log('dddddddddddddddddddddddddddddddd', responses);

    // alert(responses)
    return responses.every(reponse => reponse.trim().split(/\s+/).length < 5);
  }

}




