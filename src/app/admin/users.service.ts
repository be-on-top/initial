import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithEmailAndPassword, signInWithCustomToken } from '@angular/fire/auth';
import { Firestore, collectionData, collection, docData, setDoc, query, where, updateDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable, pipe } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  users: any[] = [];
  result: any;

  actualRoute: string = ""

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    this.actualRoute = this.router.url

  }


  // pour en faire une méthode générique susceptible d'attribuer un rôle ou un autre, me faut 2 arguments.
  async createUser(user: any) {
    alert(this.actualRoute)

    // Vérifier si currentUser est défini
    if (this.auth.currentUser && this.auth.currentUser.email) {
      // Récupérer l'email de l'administrateur
      const adminEmail = this.auth.currentUser.email;
      // const actualRoute = this.router.url


      // si nul besoin de récupérer le rôle dans le profil de l'utilisateur, inutile de l'y inscrire. 
      // on peut cependant considérer que l'ajout de role modifie 2 collections pour éviter d'aller lire dans rôles celui attribué à l'utilisateur.... 
      // let newUser = { created: Date.now(), roles: 'editor', status: true, ...user };
      let newUser = { created: Date.now(), role: user.role, status: true, ...user };
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

          // enregistre dans Firestore d'autre part avec un collection trainers qui elle aura de multiples propriétés
      let $usersRef = collection(this.firestore, "users");
      // addDoc($trainersRef, newTrainer)
      setDoc(doc($usersRef, newUser.id), newUser)

      // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
      let $rolesRef = collection(this.firestore, "roles");
      // addDoc($trainersRef, newTrainer)
      // setDoc(doc($rolesRef, newUser.id), { role: 'editor' })
      await setDoc(doc($rolesRef, newUser.id), { role: user.role })

      // envoie un mail de réinitialisation du mot de passe
      await sendPasswordResetEmail(this.auth, newUser.email)
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

    
    
    

      ///////////////
      // Déconnexion de l'administrateur après la création de l'utilisateur
      await this.auth.signOut();

      // Attendre que la déconnexion soit terminée
      this.auth.onAuthStateChanged(async (user) => {
        if (!user) {
      // Demander à l'administrateur de se reconnecter
      const adminPassword = prompt('Veuillez entrer votre mot de passe pour vous reconnecter.');

      if (adminPassword) {
        await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
        console.log('Reconnexion automatique en tant qu\'administrateur réussie.', adminPassword);
        this.router.navigate([this.actualRoute]);
      } else {
        console.error('Mot de passe non fourni.');
      }
        }
      });


    } else {
      // Gérer le cas où currentUser est undefined
      console.error('Utilisateur non connecté.');
    }


  }

 
  // gettrainers(): Observable<trainers[]> {
  getUsers() {
    let $trainersRef = collection(this.firestore, "users");
    return collectionData($trainersRef, { idField: "id" }) as Observable<any[]>

  }

  deleteUser(id: string) {
    // on utilisera la méthode deleteDoc() de Firestore (pas delete de currentUser)
    let $usersRef = doc(this.firestore, "users/" + id)
    // faut aussi virer la référence à l'utilisateur dans la collection roles (tant qu'on maintient cette collection...)
    let $rolesRef = doc(this.firestore, "roles/" + id)
    console.log("this.auth.currentUser to delete", this.auth.currentUser)
    deleteDoc($usersRef)
    deleteDoc($rolesRef)
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


  updateUser(id: string, user: any) {
    let $userRef = doc(this.firestore, "users/" + id);
    setDoc($userRef, user)

  }

}
