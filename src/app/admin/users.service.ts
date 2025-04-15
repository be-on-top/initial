import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithEmailAndPassword, signInWithCustomToken, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { Firestore, collectionData, collection, docData, setDoc, query, where, updateDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable, pipe } from 'rxjs';
import { Users } from './Users/users';


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
  // async createUser(user: any) {
  //   alert(this.actualRoute)

  //   // Vérifier si currentUser est défini
  //   if (this.auth.currentUser && this.auth.currentUser.email) {
  //     // Récupérer l'email de l'administrateur
  //     const adminEmail = this.auth.currentUser.email;
  //     // const actualRoute = this.router.url


  //     // si nul besoin de récupérer le rôle dans le profil de l'utilisateur, inutile de l'y inscrire. 
  //     // on peut cependant considérer que l'ajout de role modifie 2 collections pour éviter d'aller lire dans rôles celui attribué à l'utilisateur.... 
  //     // let newUser = { created: Date.now(), roles: 'editor', status: true, ...user };

  //     // puisque le status doit être maintenant lié à isPrivate... 
  //     if (user.isPrivate === true) {
  //       user.status = false;
  //     }
  //     let newUser = { created: Date.now(), role: user.role, status: user.status, ...user };
  //     // let newUser = { created: Date.now(), role: user.role, status: true, ...user };
  //     this.users = [newUser, ...this.users];
  //     console.log('this.users!!!!!!!!!!!', this.users);
  //     // on va lui affecter un password aléatoire en fonction de la date
  //     // mais pour le moment, je fais un password à la con pour pouvoir faire mes tests : ATTENTION !!!!!!!!!!!!!!!!!!!
  //     let password = "password2025#";
  //     // let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

  //     // enregistrement en base dans fireAuth d'une part : 
  //     this.result = await createUserWithEmailAndPassword(this.auth, user.email, password);


  //     // c'est ici que ça ne suit pas !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //     if (this.result && this.result.user) {
  //       // ATTENTION : compte tenu du fait qu'on enregistre maintenant AVEC uid comme id du doc, ajouter l'uid en propriété du doc n'a plus vraiment d'intérêt
  //       newUser.id = this.result.user.uid

  //       // enregistre dans Firestore d'autre part avec un collection trainers qui elle aura de multiples propriétés
  //       let $usersRef = collection(this.firestore, "users");
  //       // addDoc($trainersRef, newTrainer)
  //       setDoc(doc($usersRef, newUser.id), newUser)

  //       // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
  //       let $rolesRef = collection(this.firestore, "roles");
  //       // addDoc($trainersRef, newTrainer)
  //       // setDoc(doc($rolesRef, newUser.id), { role: 'editor' })
  //       await setDoc(doc($rolesRef, newUser.id), { role: user.role })

  //       // envoie un mail de réinitialisation du mot de passe
  //       await sendPasswordResetEmail(this.auth, newUser.email
  //             ,{
  //                // URL de redirection après personnalisation du mot de passe
  //             url: 'https://be-on-top.io/login',
  //             // Utilisation de l'application pour traiter cette action
  //             handleCodeInApp: true 
  //         }
  //       )
  //         .then(() => {
  //           // Password reset email sent!
  //           // ..
  //         })
  //         .catch((error) => {
  //           const errorCode = error.code;
  //           const errorMessage = error.message;
  //           return errorMessage
  //           // ..
  //         });



  //     }





  //     ///////////////
  //     // Déconnexion de l'administrateur après la création de l'utilisateur
  //     await this.auth.signOut();

  //     // Attendre que la déconnexion soit terminée
  //     this.auth.onAuthStateChanged(async (user) => {
  //       if (!user) {
  //         // Demander à l'administrateur de se reconnecter
  //         const adminPassword = prompt('Veuillez entrer votre mot de passe pour vous reconnecter.');

  //         if (adminPassword) {
  //           await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
  //           console.log('Reconnexion automatique en tant qu\'administrateur réussie.', adminPassword);
  //           this.router.navigate([this.actualRoute]);
  //         } else {
  //           console.error('Mot de passe non fourni.');
  //         }
  //       }
  //     });


  //   } else {
  //     // Gérer le cas où currentUser est undefined
  //     console.error('Utilisateur non connecté.');
  //   }


  // }

    // suggestion pour plus de robusteste  
    async createUser(user: any) {
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
      const newUser: Users = {
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
  
        console.log("Aucun doublon détecté. Création de l'étudiant...");
        // const password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
        const password="password"
  
        const result = await createUserWithEmailAndPassword(this.auth, cleanedEmail, password);
        if (!result || !result.user) {
          throw new Error("Échec de la création de l'utilisateur Firebase.");
        }
  
        newUser.id = result.user.uid;
  
        // Ajouter les informations de l'étudiant dans Firestore
        const studentsRef = collection(this.firestore, "users");
        await setDoc(doc(studentsRef, newUser.id), newUser);
        console.log("Utilisateur ajouté avec succès dans Firestore :", newUser);
  
        // Ajouter le rôle de l'étudiant dans Firestore
        const rolesRef = collection(this.firestore, "roles");
        await setDoc(doc(rolesRef, newUser.id), { role: user.role });
        console.log("Rôle de l'utilisateur ajouté avec succès!!!!!!!.", user.role);
  
        // Envoyer un e-mail de réinitialisation du mot de passe
        await sendPasswordResetEmail(this.auth, cleanedEmail
  
          , {
            // URL de redirection après personnalisation du mot de passe
            url: 'https://be-on-top.io/login',
            // Utilisation de l'application pour traiter cette action
            handleCodeInApp: true
          }
  
  
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
        this.router.navigate(['/admin/external', newUser.id]);
        console.log("Redirection vers la page des détails de l'utilisateur.");
      } catch (error: any) {
        console.error("Erreur lors de la création de l'utilisateur :", error.message);
        alert(`Erreur : ${error.message}`);
      }
    }


  // version simplifiée de createUsers
  async createUsers(users: any[]): Promise<void> {
    const adminEmail = this.auth.currentUser?.email;

    if (!adminEmail) {
      console.error('Administrateur non connecté.');
      return;
    }

    // Initialisation des erreurs et succès
    const errors: string[] = [];
    const successes: string[] = [];

    // Boucle sur chaque utilisateur pour traitement
    for (const user of users) {
      try {
        // Génération d’un mot de passe aléatoire (ou utiliser un mot de passe fixe pour les tests)
        // const password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
        // juste pour tests en intern
        const password = "password"


        // Création dans Firebase Auth
        const result = await createUserWithEmailAndPassword(this.auth, user.email, password);

        if (!result || !result.user) {
          throw new Error(`Échec de la création d'un utilisateur pour l'email ${user.email}`);
        }

        const newUser = {
          ...user,
          id: result.user.uid,
          created: Date.now(),
          status: true,
        };

        // Enregistrement dans Firestore (collection "users")
        const $usersRef = collection(this.firestore, "users");
        await setDoc(doc($usersRef, newUser.id), newUser);

        // Enregistrement dans Firestore (collection "roles")
        const $rolesRef = collection(this.firestore, "roles");
        await setDoc(doc($rolesRef, newUser.id), { role: user.role });

        // Envoi d'un email de réinitialisation du mot de passe
        await sendPasswordResetEmail(this.auth, user.email

              ,{
                 // URL de redirection après personnalisation du mot de passe
              url: 'https://be-on-top.io/login',
              // Utilisation de l'application pour traiter cette action
              handleCodeInApp: true 
          }


        );

        // Ajout à la liste des succès
        successes.push(user.email);
      } catch (error: any) {
        console.error(`Erreur pour l'utilisateur ${user.email}:`, error.message);
        errors.push(`Email: ${user.email}, Erreur: ${error.message}`);
      }
    }

    // Résumé des résultats
    console.log('Utilisateurs créés avec succès:', successes);
    if (errors.length > 0) {
      console.error('Erreurs lors de la création des utilisateurs:', errors);
    }

    // Déconnexion de l'administrateur
    await this.auth.signOut();
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


  // updateUser(id: string, user: any) {  
  //   let $userRef = doc(this.firestore, "users/" + id);
  //   setDoc($userRef, user)
  // }

  // pour éviter les erreurs dûes à des champs undefined
  updateUser(id: string, user: any) {
    console.log('user depuis service', user);
  
    // Supprimer les clés dont la valeur est undefined
    let cleanedUser = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== undefined)
    );
  
    // console.log("Mise à jour du doc:", id, "avec:", cleanedUser);
    let $userRef = doc(this.firestore, "users/" + id);
    setDoc($userRef, cleanedUser, { merge: true }); // merge:true pour conserver les autres champs
  }


    deleteStudentFromUser(UserId: string, studentUid: string) {
      // Référence au document Trainer dans Firestore
      const $userRef = doc(this.firestore, "users/" + UserId);
    
      // Lire le document actuel pour récupérer la liste des étudiants
      getDoc($userRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data(); // Obtenir les données du document
    
            // Vérifier que 'students' est un tableau valide
            if (userData['students'] && Array.isArray(userData['usertudents'] )) {
              // Supprimer le studentUid de la liste des étudiants
              const updatedStudents = userData['students'] .filter((id: string) => id !== studentUid);
    
              // Mettre à jour uniquement le champ 'students' dans Firestore
              return updateDoc($userRef, { students: updatedStudents });
            } else {
              console.error("Le champ 'students' est absent ou invalide.");
              return Promise.reject("Propriété 'students' invalide.");
            }
          } else {
            console.error("Le document trainer n'existe pas.");
            return Promise.reject("Document introuvable.");
          }
        })
        .then(() => {
          console.log("Le champ 'students' a été mis à jour avec succès !");
    
          // Réinitialiser la propriété 'trainer' dans le document de l'étudiant
          const $studentRef = doc(this.firestore, "students/" + studentUid);
          return updateDoc($studentRef, { trainer: "attribué ultérieurement" });
        })
        .then(() => {
          console.log(`La propriété 'trainer' de l'étudiant ${studentUid} a été réinitialisée avec succès !`);
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour :", error);
        });
    }
  

}
