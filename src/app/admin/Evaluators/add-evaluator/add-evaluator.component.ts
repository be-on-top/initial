import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvaluatorsService } from '../../evaluators.service';


@Component({
  selector: 'app-add-evaluator',
  templateUrl: './add-evaluator.component.html',
  styleUrls: ['./add-evaluator.component.css']
})
export class AddEvaluatorComponent implements OnInit {
  lastName: string = "active";
  firstName: string = "";
  email: string = "";

  constructor(private service: EvaluatorsService, private router: Router) { }

  ngOnInit(): void {
  }

  async addEvaluator(form: any) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    console.log("form registration", form.value);
    this.service.createEvaluator(form.value);
    form.reset();
    // redirige vers la vue de détail 
    this.router.navigate(['/evaluators']);

  }



}
