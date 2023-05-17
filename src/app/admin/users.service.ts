import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser } from '@angular/fire/auth';
import { Firestore, collectionData, collection, docData, setDoc, query, where,  updateDoc, getDoc } from '@angular/fire/firestore';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable, pipe } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  users: any[] = [];
  result: any;

  constructor(private auth: Auth, private firestore: Firestore) {
  }

  // ATTENTION : dans un premier temps, c'est pour les contributeurs (=editors) que je tente ce module générique !!!!!! 
  // On va donc se référer à user pour contributeur... 

  async createUser(user: any) {

    // si nul besoin de récupérer le rôle dans le profil de l'utilisateur, inutile de l'y inscrire. 
    // on peut cependant considérer que l'ajout de role modifie 2 collections pour éviter d'aller lire dans rôles celui attribué à l'utilisateur.... 
    let newUser = { created: Date.now(), roles: 'trainer', status: true, ...user };
    this.users = [newUser, ...this.users];
    console.log(this.users);
    // on va lui affecter un password aléatoire en fonction de la date
    // mais pour le moment, je fais un password à la con pour pouvoir faire mes tests : ATTENTION !!!!!!!!!!!!!!!!!!!
    let password = "password";
    // let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

    // enregistrement en base dans fireAuth d'une part : 
    this.result = await createUserWithEmailAndPassword(this.auth, user.email, password);

    if (this.result && this.result.user) {
      // ATTENTION : compte tenu du fait qu'on enregistre maintenant AVEC uid comme id du doc, ajouter l'uid en propriété du doc n'a plus vraiment d'intérêt
      newUser.id = this.result.user.uid
    }

    // enregistre dans Firestore d'autre part avec un collection trainers qui elle aura de multiples propriétés
    let $usersRef = collection(this.firestore, "users");
    // addDoc($trainersRef, newTrainer)
    setDoc(doc($usersRef, newUser.id), newUser)

    // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
    let $rolesRef = collection(this.firestore, "roles");
    // addDoc($trainersRef, newTrainer)
    setDoc(doc($rolesRef, newUser.id), { role: 'editor' })

    // envoie un mail de réinitialisation du mot de passe
    sendPasswordResetEmail(this.auth, newUser.email)
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
  getUsers() {
    let $trainersRef = collection(this.firestore, "users");
    return collectionData($trainersRef, { idField: "id" }) as Observable<any[]>

  }

  deleteUser(id: string) {
    // on utilisera la méthode deleteDoc() de Firestore et delete de currentUser
    let $usersRef = doc(this.firestore, "users/" + id)
    console.log("this.auth.currentUser to delete", this.auth.currentUser);
    deleteDoc($usersRef);
    // HORS DE QUESTION d'utiliser cette méthode. Elle supprime l'utilisateur authentifié !!!!
    // let userToDelete:any=this.auth.currentUser
    // deleteUser(userToDelete).then(() => {
    //   alert("utilisateur supprimé")
    // }).catch((error) => {
    //   console.log("problème à la suppression sur Auth");
    // });
  }

  getUser(id: string) {
    let $userRef = doc(this.firestore, "users/" + id)
    return docData($userRef, { idField: 'id' }) as Observable<any>;
  }

  
  updateUser(id: string, user:any) {
    let $userRef = doc(this.firestore, "users/" + id);
    setDoc($userRef, user)

  }

}
