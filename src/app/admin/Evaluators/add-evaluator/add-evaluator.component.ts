import { Component, ErrorHandler, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvaluatorsService } from '../../evaluators.service';



@Component({
  selector: 'app-add-evaluator',
  templateUrl: './add-evaluator.component.html',
  styleUrls: ['./add-evaluator.component.css']
})
export class AddEvaluatorComponent implements OnInit{
  lastName: string = "active";
  firstName: string = "";
  email: string = "";
  selectedSigles: string[] = []

  feedbackMessages?:any=""
  isSuccessMessage:boolean=true

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
    this.service.createEvaluator(form.value).then((userCredential) => {
      // Signed in 
      const user = userCredential;
      this.feedbackMessages=`Enregistrement OK`;

      // alert("registration ok")
      setTimeout(() => {
        this.router.navigate(['/admin/evaluators'])
      }, 2000)
      // this.router.navigate(['/admin/evaluators']);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      this.feedbackMessages=error.message;
      this.isSuccessMessage=false;
      console.log(this.feedbackMessages);
      
      // ..};
    })
    // form.reset();
    // redirige vers la vue de détail 
    // this.router.navigate(['/admin/evaluators']);

  }

  // pour affecation métier de l'évaluateur
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }

}
