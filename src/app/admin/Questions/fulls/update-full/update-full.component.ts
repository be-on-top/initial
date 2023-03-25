import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionsService } from 'src/app/admin/questions.service';
import { EvaluatorsService } from 'src/app/admin/evaluators.service';


@Component({
  selector: 'app-update-full',
  templateUrl: './update-full.component.html',
  styleUrls: ['./update-full.component.css']
})
export class UpdateFullComponent {

  // pour les données liées à la collection questions
  questionId: any;
  result: any = {}


  mediaQuestion: any;
  mediaOption1: any;
  option1: string = "";
  optScoring1: boolean = false;
  comment1: string = "";
  mediaOption2: any;
  option2: string = "";
  optScoring2: boolean = false;
  comment2: string = "";
  mediaOption3: any;
  optScoring3: boolean = false;
  option3: string = "";
  comment3: string = "";
  mediaOption4: any;
  optScoring4: boolean = false;
  option4: string = "";
  comment4: string = "";
  mediaOption5: any;
  option5: string = "";
  comment5: string = "";


  allMediasQuestions: any = []
  allMediasResponses: any = []
  // allPathsResponses: any[] = []
  mediasResponsesById: any = []
  mediaQuestionById: any = []

  arrayFilesToUpdate: any = []
  notations: number[] = [1, 2, 3]

  constructor(private service: QuestionsService, private ac: ActivatedRoute, private router: Router, private evaluatorService: EvaluatorsService) {
  }

  ngOnInit(): void {

    this.questionId = this.ac.snapshot.params["id"];
    // récupération des seuls média Responses correspondant à la question en cours d'update
    this.service.getMediasResponsesById(this.questionId)
    // récupération du seul média Question correspondant à la question en cours d'update
    this.allMediasResponses = this.service.getMediasResponsesById(this.questionId)
    this.allMediasQuestions = this.service.getMediaQuestionById(this.questionId)
    // console.log("mediaQuestionById",this.mediaQuestionById);


    // on fait appel à getQuestion pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getQuestion(this.questionId).subscribe((data) => {
      console.log("data depuis update-question component !!!!!!!!!!!!!", data);
      this.result = data
    })

  }


  updateForm(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    // console.log("form update values", form.value);
    // pour update de la nouvelle image si nouvelle : 
    this.service.updateQuestion(this.questionId, form.value, this.arrayFilesToUpdate)
    // il faudra prévoir une redirection vers la question qui a été mise à jour... 
    this.router.navigate(['/fullList'])
  }

  //  fonction basique pour le moment. on fait d'abord un focus sur les données textuelles
  detectFiles(event: any, fieldName: any, item: any = "") {
    // console.log("fieldName.name", fieldName.name);
    alert(`êtes-vous certain de vouloir remplacer le fichier ${item} ?`)
    this.service.deleteMedia(item)


    console.log("Type de fichier", event.target.files[0].type);

    this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name, event.target.files[0].type])
    // console.log("this.arrayFilesToUpdate", this.arrayFilesToUpdate);
    console.log(event.target.files[0].size);
    if (event.target.files[0].size > 18000000) {
      alert("File is too big!")
    }
  }


  readFile(fieldName: any) {
    alert("dddddd")
    console.log("ce que je récupère", fieldName);
  }





}
