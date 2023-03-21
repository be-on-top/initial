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
  selectedSigles: string[] = []

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

  // pour affecation métier de l'évaluateur
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }

  // juste pour l'exercice à virer !!! 
  checkLength(field: any) {
    console.log("eeeeeee", field.value);
    field.value.length < 8 ? console.log(`la longueur de ${field.value} est de ${field.value.length} alors qu'un minimum de 8 est requis`) : ""
    // alert(`la longueur de ${e.value} est ${e.value.length}`)    
  }

  // juste pour l'exercice à virer !!!
  change(event: any) {
    console.log("event target value", event.target.value);
    event.target.value.length > 6 ? alert("Ok") : ""

  }

  /** La fonction qui écoute l'événement onclick sur le  password juste pour l'exercice */
  toggleDisplayPassword(event: any) {

    /* La source de l'événement */
    const srcElement = event.srcElement;

    /* Récupère l'élément enfant qui précède l'élément source */
    const passwordField = srcElement.previousElementSibling;

    /* Si le champ est de type "mot de passe" */
    if (passwordField.type == "password") {

      /* Interversion des icônes */
      srcElement.classList.remove("bi-eye");
      srcElement.classList.add("bi-eye-slash");

      /* Affiche le texte en clair */
      passwordField.type = "text";

    } else if (passwordField.type == "text") {

      /* Interversion des icônes */
      srcElement.classList.remove("bi-eye-slash");
      srcElement.classList.add("bi-eye");

      /* Cache le texte du mot de passe */
      passwordField.type = "password";
    }

  }

}
