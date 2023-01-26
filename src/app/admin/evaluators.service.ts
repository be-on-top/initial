import { Injectable } from '@angular/core';
import { Evaluators } from './evaluators';

// à vérifier
import { Auth,createUserWithEmailAndPassword, user } from '@angular/fire/auth';
import { Firestore, collectionData, collection, documentId, getDoc } from '@angular/fire/firestore';
import { addDoc, getDocs } from 'firebase/firestore';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class EvaluatorsService {

  // évaluateurs ne serait pas un tableau de type any mais un observable
  evaluators: any[] = [];
  result:any;


  constructor(private auth: Auth, private firestore:Firestore) { }

  async createEvaluator(evaluator: any) {

    let newEvaluator = { id: Date.now(), ...evaluator };
    this.evaluators = [newEvaluator, ...this.evaluators];
    console.log(this.evaluators);
    // on va lui affecter un password aléatoire en fonction de la date
    let password= Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
    
    // enregistrement en base dans fireAuth d'une part : 
   this.result= await createUserWithEmailAndPassword(this.auth, evaluator.evalEmail, password);  

   if (this.result && this.result.user) {
    const {uid, emailVerified}=this.result.user;
    newEvaluator.id=this.result.user.uid
    }   
    
    // enregistre dans Firestore d'autre part avec un collection evaluators qui elle aura de multiples propriétés
    let $evaluatorsRef = collection(this.firestore, "evaluators");
    addDoc($evaluatorsRef, newEvaluator)    
  }

  // getEvaluators(): Observable<Evaluators[]> {
  getEvaluators(){
    let $evaluatorsRef = collection(this.firestore, "evaluators");
    // return collectionData($evaluatorsRef, {idField:"id"}) as Observable<Evaluators[]>
    return collectionData($evaluatorsRef) as Observable<Evaluators[]>

  }

  deleteEvaluator(evaluator: Evaluators) {
    this.evaluators = this.evaluators.filter(e => e.id !== evaluator.id);
    return this.evaluators;
  }

}
