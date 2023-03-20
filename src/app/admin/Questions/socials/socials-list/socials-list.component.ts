import { Component, OnInit } from '@angular/core';
import { SocialsService } from 'src/app/admin/socials.service';

@Component({
  selector: 'app-socials-list',
  templateUrl: './socials-list.component.html',
  styleUrls: ['./socials-list.component.css']
})
export class SocialsListComponent implements OnInit {

  squestions: any[] = []
  allSocialQuestions: any[] = []
  

  // questionsMedias: any = []
  // responsesMedias: any = []
  //  isMediaQuestion: boolean = true

  // pour les lister par qid (id d'un document enregistré sur firestore)
  // dans la mesure où on teste ici le chargement de components enfants (social-details.component), soit on laisse aux enfants le soin de s'alimenter, soit on les alimente (?)
  // je vais déjà tester la première hypothèse
  // allSocialMediaByQid: any = []
  // allSocialQid: any = []

  constructor(private service: SocialsService) {
    this.squestions = []
    this.allSocialQuestions = []

  }

  ngOnInit() {
    // this.questionsMedias = this.service.getMediasQuestions()
    // this.responsesMedias = this.service.getMediasResponses()
    this.service.getSocialQuestions().subscribe(data => {
      this.allSocialQuestions = data
      this.allSocialQuestions.sort(this.compare)
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
