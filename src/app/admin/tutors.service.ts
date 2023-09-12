import { Injectable } from '@angular/core';
// import { tutors } from './tutors';

// à vérifier
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser } from '@angular/fire/auth';
import { Firestore, collectionData, collection, docData, setDoc, query, where,  updateDoc, getDoc } from '@angular/fire/firestore';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable, pipe } from 'rxjs';
import { StudentsService } from './students.service';
import { PushNotificationService } from '../push-notification.service';


@Injectable({
  providedIn: 'root'
})
export class TutorsService {

  // tutors ne serait pas un tableau de type any mais un observable (?)
  tutors: any[] = [];
  result: any;

  constructor(private auth: Auth, private firestore: Firestore, private studentsService:StudentsService, private notificationsService:PushNotificationService) {
  }

  async createTutor(tutor: any) {

    // let newTutor = { id: Date.now(), ...trainer };
    let newTutor = { created: Date.now(), roles: 'trainer', status: true, ...tutor };
    this.tutors = [newTutor, ...this.tutors];
    console.log(this.tutors);
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
    let $tutorsRef = collection(this.firestore, "tutors");
    // addDoc($tutorsRef, newTutor)
    setDoc(doc($tutorsRef, newTutor.id), newTutor)

    // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
    let $rolesRef = collection(this.firestore, "roles");
    // addDoc($tutorsRef, newTutor)
    setDoc(doc($rolesRef, newTutor.id), { role: 'tutor' })

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
  getTutors() {
    let $tutorsRef = collection(this.firestore, "tutors");
    return collectionData($tutorsRef, { idField: "id" }) as Observable<any[]>

  }

  deleteTutor(id: string) {
    // on utilisera la méthode deleteDoc() de Firestore et delete de currentUser
    let $tutorRef = doc(this.firestore, "tutors/" + id)
    console.log("this.auth.currentUser to delete", this.auth.currentUser);
    deleteDoc($tutorRef);
    // HORS DE QUESTION d'utiliser cette méthode. Elle supprime l'utilisateur authentifié !!!!
    // let userToDelete:any=this.auth.currentUser
    // deleteUser(userToDelete).then(() => {
    //   alert("utilisateur supprimé")
    // }).catch((error) => {
    //   console.log("problème à la suppression sur Auth");
    // });
  }

  getTutor(id: string) {
    let $tutorRef = doc(this.firestore, "tutors/" + id)
    return docData($tutorRef, { idField: 'id' }) as Observable<any>;
  }

  // ça marche !!!! 
  async getMyStudentsByParam(uid: string) {
    const myData = query(collection(this.firestore, 'students'), where('id', '==', uid));
    const querySnapshot = await getDocs(myData);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
      // return doc.data
    });
  }


  updateTutor(id: string,tutor: any) {
    let $tutorRef = doc(this.firestore, "tutors/" + id);
    setDoc($tutorRef, tutor)
    // plutôt que d'utiliser ma fonction notifyStudent depuis le ts de updateTrainer, on profite de la boucle sur les candidats affectés pour les notifier
    for (let student of tutor.students){
      let $studentRef = doc(this.firestore, "students/" + student);
      updateDoc($studentRef,{tutor:tutor.lastName} )
      // +++ notifyStudent
      alert(`notification à envoyer à ${student}`)
      // this.notificationsService.newNotifyUser(student)
      // this.notificationsService.sendNotificationToUser(student)
    }

  }

  
  // methode à tester pour récupérer le nom
  getLinkedStudentName(id: string) {
      let $studentRef = doc(this.firestore, "students/" + id);
      return docData($studentRef) as Observable<any>;

  }

  addRoleToEvaluator(id:string){
    // console.log("id récupéré depuis addRoleToEvaluator", id);
    
        // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
        let $rolesRef = collection(this.firestore, "roles");
        // addDoc($tutorsRef, newTutor)
        setDoc(doc($rolesRef, id), { role: ['tutor', 'evaluator'] })
  }



}
