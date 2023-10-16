import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvaluatorsService } from 'src/app/admin/evaluators.service';
import { QuestionsService } from 'src/app/admin/questions.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/admin/auth.service';
import { AuthGuardService } from 'src/app/auth-guard.service';



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

  constructor(private service: QuestionsService, private activatedRoute: ActivatedRoute, private evaluatorService: EvaluatorsService, private authService: AuthGuardService) {
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
        this.questions = this.questions.filter(q => this.sigleIds.includes(q.sigle))
      } else {
        // Si on accède à la liste sans paramètres, dans ce cas, c'est le(s) sigle(s) rattaché à l'évaluateur qui doit intervenir
        this.getUserSigles(this.authService.user)
      }

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


  // pour filtrer les questions lorsque la sélection dans le menu déroulant change
  onChange(event: Event) {
    // Récupère la valeur sélectionnée dans le menu déroulant
    const selectedValue = (event.target as HTMLSelectElement).value;

    // Appelle la méthode pour filtrer les questions en fonction de la valeur sélectionnée
    this.getFilteredQuestions(selectedValue).subscribe(filteredQuestions => {
      // Met à jour la liste de questions du composant avec les questions filtrées
      this.questions = filteredQuestions;
    })
  }


  // Méthode pour filtrer les questions en fonction du sigle fourni en paramètre
  getFilteredQuestions(sigle: string): Observable<any[]> {
    // Appelle la méthode du service pour obtenir toutes les questions depuis Firestore
    return this.service.getQuestions().pipe(
      // Utilise l'opérateur map pour filtrer les questions en fonction du sigle
      map(questions => questions.filter(question => question.sigle === sigle))
    )

  }

  // Méthode pour filtrer les questions en fonction du sigle rattaché à l'utilisateur
  getUserSigles(uid: string): any {
    this.evaluatorService.getEvaluator(uid).subscribe(userData => {
      this.sigleIds = userData.sigle
      this.questions = this.questions.filter(q => this.sigleIds.includes(q.sigle))
    })

  }

}
