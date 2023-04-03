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


  // mediaQuestion: any;
  // mediaOption1: any;
  // option1: string = "";
  // optScoring1: boolean = false;
  // comment1: string = "";
  // mediaOption2: any;
  // option2: string = "";
  // optScoring2: boolean = false;
  // comment2: string = "";
  // mediaOption3: any;
  // optScoring3: boolean = false;
  // option3: string = "";
  // comment3: string = "";
  // mediaOption4: any;
  // optScoring4: boolean = false;
  // option4: string = "";
  // comment4: string = "";
  isVideo?: any;


  allMediasQuestions: any = []
  allMediasResponses: any = []
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
    this.allMediasResponses = this.service.getMediasResponsesById(this.questionId)
    this.allMediasQuestions = this.service.getMediaQuestionById(this.questionId)
    // console.log("mediaQuestionById",this.mediaQuestionById);


    // on fait appel à getSocialQuestion pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getSocialQuestion(this.questionId).subscribe((data) => {
      console.log("data depuis update-question component !!!!!!!!!!!!!", data);
      this.result = data
      this.isVideo = data.isVideo

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
    console.log("video avant passage à service", this.isVideo);
    let updatedQuestion = { isVideo: this.isVideo, ...form.value }
    this.service.updateSocialQuestion(this.questionId, updatedQuestion, this.arrayFilesToUpdate)

    this.router.navigate(['/admin/socials'])
  }

  //  fonction en cas de modification d'un média existant
  detectFiles(event: any, fieldName: any, item: any = "") {
    // console.log("fieldName.name", fieldName.name);
    alert(`êtes-vous certain de vouloir remplacer le fichier ${item} ?`)
    this.service.deleteMedia(item)

    console.log("Type de fichier depuis update social component", event.target.files[0].type);

    event.target.files[0].type === "video/mp4" ? this.isVideo = true : this.isVideo = false;

    // https://www.cnetfrance.fr/produits/calculer-le-poids-de-ses-photos-1003101.htm
    if (event.target.files[0].size > 18000000) {
      alert("File is too big!")
    }

    this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name])
    // this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name, event.target.files[0].type])
    // console.log("this.arrayFilesToUpdate !!!!!!!!!", this.arrayFilesToUpdate);
    // console.log(event.target.files[0].size);

  }

  // fonction en cas d'ajout d'un média sur une réponse initialement sans média
  detectNewFiles(event: any, fieldName: any, item: any = "") {
    // console.log("fieldName.name", fieldName.name);
    // console.log("Type de fichier", event.target.files[0].type);
    alert("new file")

    event.target.files[0].type === "video/mp4" ? this.isVideo = true : this.isVideo = false;

    if (event.target.files[0].size > 18000000) {
      alert("File is too big!")
    }

    this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name])

  }


  readFile(fieldName: any) {
    alert("dddddd")
    console.log("ce que je récupère", fieldName);
  }


}