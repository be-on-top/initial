import { Injectable } from '@angular/core';
// import { tutors } from './tutors';

// à vérifier
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { Firestore, collectionData, collection, docData, setDoc, query, where,  updateDoc, getDoc } from '@angular/fire/firestore';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable, pipe } from 'rxjs';
import { StudentsService } from './students.service';
import { PushNotificationService } from '../push-notification.service';
import { Router } from '@angular/router';
import { Trainer } from './trainer';



@Injectable({
  providedIn: 'root'
})
export class TutorsService {

  // tutors ne serait pas un tableau de type any mais un observable (?)
  tutors: any[] = [];
  result: any;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private studentsService:StudentsService,
    private notificationsService:PushNotificationService,
  private router:Router) {
  }

  // async createTutor(tutor: any) {

  //   // let newTutor = { id: Date.now(), ...trainer };
  //   let newTutor = { created: Date.now(), roles: 'trainer', status: true, ...tutor };
  //   this.tutors = [newTutor, ...this.tutors];
  //   console.log(this.tutors);
  //   // on va lui affecter un password aléatoire en fonction de la date
  //   // mais pour le moment, je fais un password à la con pour pouvoir faire mes tests
  //   let password = "password";
  //   // let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

  //   // enregistrement en base dans fireAuth d'une part : 
  //   this.result = await createUserWithEmailAndPassword(this.auth, tutor.email, password);

  //   if (this.result && this.result.user) {
  //     // const { uid, emailVerified } = this.result.user;
  //     newTutor.id = this.result.user.uid
  //   }

  //   // enregistre dans Firestore d'autre part avec un collection tutors qui elle aura de multiples propriétés
  //   let $tutorsRef = collection(this.firestore, "tutors");
  //   // addDoc($tutorsRef, newTutor)
  //   setDoc(doc($tutorsRef, newTutor.id), newTutor)

  //   // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
  //   let $rolesRef = collection(this.firestore, "roles");
  //   // addDoc($tutorsRef, newTutor)
  //   setDoc(doc($rolesRef, newTutor.id), { role: 'tutor' })

  //   // envoie un mail de réinitialisation du mot de passe
  //   sendPasswordResetEmail(this.auth, newTutor.email)
  //     .then(() => {
  //       // Password reset email sent!
  //       // ..
  //     })
  //     .catch((error) => {
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       return errorMessage
  //       // ..
  //     });

  // }

      // suggestion pour plus de robusteste  
      async createTutor(user: any) {
        if (!this.auth.currentUser || !this.auth.currentUser.email) {
          console.error('Administrateur non connecté.');
          return;
        }
    
        const adminEmail = this.auth.currentUser.email;
        const adminPassword = prompt('Veuillez entrer votre mot de passe administrateur pour continuer.');
        if (!adminPassword) {
          console.error('Mot de passe administrateur non fourni.');
          return;
        }
    
        const adminUid = this.auth.currentUser.uid;
    
        // Nettoyer l'email (enlever les espaces avant et après)
        const cleanedEmail = user.email.trim();
  
    
        // Initialiser un nouvel étudiant avec des champs par défaut
        const newUser: Trainer = {
          created: Date.now(),        
          referentUid: adminUid,
          ...user,
          email: cleanedEmail,  // Assurez-vous que l'email nettoyé est utilisé
        };
    
        try {
          console.log("Vérification des doublons pour l'email :", cleanedEmail);
          const signInMethods = await fetchSignInMethodsForEmail(this.auth, cleanedEmail);
          if (signInMethods.length > 0) {
            console.error('Un utilisateur avec cet email existe déjà.');
            alert('Un utilisateur avec cet email existe déjà.');
            return;
          }
    
          console.log("Aucun doublon détecté. Création de l'utilisateur...");
          // const password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
          const password="password"
    
          const result = await createUserWithEmailAndPassword(this.auth, cleanedEmail, password);
          if (!result || !result.user) {
            throw new Error("Échec de la création de l'utilisateur Firebase.");
          }
    
          newUser.id = result.user.uid;
    
          // Ajouter les informations de l'étudiant dans Firestore
          const studentsRef = collection(this.firestore, "tutors");
          await setDoc(doc(studentsRef, newUser.id), newUser);
          console.log("Utilisateur ajouté avec succès dans Firestore :", newUser);
    
          // Ajouter le rôle de l'étudiant dans Firestore
          const rolesRef = collection(this.firestore, "roles");
          await setDoc(doc(rolesRef, newUser.id), { role: 'tutor' });
          console.log("Rôle de l'utilisateur ajouté avec succès!!!!!!!.", user.role);
    
          // Envoyer un e-mail de réinitialisation du mot de passe
          await sendPasswordResetEmail(this.auth, cleanedEmail
    
            // , {
            //   // URL de redirection après personnalisation du mot de passe
            //   url: 'https://be-on-top.io/login',
            //   // Utilisation de l'application pour traiter cette action
            //   handleCodeInApp: true
            // }
    
    
          );
          console.log("E-mail de réinitialisation envoyé à :", cleanedEmail);
    
          // Déconnexion du compte étudiant
          await this.auth.signOut();
          console.log("Déconnexion de l'utilisateur étudiant.");
    
          // Reconnexion de l'administrateur
          const adminResult = await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
          if (!adminResult || !adminResult.user) {
            throw new Error('Échec de la reconnexion de l\'administrateur.');
          }
    
          console.log("Administrateur reconnecté avec succès.");
    
          // Redirection vers la liste ou page des détails de l'utilisateur (?)
          this.router.navigate(['/admin/tutor', newUser.id]);
          console.log("Redirection vers la page des détails de l'utilisateur.");
        } catch (error: any) {
          console.error("Erreur lors de la création de l'utilisateur :", error.message);
          alert(`Erreur : ${error.message}`);
        }
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
