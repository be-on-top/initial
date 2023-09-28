import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionsService } from 'src/app/admin/questions.service';


@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})

export class QuestionsListComponent implements OnInit {

  questions: any[] = []
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  sigleIds: string[] = []

  constructor(private service: QuestionsService, private activatedRoute: ActivatedRoute) {

    this.activatedRoute.queryParams.subscribe(params => {
      this.sigleIds = params['sigleIds']
      console.log('Sigle IDs:', this.sigleIds)
    })

  }

  ngOnInit() {
    this.service.getQuestions().subscribe(data => {
      let allQuestions = data;
      console.log("allQuestions", allQuestions);

      this.questions = allQuestions.filter(q => q.number < 21)

      // Si sigleIds est défini et non vide, filtre également par sigles
      if (this.sigleIds && this.sigleIds.length > 0) {
        this.questions = this.questions.filter(q => this.sigleIds.includes(q.sigle));
      }

      this.questions.sort(this.compare)
    })
  }

  compare(a: any, b: any) {
    return a.number - b.number;
  }


  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue
    console.log(this.searchText);
  }



}
