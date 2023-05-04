import { Injectable } from '@angular/core';
import { Evaluators } from './evaluators';

// à vérifier
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser } from '@angular/fire/auth';
import { Firestore, collectionData, collection, documentId, getDoc, docData, setDoc, query, where } from '@angular/fire/firestore';
import { addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EvaluatorsService {

  // évaluateurs ne serait pas un tableau de type any mais un observable
  evaluators: any[] = [];
  result: any;

  constructor(private auth: Auth, private firestore: Firestore) {

  }

  async createEvaluator(evaluator: any) {

    // let newEvaluator = { id: Date.now(), ...evaluator };
    // puisque on n'accède plus aux rôles via la collection de l'utilisateur mais via la collection roles, on n'a plus de raison impérieuse de conserver les rôles dans cette collection...
    // let newEvaluator = { created: Date.now(), roles: ['evaluator'], status: true, ...evaluator };
    let newEvaluator = { created: Date.now(), status: true, ...evaluator };
    this.evaluators = [newEvaluator, ...this.evaluators];
    console.log(this.evaluators);
    // on va lui affecter un password aléatoire en fonction de la date ! Important !
    // let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
    // ATTENTION à modifier. Juste pour les tests en interne, j'affecte password à TOUS les utilisateurs
    let password = 'password';

    // enregistrement en base dans fireAuth d'une part : 
    this.result = await createUserWithEmailAndPassword(this.auth, evaluator.email, password);

    if (this.result && this.result.user) {
      // const { uid, emailVerified } = this.result.user;
      newEvaluator.id = this.result.user.uid
    }

    // enregistre dans Firestore d'autre part avec un collection evaluators qui elle aura de multiples propriétés
    let $evaluatorsRef = collection(this.firestore, "evaluators");
    // addDoc($evaluatorsRef, newEvaluator)
    setDoc(doc($evaluatorsRef, newEvaluator.id), newEvaluator)

    // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
    let $rolesRef = collection(this.firestore, "roles");
    // addDoc($trainersRef, newTrainer)
    // dès lors qu'on peut finalement avoir 2 rôles pour l'évaluateur, role devient un tableau
    // setDoc(doc($rolesRef, newEvaluator.id), { role: 'evaluator' })
    setDoc(doc($rolesRef, newEvaluator.id), { role: ['evaluator'] })

    // envoie un mail de réinitialisation du mot de passe
    sendPasswordResetEmail(this.auth, newEvaluator.email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        return errorMessage
        // ..
      });

  }

  // getEvaluators(): Observable<Evaluators[]> {
  getEvaluators() {
    let $evaluatorsRef = collection(this.firestore, "evaluators");
    return collectionData($evaluatorsRef, { idField: "id" }) as Observable<Evaluators[]>

  }

  deleteEvaluator(id: any) {
    let $evaluatorRef = doc(this.firestore, "evaluators/" + id)

    deleteDoc($evaluatorRef);
    // HORS DE QUESTION d'utiliser cette méthode. Elle supprime l'utilisateur authentifié !!!!
    // let userToDelete:any=this.auth.currentUser
    // deleteUser(userToDelete).then(() => {
    //   alert("utilisateur supprimé")
    // }).catch((error) => {
    //   console.log("problème à la suppression sur Auth");
    // });

    deleteUser(id)
  }

  getEvaluator(id: string) {
    let $evaluatorRef = doc(this.firestore, "evaluators/" + id)
    return docData($evaluatorRef, { idField: 'id' }) as Observable<Evaluators>;
  }

  // ça marche !!!! 
  async getDocsByParam(uid: string) {
    const myData = query(collection(this.firestore, 'evaluators'), where('id', '==', uid));
    const querySnapshot = await getDocs(myData);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
      // return doc.data
    });
  }


  updateEvaluator(id: string, evaluator: Evaluators) {
    let $evaluatorRef = doc(this.firestore, "evaluators/" + id);
    setDoc($evaluatorRef, evaluator)
  }


}
