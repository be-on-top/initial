import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvaluatorsService } from 'src/app/admin/evaluators.service';
import { QuestionsService } from 'src/app/admin/questions.service';
import { Observable, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/admin/auth.service';
import { AuthGuardService } from 'src/app/auth-guard.service';
import { Questions } from '../../questions';



@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})

export class QuestionsListComponent implements OnInit, OnDestroy {

  questions: Questions[] = [];
  searchText: string = '';
  sigleIds: string[] = [];
  private subscription: Subscription = new Subscription(); // Stocke l’abonnement pour éviter les fuites mémoire

  constructor(
    private service: QuestionsService, 
    private activatedRoute: ActivatedRoute, 
    private evaluatorService: EvaluatorsService, 
    private authService: AuthGuardService
  ) {
    // Récupère les paramètres de l’URL (sigleIds) pour filtrer les questions si nécessaire
    this.activatedRoute.queryParams.subscribe(params => {
      this.sigleIds = params['sigleIds'];
      console.log('Sigle IDs:', this.sigleIds);
    });
  }

  ngOnInit() {
    // Ajoute l’abonnement principal pour récupérer et filtrer les questions
    this.subscription.add(
      this.service.getQuestions().pipe(
        // Filtre les questions pour ne garder que celles avec number < 21
        map(allQuestions => allQuestions.filter(q => q.number < 21)), 
        
        // Gestion des sigles : si sigleIds est défini, filtre directement,
        // sinon récupère les sigles de l'utilisateur connecté
        switchMap(filteredQuestions => {
          if (this.sigleIds && this.sigleIds.length > 0) {
            return of(filteredQuestions.filter(q => this.sigleIds.includes(q.sigle)));
          } else {
            return this.evaluatorService.getEvaluator(this.authService.user).pipe(
              map(userData => {
                this.sigleIds = userData.sigle;
                return filteredQuestions.filter(q => this.sigleIds.includes(q.sigle));
              })
            );
          }
        })
      ).subscribe(sortedQuestions => {
        // Trie les questions par numéro croissant avant affichage
        this.questions = sortedQuestions.sort(this.compare);
      })
    );
  }

  // Fonction pour comparer les numéros des questions et les trier
  compare(a: any, b: any) {
    const numA = typeof a.number === 'number' ? a.number : parseInt(a.number as string, 10);
    const numB = typeof b.number === 'number' ? b.number : parseInt(b.number as string, 10);
  
    return numA - numB;
  }

  // Méthode pour mettre à jour la recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue;
    console.log(this.searchText);
  }

  // Méthode pour filtrer les questions lorsque l'utilisateur change de sigle via le menu déroulant
  onChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.getFilteredQuestions(selectedValue).subscribe(filteredQuestions => {
      this.questions = filteredQuestions;
    });
  }

  // Récupère et filtre les questions en fonction du sigle sélectionné
  getFilteredQuestions(sigle: string): Observable<any[]> {
    return this.service.getQuestions().pipe(
      map(questions => questions
        .filter(question => question.sigle === sigle && question.number < 21)
        .sort(this.compare)
      )
    );
  }

  // Récupère les sigles associés à un utilisateur et met à jour sigleIds
  getUserSigles(uid: string): Observable<string[]> {
    return this.evaluatorService.getEvaluator(uid).pipe(
      map(userData => userData.sigle)
    );
  }

  // Nettoie les abonnements pour éviter les fuites mémoire quand le composant est détruit
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

