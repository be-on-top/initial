import { Component } from '@angular/core';
import { QuestionsService } from 'src/app/admin/questions.service';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthGuardService } from 'src/app/auth-guard.service';
import { EvaluatorsService } from 'src/app/admin/evaluators.service';
import { Evaluators } from 'src/app/admin/evaluators';
import { User } from 'firebase/auth';
import { Questions } from '../../questions';

@Component({
  selector: 'app-full-list',
  templateUrl: './full-list.component.html',
  styleUrls: ['./full-list.component.css']
})

export class FullListComponent {

  questions: Questions[] = []
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''
  // sigle:string=""
  sigleIds: string[] = []


  constructor(private service: QuestionsService, private swUpdate: SwUpdate, private activatedRoute: ActivatedRoute, private authService: AuthGuardService, private evaluatorService: EvaluatorsService) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.sigleIds = params['sigleIds'];
      console.log('Sigle IDs:', this.sigleIds)
    })

  }

  // ngOnInit() {
  //   this.service.getQuestions().subscribe(data => {
  //     const allQuestions = data;
  //     this.questions = allQuestions.filter(q => q.number > 20)
  //     this.questions.sort(this.compare)

  //     // essai tests détection updated data via service worker
  //     this.updateClient()
  //   })

  // }

  ngOnInit() {
    this.service.getQuestions().subscribe(data => {
      const allQuestions = data;

      // Filtrez d'abord les questions ayant q.number > 20
      this.questions = allQuestions.filter(q => q.number > 20)

      // Si sigleIds est défini et non vide, filtre également par sigles
      if (this.sigleIds && this.sigleIds.length > 0) {
        this.questions = this.questions.filter(q => this.sigleIds.includes(q.sigle))
      } else {
        // Si on accède à la liste sans paramètres, dans ce cas, c'est le(s) sigle(s) rattaché à l'évaluateur qui doit intervenir
        this.getUserSigles(this.authService.user)
        // this.questions = this.questions.filter(q => this.sigleIds.includes(q.sigle))
        // alert(this.sigleIds)
      }

      // Si sigleIds est défini et non vide, filtre également par sigles
      if (this.sigleIds && this.sigleIds.length > 1) {
        this.questions = this.questions.filter(q => this.sigleIds.includes(q.sigle))
      }

      // Trie les questions par ordre 
      this.questions.sort(this.compare)

      // essai tests détection updated data via service worker
      // this.updateClient()
      this.checkForUpdates()

    })

  }


  // compare(a: any, b: any) {
  //   if (a.number < b.number) {
  //     return -1;
  //   }
  //   if (a.number > b.number) {
  //     return 1;
  //   }
  //   return 0;
  // }

  
  compare(a: any, b: any) {
    const numA = typeof a.number === 'number' ? a.number : parseInt(a.number as string, 10);
    const numB = typeof b.number === 'number' ? b.number : parseInt(b.number as string, 10);
  
    if (numA < numB) {
      return -1;
    }
    if (numA > numB) {
      return 1;
    }
    return 0;
  }

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue
    console.log(this.searchText);
  }


  checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm("Une mise à jour est disponible. Souhaitez-vous recharger la page ?")) {
          this.swUpdate.activateUpdate().then(() => document.location.reload());
        }
      });
    }
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
      map(questions => questions.filter(question => question.sigle === sigle && question.number > 20)
        // puis chaine avec la méthode pour les sortir par ordre
        .sort(this.compare))
    )
  }

  // Méthode pour filtrer les questions en fonction du sigle rattaché à l'utilisateur
  // getUserSigles(uid: string): any {
  //   this.evaluatorService.getEvaluator(uid).subscribe(userData => {
  //     this.sigleIds = userData.sigle

  //     this.questions = this.questions.filter(q => this.sigleIds.includes(q.sigle))

  //   })


  // }

  // Méthode pour filtrer les questions en fonction du sigle rattaché à l'utilisateur
  getUserSigles(uid: string): void {
    this.evaluatorService.getEvaluator(uid).subscribe(userData => {
      this.sigleIds = userData.sigle;
      this.questions = this.questions.filter(q => q.number > 20 && this.sigleIds.includes(q.sigle));
      this.questions.sort(this.compare);
    });
  }



}





