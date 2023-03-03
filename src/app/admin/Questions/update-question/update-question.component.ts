import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { QuestionsService } from '../questions.service';


@Component({
  selector: 'app-update-question',
  templateUrl: './update-question.component.html',
  styleUrls: ['./update-question.component.css']
})
export class UpdateQuestionComponents implements OnInit {
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
  allPathsResponses: any[] = []

  arrayFilesToUpdate: any = []

  constructor(private service: QuestionsService, private ac: ActivatedRoute) {
  }

  ngOnInit(): void {

    this.questionId = this.ac.snapshot.params["id"];
    // on fait appel à getEvaluator pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getQuestion(this.questionId).subscribe((data) => {
      console.log("data depuis update-question component !!!!!!!!!!!!!", data.question);
      this.result = data
    })

    this.allMediasQuestions = this.service.getMediasQuestions()
    this.allMediasResponses = this.service.getMediasResponses()
    this.allPathsResponses = this.service.getMediasResponsesPath()
    console.log("allMediasQuestions",this.allMediasQuestions);
    console.log("allMediasResponses", this.allMediasResponses);

  }

  async updateForm(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    console.log("form update values", form.value);
    // pour update de la nouvelle image si nouvelle : 
    this.service.updateQuestion(this.questionId, form.value, this.arrayFilesToUpdate)
    // il faudra prévoir une redirection... 
  }


  //  fonction basique pour le moment. on fait d'abord un focus sur les données textuelles
  detectFiles(event: any, fieldName: any, item: any = "") {
    console.log("sssssssssss", fieldName.name);

    if (this.allMediasQuestions.includes(item) || this.allMediasResponses.includes(item) || this.allPathsResponses.includes(item)) {
      alert(`êtes-vous certain de vouloir remplacer le fichier ${item} ?`)
      // si confirmation (à faire)
      // this.service.deleteMedia(item)
      //et on enregistre le nouveau
  //  this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name, event.target.files[0].type])   
    }

    this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name, event.target.files[0].type])
    console.log(event.target.files[0].size);
    if (event.target.files[0].size > 13000000) {
      alert("File is too big!")
    }
  }


  readFile(fieldName: any) {
    alert("dddddd")
    console.log("ce que je récupère", fieldName);

  }

}
