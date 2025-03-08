import { Injectable } from '@angular/core';
// import { trainers } from './trainers';

// à vérifier
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, collectionData, collection, docData, setDoc, query, where, updateDoc, getDoc, writeBatch } from '@angular/fire/firestore';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Observable, pipe } from 'rxjs';
import { StudentsService } from './students.service';
import { PushNotificationService } from '../push-notification.service';
import { Users } from './Users/users';
import { Trainer } from './trainer';
import { Router } from '@angular/router';
pipe


@Injectable({
  providedIn: 'root'
})
export class TrainersService {

  // évaluateurs ne serait pas un tableau de type any mais un observable
  trainers: any[] = [];
  result: any;

  constructor(private auth: Auth, private firestore: Firestore, private studentsService: StudentsService, private notificationsService: PushNotificationService, private router: Router) {




  }

  // async createTrainer(trainer: any) {
  //   // if (!this.auth.currentUser || !this.auth.currentUser.email) {
  //   //   console.error('Administrateur non connecté.');
  //   //   return;
  //   // }

  //   // const adminEmail = this.auth.currentUser.email;
  //   // console.log(adminEmail);
    


  //   // Suppression des espaces et découpage en tableau
  //   const cpArray = trainer.cp
  //     .split(',')           // Sépare la chaîne en fonction des virgules
  //     .map((cp: string) => cp.trim()) // Supprime les espaces inutiles autour des codes
  //     .filter((cp: string) => cp);    // Retire les chaînes vides s'il y en a

  //   // Affichage des codes postaux sous forme de tableau
  //   console.log(cpArray); // Pour vérifier dans la console

  //   // let newTrainer = { id: Date.now(), ...trainer };
  //   trainer.cp = cpArray
  //   let newTrainer = { created: Date.now(), roles: 'trainer', status: true, cp: cpArray, ...trainer };
  //   console.log(newTrainer);

  //   this.trainers = [newTrainer, ...this.trainers];
  //   console.log(this.trainers);
  //   // on va lui affecter un password aléatoire en fonction de la date
  //   // mais pour le moment, je fais un password à la con pour pouvoir faire mes tests
  //   let password = "password";
  //   // let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

  //   // enregistrement en base dans fireAuth d'une part : 
  //   this.result = await createUserWithEmailAndPassword(this.auth, trainer.email, password);

  //   if (this.result && this.result.user) {
  //     // const { uid, emailVerified } = this.result.user;
  //     newTrainer.id = this.result.user.uid
  //   }

  //   // enregistre dans Firestore d'autre part avec un collection trainers qui elle aura de multiples propriétés
  //   let $trainersRef = collection(this.firestore, "trainers");
  //   // addDoc($trainersRef, newTrainer)
  //   setDoc(doc($trainersRef, newTrainer.id), newTrainer)

  //   // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
  //   let $rolesRef = collection(this.firestore, "roles");
  //   // addDoc($trainersRef, newTrainer)
  //   setDoc(doc($rolesRef, newTrainer.id), { role: 'trainer' })

  //   // envoie un mail de réinitialisation du mot de passe
  //   sendPasswordResetEmail(this.auth, newTrainer.email)
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

  //   // partie additionnelle
  //   // await this.auth.signOut();
  //   // console.log("Déconnexion de l'utilisateur étudiant.");

  //   // const adminPassword = prompt('Veuillez entrer votre mot de passe administrateur pour continuer.');
  //   // if (!adminPassword) {
  //   //   console.error('Mot de passe administrateur non fourni.');
  //   //   return;
  //   // }

  //   // // Reconnexion de l'administrateur
  //   // const adminResult = await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
  //   // if (!adminResult || !adminResult.user) {
  //   //   throw new Error('Échec de la reconnexion de l\'administrateur.');
  //   // }

  //   // console.log("Administrateur reconnecté avec succès.");

  //   // // Redirection vers la page des détails de l'étudiant
  //   // this.router.navigate(['/admin/trainer', newTrainer.id]);
  //   // console.log("Redirection vers la page des détails du formateur.");

  // }


