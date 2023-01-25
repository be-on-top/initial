import { Injectable } from '@angular/core';
import { Evaluators } from './evaluators';

// à vérifier
import { Auth,createUserWithEmailAndPassword } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class EvaluatorsService {

  evaluators: any[] = [];

  constructor(private auth: Auth) { }

  createEvaluator(evaluator: any) {
    const newEvaluator = { id: Date.now(), ...evaluator };
    this.evaluators = [newEvaluator, ...this.evaluators];
    console.log(this.evaluators);
    // on va lui affecter un password aléatoire en fonction de la date
    let password= Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
    
    // enregistrement en base dans fireAuth d'une part : 
    return createUserWithEmailAndPassword(this.auth, evaluator.evalEmail, password);  
    
    
    // enregistre dans Firestore d'autre part avec un collection evaluators qui elle aura de multiples propriétés


  }

  getEvaluators(): Evaluators[] {
    return this.evaluators;
  }

  deleteEvaluator(evaluator: Evaluators) {
    this.evaluators = this.evaluators.filter(e => e.id !== evaluator.id);
    return this.evaluators;
  }


}
