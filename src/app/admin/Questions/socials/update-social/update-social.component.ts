import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialsService } from 'src/app/admin/socials.service';

@Component({
  selector: 'app-update-social',
  templateUrl: './update-social.component.html',
  styleUrls: ['./update-social.component.css']
})
export class UpdateSocialComponent {

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


  allMediasQuestions: any[] = []
  allMediasResponses: any[] = []
  // allPathsResponses: any[] = []
  mediasResponsesById: any = []
  mediaQuestionById: any = []

  arrayFilesToUpdate: any = []
  notations: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  constructor(private service: SocialsService, private ac: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {

    this.questionId = this.ac.snapshot.params["id"];
    // récupération des seuls média Responses correspondant à la question en cours d'update
    this.service.getMediasResponsesById(this.questionId)
    // récupération du seul média Question correspondant à la question en cours d'update
    this.mediasResponsesById=this.service.getMediasResponsesById(this.questionId)
    this.mediaQuestionById=this.service.getMediaQuestionById(this.questionId)
    // console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjj",this.mediaQuestionById);
    

    // on fait appel à getEvaluator pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getSocialQuestion(this.questionId).subscribe((data) => {
      console.log("data depuis update-question component !!!!!!!!!!!!!", data.question);
      this.result = data

    })


    this.allMediasQuestions = this.service.getMediasQuestions()
    this.allMediasResponses = this.service.getMediasResponses()
    // this.allPathsResponses = this.service.getMediasResponsesPath()
    console.log("allMediasQuestions", this.allMediasQuestions);
    console.log("allMediasResponses", this.allMediasResponses);

  }

  updateForm(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    // console.log("form update values", form.value);
    // pour update de la nouvelle image si nouvelle : 
    this.service.updateSocialQuestion(this.questionId, form.value, this.arrayFilesToUpdate)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/socials'])
  }

  //  fonction basique pour le moment. on fait d'abord un focus sur les données textuelles
  detectFiles(event: any, fieldName: any, item: any = "") {
    console.log("sssssssssss", fieldName.name);

    // if (this.allMediasQuestions.includes(item) || this.allMediasResponses.includes(item) || this.allPathsResponses.includes(item)) {
    if (this.allMediasQuestions.includes(item) || this.allMediasResponses.includes(item)) {
      alert(`êtes-vous certain de vouloir remplacer le fichier ${item} ?`)
      // si confirmation (à faire)
      this.service.deleteMedia(item)
      //et on enregistre le nouveau
      //  this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name, event.target.files[0].type])   
    }

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
