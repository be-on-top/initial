import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
// import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

// import { onAuthStateChanged } from 'firebase/auth';
import { QuestionsService } from '../admin/questions.service';
import { SettingsService } from '../admin/settings.service';
import { DetailsComponent } from './vues/details/details.component';
import { StudentsService } from '../admin/students.service';
import { Denominator } from './denominator';
import { Questions } from '../admin/Questions/questions';
import { Trade } from '../admin/trade';
import { Observable, Subject, distinctUntilChanged, firstValueFrom, of, takeUntil } from 'rxjs';
// import { PushNotificationService } from '../push-notification.service';
// import { getMessaging, getToken } from "@angular/fire/messaging";
import { NetworkService } from '../network.service';
import { KeyValue } from '@angular/common';
// import { UpdateService } from '../update.service';

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
  questionsMedias: string[] = ['1', '2']
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
  // cursors: number[] = [10, 15]
  // avec cursors devenu dynamique
  cursors: any = {}
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
  quotationIsReady: boolean = false
  totalCost: number = 0

  // pour tester la modularité de tooltipComponent
  // moreInfo: string = ""
  // moreInfo?: Observable<string | null>
  moreInfo: string | null = null;

  // isIncremented: boolean = false
  // isDecremented: boolean = false

  studentData?: any;
  isIndexValable: boolean = true;

  // Définissez la hauteur de votre menu fixe
  // menuHeight = 100;
  // mobileBreakpoint = 575;

  title: string = ""
  // totalQuestions: number = 100
  totalQuestions: number = 0
  // hasReaden: boolean = false
  loading: boolean = true

  // Subject utilisé pour gérer la destruction de l'abonnement au statut de connexion
  private destroy$ = new Subject<void>();

  isSaving = false;

  saveSuccess = false;


  @ViewChild('myModal') myModal!: ElementRef;
  constructor(
    private ac: ActivatedRoute,
    // private auth: Auth, 
    private questionsService: QuestionsService,
    // private settingService: SettingsService, 
    private studentService: StudentsService,
    // pour tester la récupération des curseurs
    private settingsService: SettingsService,
    private router: Router,
    private el: ElementRef,
    // private notificationService: PushNotificationService,
    private networkService: NetworkService
    // private updateService: UpdateService
  ) {

    // this.networkService.getOnlineStatus().subscribe(online => {
    //   if (!online) {
    //     alert("Vous n'avez plus de connexion. Nous ne pourrons plus charger les données du questionnaire ou détails du compte utilisateur. Merci de réessayer ultérieurement")
    //     this.router.navigate(['/home']); // Rediriger vers la page d'accueil lorsque hors ligne
    //   }
    // });

  }

  ngOnInit() {

    // S'abonner aux changements de statut de connexion
    this.networkService.getOnlineStatus()
      .pipe(
        // Utiliser takeUntil pour gérer la désinscription automatique lors de la destruction du composant
        takeUntil(this.destroy$),
        // Utiliser distinctUntilChanged pour ne réagir qu'aux changements de statut (évite les répétitions)
        distinctUntilChanged()
      )
      .subscribe(online => {
        // Si l'application est hors ligne
        if (!online) {
          // alert("Vous n'avez plus de connexion. Nous ne pourrons plus charger les données du questionnaire ou détails du compte utilisateur. Merci de réessayer ultérieurement");
          // Rediriger vers la page d'accueil
          this.router.navigate(['/home'])
        }
      })

    // pour tenter de détecter des updates côté template
    // this.updateService.checkForUpdates();

    this.trade = this.ac.snapshot.params["id"]
    this.indexQuestion = this.ac.snapshot.params["indexQuestion"]
    this.scoreCounter = this.ac.snapshot.params["scoreCounter"]
    this.hasStartedEvaluation = this.ac.snapshot.params['hasStartedEvaluation'] === 'true'
    this.studentId = this.ac.snapshot.params["studentId"]


    // pour recevoir la liste des questions relatives au métier
    this.questionsService.getQuestions().subscribe(data => {
      let allQuestions = data;
      console.log("allQuestions", allQuestions);

      // on ne compte pas afficher un résulat intermédiaire, donc pour tester le calcul au global...
      // this.questions = allQuestions.filter(q => q.number < 21 && q.sigle == this.trade)
      // this.questions = allQuestions.filter(q => q.number < 100 && q.sigle == this.trade)
      this.questions = allQuestions.filter(q => q.number < 100 && q.sigle == this.trade)
      this.questions.sort(this.compare)
      // pour déterminer le nombre total (réel) de questions
      // this.totalQuestions = this.questions.length + 1
      this.totalQuestions = this.questions.length
      // alert(this.totalQuestions)
      this.loading = false

      // pour qu'on ne se retrouve pas en console avec un can not read id parce qu'il n'y en a plus
      // on peut rajouter ATTENTION !!!!! 
      if (this.indexQuestion < this.questions.length - 1) {
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
        console.log("this.fullOptScoringArray mis à jour !!!!!", this.fullOptScoringTrue)

        // on initialise la valeur réelle de totalAnswersAvailable pour la limite à 2, 3 ou 4 réponses max
        if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option1)) {
          this.totalAnswersAvailable += 1;
        }

        if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option2)) {
          this.totalAnswersAvailable += 1;
        }

        if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option3)) {
          this.totalAnswersAvailable += 1;
        }

        if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option4)) {
          this.totalAnswersAvailable += 1;
        }

        console.log("this.totalAnswersAvailable mis à jour !!!!", this.totalAnswersAvailable);

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
      console.log('this.questions', this.questions);
      console.log('this.questions.length', this.questions.length);


      this.questions.forEach(value => {
        this.competences.push(value.competence)
      }
      )

      this.competences = [...new Set(this.competences)];
      console.log("this.competences!!!!!!!!!!!!!!", this.competences);

      if (this.indexQuestion == 0 && this.scoreCounter == 0) {
        this.studentCompetences = this.competences.map((item: number) => ({ [item]: 0 }));
        console.log(this.studentCompetences);
      }

      // si OPTION MODALE conservée !!!!!!
      // if (this.hasStartedEvaluation==false && this.indexQuestion == 0) {
      //   this.openModal();
      // }


      // et dans l'hypothèse où denominatorsCompetences est incrémenté par le biais de next()
      // et dans l'hypothèse où on peut l'initier dans ngOnInit sans l'écrasesr à chaque fois... 
      this.denominatorsCompetences = this.competences.map((item: number) => ({ [item]: 0 }));
      this.generateFullDenominatorsCompetences(this.competences)

      this.resultingDurationsByCompetences = this.competences.map((item: number) => ({ [item]: 0 }));

      // pour traiter en dur la dénomination 
      if (this.trade == "cl_vul") {
        this.title = "Chauffeur Livreur VUL"

      } else if (this.trade == "prepa_cdes") {
        this.title = "Préparateur de Commandes"

      } else if (this.trade == "poseur_ite") {
        this.title = "Poseur ITE"
      }

      else if (this.trade == "mac_vrd") {
        this.title = "Maçon VRD"
      }

      else if (this.trade == "caces_R489") {
        this.title = "Conducteur chariot élévateur R489"
      }

      else if (this.trade == "caces_R482") {
        this.title = "Conducteur engins de chantier R482"
      }

    })


    // pour vérifier au préalable qu'on accède bien à dataStudent
    this.studentService.getStudentById(this.studentId).subscribe((data) => {
      this.dataStudent = data;
      const quizzKey: string = 'quizz_' + this.trade;
      // console.log('quizzKey!!!!!!!!!!!!!!!!!!!!', quizzKey);
      // console.log('this.dataStudent', this.dataStudent);

      // ici, il est bon
      // console.log('this.dataStudent', this.dataStudent);
      this.hasStartedEvaluation === true && this.dataStudent[quizzKey] && this.dataStudent[quizzKey].studentCompetences ? this.studentCompetences = this.dataStudent[quizzKey].studentCompetences : '';
      this.dataStudent && this.dataStudent[quizzKey] ? console.log('this.dataStudent[quizzKey]', this.dataStudent[quizzKey]) : console.log("pas encore généré");

    })

    // fin

    this.getCursors()

    // this.settingsService.getDurationsBySigle(this.trade).then((data)=>console.log('duration récupéré', data))

    this.getDurations(this.trade)

    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     // L'URL a changé, vous pouvez effectuer des actions ici
    //     alert(this.router.url);
    //     const realIndexFromDatabase = this.studentData['quizz_' + this.trade].lastIndexQuestion
    //     this.router.navigate([
    //       '/quizz/',
    //       this.trade,realIndexFromDatabase + 1,this.studentData?.['quizz_'+this.trade.sigle]?.scoreCounter,
    //       true,this.studentId
    //     ]);

    //   }
    // }); 



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
    // quoi que puisque on a une affectation conditionnée dans ngOnInit, ça fera probablement double emploi !!!!!
    // this.studentCompetences = this.dataStudent.studentCompetences
    const quizzKey: string = 'quizz_' + this.trade
    this.studentCompetences = this.dataStudent[quizzKey]?.studentCompetences

    // une fois qu'il a fait tout ça,  on va tester le retour de levelsArray
    // this.setLevel() 

  }
  // pour déléguer à next la gestion sensible du cas où fullAnswersClicked est supérieur ou égal à totalAnswersAvailable, je récupère un paramètre additionnel
  next(indexQuestion: number, evaluatedCompetence: string) {
    // alert(this.totalAnswersAvailable)
    // alert(evaluatedCompetence)


    // if (this.fullAnswersClicked >= this.totalAnswersAvailable) {
    //   // alert("Vous ne pouvez pas cocher toutes les réponses. Il faut faire une sélection"),
    //   this.scoreCounter -= Number(this.numberOfPoints),
    //     this.studentService.updateStudentScore(this.studentId, this.scoreCounter, this.indexQuestion, this.trade, this.hasStartedEvaluation, this.studentCompetences, evaluatedCompetence, this.numberOfPoints, false, true)
    // }

    // la ligne ci-dessous fonctionne très bien pour un algorithme plus selectif
    // if (this.fullAnswersClicked >this.fullOptScoringTrue) {
    //   this.scoreCounter -= Number(this.numberOfPoints),
    //     this.studentService.updateStudentScore(this.studentId, this.scoreCounter, this.indexQuestion, this.trade, this.hasStartedEvaluation, this.studentCompetences, evaluatedCompetence, this.numberOfPoints, false, true)
    // }

    // Appel de la méthode "reset" du composant enfant
    this.childComponent.reset();
    this.indexQuestion = Number(indexQuestion) + 1
    // alert(this.indexQuestion)
    this.updateUrl(this.indexQuestion, this.scoreCounter);

    // on peut rajouter ATTENTION !!!!! 
    if (this.indexQuestion < this.questions.length) {

      // pour mettre à jour les points à attribuer à la question une fois l'index incrémenté
      this.questions[this.indexQuestion].notation ? this.numberOfPoints = this.questions[this.indexQuestion].notation : ''

      console.log('  this.denominatorsCompetences!', this.denominatorsCompetences);

    } else {

      console.log('indexQuestion ne correspond plus à aucune question identifiable');
      this.setLevel()
    }

    // pour rappeler la liste des medias 
    // this.questionsMedias = this.questionsService.getMediaQuestionById(this.questions[this.indexQuestion].id)
    // console.log("questionsMedias depuis questions-details", this.questionsMedias)
    // this.responsesMedias = this.questionsService.getMediasResponsesById(this.questions[this.indexQuestion].id)
    // Vérifier si l'index est valide avant d'essayer d'accéder aux médias
    if (this.indexQuestion < this.questions.length) {
      this.questionsMedias = this.questionsService.getMediaQuestionById(this.questions[this.indexQuestion].id);
      console.log("questionsMedias depuis questions-details", this.questionsMedias);
      this.responsesMedias = this.questionsService.getMediasResponsesById(this.questions[this.indexQuestion].id);
    } else {
      // Traiter le cas où il n'y a plus de questions disponibles
      console.log("Plus de questions disponibles, aucun média à charger.");
      this.questionsMedias = [];
      this.responsesMedias = [];
    }



    // // et puisqu'on commence une nouvelle question, isCompleted redevient false, de même que les variabless qui suivent
    // this.isCompleted = false
    // this.fullGoodAnswersClicked = 0
    // this.fullOptScoringTrue = 0
    // this.totalAnswersAvailable = 0
    // this.resetChildCounter()

    // // on initialise la valeur réelle de fullOptScoringArray pour avoir un point de comparaison
    // this.questions[this.indexQuestion].optScoring1 && this.questions[this.indexQuestion].optScoring1 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    // this.questions[this.indexQuestion].optScoring2 && this.questions[this.indexQuestion].optScoring2 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    // this.questions[this.indexQuestion].optScoring3 && this.questions[this.indexQuestion].optScoring3 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    // this.questions[this.indexQuestion].optScoring4 && this.questions[this.indexQuestion].optScoring4 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : ""
    // console.log("this.fullOptScoringArray", this.fullOptScoringTrue)

    // pour plus de fiabilité
    // Vérifier si l'index est valide avant d'essayer d'accéder aux propriétés de la question
    if (this.indexQuestion < this.questions.length) {
      // Initialisation des variables
      this.isCompleted = false;
      this.fullGoodAnswersClicked = 0;
      this.fullOptScoringTrue = 0;
      this.totalAnswersAvailable = 0;
      this.resetChildCounter();

      // Initialiser les valeurs de fullOptScoringArray, si les options existent
      this.questions[this.indexQuestion].optScoring1 && this.questions[this.indexQuestion].optScoring1 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : "";
      this.questions[this.indexQuestion].optScoring2 && this.questions[this.indexQuestion].optScoring2 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : "";
      this.questions[this.indexQuestion].optScoring3 && this.questions[this.indexQuestion].optScoring3 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : "";
      this.questions[this.indexQuestion].optScoring4 && this.questions[this.indexQuestion].optScoring4 === true ? this.fullOptScoringTrue = Number(this.fullOptScoringTrue) + 1 : "";

      console.log("this.fullOptScoringArray", this.fullOptScoringTrue);
    } else {
      console.log("Index de question invalide, pas de scoring disponible.");
    }



    // if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option1)) {
    //   this.totalAnswersAvailable += 1;
    // }

    // if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option2)) {
    //   this.totalAnswersAvailable += 1;
    // }

    // if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option3)) {
    //   this.totalAnswersAvailable += 1;
    // }

    // if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option4)) {
    //   this.totalAnswersAvailable += 1;
    // }

    // pour plus de fiabilité

    // Vérifier si l'index est valide avant d'essayer d'accéder aux options
if (this.indexQuestion < this.questions.length) {
  // Vérification des options pour calculer totalAnswersAvailable
  if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option1)) {
    this.totalAnswersAvailable += 1;
  }

  if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option2)) {
    this.totalAnswersAvailable += 1;
  }

  if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option3)) {
    this.totalAnswersAvailable += 1;
  }

  if (!this.isNullOrEmpty(this.questions[this.indexQuestion].option4)) {
    this.totalAnswersAvailable += 1;
  }

  console.log("this.totalAnswersAvailable mis à jour !!!!", this.totalAnswersAvailable);
} else {
  console.log("Index de question invalide, le questionnaire est terminé, pas de calcul des options.");
}



    // ne sert à rien une fois déployé
    // const isMobile = window.innerWidth <= this.mobileBreakpoint;

    // if (isMobile) {
    //   const nextAnchor = this.el.nativeElement.querySelector('a[name="next"]');
    //   if (nextAnchor) {
    //     const offset = nextAnchor.offsetTop - this.menuHeight;
    //     window.scrollTo({ top: offset, behavior: 'smooth' });
    //   }
    // }

  }


  updateUrl(indexQuestion: number, scoreCounter: number) {
    const updatedUrl = ['/quizz', this.trade, indexQuestion, scoreCounter, this.hasStartedEvaluation.toString(), this.studentId];
    this.router.navigate(updatedUrl);
    console.log("URL mise à jour :", this.router.url);
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
    // avec les multiples quizz, ce n'est plus possible
    // const resultQuizz = this.dataStudent.studentCompetences
    const quizzKey: string = 'quizz_' + this.trade
    const resultQuizz = this.dataStudent[quizzKey].studentCompetences

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


  // refacto

  async setLevel() {
    this.realEvaluations = this.convertirNoteSurVingt();
    console.log("realEvaluations", this.realEvaluations);

    this.levelsArray = this.realEvaluations.map((obj: any) => {
      const newObj: any = {};
      for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          const levelProp = `level_${prop}`;
          const value = obj[prop];

          let levelValue = value < this.firstCursor ? 1 : value > this.secondCursor ? 3 : 2;
          newObj[levelProp] = levelValue;
        }
      }
      return newObj;
    });

    console.log("this.levelsArray)", this.levelsArray);

    // On prépare les données asynchrones puis on génère fullResults
    await this.prepareDataForResults();
  }

  async prepareDataForResults() {
    const durationsByLevels: any = {};
    const estimatedCPCost: any = {};

    // Récupérer toutes les valeurs asynchrones en parallèle
    await Promise.all(
      Object.keys(this.durations).map(async (key) => {
        const level = parseInt(key.match(/\d+$/)?.[0] || "");
        if (isNaN(level)) return;

        const levelMatch = `CP${level}`;

        // Trouver la valeur du niveau
        let levelValue;
        for (const levelObj of this.levelsArray) {
          const objKey = Object.keys(levelObj)[0];
          if (objKey.endsWith(`_CP${level}`)) {
            levelValue = levelObj[objKey];
            break;
          }
        }

        if (levelValue !== undefined) {
          const value = this.durations[key][levelValue - 1];
          durationsByLevels[levelMatch] = value;

          // Récupérer le coût correspondant
          const data = await firstValueFrom(this.settingsService.getSigle(this.trade));
          estimatedCPCost[`individual_cost_CP${level}`] = data.costs[`cost_CP${level}`] * value;
        }
      })
    );

    this.durationsByLevels = durationsByLevels;
    this.estimatedCPCost = estimatedCPCost;

    console.log('this.durationsByLevels', this.durationsByLevels);
    console.log('this.estimatedCPCost', this.estimatedCPCost);

    // Une fois tout prêt, on génère fullResults
    await this.generateFullResults();
  }

  // async generateFullResults() {
  //   this.quotationIsReady = true;
  //   console.log("this.durationsByLevels dans generateFullResults", this.durationsByLevels);
  //   console.log("this.levelsArray dans generateFullResults", this.levelsArray);

  //   this.fullResults = await this.studentService.setFullResults(
  //     this.durationsByLevels,
  //     this.estimatedCPCost,
  //     this.realEvaluations
  //   );

  //   console.log('this.fullResults de generatedFullResults', this.fullResults);

  //   await this.studentService.updateFullResults(this.studentId, this.fullResults, this.trade);
  //   this.totalCost = this.sumCosts(this.fullResults);
  // }



  // fin refacto


  // pour la gestion du spinner
  // async generateFullResults() {
  //     this.isSaving = true;
  //     this.quotationIsReady = true;

  //     try {
  //         console.log("this.durationsByLevels dans generateFullResults", this.durationsByLevels);
  //         console.log("this.levelsArray dans generateFullResults", this.levelsArray);

  //         this.fullResults = await this.studentService.setFullResults(
  //             this.durationsByLevels,
  //             this.estimatedCPCost,
  //             this.realEvaluations
  //         );

  //         console.log('this.fullResults de generatedFullResults', this.fullResults);

  //         await this.studentService.updateFullResults(this.studentId, this.fullResults, this.trade);
  //         this.totalCost = this.sumCosts(this.fullResults);

  //         this.saveSuccess = true; // Affiche le message de succès  
  //     } catch (error) {
  //         console.error("Erreur lors de l'enregistrement des résultats", error);
  //     } finally {
  //         this.isSaving = false;
  //     }
  // }

  // encore plus fiable
  async generateFullResults() {
    try {
      // Démarrage de l'enregistrement -> Affichage du spinner
      this.isSaving = true;
      console.log("this.durationsByLevels dans generateFullResults", this.durationsByLevels);
      console.log("this.levelsArray dans generateFullResults", this.levelsArray);

      // Appel au service pour sauvegarder les résultats
      this.fullResults = await this.studentService.setFullResults(
        this.durationsByLevels,
        this.estimatedCPCost,
        this.realEvaluations
      );

      console.log('this.fullResults de generatedFullResults', this.fullResults);

      // Mise à jour des résultats en base
      await this.studentService.updateFullResults(this.studentId, this.fullResults, this.trade);
      this.totalCost = this.sumCosts(this.fullResults);

      // On met à jour le succès
      this.saveSuccess = true;

    } catch (error) {
      console.error("Erreur lors de l'enregistrement des résultats", error);
      // Optionnel : Message d'erreur utilisateur
      this.saveSuccess = false;
    } finally {
      // Le spinner est désactivé une fois l'enregistrement terminé (ou en cas d'erreur)
      this.isSaving = false;
    }
  }




  getCursors() {
    this.settingsService.getLevelsCursors().subscribe((data) => {
      // Vérifie si data est défini et s'il a les propriétés attendues
      if (data && 'firstCursor' in data && 'secondCursor' in data) {
        console.log(data);

        this.cursors = data;
        this.firstCursor = data['firstCursor'];
        this.secondCursor = data['secondCursor'];

        console.log(this.firstCursor);
        console.log(this.secondCursor);
      } else {
        // Gérer le cas où les propriétés ne sont pas définies
        console.error('Les propriétés attendues ne sont pas définies dans data.');
      }
    });
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
    // pour être certain de la gestion du fractionné (?)
    // Arrondir le résultat final à deux décimales
    // return parseFloat(totalCost.toFixed(2));
  }


  // fonction test pour retourne LA clé que j'aurais toujours besoin de passer à settings : OK
  //   transformTextToInfo(text: string, delimiter: string): string {
  //     const startIndex = text.indexOf(delimiter);
  //     if (startIndex !== -1) {
  //         return delimiter + text.slice(startIndex + delimiter.length);
  //     }
  //     return text;
  // }

  updateMoreInfo(key: string): void {
    this.transformTextToInfo(key, 'CP').subscribe(info => {
      this.moreInfo = info;
    });
  }

  transformTextToInfo(text: string, delimiter: string): Observable<string> {
    const startIndex = text.indexOf(delimiter)
    if (startIndex !== -1) {
      // console.log(text.indexOf(delimiter))
      const infoKey = parseInt(text.substring(startIndex + delimiter.length), 10) - 1;
      console.log("infoKey", infoKey);
      return this.settingsService.getCPName(this.trade, infoKey)
    }

    return of(text); // Retourner un observable avec la valeur actuelle si la clé n'est pas trouvée
  }


  // Fonction pour vérifier si la valeur est nulle ou une chaîne vide
  isNullOrEmpty = (value: string | null): boolean => {
    return value === null || value.trim() === '';
  };

  redirectToAccount() {
    this.notifyMeWithTitleAndBody('Votre Actualité', `Bravo, vous êtes au top ! Retrouvez tous vos résultats et vos estimations personnalisées dans votre compte personnel `);

    this.router.navigate(['/account']);

  }

  checkIndexValidity(param: number) {
    this.studentService.getStudentById(this.studentId).subscribe((data) => {
      this.studentData = data

      const realIndexFromDatabase = this.studentData['quizz_' + this.trade].lastIndexQuestion

      // alert(realIndexFromDatabase)

      if (param <= realIndexFromDatabase) { this.redirectToRealUrl(realIndexFromDatabase) } else { alert("ok") }
    })
  }

  redirectToRealUrl(realIndexFromDatabase: number) {
    this.router.navigate([
      '/quizz/',
      this.trade, realIndexFromDatabase + 1, this.studentData?.['quizz_' + this.trade.sigle]?.scoreCounter,
      true, this.studentId
    ]);
  }

  // openModal() {
  //   const modalElement = this.myModal.nativeElement;

  //   // Ouvrir la modal
  //   modalElement.classList.add('show');
  //   modalElement.style.display = 'block';

  //   // Ajouter un écouteur d'événements pour détecter la fermeture de la modal
  //   modalElement.addEventListener('click', (event:any) => {
  //     if (event.target === modalElement) {
  //       this.hideModal();
  //     }
  //   });

  //   // Ajouter un écouteur d'événements pour le bouton de fermeture
  //   const closeButton = modalElement.querySelector('.btn-close', '.btn');
  //   if (closeButton) {
  //     closeButton.addEventListener('click', () => {
  //       this.hideModal();
  //     });
  //   }
  // }

  hideModal() {
    const modalElement = this.myModal.nativeElement;

    // Fermer la modal
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';

    // Retirer les écouteurs d'événements pour éviter les fuites de mémoire
    modalElement.removeEventListener('click', this.hideModal);
    const closeButton = modalElement.querySelector('.btn-close');
    if (closeButton) {
      closeButton.removeEventListener('click', this.hideModal);
    }
  }

  // readen() {
  //   this.hasReaden = true;
  // }


  // à tester 

  async notifyMeWithTitleAndBody(title: string, body: string) {
    // Vérifier si la permission est déjà accordée
    if (Notification.permission !== 'granted') {
      await this.requestNotificationPermission();
    }

    try {
      const options = {
        body: body,
        icon: 'url_de_l_icone', // Remplacez par l'URL de l'icône que vous souhaitez afficher
        image: 'url_de_l_image', // Ajoutez une image si nécessaire
      };

      // Afficher la notification avec les options
      const registration = await navigator.serviceWorker.getRegistration();
      // alert(registration)
      if (registration) {
        registration.showNotification(title, options);
      }

    } catch (error) {
      console.error("Error during notification setup:", error);
    }

  }

  // Méthode pour demander la permission de notification
  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("Notification permission granted");
        // Vous pouvez effectuer d'autres actions ici si la permission est accordée...
      } else {
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }

  // Méthode pour trier les entrées de l'objet par les parties numériques des clés
  sortDurationsByLevels(): KeyValue<string, number>[] {
    return Object.entries(this.durationsByLevels)
      .sort(([keyA], [keyB]) => {
        const numA = parseInt(keyA.match(/\d+/)![0], 10);
        const numB = parseInt(keyB.match(/\d+/)![0], 10);
        return numA - numB;
      })
      .map(([key, value]) => ({ key, value }));
  }

  ngOnDestroy() {
    // Emettre un signal pour compléter l'Observable et désinscrire les abonnés
    this.destroy$.next();
    this.destroy$.complete();
  }


}
