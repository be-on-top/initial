import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { QuestionsService } from '../admin/questions.service';
import { SettingsService } from '../admin/settings.service';

@Component({
  selector: 'app-quizz',
  templateUrl: './quizz.component.html',
  styleUrls: ['./quizz.component.css']
})
export class QuizzComponent implements OnInit {
  // doit récupérer via le paramètre de route l'id relative au métier
  trade: any = ""
  // doit retrouver le sigle correspondant à l'id du métier
  specificSigle:any=""
  // doit récupérer l'uid de l'utilisateur authentifié
  uid: string = ""
  // doit récupérer les questions (préalables et de positionnement) via le service dédié (questionsService) pour le métier visé
  questions: any[] = []

  constructor(private ac: ActivatedRoute, private auth: Auth, private questionsService: QuestionsService, private settingService:SettingsService) {
    this.trade = this.ac.snapshot.params["id"]
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.uid = user.uid
      }
      else {
        console.log("Personne n'est authentifié actuellement !");
      }
    })




    // pour recevoir la liste des questions relatives au métier
    this.questionsService.getQuestions().subscribe(data => {
      let allQuestions = data;
      console.log("allQuestions", allQuestions);

      this.questions = allQuestions.filter(q => q.number < 21 && q.sigle==this.trade)
      // this.questions.sort(this.compare)
    })
  }

  // compare(a: any, b: any) {
  //   return a.number - b.number;
  // }


  }




