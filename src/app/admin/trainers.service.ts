import { Injectable } from '@angular/core';
// import { trainers } from './trainers';

// à vérifier
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser } from '@angular/fire/auth';
import { Firestore, collectionData, collection, docData, setDoc, query, where, updateDoc, getDoc } from '@angular/fire/firestore';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable, pipe } from 'rxjs';
import { StudentsService } from './students.service';
import { PushNotificationService } from '../push-notification.service';
pipe


@Injectable({
  providedIn: 'root'
})
export class TrainersService {

  // évaluateurs ne serait pas un tableau de type any mais un observable
  trainers: any[] = [];
  result: any;

  constructor(private auth: Auth, private firestore: Firestore, private studentsService: StudentsService, private notificationsService: PushNotificationService) {
  }

  async createTrainer(trainer: any) {

    // Suppression des espaces et découpage en tableau
    const cpArray = trainer.cp
      .split(',')           // Sépare la chaîne en fonction des virgules
      .map((cp: string) => cp.trim()) // Supprime les espaces inutiles autour des codes
      .filter((cp: string) => cp);    // Retire les chaînes vides s'il y en a

    // Affichage des codes postaux sous forme de tableau
    console.log(cpArray); // Pour vérifier dans la console

    // let newTrainer = { id: Date.now(), ...trainer };
    trainer.cp=cpArray
    let newTrainer = { created: Date.now(), roles: 'trainer', status: true, cp:cpArray, ...trainer};
    console.log(newTrainer);
    
    this.trainers = [newTrainer, ...this.trainers];
    console.log(this.trainers);
    // on va lui affecter un password aléatoire en fonction de la date
    // mais pour le moment, je fais un password à la con pour pouvoir faire mes tests
    let password = "password";
    // let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

    // enregistrement en base dans fireAuth d'une part : 
    this.result = await createUserWithEmailAndPassword(this.auth, trainer.email, password);

    if (this.result && this.result.user) {
      // const { uid, emailVerified } = this.result.user;
      newTrainer.id = this.result.user.uid
    }

    // enregistre dans Firestore d'autre part avec un collection trainers qui elle aura de multiples propriétés
    let $trainersRef = collection(this.firestore, "trainers");
    // addDoc($trainersRef, newTrainer)
    setDoc(doc($trainersRef, newTrainer.id), newTrainer)

    // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
    let $rolesRef = collection(this.firestore, "roles");
    // addDoc($trainersRef, newTrainer)
    setDoc(doc($rolesRef, newTrainer.id), { role: 'trainer' })

    // envoie un mail de réinitialisation du mot de passe
    sendPasswordResetEmail(this.auth, newTrainer.email)
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

  // gettrainers(): Observable<trainers[]> {
  getTrainers() {
    let $trainersRef = collection(this.firestore, "trainers");
    return collectionData($trainersRef, { idField: "id" }) as Observable<any[]>

  }

  deleteTrainer(id: string) {
    // on utilisera la méthode deleteDoc() de Firestore et delete de currentUser
    let $trainerRef = doc(this.firestore, "trainers/" + id)
    console.log("this.auth.currentUser to delete", this.auth.currentUser);
    deleteDoc($trainerRef);
    // HORS DE QUESTION d'utiliser cette méthode. Elle supprime l'utilisateur authentifié !!!!
    // let userToDelete:any=this.auth.currentUser
    // deleteUser(userToDelete).then(() => {
    //   alert("utilisateur supprimé")
    // }).catch((error) => {
    //   console.log("problème à la suppression sur Auth");
    // });
  }

  getTrainer(id: string) {
    let $trainerRef = doc(this.firestore, "trainers/" + id)
    return docData($trainerRef, { idField: 'id' }) as Observable<any>;
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


  updateTrainer(id: string, trainer: any) {

     // Suppression des espaces et découpage en tableau
     const cpArray = trainer.cp
     .split(',')           // Sépare la chaîne en fonction des virgules
     .map((cp: string) => cp.trim()) // Supprime les espaces inutiles autour des codes
     .filter((cp: string) => cp);    // Retire les chaînes vides s'il y en a

   // Affichage des codes postaux sous forme de tableau
   console.log(cpArray); // Pour vérifier dans la console

   // let newTrainer = { id: Date.now(), ...trainer };
   trainer.cp=cpArray

    let $trainerRef = doc(this.firestore, "trainers/" + id);
    setDoc($trainerRef, trainer)
    // plutôt que d'utiliser ma fonction notifyStudent depuis le ts de updateTrainer, on profite de la boucle sur les candidats affectés pour les notifier
    for (let student of trainer.students) {
      let $studentRef = doc(this.firestore, "students/" + student);
      updateDoc($studentRef, { trainer: trainer.lastName })
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

  addRoleToEvaluator(id: string) {
    // console.log("id récupéré depuis addRoleToEvaluator", id);

    // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
    let $rolesRef = collection(this.firestore, "roles");
    // addDoc($trainersRef, newTrainer)
    setDoc(doc($rolesRef, id), { role: ['trainer', 'evaluator'] })
  }

  // async getStudentByParam(uid: string) {
  //   const myData = query(collection(this.firestore, 'students'), where('id', '==', uid));
  //   const querySnapshot = await getDocs(myData);
  //   if (querySnapshot) {
  //     querySnapshot.forEach((doc) => {
  //       console.log(doc.id, ' => ', doc.data());
  //       doc.data()
  //     });
  //   }
  // }


}
