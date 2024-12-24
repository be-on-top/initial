import { Injectable } from '@angular/core';
// import { trainers } from './trainers';

// à vérifier
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser } from '@angular/fire/auth';
import { Firestore, collectionData, collection, docData, setDoc, query, where, updateDoc, getDoc, writeBatch } from '@angular/fire/firestore';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable, pipe } from 'rxjs';
import { StudentsService } from './students.service';
import { PushNotificationService } from '../push-notification.service';
import { Users } from './Users/users';
import { Trainer } from './trainer';
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

  
    getReferentData(id: string) {
      let $userRef = doc(this.firestore, "users/" + id)
      return docData($userRef, { idField: 'id' }) as Observable<Users>;
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


  
  // marche bien pour ajouter une  propriété class []
  // async updateTrainerClass(id: string, trainingClass: string) {
  //   const $trainerRef = doc(this.firestore, "trainers/" + id);
  
  //   try {
  //     // Récupérer le document
  //     const docSnap = await getDoc($trainerRef);
  
  //     if (docSnap.exists()) {
  //       // Obtenir la propriété `class` (si elle existe)
  //       const data = docSnap.data();
  //       let classArray: string[] = data['class'] || []; // Utilise un tableau vide si `class` est inexistant
  
  //       // Ajouter `trainingClass` si elle n'est pas déjà présente
  //       if (!classArray.includes(trainingClass)) {
  //         classArray.push(trainingClass);
  //       }
  
  //       // Mettre à jour le document
  //       await updateDoc($trainerRef, { class: classArray });
  //       console.log("Document mis à jour avec succès");
  //     } else {
  //       // Si le document n'existe pas, on peut le signaler ou le créer
  //       console.error("Document non trouvé, assurez-vous qu'il existe");
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors de la mise à jour :", error);
  //   }
  // }

  // Plus complet pour mettre aussi à jour students[] ATTENTION !!!! pas encore testée
  async updateTrainerClass(id: string, trainingClass: string, studentId: string) {
    const $trainerRef = doc(this.firestore, "trainers/" + id);
  
    try {
      // Récupérer le document du formateur
      const docSnap = await getDoc($trainerRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
  
        // Mise à jour du tableau 'class[]' (gestion des classes normées)
        let classArray: string[] = data['class'] || [];
        if (!classArray.includes(trainingClass)) {
          classArray.push(trainingClass);
        }
  
        // Mise à jour du tableau 'students[]' (gestion des étudiants affectés)
        let studentsArray: string[] = data['students'] || [];
        if (!studentsArray.includes(studentId)) {
          studentsArray.push(studentId);
        }
  
        // Mettre à jour le document avec les deux tableaux
        await updateDoc($trainerRef, {
          class: classArray,
          students: studentsArray // Ajout automatique des étudiants
        });
  
        console.log("Document formateur mis à jour avec succès.");
      } else {
        console.error("Document formateur non trouvé, assurez-vous qu'il existe.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du formateur :", error);
    }
  }


  // Méthode pour importer les formateurs depuis un fichier CSV
  async createTrainers(trainers: any[]): Promise<void> {
    const failedEntries: any[] = []; // Stocke les erreurs
    const batch = writeBatch(this.firestore); // Prépare un lot d'écritures Firestore
  
    for (const trainer of trainers) {
      try {
        // Nettoyage des données
        const cpArray = trainer.cp.split(',').map((cp: string) => cp.trim()).filter((cp: string) => cp);
        const sigleArray = trainer.sigle.split(',').map((sigle: string) => sigle.trim()).filter((sigle: string) => sigle);
  
        // Prépare les données
        const newTrainer = {
          created: Date.now(),
          roles: 'trainer',
          status: true,
          cp: cpArray,
          sigle: sigleArray,
          students: [],
          class: [],
          lastName: trainer.lastName.trim(),
          firstName: trainer.firstName.trim(),
          email: trainer.email.trim(),
          id:''
        };
  
        // Création de l'utilisateur Firebase Auth
        const password = "password"; // Temporaire
        const result = await createUserWithEmailAndPassword(this.auth, newTrainer.email, password);
        newTrainer.id = result.user.uid;
  
        // Ajoute au lot d'écritures Firestore
        const trainerRef = doc(collection(this.firestore, "trainers"), newTrainer.id);
        batch.set(trainerRef, newTrainer);
  
        // Ajoute au lot d'écritures pour la collection roles
        const roleRef = doc(collection(this.firestore, "roles"), newTrainer.id);
        batch.set(roleRef, { role: 'trainer' });
  
      } catch (error:any) {
        console.error(`Erreur pour ${trainer.email}:`, error);
        failedEntries.push({ trainer, error: error.message });
      }
    }
  
    // Applique le lot d'écritures en une seule fois
    try {
      await batch.commit();
      console.log('Importation terminée avec succès !');
  
      // Envoie les emails pour les entrées réussies
      for (const trainer of trainers) {
        sendPasswordResetEmail(this.auth, trainer.email).catch(err => {
          console.warn(`Email non envoyé à ${trainer.email}: ${err.message}`);
        });
      }
    } catch (batchError) {
      console.error('Erreur lors du commit du lot :', batchError);
    }
  
    // Rapport des erreurs
    if (failedEntries.length > 0) {
      console.warn('Certaines entrées ont échoué :', failedEntries);
    }
  }
  
  
  


}
