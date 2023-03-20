import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SocialsService } from 'src/app/admin/socials.service';

@Component({
  selector: 'app-social-details',
  templateUrl: './social-details.component.html',
  styleUrls: ['./social-details.component.css']
})
export class SocialDetailsComponent implements OnInit, OnDestroy {
  @Input() q: any;

  questionsMedias: any = []
  responsesMedias: any = []

  // allSocialMediaByQid: any = []
  allSocialQid: any = []

  constructor(private service: SocialsService) {

  }

  ngOnInit() {
    // this.allSocialMediaByQid = this.service.getMediaQuestionById(this.q.id)
    this.questionsMedias= this.service.getMediaQuestionById(this.q.id)
    console.log("jjj",this.questionsMedias);
    
    this.responsesMedias = this.service.getMediasResponsesById(this.q.id)
  }

  ngOnDestroy(): void {
    this.responsesMedias = []

  }

}