  async createTrainer(trainer: any) {
  try {
    // Vérifier si l'administrateur est connecté
    if (!this.auth.currentUser || !this.auth.currentUser.email) {
      console.error('Administrateur non connecté.');
      return;
    }

    // Récupérer l'email de l'administrateur AVANT toute autre action
    const adminEmail = this.auth.currentUser.email;
    console.log(`Email de l'administrateur : ${adminEmail}`);

    // Préparation des données
    const cpArray = trainer.cp
      .split(',')
      .map((cp: string) => cp.trim())
      .filter((cp: string) => cp);

    trainer.cp = cpArray;
    let newTrainer = { created: Date.now(), status: true, cp: cpArray, ...trainer };
    let password = "password";

    // Création dans Firebase Auth
    this.result = await createUserWithEmailAndPassword(this.auth, trainer.email, password);
    if (this.result && this.result.user) {
      newTrainer.id = this.result.user.uid;
    }

    // Enregistrement dans Firestore
    const $trainersRef = collection(this.firestore, "trainers");
    await setDoc(doc($trainersRef, newTrainer.id), newTrainer);

    const $rolesRef = collection(this.firestore, "roles");
    await setDoc(doc($rolesRef, newTrainer.id), { role: 'trainer' });

    // Envoi du mail de réinitialisation
    await sendPasswordResetEmail(this.auth, newTrainer.email);

    // Déconnexion de l'administrateur
    await this.auth.signOut();
    console.log("Administrateur déconnecté.");

    // Demander le mot de passe administrateur
    const adminPassword = prompt('Veuillez entrer votre mot de passe administrateur pour continuer.');
    if (!adminPassword) {
      throw new Error("Mot de passe administrateur non fourni.");
    }

    // Reconnexion de l'administrateur
    const adminResult = await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
    if (!adminResult || !adminResult.user) {
      throw new Error("Échec de la reconnexion de l'administrateur.");
    }

    console.log("Administrateur reconnecté avec succès.");

    // Redirection vers la page du formateur
    this.router.navigate(['/admin/trainer', newTrainer.id]);
  } catch (error) {
    console.error("Erreur lors de la création du formateur :", error);
  }
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


  deleteStudentFromTrainer(trainerId: string, studentUid: string) {
    // Référence au document Trainer dans Firestore
    const $trainerRef = doc(this.firestore, "trainers/" + trainerId);
  
    // Lire le document actuel pour récupérer la liste des étudiants
    getDoc($trainerRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const trainerData = docSnapshot.data(); // Obtenir les données du document
  
          // Vérifier que 'students' est un tableau valide
          if (trainerData['students'] && Array.isArray(trainerData['students'] )) {
            // Supprimer le studentUid de la liste des étudiants
            const updatedStudents = trainerData['students'] .filter((id: string) => id !== studentUid);
  
            // Mettre à jour uniquement le champ 'students' dans Firestore
            return updateDoc($trainerRef, { students: updatedStudents });
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
  
  


  // ne gère  pas le cas où comment est undefined
  // updateTrainer(id: string, trainer: any) {
  //   // Suppression des espaces et découpage en tableau
  //   const cpArray = trainer.cp
  //     .split(',')           // Sépare la chaîne en fonction des virgules
  //     .map((cp: string) => cp.trim()) // Supprime les espaces inutiles autour des codes
  //     .filter((cp: string) => cp);    // Retire les chaînes vides s'il y en a

  //   // Affichage des codes postaux sous forme de tableau
  //   console.log(cpArray); // Pour vérifier dans la console

  //   // let newTrainer = { id: Date.now(), ...trainer };
  //   trainer.cp = cpArray

  //   let $trainerRef = doc(this.firestore, "trainers/" + id);
  //   setDoc($trainerRef, trainer)
  //   // plutôt que d'utiliser ma fonction notifyStudent depuis le ts de updateTrainer, on profite de la boucle sur les candidats affectés pour les notifier
  //   for (let student of trainer.students) {
  //     let $studentRef = doc(this.firestore, "students/" + student);
  //     updateDoc($studentRef, { trainer: trainer.lastName })
  //     // +++ notifyStudent
  //     alert(`notification à envoyer à ${student}`)
  //     // this.notificationsService.newNotifyUser(student)
  //     // this.notificationsService.sendNotificationToUser(student)
  //   }

  // }

  // le champ email doit être préservé. mieux vaut faire de l'updateDoc
  // updateTrainer(id: string, trainer: any) {
  //   // Suppression des espaces et découpage en tableau
  //   const cpArray = trainer.cp
  //     .split(',')
  //     .map((cp: string) => cp.trim())
  //     .filter((cp: string) => cp);
  
  //   // Mise à jour des codes postaux
  //   trainer.cp = cpArray;
  
  //   // Supprimer uniquement la propriété "comment" si elle est undefined
  //   if (trainer.comment === undefined) {
  //     delete trainer.comment;
  //   }
  
  //   // Référence du document dans Firestore
  //   let $trainerRef = doc(this.firestore, "trainers/" + id);
  //   setDoc($trainerRef, trainer)
  //     .then(() => {
  //       console.log("Trainer mis à jour avec succès !");
  //     })
  //     .catch((error) => {
  //       console.error("Erreur lors de la mise à jour du trainer :", error);
  //     });
  
  //   // Mise à jour et notification des étudiants
  //   for (let student of trainer.students) {
  //     let $studentRef = doc(this.firestore, "students/" + student);
  //     updateDoc($studentRef, { trainer: trainer.lastName })
  //       .then(() => {
  //         console.log(`Notification à envoyer à ${student}`);
  //       })
  //       .catch((error) => {
  //         console.error(`Erreur lors de la mise à jour du student ${student} :`, error);
  //       });
  //   }
  // }

  // faut traiter le cas où students n'est pas encore renseigné pour éviter erreurs en console
  updateTrainer(id: string, trainer: any) {
    const $trainerRef = doc(this.firestore, "trainers/" + id);
  
    // Nettoyage des codes postaux
    const cpArray = trainer.cp
      .split(',')
      .map((cp: string) => cp.trim())
      .filter((cp: string) => cp);
  
    trainer.cp = cpArray;
  
    // Suppression des champs optionnels vides ou undefined
    if (trainer.comment === undefined) {
      delete trainer.comment;
    }
  
    // Vérifier si "students" est bien un tableau non vide, sinon le supprimer
    if (!Array.isArray(trainer.students) || trainer.students.length === 0) {
      delete trainer.students;
    }
  
    // Mise à jour du document trainer
    updateDoc($trainerRef, trainer)
      .then(() => {
        console.log("Trainer mis à jour avec succès !");
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du trainer :", error);
      });
  
    // Mise à jour et notification des étudiants uniquement si students est un tableau non vide
    if (Array.isArray(trainer.students) && trainer.students.length > 0) {
      for (let student of trainer.students) {
        const $studentRef = doc(this.firestore, "students/" + student);
        updateDoc($studentRef, { trainer: trainer.lastName + " " + trainer.firstName })
          .then(() => {
            console.log(`Notification à envoyer à ${student}`);
          })
          .catch((error) => {
            console.error(`Erreur lors de la mise à jour du student ${student} :`, error);
          });
      }
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

    // pour reconnecter l'admin
    // Récupérer l'email de l'administrateur
    const adminEmail = this.auth.currentUser?.email;


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
          // roles: 'trainer',
          status: true,
          cp: cpArray,
          sigle: sigleArray,
          students: [],
          class: [],
          lastName: trainer.lastName.trim(),
          firstName: trainer.firstName.trim(),
          email: trainer.email.trim(),
          comment: trainer.comment,
          id: ''
        };

        // Création de l'utilisateur Firebase Auth
        const password = "password2025#"; // Temporaire
        const result = await createUserWithEmailAndPassword(this.auth, newTrainer.email, password);
        newTrainer.id = result.user.uid;

        // Ajoute au lot d'écritures Firestore
        const trainerRef = doc(collection(this.firestore, "trainers"), newTrainer.id);
        batch.set(trainerRef, newTrainer);

        // Ajoute au lot d'écritures pour la collection roles
        const roleRef = doc(collection(this.firestore, "roles"), newTrainer.id);
        batch.set(roleRef, { role: ['trainer'] });



      } catch (error: any) {
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
        sendPasswordResetEmail(this.auth, trainer.email


          , {
            // URL de redirection après personnalisation du mot de passe
            url: 'https://be-on-top.io/login',
            // Utilisation de l'application pour traiter cette action
            handleCodeInApp: true
          }


        ).catch(err => {
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

    // partie additionnelle pour reconnecter

    // Déconnexion de l'administrateur après l'importation
    await this.auth.signOut();

    // Demande du mot de passe pour reconnecter l'administrateur
    const adminPassword = prompt('Veuillez entrer votre mot de passe pour vous reconnecter.');
    if (adminPassword && adminEmail) {
      try {
        // Reconnexion de l'administrateur
        await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
        console.log('Reconnexion réussie.');

        // Naviguer vers la page des étudiants avant de recharger la page
        this.router.navigate(['/admin/trainers']); // Redirection vers la page des étudiants

        // Utiliser setTimeout pour permettre à la navigation de se produire avant de recharger la page
        setTimeout(() => {
          window.location.reload(); // Recharge la page après la redirection
        }, 500); // Un délai de 500ms pour s'assurer que la navigation a lieu avant le rechargement
      } catch (error) {
        console.error('Erreur lors de la reconnexion de l\'administrateur:', error);
      }
    } else {
      console.error('Mot de passe non fourni.');
    }












  }








  // Ajouter un rôle 'trainer' à un évaluateur existant
  //  async addRoleToEvaluator(evaluatorId: string): Promise<void> {
  //   const rolesRef = doc(this.firestore, 'roles', evaluatorId);
  //   await setDoc(rolesRef, { role: 'trainer' }, { merge: true }); // Ajoute ou met à jour
  // }

  // Vérifier si l’évaluateur existe déjà dans la collection 'trainers'
  async checkTrainerExists(evaluatorId: string): Promise<boolean> {
    const trainerRef = doc(this.firestore, 'trainers', evaluatorId);
    const trainerSnapshot = await getDoc(trainerRef);
    return trainerSnapshot.exists(); // Renvoie true s’il existe
  }

  // Ajouter un évaluateur dans la collection 'trainers' (sans créer de compte Auth)
  async addEvaluatorAsTrainer(evaluator: any): Promise<void> {
    const trainerRef = doc(this.firestore, 'trainers', evaluator.id);

    try {
      // Vérifie si le formateur existe déjà dans trainers
      const trainerDoc = await getDoc(trainerRef);

      if (trainerDoc.exists()) {
        console.log('Ce formateur existe déjà dans la collection trainers.');
        alert('Ce formateur est déjà enregistré comme formateur.');
        return; // Stoppe l'exécution si l'entrée existe déjà
      }

      // Prépare les données pour le nouveau formateur
      const trainerData = {
        id: evaluator.id,
        firstName: evaluator.firstName,
        lastName: evaluator.lastName,
        email: evaluator.email,
        sigles: evaluator.sigles || [], // Initialise vide ou conserve les sigles
        roles: ['trainer'],
        created: Date.now(),
      };

      console.log('Ajout du formateur :', trainerData);

      // Ajoute l'évaluateur dans trainers
      await setDoc(trainerRef, trainerData);

      // Ajoute également le rôle dans la collection roles (en fusionnant si besoin)
      const rolesRef = doc(this.firestore, 'roles', evaluator.id);
      await setDoc(rolesRef, { role: 'trainer' }, { merge: true });

      alert('Évaluateur ajouté avec succès en tant que formateur.');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du formateur :', error);
      alert('Une erreur est survenue lors de l\'ajout du formateur.');
    }
  }



  // Mettre à jour les expertises métier (sigles) dans la collection 'trainers'
  // async updateTrainerExpertises(trainerId: string, sigles: string[]): Promise<void> {
  //   const trainerRef = doc(this.firestore, 'trainers', trainerId);
  //   await updateDoc(trainerRef, { sigles: sigles }); // Mise à jour des sigles
  // }


  async isCurrentUserReferent(): Promise<boolean> {
    try {
      // Récupérer l'utilisateur actuellement authentifié
      const currentUser = this.auth.currentUser;
      if (!currentUser || !currentUser.uid) {
        console.error("Aucun utilisateur authentifié.");
        return false;
      }

      const userId = currentUser.uid;

      // Accéder au document de la collection "roles" correspondant à l'utilisateur
      const rolesDocRef = doc(this.firestore, `roles/${userId}`);
      const rolesDocSnap = await getDoc(rolesDocRef);

      if (rolesDocSnap.exists()) {
        const roleData = rolesDocSnap.data();
        console.log("Role Data:", roleData);

        // Vérifier si le rôle est "referent"
        return roleData['role'] === 'referent';
      } else {
        console.warn("Aucun rôle trouvé pour cet utilisateur.");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du rôle :", error);
      return false;
    }
  }




}
