import { Component, OnInit, Input } from '@angular/core';
// import { Router } from '@angular/router';
import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css']
})
export class QuestionDetailsComponent implements OnInit {

  @Input() q: any;

  questionsMedias: any = []
  responsesMedias: any = []

  isLoading: boolean = true
  isImageResponseLoading: boolean = true

  constructor(private service: QuestionsService) {
  }

  ngOnInit() {
    // this.allSocialMediaByQid = this.service.getMediaQuestionById(this.q.id)
    this.questionsMedias = this.service.getMediaQuestionById(this.q.id)
    console.log("questionsMedias depuis questions-details", this.questionsMedias);
    this.responsesMedias = this.service.getMediasResponsesById(this.q.id)
  }

  ngOnDestroy(): void {
    this.responsesMedias = []
  }

  onImageLoad
    () {
    this.isLoading = false;
  }
  
  deleteQuestion(idQuestion: string, number: number, sigle:string) {
    // this.service.deleteQuestionById(idQuestion)

    // pour lui passer mediaQuestion
   if (this.questionsMedias) {
     for (const element of this.questionsMedias) {
      console.log('en voilà un', element);
      this.service.deleteMediaFromUrl(element)
      
     }
   }

       // pour lui passer mediasResponses
       if (this.responsesMedias) {
        for (const element of this.responsesMedias) {
         console.log('en voilà un', element);
         this.service.deleteMediaFromUrl(element)
         
        }
      }

    const questionNumber = number

    if (window.confirm("Êtes-vous certain ? Ceci est irrévocable.")) {
      this.service.deleteQuestionById(idQuestion).then(() => {
        alert("la question "+idQuestion+" numéro " + questionNumber +" de "+sigle+ " a bien été supprimée")
      }).catch(error => console.error("Erreur lors de la suppression :", error));
    }

  }




  // onImageResponseLoad
  //   () {
  //   this.isImageResponseLoading = false;
  // }

}
