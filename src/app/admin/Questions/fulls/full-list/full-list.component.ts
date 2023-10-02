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

@Component({
  selector: 'app-full-list',
  templateUrl: './full-list.component.html',
  styleUrls: ['./full-list.component.css']
})

export class FullListComponent {

  questions: any[] = []
  // sigle:string=""
  sigleIds: string[] = []


  constructor(private service: QuestionsService, private swUpdate: SwUpdate, private activatedRoute: ActivatedRoute, private authService: AuthGuardService, private evaluatorService: EvaluatorsService) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.sigleIds = params['sigleIds'];
      console.log('Sigle IDs:', this.sigleIds)
    });


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
      this.questions = allQuestions.filter(q => q.number > 20);



      // Si sigleIds est défini et non vide, filtre également par sigles
      if (this.sigleIds && this.sigleIds.length > 0) {
        this.questions = this.questions.filter(q => this.sigleIds.includes(q.sigle))
      } else {
        // Si on accède à la liste sans paramètres, dans ce cas, c'est le(s) sigle(s) rattaché à l'évaluateur qui doit intervenir
        this.getUserSigles(this.authService.user) 
        // this.questions = this.questions.filter(q => this.sigleIds.includes(q.sigle))
        // alert(this.sigleIds)
      }

      // Trie les questions par ordre 
      this.questions.sort(this.compare)

      // essai tests détection updated data via service worker
      // this.updateClient();
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


  // we also create a method that will inform the browser about the update
  // reloadCache() {
  updateClient() {
    if (!this.swUpdate.isEnabled) {
      console.log("swUpdate not available");
      return
    }

    // we will subscribe to the available observable
    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map(evt => ({
        type: 'UPDATE_AVAILABLE',
        current: evt.currentVersion,
        available: evt.latestVersion,
      })))
      // pour simplement comparer la version actuelle et la version disponible 
      // .subscribe((result)=>console.log("current",result.current, "available", result.available))
      .subscribe((result) => {
        console.log("current", result.current, "available", result.available)
        if (confirm("Une mise à jour est disponible. Souhaitez-vous recharger la page ?")) {
          this.swUpdate.activateUpdate().then(() => location.reload())
          // document.location.reload()
        }
      })

    this.swUpdate.activated.subscribe((event) => console.log("previous", event.previous, "current", event.current))

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
      // // Appelle la méthode du service pour obtenir toutes les questions depuis Firestore
      // return this.service.getQuestions().pipe(
      //   // Utilise l'opérateur map pour filtrer les questions en fonction du sigle
      //   map(questions => questions.filter(question => this.sigleIds.includes(question.sigle)))
      // )

    })


  }






}





