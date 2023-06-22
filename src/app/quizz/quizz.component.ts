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
  scoreCounter: number = 0
  competences?: any = []
  studentCompetences?: any = []
  hasStartedEvaluation: boolean = false
  numberOfPoints: number = 0
  // puisqu'on va interroger students tout compte fait...
  studentId: string = ""
  dataStudent: any
  // selon qu'on a déjà un tableau studentCompetences en base
  hasAlreadyCompetences: boolean = false
  // ultérieurement, ils seront enregistrés comme paramètres d'application
  cursors: number[] = [10, 15]
  firstCursor: number = 0
  secondCursor: number = 0

  levelsArray: [] = []

  constructor(
    private ac: ActivatedRoute,
    // private auth: Auth, 
    private questionsService: QuestionsService,
    // private settingService: SettingsService, 
    private studentService: StudentsService) {
    // this.trade = this.ac.snapshot.params["id"]
    // this.indexQuestion = this.ac.snapshot.params["indexQuestion"]
    // this.scoreCounter = this.ac.snapshot.params["scoreCounter"]
    // this.hasStartedEvaluation = this.ac.snapshot.params['hasStartedEvaluation']
  }

  ngOnInit() {

    this.trade = this.ac.snapshot.params["id"]
    this.indexQuestion = this.ac.snapshot.params["indexQuestion"]
    this.scoreCounter = this.ac.snapshot.params["scoreCounter"]
    this.hasStartedEvaluation = this.ac.snapshot.params['hasStartedEvaluation'] === 'true'
    this.studentId = this.ac.snapshot.params["studentId"]

    // onAuthStateChanged(this.auth, (user: any) => {
    //   if (user) {
    //     this.uid = user.uid
    //   }
    //   else {
    //     console.log("Personne n'est authentifié actuellement !");
    //   }
    // })


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

      // Pour connaitre le nombre de points affectés à la question et la refiler à l'instant t au service, 
      // on peut passer par une variable intermédiaire pour plus de lisibilité, mais ce n'est pas impératif
      this.numberOfPoints = this.questions[this.indexQuestion].notation
      console.log('numberOfPoints depuis quizzComponent', this.numberOfPoints);

      // Pour générer le tableau de compétences dans le compte utilisateur si il n'y en a  pas
      this.questions.forEach(value => {
        this.competences.push(value.competence)
      }
      )

      this.competences = [...new Set(this.competences)];
      console.log("this.competences", this.competences);

      this.studentCompetences = this.competences.map((item: any) => ({ [item]: 0 }));
      console.log(this.studentCompetences);

    })

    this.studentService.getStudentById(this.studentId).subscribe((data) => {
      this.dataStudent = data
      this.dataStudent.studentCompetences ? this.studentCompetences = this.dataStudent.studentCompetences : ''
    })

    this.firstCursor = this.cursors[0]
    this.secondCursor = this.cursors[1]


    console.log(this.firstCursor);
    console.log(this.secondCursor);

  }

  compare(a: any, b: any) {
    return a.number - b.number;
  }

  answered(value: boolean) {
    // alert(value)
    value == true ? this.isCompleted = true : "this.isCompleted==false"
    // alert(this.isCompleted)

  }

  // principale !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // exemple générique : 
  // Composant parent
  // handleVariablesRemontees(event: { variable1: string, variable2: number }) {

  updated(event: { counter: number, evaluatedCompetence: string, isIncremented: boolean,  isDecremented: boolean }) {
    // puisque value intègre la remontée de 2 variables différentes
    this.scoreCounter = event.counter
    const isIncremented = event.isIncremented
    const isDecremented = event.isDecremented
    const evaluatedCompetence = event.evaluatedCompetence
    // alert(`this.scoreCounter depuis quizzComponent", ${this.scoreCounter}`)
    this.hasStartedEvaluation = true
    this.studentService.updateStudentScore(this.studentId, this.scoreCounter, this.indexQuestion, this.trade, this.hasStartedEvaluation, this.studentCompetences, evaluatedCompetence, this.numberOfPoints, isIncremented, isDecremented)
    // et pour être certain qu'à la prochaine étape, c'est bien dataStudent.studentCompetences qui sera incrémenté !!!!!!!!!!!!
    this.studentCompetences = this.dataStudent.studentCompetences

    // une fois qu'il a fait tout ça,  on va tester le retour de levelsArray
    // this.setLevel() 

    
    

  }

  next(indexQuestion: number) {
    // Appel de la méthode "reset" du composant enfant
    this.childComponent.reset();
    this.indexQuestion = Number(indexQuestion) + 1
    // alert(this.indexQuestion)
    // pour mettre à jour les points à attribuer à la question une fois l'index incrémenté
    this.numberOfPoints = this.questions[this.indexQuestion].notation


    // pour rappeler la liste des medias 
    this.questionsMedias = this.questionsService.getMediaQuestionById(this.questions[this.indexQuestion].id)
    console.log("questionsMedias depuis questions-details", this.questionsMedias)
    this.responsesMedias = this.questionsService.getMediasResponsesById(this.questions[this.indexQuestion].id)

    // et puisqu'on commence une nouvelle question, isCompleted redevient false, de même que les variabless qui suivent
    this.isCompleted = false
    this.fullGoodAnswersClicked = 0
    this.fullOptScoringTrue = 0
    this.totalAnswersAvailable = 0
  this.resetChildCounter()
    

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
    // this.childComponent.counter = 0
    this.childComponent.isDecremented = false
    this.fullAnswersClicked=0
    // this.childComponent.isIncremented=false
  }

  setLevel() {
    this.levelsArray = this.dataStudent.studentCompetences.map((obj: any) => {
      const newObj: any = {};
      for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          const levelProp = `level_${prop}`;
          const value = obj[prop];

          let levelValue;
          if (value < 10) {
            levelValue = 1;
          } else if (value > 15) {
            levelValue = 3;
          } else {
            levelValue = 2;
          }

          newObj[levelProp] = levelValue;
        }
      }
      return newObj;
    });

    
    
    console.log("this.levelsArray)", this.levelsArray);
  }


}




