import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { Evaluators } from '../../evaluators';
import { EvaluatorsService } from '../../evaluators.service';

@Component({
  selector: 'app-update-evaluator',
  templateUrl: './update-evaluator.component.html',
  styleUrls: ['./update-evaluator.component.css']
})
export class UpdateEvaluatorComponent implements OnInit {

  evaluatorId: any
  evaluator: any = {}
  selectedSigles: string[] = []

  constructor(private service: EvaluatorsService, private ac: ActivatedRoute, private router: Router) {
    this.evaluatorId = this.ac.snapshot.params["id"];
    // on fait appel à getEvaluator pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getEvaluator(this.evaluatorId).subscribe((data) => {
      console.log("data depuis update-evaluator component", data);
      this.evaluator = data
    })

  }

  ngOnInit(): void {
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

  // pour affecation métier de l'évaluateur
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }


}
