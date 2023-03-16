import { Component } from '@angular/core';
import { SocialsService } from 'src/app/admin/socials.service';

@Component({
  selector: 'app-socials-list',
  templateUrl: './socials-list.component.html',
  styleUrls: ['./socials-list.component.css']
})
export class SocialsListComponent {

  // évaluateurs ne serait pas un tableau de type any mais un observable
  squestions: any
  allSocialQuestions?: any

  questionsMedias: any = []
  responsesMedias: any = []
  //  isMediaQuestion: boolean = true

  videoEnded: boolean = false

  // pour les lister par qid (id d'un document enregistré sur firestore)
  allSocialMediaByQid: any = []
  allSocialQid: any = []

  constructor(private service: SocialsService) {

  }

  ngOnInit() {
    this.questionsMedias = this.service.getMediasQuestions()
    this.responsesMedias = this.service.getMediasResponses()
    this.getSocialQuestions()
  }

  getSocialQuestions() {
    this.service.getSocialQuestions().subscribe(data => {
      console.log("data de getQuestions()", data)
      this.allSocialQuestions = data;
      this.allSocialQuestions.sort(this.compare)
      return this.allSocialQuestions
    })

  }

  compare(a: any, b: any) {
    if (a.number < b.number) {
      return -1;
    }
    if (a.number > b.number) {
      return 1;
    }
    return 0;
  }




}
