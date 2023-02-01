import { Injectable } from '@angular/core';
import { Evaluators } from './evaluators';

// à vérifier
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, collectionData, collection, documentId, getDoc, docData, setDoc } from '@angular/fire/firestore';
import { addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable } from 'rxjs';
// import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class EvaluatorsService {

  // évaluateurs ne serait pas un tableau de type any mais un observable
  evaluators: any[] = [];
  result: any;


  constructor(private auth: Auth, private firestore: Firestore) { }

  async createEvaluator(evaluator: any) {

    // let newEvaluator = { id: Date.now(), ...evaluator };
    let newEvaluator = { created: Date.now(), roles: 'admin-', ...evaluator };
    this.evaluators = [newEvaluator, ...this.evaluators];
    console.log(this.evaluators);
    // on va lui affecter un password aléatoire en fonction de la date
    let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

    // enregistrement en base dans fireAuth d'une part : 
    this.result = await createUserWithEmailAndPassword(this.auth, evaluator.email, password);

    if (this.result && this.result.user) {
      const { uid, emailVerified } = this.result.user;
      newEvaluator.id = this.result.user.uid
    }

    // enregistre dans Firestore d'autre part avec un collection evaluators qui elle aura de multiples propriétés
    let $evaluatorsRef = collection(this.firestore, "evaluators");
    addDoc($evaluatorsRef, newEvaluator)

    // envoie un mail de réinitialisation du mot de passe


    sendPasswordResetEmail(this.auth, newEvaluator.email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });

  }

  // getEvaluators(): Observable<Evaluators[]> {
  getEvaluators() {
    let $evaluatorsRef = collection(this.firestore, "evaluators");
    return collectionData($evaluatorsRef, { idField: "id" }) as Observable<Evaluators[]>

  }

  deleteEvaluator(id: string) {
    // on utilisera la méthode deleteDoc() de Firestore et delete de currentUser
    let $evaluatorRef = doc(this.firestore, "evaluators/" + id)
    console.log("this.auth.currentUser", this.auth.currentUser);
    this.auth.currentUser?.delete()
    return deleteDoc($evaluatorRef);
  }


  getEvaluator(id: string) {
    // on utilisera la méthode deleteDoc() de Firestore
    let $evaluatorRef = doc(this.firestore, "evaluators/" + id)
    return docData($evaluatorRef, { idField: 'id' }) as Observable<Evaluators>;
  }


  updateEvaluator(id: string, evaluator: Evaluators) {
    let $evaluatorRef = doc(this.firestore, "evaluators/" + id);
    setDoc($evaluatorRef, evaluator)
  }


}
