import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestionsService } from 'src/app/admin/questions.service';
import { SwUpdate } from '@angular/service-worker';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Subscription, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthGuardService } from 'src/app/auth-guard.service';
import { EvaluatorsService } from 'src/app/admin/evaluators.service';
import { Questions } from '../../questions';

@Component({
  selector: 'app-full-list',
  templateUrl: './full-list.component.html',
  styleUrls: ['./full-list.component.css']
})
export class FullListComponent implements OnInit, OnDestroy {
  questions: Questions[] = []; // Liste des questions filtrées
  searchText: string = ''; // Pour la recherche utilisateur
  sigleIds: string[] = []; // Sigles associés à l'utilisateur

  private subscription = new Subscription(); // Gestion des abonnements pour éviter les fuites mémoire

  selectedSigle?: string | null = '';

  constructor(
    private service: QuestionsService,
    private swUpdate: SwUpdate,
    private activatedRoute: ActivatedRoute,
    private authService: AuthGuardService,
    private evaluatorService: EvaluatorsService,
    private router:Router
  ) {
    // Récupération des paramètres de l'URL (sigles sélectionnés)
    this.activatedRoute.queryParams.subscribe(params => {
      this.sigleIds = params['sigleIds'] || [];
      console.log('Sigle IDs:', this.sigleIds);
    });
  }

  ngOnInit() {
    const storedSigle = localStorage.getItem('selectedSigle'); // Récupérer le sigle stocké
    storedSigle?this.selectedSigle=storedSigle:''  

    this.subscription.add(
      this.service.getQuestions().pipe(
        map(allQuestions => allQuestions.filter(q => q.number > 20)),
        switchMap(filteredQuestions => {
          if (this.sigleIds.length > 0) {
            if (storedSigle && this.sigleIds.includes(storedSigle)) {
              // Si un sigle est sauvegardé et qu'il fait partie des sigles de l'utilisateur, filtrer dessus
              return of(filteredQuestions.filter(q => q.sigle === storedSigle));
            }
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
        this.questions = sortedQuestions.sort(this.compare);
      })
    );
  
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('selectedSigle'); // Effacer la sélection quand l'utilisateur quitte
    });
  }
  
  

  ngOnDestroy() {
    // Nettoyage des abonnements pour éviter les fuites mémoire
    this.subscription.unsubscribe();
  }

  compare(a: any, b: any) {
    const numA = typeof a.number === 'number' ? a.number : parseInt(a.number as string, 10);
    const numB = typeof b.number === 'number' ? b.number : parseInt(b.number as string, 10);

    return numA - numB;
  }

  // Gestion de la recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue;
    console.log(this.searchText);
  }

  // Vérification des mises à jour du Service Worker
  checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm("Une mise à jour est disponible. Souhaitez-vous recharger la page ?")) {
          this.swUpdate.activateUpdate().then(() => document.location.reload());
        }
      });
    }
  }

  // Gestion du filtre sur le sigle via menu déroulant
  onChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;


    console.log("Sigle sélectionné :", selectedValue); // Vérification console
    // Stocke dans sessionStorage
    // sessionStorage.setItem('selectedSigle', selectedValue); 
    localStorage.setItem('selectedSigle', selectedValue);

    this.subscription.add(
      this.getFilteredQuestions(selectedValue).subscribe(filteredQuestions => {
        this.questions = filteredQuestions;
      })
    );
  }

  // Récupérer les questions selon le sigle sélectionné
  getFilteredQuestions(sigle: string): Observable<Questions[]> {
    return this.service.getQuestions().pipe(
      map(questions => questions
        .filter(question => question.sigle === sigle && question.number > 20)
        .sort(this.compare)
      )
    );
  }
}
