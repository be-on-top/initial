import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { QuestionsService } from '../admin/questions.service';
import { SettingsService } from '../admin/settings.service';
import { DetailsComponent } from './vues/details/details.component';
import { StudentsService } from '../admin/students.service';

@Component({
  selector: 'app-quizz',
  templateUrl: './quizz.component.html',
  styleUrls: ['./quizz.component.css']
})
export class QuizzComponent implements OnInit {
  @ViewChild(DetailsComponent) childComponent!: DetailsComponent;
  // doit récupérer via le paramètre de route l'id relative au métier
  trade: any = ""
  // doit retrouver le sigle correspondant à l'id du métier
  specificSigle: any = ""
  // doit récupérer l'uid de l'utilisateur authentifié
  uid: string = ""
  // doit récupérer les questions (préalables et de positionnement) via le service dédié (questionsService) pour le métier visé
  questions: any[] = []
  questionsMedias: any = []
  responsesMedias: any = []
  // pour passer de l'une à l'autre, faut qu'on ait un indexQuestion qui soit susceptible de s'incrémenter
  indexQuestion: number = 0
  // on le prépare à recevoir un Output depuis détails
  isCompleted: boolean = false
  // pour les compteurs de réponses qui seront à réinitialiser lors du passage à la question suivante :
  fullGoodAnswersClicked: number = 0
  fullAnswersClicked: number = 0
  fullOptScoringTrue: number = 0
  totalAnswersAvailable: number = 0
  scoreCounter?:number

  constructor(private ac: ActivatedRoute, private auth: Auth, private questionsService: QuestionsService, private settingService: SettingsService, private studentService: StudentsService) {
    this.trade = this.ac.snapshot.params["id"]
    this.ac.snapshot.params["indexedQuestion"]?this.indexQuestion=this.ac.snapshot.params["indexedQuestion"]:""    
    this.ac.snapshot.params["scoreCounter"]?this.scoreCounter=this.ac.snapshot.params["scoreCounter"]:this.scoreCounter= 0
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.uid = user.uid
      }
      else {
        console.log("Personne n'est authentifié actuellement !");
      }
    })


    // pour recevoir la liste des questions relatives au métier
    this.questionsService.getQuestions().subscribe(data => {
      let allQuestions = data;
      console.log("allQuestions", allQuestions);

      this.questions = allQuestions.filter(q => q.number < 21 && q.sigle == this.trade)
      this.questions.sort(this.compare)


      // pour recevoir la liste des médias relatifs aux questions relatives au métier
      this.questionsMedias = this.questionsService.getMediaQuestionById(this.questions[this.indexQuestion].id)
      console.log("questionsMedias depuis questions-details", this.questionsMedias);
      this.responsesMedias = this.questionsService.getMediasResponsesById(this.questions[this.indexQuestion].id)

      console.log("this.fullOptScoringArray initial", this.fullOptScoringTrue)
      console.log("this.totalAnswersAvailable initial", this.totalAnswersAvailable)
      console.log("this.fullAnswersClicked initial", this.fullAnswersClicked)
      console.log("this.fullGoodAnswersClicked: initial", this.fullGoodAnswersClicked)
      // console.log("this.q.optScoring1", this.q.optScoring1 === 'false');

      // on initialise la valeur réelle de fullOptScoringArray pour avoir un point de comparaison
      this.questions[this.indexQuestion].optScoring1 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
      this.questions[this.indexQuestion].optScoring2 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
      this.questions[this.indexQuestion].optScoring3 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
      this.questions[this.indexQuestion].optScoring4 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
      console.log("this.fullOptScoringArray", this.fullOptScoringTrue)

      // on initialise la valeur réelle de totalAnswersAvailable pour la limite à 2, 3 ou 4 réponses max
      this.questions[this.indexQuestion].optScoring1 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
      this.questions[this.indexQuestion].optScoring2 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
      this.questions[this.indexQuestion].optScoring3 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
      this.questions[this.indexQuestion].optScoring4 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
      console.log("this.totalAnswersAvailable", this.totalAnswersAvailable)

    })


  }

  compare(a: any, b: any) {
    return a.number - b.number;
  }

  answered(value: boolean) {
    // alert(value)
    value == true ? this.isCompleted = true : "this.isCompleted==false"
    // alert(this.isCompleted)

  }

  updated(value: number) {
    this.scoreCounter=value
    this.studentService.updateStudentScore(this.uid, this.scoreCounter, this.indexQuestion, this.trade)
  }

  next(indexQuestion: number) {
    // Appel de la méthode "reset" du composant enfant
    this.childComponent.reset();
    this.indexQuestion = indexQuestion + 1

    // pour rappeler la liste des medias 
    this.questionsMedias = this.questionsService.getMediaQuestionById(this.questions[this.indexQuestion].id)
    console.log("questionsMedias depuis questions-details", this.questionsMedias);
    this.responsesMedias = this.questionsService.getMediasResponsesById(this.questions[this.indexQuestion].id)

    // et puisqu'on commence une nouvelle question, isCompleted redevient false
    this.isCompleted = false
    this.fullGoodAnswersClicked=0
    this.fullOptScoringTrue=0
    this.totalAnswersAvailable=0

    // on initialise la valeur réelle de fullOptScoringArray pour avoir un point de comparaison
    this.questions[this.indexQuestion].optScoring1 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    this.questions[this.indexQuestion].optScoring2 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    this.questions[this.indexQuestion].optScoring3 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    this.questions[this.indexQuestion].optScoring4 === 'true' ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    console.log("this.fullOptScoringArray", this.fullOptScoringTrue)

    // on initialise la valeur réelle de totalAnswersAvailable pour la limite à 2, 3 ou 4 réponses max
    this.questions[this.indexQuestion].optScoring1 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    this.questions[this.indexQuestion].optScoring2 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    this.questions[this.indexQuestion].optScoring3 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    this.questions[this.indexQuestion].optScoring4 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    console.log("this.totalAnswersAvailable", this.totalAnswersAvailable)



  }


  resetChildCounter() {
    // Réinitialisation du compteur dans le composant enfant
    this.childComponent.counter = 0;
  }


}




