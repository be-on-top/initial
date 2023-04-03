import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// import { Observable } from 'rxjs';
import { QuestionsService } from 'src/app/admin/questions.service';


@Component({
  selector: 'app-update-question',
  templateUrl: './update-question.component.html',
  styleUrls: ['./update-question.component.css']
})

export class UpdateQuestionComponents implements OnInit {
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
  // logiquement, isVideo doit être décelé bien antérieurement au passage au service en charge de l'enregistrement. 
  // plus cohérent, plus pertinent
  isVideo?: any;


  allMediasQuestions: any[] = []
  allMediasResponses: any[] = []
  // allPathsResponses: any[] = []
  mediasResponsesById: any = []
  mediaQuestionById: any = []

  arrayFilesToUpdate: any = []
  notations: number[] = [1, 2, 3]

  // pour faire le décompte des questions enregistrées puisqu'il faut pouvoir permutter
  numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  registryNumbers: any[] = []

  constructor(private service: QuestionsService, private ac: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {


    this.questionId = this.ac.snapshot.params["id"];
    this.service.getMediasResponsesById(this.questionId)
    this.allMediasResponses = this.service.getMediasResponsesById(this.questionId)
    this.allMediasQuestions = this.service.getMediaQuestionById(this.questionId)
    this.service.getQuestion(this.questionId).subscribe((data) => {
      console.log("data depuis update-question component !!!!!!!!!!!!!", data.question);
      this.result = data
      this.isVideo = data.isVideo
      console.log('status de la video', this.isVideo);
      

    })

    // pour permettre de permutter le numéro de la question
    this.service.getQuestions().subscribe(data => {
      // console.log(data);
      // attention : c'est la différence avec prior-form, on ne veut pas afficher les 20 premières questions dans le dénombre
      for (let n of data) {
        n.number < 21 ? this.registryNumbers = [...this.registryNumbers, Number(n.number)] : ""
        // console.log(this.registryNumbers);
        this.numbers = this.numbers.filter(element => {
          return element != n.number
        });
        // console.log("result", this.numbers);
      }
      // return this.registryNumbers
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
    let updatedQuestion={isVideo:this.isVideo,...form.value}
    this.service.updateQuestion(this.questionId, updatedQuestion, this.arrayFilesToUpdate)
    
    this.router.navigate(['/admin/questions'])
  }

  //  fonction en cas de modification d'un média existant
  detectFiles(event: any, fieldName: any, item: any = "") {
    // console.log("fieldName.name", fieldName.name);
    alert(`êtes-vous certain de vouloir remplacer le fichier ${item} ?`)
    this.service.deleteMedia(item)

    console.log("Type de fichier depuis update question à la modification", event.target.files[0].type);

    event.target.files[0].type==="video/mp4"?this.isVideo=true:this.isVideo=false;

    if (event.target.files[0].size > 1800000) {
      alert("File is too big!")
    }

    this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name])
    // this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name, event.target.files[0].type])
    // console.log("this.arrayFilesToUpdate !!!!!!!!!", this.arrayFilesToUpdate);
    // console.log(event.target.files[0].size);
    
  }

  // fonction en cas d'ajout d'un média sur une réponse ou question initialement sans média
  detectNewFiles(event: any, fieldName: any, item: any = "") {
    // console.log("fieldName.name", fieldName.name);
    // console.log("Type de fichier", event.target.files[0].type);
    alert("new file")

    event.target.files[0].type==="video/mp4"?this.isVideo=true:this.isVideo=false;

    if (event.target.files[0].size > 1800000) {
      alert("File is too big!")
    }

    this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name])
    
  }


  readFile(fieldName: any) {
    alert("dddddd")
    console.log("ce que je récupère", fieldName);
  }
}