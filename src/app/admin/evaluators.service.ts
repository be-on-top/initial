import { Injectable } from '@angular/core';
import { Evaluators } from './evaluators';

// à vérifier
import { Auth,createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, collectionData, collection, documentId } from '@angular/fire/firestore';
import { addDoc } from 'firebase/firestore';



@Injectable({
  providedIn: 'root'
})
export class EvaluatorsService {

  // évaluateurs ne serait pas un tableau de type any mais un observable
  evaluators: any[] = [];


  constructor(private auth: Auth, private firestore:Firestore) { }

  createEvaluator(evaluator: any) {
    const newEvaluator = { id: Date.now(), ...evaluator };
    this.evaluators = [newEvaluator, ...this.evaluators];
    console.log(this.evaluators);
    // on va lui affecter un password aléatoire en fonction de la date
    let password= Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
    
    // enregistrement en base dans fireAuth d'une part : 
    createUserWithEmailAndPassword(this.auth, evaluator.evalEmail, password);  
    
    
    // enregistre dans Firestore d'autre part avec un collection evaluators qui elle aura de multiples propriétés

    let $evaluatorsRef = collection(this.firestore, "evaluators");
    addDoc($evaluatorsRef, newEvaluator)
    
  }

  getEvaluators(): Evaluators[] {
    return this.evaluators;
  }

  deleteEvaluator(evaluator: Evaluators) {
    this.evaluators = this.evaluators.filter(e => e.id !== evaluator.id);
    return this.evaluators;
  }


}
