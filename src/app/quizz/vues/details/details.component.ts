import { Component, Input } from '@angular/core';
import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {

  counter: number = 0
  questionsMedias: any = []
  responsesMedias: any = []
  // questionId va être transmis par son parent qui le reçoit lui-même en paramètre de route
  @Input() q: any;

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

  choice(optScoring: any) {
    // test OK
    // optScoring == "true" ? alert("Bingo ! ") : alert("Mauvaise réponse ! ")
    if (optScoring == "true") {
      this.counter = this.counter + this.q.notation
      alert(this.counter)

    } else { alert('Aucun point supplémentnaire') }

  }

}
