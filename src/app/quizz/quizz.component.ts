import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { QuestionsService } from '../admin/questions.service';
import { SettingsService } from '../admin/settings.service';
import { DetailsComponent } from './vues/details/details.component';
import { StudentsService } from '../admin/students.service';
import { Denominator } from './denominator';
import { Questions } from '../admin/Questions/questions';
import { Trade } from '../admin/trade';

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
  questions: Questions[] = []
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
  actualCompetence: string = ""
  studentCompetences: Denominator[] = []
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

  levelsArray: Denominator[] = []

  denominatorsCompetences: Denominator[] = []
  resultingDurationsByCompetences: Denominator[] = []
  durations: { [key: string]: number[] } = {}
  durationsByLevels: { [key: string]: number } = {};
  // troisiemeTableau:{ [key: string]: number } ={}
  troisiemeTableau: { [key: string]: any } = {}

  // ces valeurs n'ont principalemenet d'intérêt à l'affichage que pour attester du bon retour du calculateur
  realEvaluations: Denominator[] = []
  // pour le coût individualisé d'une compétence en fonction du niveau et du coût horaire
  cpCostByHour: number = 0
  estimatedCPCost: { [key: string]: number } = {};
  fullResults: { [key: string]: { duration: number; cost: number } }[] = [];
  quotationIsReady:boolean=false
  totalCost:number=0



  constructor(
    private ac: ActivatedRoute,
    // private auth: Auth, 
    private questionsService: QuestionsService,
    // private settingService: SettingsService, 
    private studentService: StudentsService,
    // pour tester la récupération des curseurs
    private settingsService: SettingsService) {
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

      // on ne compte pas afficher un résulat intermédiaire, donc pour tester le calcul au global...
      // this.questions = allQuestions.filter(q => q.number < 21 && q.sigle == this.trade)
      this.questions = allQuestions.filter(q => q.number < 100 && q.sigle == this.trade)
      this.questions.sort(this.compare)

      // pour qu'on ne se retrouve pas en console avec un can not read id parce qu'il n'y en a plus
      // on peut rajouter ATTENTION !!!!! 
      if (this.indexQuestion < this.questions.length) {


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
        this.questions[this.indexQuestion].optScoring1 && this.questions[this.indexQuestion].optScoring1 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
        this.questions[this.indexQuestion].optScoring2 && this.questions[this.indexQuestion].optScoring2 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
        this.questions[this.indexQuestion].optScoring3 && this.questions[this.indexQuestion].optScoring3 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
        this.questions[this.indexQuestion].optScoring4 && this.questions[this.indexQuestion].optScoring4 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
        console.log("this.fullOptScoringArray", this.fullOptScoringTrue)

        // on initialise la valeur réelle de totalAnswersAvailable pour la limite à 2, 3 ou 4 réponses max
        this.questions[this.indexQuestion].option1 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
        this.questions[this.indexQuestion].option2 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
        this.questions[this.indexQuestion].option3 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
        this.questions[this.indexQuestion].option4 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
        console.log("this.totalAnswersAvailable", this.totalAnswersAvailable)

        // Pour connaitre le nombre de points affectés à la question et la refiler à l'instant t au service, 
        // on peut passer par une variable intermédiaire pour plus de lisibilité, mais ce n'est pas impératif
        this.numberOfPoints = this.questions[this.indexQuestion].notation
        console.log('numberOfPoints depuis quizzComponent', this.numberOfPoints);

        // competence evaluée pas forcément nécessaire de la rajouter mais plus simple si denominatorsCompetences incrémenté au fur à mesure
        this.actualCompetence = this.questions[this.indexQuestion].competence
        console.log('actualCompetence', this.actualCompetence);

        // fin du décompte de la longueur de this.questons

      } else {

        console.log('plus aucun id ne correspond au paramètre')
        // alert('plus aucun id ne correspond au paramètre')

      }

      // Pour générer le tableau de compétences dans le compte utilisateur si il n'y en a  pas
      // pour essayer de comprendre pourquoi je n'ai plus qu'une compétence dans compétences
      console.log('this.questions', this.questions);
      console.log('this.questions.length', this.questions.length);

      this.questions.forEach(value => {
        this.competences.push(value.competence)
      }
      )

      this.competences = [...new Set(this.competences)];
      console.log("this.competences!!!!!!!!!!!!!!", this.competences);

      this.studentCompetences = this.competences.map((item: number) => ({ [item]: 0 }));
      console.log(this.studentCompetences);

      // et dans l'hypothèse où denominatorsCompetences est incrémenté par le biais de next()
      // et dans l'hypothèse où on peut l'initier dans ngOnInit sans l'écrasesr à chaque fois... 
      this.denominatorsCompetences = this.competences.map((item: number) => ({ [item]: 0 }));
      this.generateFullDenominatorsCompetences(this.competences)

      this.resultingDurationsByCompetences = this.competences.map((item: number) => ({ [item]: 0 }));


    })

    this.studentService.getStudentById(this.studentId).subscribe((data) => {
      this.dataStudent = data
      this.dataStudent.studentCompetences ? this.studentCompetences = this.dataStudent.studentCompetences : ''
    })

    // c'était bien, mais faut tester la récupération des curseurs en base si besoin
    // this.firstCursor = this.cursors[0]
    // this.secondCursor = this.cursors[1]
    this.getCursors()

    // this.settingsService.getDurationsBySigle(this.trade).then((data)=>console.log('duration récupéré', data))

    this.getDurations(this.trade)


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

  updated(event: { counter: number, evaluatedCompetence: string, isIncremented: boolean, isDecremented: boolean, fullAnswersClicked: number }) {
    // puisque value intègre la remontée de 2 variables différentes
    this.scoreCounter = event.counter
    this.fullAnswersClicked = event.fullAnswersClicked
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

    // fonctionne bien dans l'hyothèse où on n'utilise pas generateFullDenominatorsCompetences
    // this.incrementDenominatorsCompetences(this.denominatorsCompetences, this.actualCompetence, this.numberOfPoints)
    // console.log('denominatorsCompetences dans next après execution fonction', this.denominatorsCompetences);

    // Appel de la méthode "reset" du composant enfant
    this.childComponent.reset();
    this.indexQuestion = Number(indexQuestion) + 1
    // alert(this.indexQuestion)

    // pour qu'on ne se retrouve pas en console avec un can not read id parce qu'il n'y en a plus
    // on peut rajouter ATTENTION !!!!! 
    // pour qu'on ne se retrouve pas en console avec un can not read id parce qu'il n'y en a plus
    // on peut rajouter ATTENTION !!!!! 
    if (this.indexQuestion < this.questions.length) {

      // pour mettre à jour les points à attribuer à la question une fois l'index incrémenté
      this.questions[this.indexQuestion].notation ? this.numberOfPoints = this.questions[this.indexQuestion].notation : ''

      // fin de la vérification de l'existence d'un index correspondant à indexQuestion

      console.log('  this.denominatorsCompetences!!!!!!!!!!!!!!!!!!!!!!!!!', this.denominatorsCompetences);

    } else {
      console.log('indexQuestion ne correspond plus à aucune question identifiable');
      // alert('indexQuestion ne correspond plus à aucune question identifiable')
    }

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
    this.questions[this.indexQuestion].optScoring1 && this.questions[this.indexQuestion].optScoring1 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    this.questions[this.indexQuestion].optScoring2 && this.questions[this.indexQuestion].optScoring2 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    this.questions[this.indexQuestion].optScoring3 && this.questions[this.indexQuestion].optScoring3 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    this.questions[this.indexQuestion].optScoring4 && this.questions[this.indexQuestion].optScoring4 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    console.log("this.fullOptScoringArray", this.fullOptScoringTrue)

    // on initialise la valeur réelle de totalAnswersAvailable pour la limite à 2, 3 ou 4 réponses max
    this.questions[this.indexQuestion].option1 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    this.questions[this.indexQuestion].option2 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    this.questions[this.indexQuestion].option3 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    this.questions[this.indexQuestion].option4 !== '' ? this.totalAnswersAvailable = Number(this.totalAnswersAvailable) + 1 : ""
    console.log("this.totalAnswersAvailable", this.totalAnswersAvailable)

  }


  resetChildCounter() {
    // Réinitialisation du compteur dans le composant enfant
    // this.childComponent.counter = 0
    this.childComponent.isDecremented = false
    this.fullAnswersClicked = 0
    // this.childComponent.isIncremented=false
  }


  // si on génère illico denominatorsCompetences dans son intégralité
  generateFullDenominatorsCompetences(competences: []) {

    competences.forEach((objet: string) => {
      // Filtrer les questions selon LA compétence
      let filteredQuestions: any = this.questions.filter(question => question.competence === objet);
      // Calculer la somme des notations pour les questions filtrées 
      const totalNotations: number = filteredQuestions.reduce((total: number, question: any) => total + Number(question.notation), 0);
      console.log("total des notations (donc dénominateur) pour la copétence en cours de testt", totalNotations);

      // return totalNotations
      this.incrementDenominatorsCompetences(this.denominatorsCompetences, objet, totalNotations)
    });

  }


  incrementDenominatorsCompetences(tableau: Denominator[], competence: string, points: number): void {

    tableau.forEach((objet: Denominator) => {
      Object.keys(objet).forEach((clé: string) => {
        if (clé === competence) {
          objet[clé] += Number(points);
          // ATTENTION je crois qu'il ne faut pas de return si generateFullDenominatorsCompetences() est utilisé (?)
          return; // Si la compétence est trouvée, on arrête la fonction
        }
      });
    });

    console.log('denominatorsCompetences', tableau);
  }



  convertirNoteSurVingt() {
    const resultQuizz = this.dataStudent.studentCompetences
    const denominatorsQuizz = this.denominatorsCompetences

    let studentCompetencesSurVingt = [];

    for (let i = 0; i < resultQuizz.length; i++) {
      const competence = resultQuizz[i];
      const competenceName = Object.keys(competence)[0];
      const competenceValue: any = Object.values(competence)[0];

      const denominator = denominatorsQuizz.find((item: any) => item.hasOwnProperty(competenceName));
      if (denominator) {
        const denominatorValue: any = Object.values(denominator)[0];
        const noteSurVingt = (competenceValue / denominatorValue) * 20;
        studentCompetencesSurVingt.push({ [competenceName]: noteSurVingt });
      }
    }

    return studentCompetencesSurVingt;
  }

  async getDurations(sigle: string) {
    try {
      this.durations = await this.settingsService.getDurationsBySigle(sigle);
      console.log('Durations associées au sigle :', this.durations);
    } catch (error) {
      console.error(error);
    }
  }



  async setLevel() {

    // ne sera appeler qu'à ce moment !!!!!!
    // const realEvaluations: Denominator[] = this.convertirNoteSurVingt();
    // si on veut l'afficher à l'utilisateur
    this.realEvaluations = this.convertirNoteSurVingt();
    console.log("realEvaluations", this.realEvaluations);


    // this.levelsArray = this.dataStudent.studentCompetences.map((obj: any) => {
    this.levelsArray = this.realEvaluations.map((obj: any) => {
      const newObj: any = {};
      for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          const levelProp = `level_${prop}`;
          const value = obj[prop];

          let levelValue: number;
          if (value < this.firstCursor) {
            levelValue = 1;
          } else if (value > this.secondCursor) {
            levelValue = 3;
          } else {
            levelValue = 2;
          }
          newObj[levelProp] = levelValue;



          // this.displayDuration(levelValue, this.actualCompetence)

        }
      }
      return newObj;
    });

    console.log("this.levelsArray)", this.levelsArray);
    // this.displayDuration(this.durations, this.levelsArray)

    // // et là on peut essayer d'enregistrer
    // // let fullResults = this.studentService.setFullResults(this.durationsByLevels, this.estimatedCPCost)
    // // this.studentService.updateFullResults(this.studentId, fullResults)

    // // Appelez la fonction pour générer fullResults
    await this.generateFullResults()


  }


  displayDuration(durations: any, levelsArray: any): void {

    for (const key in durations) {
      const level = parseInt(key.match(/\d+$/)?.[0] || ""); // Obtient le niveau de résultat à partir de la clé

      if (!isNaN(level)) {
        const levelMatch = `CP${level}`; // Construit la clé correspondante dans le tableau final
        let levelValue: number | undefined; // Stocke la valeur du niveau correspondant

        // Itère sur les objets de levelsArray pour trouver la correspondance avec le niveau
        for (const levelObj of levelsArray) {
          const objKey = Object.keys(levelObj)[0] // Obtient la clé de l'objet
          if (objKey.endsWith(`_CP${level}`)) { // Vérifie si la clé se termine par "_CP{level}"
            levelValue = levelObj[objKey] // Stocke la valeur correspondante

            this.settingsService.getSigle(this.trade).subscribe((data: Trade) => {
              console.log(`data.costsdata.costs["cost_CP${level}"]`, data.costs[`cost_CP${level}`])
              this.cpCostByHour = data.costs[`cost_CP${level}`]
              this.estimatedCPCost[`individual_cost_CP${level}`] = data.costs[`cost_CP${level}`]
            })
            console.log("le coût horaire de la compétence", this.cpCostByHour)
            break; // Sort de la boucle une fois la correspondance trouvée
          }
        }

        if (levelValue !== undefined) {
          const value = durations[key][levelValue - 1];
          this.durationsByLevels[levelMatch] = value;

          this.settingsService.getSigle(this.trade).subscribe((data: Trade) => {
            this.cpCostByHour = data.costs[`cost_CP${level}`];
            this.estimatedCPCost[`individual_cost_CP${level}`] *= value;

            console.log('this.estimatedCPCost', this.estimatedCPCost);
          });

          console.log('value', value);
        }
      }

    }

    console.log('this.troisiemeTableau', this.durationsByLevels);
  }


  async generateFullResults() { 
    this.quotationIsReady=true

    // ce qu'on avait rattaché à setLevel, bien que ce ne soit pas cohérent du point de vue de la seule logique
    this.displayDuration(this.durations, this.levelsArray)

    // Par exemple, si ces objets proviennent d'une autre fonction, vous les récupérerez ici.
    const durationsByLevels = this.durationsByLevels // Récupérez les données de manière appropriée
    const estimatedCPCost = this.estimatedCPCost // Récupérez les données de manière appropriée

    console.log("this.durationsByLevels dans generateFullResults", this.durationsByLevels);
    console.log("this.levelsArray dans generateFullResults", this.levelsArray);
    


    // Appelez la fonction setFullResults pour générer le tableau fullResults
    this.fullResults = await this.studentService.setFullResults(durationsByLevels, estimatedCPCost);

    // Maintenant, vous pouvez utiliser this.fullResults en sachant qu'il est correctement rempli
    console.log('this.fullResults', this.fullResults)

    this.studentService.updateFullResults(this.studentId, this.fullResults)

    this.totalCost = this.sumCosts(this.fullResults)

  }

  getCursors() {

    this.settingsService.getLevelsCursors().subscribe((data) => {
      // console.log("data!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", data[0]);

      console.log(data[0]);
      this.cursors = data[0]

      this.firstCursor = data[0]['firstCursor']
      this.secondCursor = data[0]['secondCursor']

      console.log(this.firstCursor);
      console.log(this.secondCursor);

    })

  }



  sumCosts(fullResults: { [key: string]: { duration: number; cost: number } }[]): number {
    let totalCost = 0;
  
    for (const entry of fullResults) {
      for (const key in entry) {
        if (entry.hasOwnProperty(key)) {
          totalCost += entry[key].cost;
        }
      }
    }
  
    return totalCost;
  }
  


}




