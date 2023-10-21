import { Injectable } from '@angular/core';
// import { tutors } from './tutors';

// à vérifier
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser } from '@angular/fire/auth';
import { Firestore, collectionData, collection, docData, setDoc, query, where,  updateDoc, getDoc } from '@angular/fire/firestore';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable, pipe } from 'rxjs';
import { PushNotificationService } from '../push-notification.service';


@Injectable({
  providedIn: 'root'
})
export class ExternalsService {

  // tutors ne serait pas un tableau de type any mais un observable (?)
  externals: any[] = [];
  result: any;

  constructor(private auth: Auth, private firestore: Firestore, private notificationsService:PushNotificationService) {
  }

  async createExternal(tutor: any) {

    // let newTutor = { id: Date.now(), ...trainer };
    let newTutor = { created: Date.now(), roles: 'external', status: true, ...tutor };
    this.externals = [newTutor, ...this.externals];
    console.log(this.externals);
    // on va lui affecter un password aléatoire en fonction de la date
    // mais pour le moment, je fais un password à la con pour pouvoir faire mes tests
    let password = "password";
    // let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

    // enregistrement en base dans fireAuth d'une part : 
    this.result = await createUserWithEmailAndPassword(this.auth, tutor.email, password);

    if (this.result && this.result.user) {
      // const { uid, emailVerified } = this.result.user;
      newTutor.id = this.result.user.uid
    }

    // enregistre dans Firestore d'autre part avec un collection tutors qui elle aura de multiples propriétés
    let $tutorsRef = collection(this.firestore, "externals");
    // addDoc($tutorsRef, newTutor)
    setDoc(doc($tutorsRef, newTutor.id), newTutor)

    // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
    let $rolesRef = collection(this.firestore, "roles");
    // addDoc($tutorsRef, newTutor)
    setDoc(doc($rolesRef, newTutor.id), { role: 'external' })

    // envoie un mail de réinitialisation du mot de passe
    sendPasswordResetEmail(this.auth, newTutor.email)
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

  // gettutors(): Observable<tutors[]> {
  getExternals() {
    let $tutorsRef = collection(this.firestore, "externals");
    return collectionData($tutorsRef, { idField: "id" }) as Observable<any[]>

  }

  deleteExternal(id: string) {
    // on utilisera la méthode deleteDoc() de Firestore et delete de currentUser
    let $externalRef = doc(this.firestore, "externals/" + id)
    console.log("this.auth.currentUser to delete", this.auth.currentUser);
    deleteDoc($externalRef);
  }

  getExternal(id: string) {
    let $externalRef = doc(this.firestore, "externals/" + id)
    return docData($externalRef, { idField: 'id' }) as Observable<any>;
  }

  // ça marche !!!! 
  async getMyStudentsByParam(uid: string) {
    const myData = query(collection(this.firestore, 'externals'), where('id', '==', uid));
    const querySnapshot = await getDocs(myData);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
      // return doc.data
    });
  }


  updateExternal(id: string,external: any) {
    let $externalRef = doc(this.firestore, "externals/" + id);
    setDoc($externalRef, external)
  }






}
