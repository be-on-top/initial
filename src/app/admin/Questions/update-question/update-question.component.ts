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


  constructor(private service: QuestionsService, private ac: ActivatedRoute) {


  }

  ngOnInit(): void {

    this.questionId = this.ac.snapshot.params["id"];
    // on fait appel à getEvaluator pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getQuestion(this.questionId).subscribe((data) => {
      console.log("data depuis update-question component !!!!!!!!!!!!!", data.question);
      this.result = data
    })

  }

  updateQuestion(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    console.log("form update values", form.value);
    // à venir pour update : 
    // this.service.updateQuestion(this.questionId, form.value)
    // il faudra prévoir une redirection... 
  }


  //  fonction basique pour le moment. on fait d'abord un focus sur les données textuelles
  detectFiles(event: any, fieldName: any) {
    console.log(event.target.files[0].size);
    if (event.target.files[0].size > 13000000) {
      alert("File is too big!")
    }
  }

}
