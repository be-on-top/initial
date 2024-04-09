import { Component, Input } from '@angular/core';
import { QuestionsService } from 'src/app/admin/questions.service';

@Component({
  selector: 'app-full-details',
  templateUrl: './full-details.component.html',
  styleUrls: ['./full-details.component.css']
})
export class FullDetailsComponent {

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
    console.log("questionsMedias depuis full-details", this.questionsMedias);
    this.responsesMedias = this.service.getMediasResponsesById(this.q.id)
  }

  ngOnDestroy(): void {
    this.responsesMedias = []

  }

  onImageLoad
    () {
    this.isLoading = false;
  }

  // onImageResponseLoad
  //   () {
  //   this.isImageResponseLoading = false;
  // }

}
