import { AfterViewInit, Component, OnInit, } from '@angular/core';
import { StudentsService } from '../../students.service';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'app-add-follow-up',
  templateUrl: './add-follow-up.component.html',
  styleUrls: ['./add-follow-up.component.css']
})
export class AddFollowUpComponent implements OnInit {

  studentId: string = ""

  // pour l'éditeur de text
  tinymce: any; // Déclaration pour accéder à l'objet tinymce global
  userRouterLinks: string = ""

  feedbackMessages?: any = ""
  isSuccessMessage: boolean = true
  // essai pour personnaliser les messages
  // https://firebase.google.com/docs/auth/admin/errors?hl=fr
  firebaseErrors: any = {
    'auth/user-not-found': 'Aucun utilisateur ne correspond à cet email',
    'auth/email-already-in-use': 'Cet email est déjà utilisé pour un autre compte',
    'auth/wrong-password': 'Le mot de passe est incorrect',
    'auth/invalid-email': 'Aucun enregistrement ne correspond au mail fourni'
  }; // list of firebase error codes to alternate error messages

  receivedTrades: string[] = [];
  selectedSigle: string = ""
  relatedCompetences: any = []
  levels: string[] = ['beginner', 'intermediate', 'advance', 'pro']
  fullName: string = ""
  // si trades devait se baser à terme sur subscriptions
  subscriptions?: any
  isRealStudent: boolean = false

  constructor(
    private service: StudentsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService) {
    this.studentId = this.activatedRoute.snapshot.params['id']
    this.userRouterLinks = this.activatedRoute.snapshot.data['user']
  }

  ngOnInit(): void {
    // this.receivedTrades = this.activatedRoute.snapshot.queryParams['trades'] ? this.activatedRoute.snapshot.queryParams['trades'].split(',') : [];
    console.log('trades récupéré en paramètres de route', this.receivedTrades);

    // on appelle la méthode qui va nous permettre de récupérer les compétences 
    this.getRelatedCompetences()
    this.service.getStudentById(this.studentId).subscribe((data: any) => {
      this.fullName = `${data.firstName} ${data.lastName}`
      data.subscriptions?this.subscriptions = Object.values(data.subscriptions):''
      data.subscriptions?this.isRealStudent = true:''

      console.log('tableau des inscriptions', this.subscriptions);
      this.receivedTrades = this.activatedRoute.snapshot.queryParams['trades'] ? this.activatedRoute.snapshot.queryParams['trades'].split(',') : [this.subscriptions];

    })


  

  }

  // si on opte pour une méthode commune : 
  addFollowUp(studentId: string, evaluation: NgForm) {
    console.log(evaluation.value.date)
    this.userRouterLinks == 'tutor' ? this.addTutorial(studentId, evaluation) : this.addEvaluation(studentId, evaluation)
  }

  addEvaluation(studentId: string, evaluation: NgForm) {
    console.log(evaluation.value.date)
    // let evaluations:any={}
    let evalKey: string = 'evaluation-' + evaluation.value.date + Math.floor(Math.random() * 2)
    const evaluations = { [evalKey]: evaluation.value }
    this.service.addFollowUpEvaluation(studentId, { evaluations }).then(() => {

      this.feedbackMessages = `Enregistrement OK`;
      setTimeout(() => {
        this.router.navigate(['/admin/myStudentDetails', studentId])
      }, 2000)
      // this.router.navigate(['/admin/trainers']);
      // ...
    })
      .catch((error) => {
        this.feedbackMessages = error.message;
        // this.feedbackMessages = this.firebaseErrors[error.code];
        this.isSuccessMessage = false;
        console.log(this.feedbackMessages);

        // ..};
      })
    // form.reset();
    // redirige vers la vue de détail 
    // this.router.navigate(['/admin/trainers']);

  }

  addTutorial(studentId: string, tutorial: NgForm) {
    console.log(tutorial.value.date)
    // let evaluations:any={}
    let evalKey: string = 'tutorial-' + tutorial.value.date + Math.floor(Math.random() * 2)
    const tutorials = { [evalKey]: tutorial.value }
    this.service.addFollowUpTutorial(studentId, { tutorials })
      .then(() => {

        this.feedbackMessages = `Enregistrement OK`;
        setTimeout(() => {
          this.router.navigate(['/admin/tutor/myStudentDetails', studentId])
        }, 2000)
        // this.router.navigate(['/admin/trainers']);
        // ...
      })
      .catch((error) => {
        this.feedbackMessages = error.message;
        // this.feedbackMessages = this.firebaseErrors[error.code];
        this.isSuccessMessage = false;
        console.log(this.feedbackMessages)
      })
  }

  // ngAfterViewInit() {

  //   this.tinymce.init({
  //     selector: '#editor', // L'ID de l'élément textarea
  //     plugins: ['link', 'table', 'image'], // Plugins que vous souhaitez activer
  //     toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | table image', // Barre d'outils de l'éditeur
  //   });


  // }

  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigle = sigle
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  async getRelatedCompetences() {
    // on peut boucler sur le tableau reçu en paramètre, récupérer chaque sigle et retourner les CP concernées dans la collection sigles
    for (const iterator of this.receivedTrades) {
      // let additionalCompetences:any
      this.settingsService.getSigle(iterator).subscribe((data): any => {
        // console.log('data.competences', data.competences)
        for (const key in data.competences) {
          // console.log('data.competences[key]', data.competences[key]);
          let additionalKeySigle: string = 'competences_' + iterator
          let additionalKey: string = key
          let additionalCP: any = data.competences[key]

          this.relatedCompetences[additionalKeySigle] = { ...this.relatedCompetences['competences_' + iterator], ['CP' + additionalKey]: additionalCP }
          console.log('relatedCompetences renvoyées par le service setting !!!!!!', this.relatedCompetences)
        }
      })

    }
    console.log('relatedCompetences en dehors de la boucle', this.relatedCompetences)
    // return this.relatedCompetences
  }


}
