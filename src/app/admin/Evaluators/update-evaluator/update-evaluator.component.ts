import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { Evaluators } from '../../evaluators';
import { EvaluatorsService } from '../../evaluators.service';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'app-update-evaluator',
  templateUrl: './update-evaluator.component.html',
  styleUrls: ['./update-evaluator.component.css']
})
export class UpdateEvaluatorComponent implements OnInit {

  evaluatorId: any
  evaluator: any = {}
  selectedSigles: string[] = []

  // essai pour connecter le tableau des sigles aux documents de la collection sigles destinée aux paramétrages métier
  sigleIds: string[] = []

  constructor(private service: EvaluatorsService, private ac: ActivatedRoute, private router: Router, private settingsService: SettingsService) {
    this.evaluatorId = this.ac.snapshot.params["id"];
    // on fait appel à getEvaluator pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getEvaluator(this.evaluatorId).subscribe((data) => {
      console.log("data depuis update-evaluator component", data);
      this.evaluator = data
      this.selectedSigles=this.evaluator.sigle
    })

  }

  ngOnInit(): void {

    this.fetchSigleIds()
  }

  updateEvaluator(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    console.log("form update values", form.value);
    this.service.updateEvaluator(this.evaluatorId, form.value)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/evaluator', this.evaluatorId])
  }

  // pour affectation métier de l'évaluateur
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }

  fetchSigleIds() {
    this.settingsService.getSigleIds()
      .then((sigleIds) => {
        this.sigleIds = sigleIds
        alert(sigleIds);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des IDs de documents :', error);
      });
  }


}
