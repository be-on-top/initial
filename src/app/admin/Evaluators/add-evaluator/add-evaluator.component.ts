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

    // juste pour l'exercice à virer !!!
    // form.value.firstName.length<8? alert(`la longueur de ${form.value.firstName} est de ${form.value.firstName.length} alors qu'un minimum de 8 est requis`):""

    console.log("form registration", form.value);
    this.service.createEvaluator(form.value);
    form.reset();
    // redirige vers la vue de détail 
    this.router.navigate(['/evaluators']);

  }

  // juste pour l'exercice à virer !!! 
  checkLength(field:any){
    console.log("eeeeeee", field.value);
    field.value.length<8? alert(`la longueur de ${field.value} est de ${field.value.length} alors qu'un minimum de 8 est requis`):""
    // alert(`la longueur de ${e.value} est ${e.value.length}`)    
  }

  // juste pour l'exercice à virer !!!
  change(event:any){
    console.log("event target value", event.target.value);
    event.target.value.length>6?alert("Ok"):""

  }



}
