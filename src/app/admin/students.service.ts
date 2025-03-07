import { Injectable } from '@angular/core';
// import { NgForm } from '@angular/forms';
import { Auth, reauthenticateWithCredential, createUserWithEmailAndPassword, deleteUser, fetchSignInMethodsForEmail, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithRedirect, updateEmail, EmailAuthProvider } from "@angular/fire/auth";
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc, updateDoc, query, getDocs, where, getDoc, QuerySnapshot, arrayUnion, CollectionReference, DocumentData, orderBy } from '@angular/fire/firestore';
// import { FirebaseApp } from '@angular/fire/app';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
// import { switchMap, tap } from 'rxjs/operators';
import { Student } from './Students/student';
import { NgForm } from '@angular/forms';
import { Evaluation } from './evaluation';
import { Analytics, setUserId } from "@angular/fire/analytics";
import { Router } from '@angular/router';
import { Storage, getDownloadURL, ref, uploadBytes, uploadString } from '@angular/fire/storage';
import { Users } from './Users/users';







@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  // private fullResults: { [key: string]: { duration: number; cost: number } }[] = [];
  users: any[] = [];
  result: any;

  actualRoute: string = ""

  constructor(private auth: Auth, private firestore: Firestore, private analytics: Analytics, private router: Router, private storage: Storage) {
    this.actualRoute = this.router.url
  }

  // createStudent(studentForm: NgForm) {
  async createStudentInitialMethod(student: any) {

    // Vérifier si currentUser est défini
    if (this.auth.currentUser && this.auth.currentUser.email) {
      // Récupérer l'email de l'administrateur
      const adminEmail = this.auth.currentUser.email;
      // const actualRoute = this.router.url


      // let newEvaluator = { id: Date.now(), ...evaluator };
      let newStudent: Student = { created: Date.now(), status: true, trainer: "Attribué ultérieurement", innerStudent: true, ...student };
      // on va lui affecter un password aléatoire en fonction de la date
      let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
      // juste le temps du test, let password sera le même pour tous : password
      // let password = "password"

      // enregistrement en base dans fireAuth d'une part : 
      const result = await createUserWithEmailAndPassword(this.auth, student.email, password);

      if (result && result.user) {
        // const { uid, emailVerified } = this.result.user;
        newStudent.id = result.user.uid
        // delete newStudent.studentPw;

        // on ajoute à la collection
        let studentsRef = collection(this.firestore, "students");
        setDoc(doc(studentsRef, newStudent.id), newStudent)
          .then(() => {
            console.log("New student added successfully");
            // alert("l'utilisateur a été ajouté et un email de personnalisation du mot de passe envoyé")
          }).catch((error) => {
            console.error("Error adding student document: ", error);
          });
        // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
        let $rolesRef = collection(this.firestore, "roles");

        await setDoc(doc($rolesRef, newStudent.id), { role: 'student' })


        // envoie un mail de réinitialisation du mot de passe et url de redirection après reset
        await sendPasswordResetEmail(this.auth, student.email, {
          url: 'https://be-on-top.io/login', // URL de redirection après personnalisation du mot de passe
          handleCodeInApp: true, // Utiliser l'application pour traiter l'action
        })
          .then(() => {
            console.log("Email de réinitialisation envoyé avec succès à l'étudiant.");
          })
          .catch((error) => {
            console.error("Erreur lors de l'envoi de l'email de réinitialisation : ", error.message);
          })

      }



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
            this.router.navigate(['/admin/student', newStudent.id]);
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


  // async createStudent(student: any) {
  //   alert(this.actualRoute);

  //   // Vérifier si currentUser est défini
  //   if (this.auth.currentUser && this.auth.currentUser.email) {
  //     // Récupérer l'email de l'administrateur
  //     const adminEmail = this.auth.currentUser.email;

  //     // Créer un nouvel étudiant avec les propriétés nécessaires
  //     let newStudent = {
  //       created: Date.now(),
  //       role: 'student',
  //       status: true,
  //       trainer: "Attribué ultérieurement",
  //       innerStudent: true,
  //       ...student
  //     };

  //     // Génération du mot de passe aléatoire
  //     let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

  //     try {
  //       // Création de l'utilisateur dans Firebase Authentication
  //       const result = await createUserWithEmailAndPassword(this.auth, student.email, password);

  //       if (result && result.user) {
  //         newStudent.id = result.user.uid;

  //         // Enregistrement dans Firestore
  //         let $studentsRef = collection(this.firestore, "students");
  //         await setDoc(doc($studentsRef, newStudent.id), newStudent);

  //         // Enregistrement du rôle dans une collection dédiée
  //         let $rolesRef = collection(this.firestore, "roles");
  //         await setDoc(doc($rolesRef, newStudent.id), { role: 'student' });

  //         // Envoi d'un email de réinitialisation avec URL personnalisée
  //         await sendPasswordResetEmail(this.auth, newStudent.email)
  //           .then(() => {
  //             console.log("Email de réinitialisation envoyé avec succès.");
  //           })
  //           .catch((error) => {
  //             console.error("Erreur lors de l'envoi de l'email de réinitialisation :", error.message);
  //           });
  //       }

  //       // Déconnexion de l'administrateur
  //       await this.auth.signOut();

  //       // Reconnexion de l'administrateur
  //       this.auth.onAuthStateChanged(async (user) => {
  //         if (!user) {
  //           const adminPassword = prompt('Veuillez entrer votre mot de passe pour vous reconnecter.');
  //           if (adminPassword) {
  //             await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
  //             console.log('Reconnexion automatique en tant qu\'administrateur réussie.');
  //             this.router.navigate(['/admin/student', newStudent.id]);
  //           } else {
  //             console.error('Mot de passe non fourni.');
  //           }
  //         }
  //       });
  //     } catch (error: any) {
  //       console.error("Erreur lors de la création de l'étudiant :", error.message);
  //     }
  //   } else {
  //     console.error('Administrateur non connecté.');
  //   }
  // }

  // pour import en nombre fonctionne et redirection convenable
  // async createStudents(students: any[]) {
  //   alert(this.actualRoute);

  //   // Vérifier si currentUser est défini
  //   if (this.auth.currentUser && this.auth.currentUser.email) {
  //     // Récupérer l'email de l'administrateur
  //     const adminEmail = this.auth.currentUser.email;

  //     try {
  //       // Parcours de chaque étudiant pour les ajouter un par un
  //       for (let student of students) {
  //         // Créer un nouvel étudiant avec les propriétés nécessaires
  //         let newStudent: Partial<Student> = {
  //           created: new Date(),
  //           role: 'student',
  //           status: true,
  //           trainer: "Attribué ultérieurement",
  //           innerStudent: true,
  //           firstName: student.firstName?.trim() || '',
  //           lastName: student.lastName?.trim() || '',
  //           email: student.email?.trim() || '',
  //           roles: [],   // Assurez-vous que vous gérez les rôles correctement
  //           details: "",  // Ajoutez des détails ou initialisez-les en fonction du modèle
  //         };

  //         // Vérification si l'email est valide
  //         if (newStudent.email) {
  //           // Génération du mot de passe aléatoire
  //           let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

  //           try {
  //             // Création de l'utilisateur dans Firebase Authentication
  //             const result = await createUserWithEmailAndPassword(this.auth, newStudent.email, password);

  //             if (result && result.user) {
  //               // Une fois l'utilisateur créé, ajouter l'ID dans l'objet
  //               newStudent.id = result.user.uid;  // Ajoutez ici l'id généré par Firebase

  //               // Enregistrement dans Firestore
  //               let $studentsRef = collection(this.firestore, "students");
  //               await setDoc(doc($studentsRef, newStudent.id), newStudent);

  //               // Enregistrement du rôle dans une collection dédiée
  //               let $rolesRef = collection(this.firestore, "roles");
  //               await setDoc(doc($rolesRef, newStudent.id), { role: 'student' });

  //               // Envoi d'un email de réinitialisation avec URL personnalisée
  //               await sendPasswordResetEmail(this.auth, newStudent.email
  //                 //     ,{
  //                 //        // URL de redirection après personnalisation du mot de passe
  //                 //     url: 'https://be-on-top.io/login',
  //                 //     // Utilisation de l'application pour traiter cette action
  //                 //     handleCodeInApp: true 
  //                 // }

  //               )
  //                 .then(() => {
  //                   console.log("Email de réinitialisation envoyé avec succès.");
  //                 })
  //                 .catch((error) => {
  //                   console.error("Erreur lors de l'envoi de l'email de réinitialisation :", error.message);
  //                 });
  //             }
  //           } catch (error: any) {
  //             console.error(`Erreur lors de la création de l'étudiant ${student.email}:`, error.message);
  //           }
  //         } else {
  //           console.error('Email manquant pour un étudiant. L\'importation pour cet étudiant est ignorée.');
  //         }
  //       }

  //       // Déconnexion de l'administrateur après l'importation
  //       await this.auth.signOut();

  //       // Demande du mot de passe pour reconnecter l'administrateur
  //       const adminPassword = prompt('Veuillez entrer votre mot de passe pour vous reconnecter.');
  //       if (adminPassword) {
  //         try {
  //           // Reconnexion de l'administrateur
  //           await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
  //           console.log('Reconnexion réussie.');

  //           // Naviguer vers la page des étudiants avant de recharger la page
  //           this.router.navigate(['/admin/students']);  // Redirection vers la page des étudiants

  //           // Utiliser setTimeout pour permettre à la navigation de se produire avant de recharger la page
  //           setTimeout(() => {
  //             window.location.reload();  // Recharge la page après la redirection
  //           }, 500);  // Un délai de 500ms pour s'assurer que la navigation a lieu avant le rechargement

  //         } catch (error) {
  //           console.error('Erreur lors de la reconnexion de l\'administrateur:', error);
  //         }
  //       } else {
  //         console.error('Mot de passe non fourni.');
  //       }
  //     } catch (error) {
  //       console.error("Erreur lors du traitement de l'importation :", error);
  //     }
  //   } else {
  //     console.error('Administrateur non connecté.');
  //   }
  // }

  // suggestion pour plus de robusteste
  async createStudents(students: any[]) {
    alert(this.actualRoute);

    // Vérifier si currentUser est défini
    if (this.auth.currentUser && this.auth.currentUser.email) {
      // Récupérer l'email de l'administrateur
      const adminEmail = this.auth.currentUser.email;

      try {
        // Parcours de chaque étudiant pour les ajouter un par un
        for (let student of students) {
          // Nettoyer les champs et créer un nouvel étudiant
          let newStudent: Partial<Student> = {
            created: new Date(),
            role: 'student',
            status: true,
            trainer: "Attribué ultérieurement",
            innerStudent: true,
            firstName: student.firstName?.trim() || '',
            lastName: student.lastName?.trim() || '',
            email: student.email?.trim() || '',
            roles: [],
            details: "", // Ajoutez des détails ou initialisez-les en fonction du modèle
          };

          // Vérification si l'email est valide
          if (newStudent.email) {
            // Vérification des doublons Firebase Auth
            try {
              const signInMethods = await fetchSignInMethodsForEmail(this.auth, newStudent.email);
              if (signInMethods.length > 0) {
                console.error(`Un utilisateur avec l'email ${newStudent.email} existe déjà. Importation ignorée.`);
                continue; // Passer à l'étudiant suivant
              }
            } catch (error: any) {
              console.error(`Erreur lors de la vérification des doublons pour l'email ${newStudent.email}:`, error.message);
              continue; // Passer à l'étudiant suivant
            }

            // Génération du mot de passe aléatoire
            let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

            try {
              // Création de l'utilisateur dans Firebase Authentication
              const result = await createUserWithEmailAndPassword(this.auth, newStudent.email, password);

              if (result && result.user) {
                // Une fois l'utilisateur créé, ajouter l'ID dans l'objet
                newStudent.id = result.user.uid;

                // Enregistrement dans Firestore
                let $studentsRef = collection(this.firestore, "students");
                await setDoc(doc($studentsRef, newStudent.id), newStudent);

                // Enregistrement du rôle dans une collection dédiée
                let $rolesRef = collection(this.firestore, "roles");
                await setDoc(doc($rolesRef, newStudent.id), { role: 'student' });

                // Envoi d'un email de réinitialisation avec URL personnalisée
                await sendPasswordResetEmail(this.auth, newStudent.email

                  // , {
                  //   // URL de redirection après personnalisation du mot de passe
                  //   url: 'https://be-on-top.io/login',
                  //   // Utilisation de l'application pour traiter cette action
                  //   handleCodeInApp: true
                  // }


                ).then(() => {
                  console.log("Email de réinitialisation envoyé avec succès.");
                }).catch((error) => {
                  console.error("Erreur lors de l'envoi de l'email de réinitialisation :", error.message);
                });
              }
            } catch (error: any) {
              console.error(`Erreur lors de la création de l'étudiant ${newStudent.email}:`, error.message);
            }
          } else {
            console.error('Email manquant pour un étudiant. L\'importation pour cet étudiant est ignorée.');
          }
        }

        // Déconnexion de l'administrateur après l'importation
        await this.auth.signOut();

        // Demande du mot de passe pour reconnecter l'administrateur
        const adminPassword = prompt('Veuillez entrer votre mot de passe pour poursuivre et vous reconnecter.');
        if (adminPassword) {
          try {
            // Reconnexion de l'administrateur
            await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
            console.log('Reconnexion réussie.');

            // Naviguer vers la page des étudiants avant de recharger la page si admin
            // this.router.navigate(['/admin/students']); // Redirection vers la page des étudiants
            // Naviguer vers la page des étudiants avant de recharger la page si referent
            this.router.navigate(['/admin/referentStudentsList']); // Redirection vers la page des étudiants

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
      } catch (error) {
        console.error("Erreur lors du traitement de l'importation :", error);
      }
    } else {
      console.error('Administrateur non connecté.');
    }

  }


  async register(student: any) {
    // alert(student.studentPw)
    let newStudent = { created: Date.now(), status: true, trainer: "Attribué ultérieurement", ...student };

    // enregistrement en base dans fireAuth d'une part : 
    const result = await createUserWithEmailAndPassword(this.auth, student.email, student.studentPw);

    if (result && result.user) {
      newStudent.id = result.user.uid
    }


    let studentsRef = collection(this.firestore, "students");
    setDoc(doc(studentsRef, newStudent.id), newStudent)
    let $rolesRef = collection(this.firestore, "roles");
    setDoc(doc($rolesRef, newStudent.id), { role: 'student' })

    // pour lui attribuer un id ou un nom dans analytics
    setUserId(this.analytics, newStudent.id);
  }


  // getStudents() {
  //   const studentsRef = collection(this.firestore, "students");
  //   return collectionData(studentsRef, { idField: "id" }) as Observable<Student[]>;
  // }
  // pour ordonner le retour
  getStudents(order: 'asc' | 'desc' = 'desc') {
    const studentsRef = collection(this.firestore, "students");
    const studentsQuery = query(studentsRef, orderBy("created", order)); // Tri par la date "created"
    return collectionData(studentsQuery, { idField: "id" }) as Observable<Student[]>;
  }

  getStudentById(studentId: string) {
    const studentRef = doc(this.firestore, 'students/' + studentId);
    return docData(studentRef) as Observable<Student>;
  }



  async deleteStudent(student: Student): Promise<void> {
    // try {
    //   if (this.auth.currentUser) {
    //     await this.auth.currentUser.delete(); // Utilisation de await pour attendre la fin de la suppression de compte avant de continuer
    //     console.log('Compte utilisateur auth supprimé.');
    //   }

    const studentRef = doc(this.firestore, 'students', student.id);
    try {
      await deleteDoc(studentRef);
      console.log(`Student with id=${student.id} deleted from firebase successfully`);
      // await deleteUser(student.id)
    } catch (error) {
      console.error(`Error deleting student from firebase with id=${student.id}: `, error);
    }
    // } catch (error) {
    //   console.error('Error deleting user account:', error);
    // }


  }

  async deleteAccount() {
    // Affichage d'une alerte de confirmation avant la suppression
    const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.');
  
    if (confirmDelete) {
      try {
        if (this.auth.currentUser) {
          // Suppression du compte utilisateur
          await this.auth.currentUser.delete();
          console.log('Compte utilisateur auth supprimé.');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du compte utilisateur :', error);
      }
    } else {
      console.log('Suppression annulée.');
    }
  }
  


  // async deleteAccount() {

  //   try {
  //     if (this.auth.currentUser) {
  //       await this.auth.currentUser.delete();
  //       console.log('Compte utilisateur auth supprimé.');
  //     }

  //   } catch (error) {
  //     console.log(error);

  //   }

  //   // try {
  //   //   await deleteDoc(studentRef);
  //   //   console.log(`Student with id=${student.id} deleted from firebase successfully`);
  //   // } catch (error) {
  //   //   console.error(`Error deleting student from firebase with id=${student.id}: `, error);
  //   // }

  // }

//  OK mais ne prenait pas en considération l'update du compte
  // updateStudent(id: string, student: any) {
  //   // let $studentRef = doc(this.firestore, "students/" + id);
  //   // setDoc($studentRef, student);
  //   let $studentRef = doc(this.firestore, "students/" + id);
  //   updateDoc($studentRef, student);
  // }
  // async updateStudent(id: string, student: any): Promise<void> {
  //   // const auth = getAuth();
  //   const user = this.auth.currentUser;

  //   if (!user) {
  //     throw new Error("User is not authenticated");
  //   }

  //   try 
    
  //   {
  //     // Vérification si l'email a changé
  //     if (student.email && student.email !== user.email) {
  //       await updateEmail(user, student.email); // Met à jour l'email dans Firebase         
  //       // alert(user.uid)
  //       // alert(student.email && student.email !== user.email)
  //       console.log("Email updated successfully in Firebase Auth");
  //     }

  //     // Mise à jour des autres champs dans Firestore
  //     const studentRef = doc(this.firestore, "students", id);
  //     await updateDoc(studentRef, student);
  //     console.log("Student updated successfully in Firestore");
  //   } catch (error) {
  //     console.error("Error updating student: ", error);
  //     throw error; // Relancer l'erreur pour la capturer dans le composant
  //   }

  // }


  async updateStudent(id: string, student: any): Promise<void> {
    const user = this.auth.currentUser;
  
    if (!user) {
      throw new Error("User is not authenticated");
    }
  
    try {
      // Vérification si l'email a changé
      if (student.email && student.email !== user.email) {
        if (!user.email) {
          throw new Error("User email is null, cannot update email");
        }
  
        const currentPassword = student.currentPassword; // Récupère le mot de passe depuis les données du formulaire
        if (!currentPassword) {
          throw new Error("Current password is required for updating the email");
        }
  
        // Ré-authentification avec le mot de passe actuel
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        console.log("User re-authenticated successfully");
  
        // Mise à jour de l'email dans Firebase Auth
        await updateEmail(user, student.email);
        console.log("Email updated successfully in Firebase Auth");
      }
  
      // Mise à jour du document dans Firestore
      const studentRef = doc(this.firestore, "students", id);
      await updateDoc(studentRef, student);
      console.log("Student updated successfully in Firestore");
  
    } catch (error) {
      console.error("Error updating student: ", error);
      throw error; // Relancer l'erreur pour la capturer dans le composant
    }
  }
  
  
  
  
  

  updateStudentEvaluation(id: string, evaluations: {}) {
    // let $studentRef = doc(this.firestore, "students/" + id);
    // setDoc($studentRef, student);
    let $studentRef = doc(this.firestore, "students/" + id);
    console.log("evaluation", evaluations);

    updateDoc($studentRef, evaluations);
  }

  async updateStudentTutorial(id: string, tutorials: {}) {
    let $studentRef = doc(this.firestore, "students/" + id);
    console.log("tutorials", tutorials);
    updateDoc($studentRef, tutorials);
  }


  async getStudentsByParam(uid: string) {
    const myData = query(collection(this.firestore, 'students'), where('id', '==', uid));
    const querySnapshot = await getDocs(myData);
    if (querySnapshot) {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
        doc.data()
      });
    }
  }

  updateStudentScore(id: string, scoreCounter: number, indexQuestion: number, trade: string, hasStartedEvaluation: boolean, studentCompetences: any, evaluatedCompetence: string, numberOfPoints: number, isIncremented: boolean, isDecremented: boolean) {
    // alert(scoreCounter)

    let $studentRef = doc(this.firestore, "students/" + id)

    // alert(hasStartedEvaluation)

    if (hasStartedEvaluation === true) {
      // alert('hasStartedEvaluation ! ')
      const updatedTableauObjets = studentCompetences.map((obj: any) => {
        console.log("evaluatedCompetence reçue par le service", evaluatedCompetence)

        console.log(isIncremented)
        console.log(isDecremented)
        console.log(numberOfPoints)

        // on le rajoute pour décrémenter LA compétence si compteurs réinitialisés parce que TOUTES les réponses ont été cochées !!!!

        if (evaluatedCompetence in obj && isIncremented == true && isDecremented == false) {
          return { ...obj, [evaluatedCompetence]: Number(obj[evaluatedCompetence]) + Number(numberOfPoints) }
        }
        if ((evaluatedCompetence in obj && isIncremented == false && isDecremented == true)) {
          return { ...obj, [evaluatedCompetence]: Number(obj[evaluatedCompetence]) - Number(numberOfPoints) }
        }

        // il n'a pas eu le temps d'être incrémenté, qu'on lui dit déjà de décrémenter
        // cas où la dernière réponse cochée était bonne
        if (evaluatedCompetence in obj && isIncremented == false && isDecremented == false) {
          return { ...obj, [evaluatedCompetence]: Number(obj[evaluatedCompetence]) + Number(0) }
        }

        return obj;

      })

      let updatedStudent: any = { scoreCounter: scoreCounter, lastIndexQuestion: Number(indexQuestion), tradeEvaluated: trade, studentCompetences: updatedTableauObjets }
      console.log('scoreCounter normalement sans sigle!!!!!!!!!!!!!!!!!!!', scoreCounter);

      console.log('updateStudent tel que service est prêt à updater!!!!!!!!!!', updatedStudent);

      // c'est là qu'on peut le transformer pour adjoindre le sigle au nom des principales propriétés concernées
      // mais avant, juste pour anticiper les tests à venir, on va dégager tradeEvaluated de uddateStudent
      // delete (updateStudent.tradeEvaluated)


      // let globalUpdatedStudent: any = {}
      // for (const key in updatedStudent) {
      //   const newKey = `${trade}_${key}`;
      //   globalUpdatedStudent[newKey] = updatedStudent[key]
      // }

      // console.log('globalUpdatedStudent', globalUpdatedStudent)
      // globalUpdatedStudent.tradesEvaluated = [trade]
      // console.log('globalUpdatedStudent with tradesEvaluated[]', globalUpdatedStudent)

      // si options multiples Quizz VERSION 2
      let globalUpdatedQuizzToAdd: any = {}
      const keyNewQuizz: string = 'quizz_' + trade
      globalUpdatedQuizzToAdd[keyNewQuizz] = updatedStudent

      console.log("globalUpdatedQuizzToAdd", globalUpdatedQuizzToAdd)


      // ça ne change pas vraiment, on donnera globalUpdatedStudent à enregistrer plus tard...
      updateDoc($studentRef, globalUpdatedQuizzToAdd)


    } else {
      alert('has NOT startedEvaluation ! ')

      // alert("on attend toujours")
      // let updateStudent = { scoreCounter: scoreCounter, lastIndexQuestion: indexQuestion, tradeEvaluated: trade, studentCompetences }
      // updateDoc($studentRef, updateStudent);

    }
  }


  // async setFullResults(durationsByLevels: { [key: string]: number }, estimatedCPCost: { [key: string]: number }) {
  //   const estimatedKeys = Object.keys(estimatedCPCost);
  //   const fullResults = []; // Initialise le tableau ici

  //   for (const estimatedKey of estimatedKeys) {
  //     const durationKey = estimatedKey.replace('individual_cost_', '');
  //     if (durationsByLevels.hasOwnProperty(durationKey)) {
  //       const entry = {
  //         [durationKey]: {
  //           duration: durationsByLevels[durationKey],
  //           cost: estimatedCPCost[estimatedKey]
  //         }
  //       }

  //       fullResults.push(entry);
  //     }
  //   }

  //   console.log('this.fullResults', fullResults);
  //   return fullResults; // Renvoie le tableau à la fin de la méthode
  // }
  async setFullResults(
    durationsByLevels: { [key: string]: number },
    estimatedCPCost: { [key: string]: number },
    thirdArray: { [key: string]: number }[]
  ) {
    const estimatedKeys = Object.keys(estimatedCPCost);
    const fullResults = [];

    for (const estimatedKey of estimatedKeys) {
      const durationKey = estimatedKey.replace('individual_cost_', '');
      if (durationsByLevels.hasOwnProperty(durationKey)) {
        const entry = {
          [durationKey]: {
            duration: durationsByLevels[durationKey],
            cost: estimatedCPCost[estimatedKey],
            notation: this.findNotation(durationKey, thirdArray) // Appelle une fonction pour trouver la notation correspondante
          }
        };

        fullResults.push(entry);
      }
    }

    console.log('this.fullResults', fullResults);
    return fullResults;
  }

  findNotation(durationKey: string, thirdArray: { [key: string]: number }[]) {
    const matchingNotationObj = thirdArray.find((notationObj) =>
      Object.keys(notationObj)[0].includes(durationKey)
    );

    if (matchingNotationObj) {
      const notationKey = Object.keys(matchingNotationObj)[0];
      return matchingNotationObj[notationKey];
    }

    return null; // Retourne null si aucune notation correspondante n'est trouvée
  }


  // pour essayer une modification de la fonction compatible avec les options de quizz multiples
  // updateFullResults(id: string, fullResults: any) {

  //   let $studentRef = doc(this.firestore, "students/" + id);

  //   let updateStudent = { fullResults: fullResults }
  //   updateDoc($studentRef, updateStudent)

  // }

  // updateFullResults(id: string, fullResults: any, trade : string) {
  //   const studentRef = doc(this.firestore, "students/" + id);
  //   const quizzKey : string = 'quizz_'+trade
  //   const updateStudent = {
  //     [quizzKey]: fullResults
  //   };
  //   updateDoc(studentRef, updateStudent)

  // }


  updateFullResults(id: string, fullResults: any, trade: string) {
    const studentRef = doc(this.firestore, "students/" + id);
    const updateStudent = {
      ['quizz_' + trade]: { fullResults: fullResults }
    }
    setDoc(studentRef, updateStudent, { merge: true })
  }

  async addFollowUpEvaluation(id: string, evaluation: any) {
    const studentRef = doc(this.firestore, "students/" + id)
    setDoc(studentRef, evaluation, { merge: true })
  }

  async addFollowUpTutorial(id: string, tutorial: any) {
    const studentRef = doc(this.firestore, "students/" + id)
    setDoc(studentRef, tutorial, { merge: true })
  }

  // fonctionne très bien conserver
  async getUserToken(studentId: string) {
    const tokenRef = doc(this.firestore, 'tokens', studentId);
    const tokenSnapshot = await getDoc(tokenRef);

    if (tokenSnapshot.exists()) {
      const tokenData = tokenSnapshot.data()?.['key'];
      console.log('tokenData', tokenData);
      return tokenData;
    }

    return null;
  }

  async activateSubscription(id: string, sigle: any, localTraining:string) {
    const studentRef = doc(this.firestore, "students/" + id)
    const updateStudent = {
      subscriptions: sigle,
      // si on veut localiser la formation en cours...
      localTraining:localTraining
    }

    console.log("updateStudent", updateStudent);
    
    setDoc(studentRef, updateStudent, { merge: true })
  }

  async endSubscription(id: string, sigle: string) {
    const studentRef = doc(this.firestore, "students/" + id)
    const date = new Date();
    // Formater la date au format YYYY-MM-DD
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    const updatedStudent = {
      endedSubscriptions: { date: formattedDate, sigle: sigle }
    }
    setDoc(studentRef, updatedStudent, { merge: true })
  }

  sendElearningInfo(id: string, info: any) {
    let $studentRef = doc(this.firestore, "students/" + id)
    const updatedStudent = { elearning: info }
    updateDoc($studentRef, updatedStudent)
  }

  // async exportCollection(collectionName: string): Promise<void> {
  //   const exportRef = collection(this.firestore, collectionName);
  //   return await getDocs(exportRef).then(snapshot => {
  //     const data = snapshot.docs.map(doc => doc.data());
  //     const jsonData = JSON.stringify(data);
  //     // Vous pouvez envoyer ce JSON à un backend pour l'exporter
  //     console.log(jsonData);
  //   }).catch(error => {
  //     console.error('Erreur lors de l\'export de la collection:', error);
  //     throw error;
  //   });
  // }

  async exportCollection(collectionName: string): Promise<void> {
    const exportRef = collection(this.firestore, collectionName);
    try {
      const snapshot: QuerySnapshot<any> = await getDocs(exportRef);
      const data = snapshot.docs.map(doc => doc.data());
      const jsonData = JSON.stringify(data);
      console.log(jsonData);

      // Création d'un objet Blob avec le contenu JSON
      const blob = new Blob([jsonData], { type: 'application/json' });

      // Création d'un objet URL pour le Blob
      const url = window.URL.createObjectURL(blob);

      // Création d'un lien HTML pour le téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectionName}_export.json`; // Nom du fichier JSON
      document.body.appendChild(a);

      // Déclenchement du téléchargement
      a.click();

      // Libération de l'URL de l'objet Blob
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export de la collection:', error);
      throw error;
    }
  }


  async exportCollectionAsCSV(collectionName: string): Promise<void> {
    const exportRef = collection(this.firestore, collectionName);
    try {
      const snapshot: QuerySnapshot<any> = await getDocs(exportRef);
      const headers = Object.keys(snapshot.docs[0].data()); // Récupérer les noms de colonnes depuis le premier document
      const csvContent = this.generateCSVContent(snapshot, headers);

      // Création d'un objet Blob avec le contenu CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });

      // Création d'un objet URL pour le Blob
      const url = window.URL.createObjectURL(blob);

      // Création d'un lien HTML pour le téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectionName}_export.csv`; // Nom du fichier CSV
      document.body.appendChild(a);

      // Déclenchement du téléchargement
      a.click();

      // Libération de l'URL de l'objet Blob
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors de l\'export de la collection:', error);
      throw error;
    }
  }

  private generateCSVContent(snapshot: QuerySnapshot<any>, headers: string[]): string {
    let csvContent = headers.join(',') + '\n'; // En-têtes de colonnes

    snapshot.docs.forEach(doc => {
      const rowData: any[] = []
      headers.forEach(header => {
        rowData.push(doc.data()[header])
      });
      csvContent += rowData.join(',') + '\n'
    });

    return csvContent;
  }

  async uploadPDF(filePath: string, selectedFile: any, studentId: string) {

    const storageRef = ref(this.storage, filePath);

    try {
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);



      const studentDocRef = doc(this.firestore, 'students', studentId);

      // Add the document metadata to the student's documents array
      await updateDoc(studentDocRef, {
        documents: arrayUnion({
          fileUrl: downloadURL,
          fileName: selectedFile.name,
          uploadTime: new Date()
        })
      });

      console.log('Document PDF uploadé et métadonnées enregistrées dans Firestore.');
    } catch (error) {
      console.error('Erreur lors de l\'upload ou de l\'enregistrement des métadonnées :', error);
    }
  }


  /**
   * Méthode pour vérifier le CP d'un utilisateur par son ID (credential.uid),
   * puis récupérer les centerID et returnedPrior correspondants.
   */

  // Définir les références aux collections Firestore
  // On ne  va pas définir les références aux collections Firestore en amont, même si c'est élégant... 
  // private usersRef: CollectionReference;
  // private centersRef: CollectionReference;
  // private socialFormRef: CollectionReference;
  // getCentersAndSocialFormByUserId(userId: string) {
  //   const usersRef = collection(this.firestore, 'users');
  //   const centersRef = collection(this.firestore, 'centers');
  //   const socialFormRef = collection(this.firestore, 'SocialForm');
  //   // Récupère le document utilisateur dans la collection 'users' en fonction de l'ID donné
  //   const userDocRef = doc(usersRef, userId);

  //   return from(getDoc(userDocRef)).pipe(

  //     // Définir les références aux collections Firestore

  //     switchMap(userDocSnapshot => {
  //       const userDocData = userDocSnapshot.data() as Users | undefined;

  //       if (userDocData && userDocData.cp) {
  //         const cp = userDocData.cp; // On suppose ici que `cp` est une chaîne
  //         console.log('utilisateur référent de', cp);

  //         const centersQuery = query(centersRef, where('cp', '==', cp));
  //         console.log('Exécution de la requête Firestore pour CP:', cp);

  //         return from(getDocs(centersQuery)).pipe(
  //           tap(querySnapshot => {
  //             console.log('Résultats de la requête centers:', querySnapshot.docs.map(doc => doc.data()));
  //           }),
  //           map(querySnapshot => {
  //             const centerIDs = querySnapshot.docs.map(doc => doc.id);
  //             return centerIDs;
  //           }),
  //           switchMap(centerIDs => {
  //             if (centerIDs.length > 0) {
  //               const socialFormQuery = query(socialFormRef, where('center', 'in', centerIDs));
  //               return from(getDocs(socialFormQuery));
  //             } else {
  //               return of([]);
  //             }
  //           }),
  //           map((socialFormQuerySnapshot: any) => {
  //             const returnedPriors = socialFormQuerySnapshot.docs.map((doc: any) => doc.id);
  //             return returnedPriors;
  //           })
  //         );
  //       } else {
  //         return of([]);
  //       }
  //     })

  //   );
  // }

//   getCentersAndSocialFormByUserId(userId: string) {
//     const usersRef = collection(this.firestore, 'users');
//     const centersRef = collection(this.firestore, 'centers');
//     const socialFormRef = collection(this.firestore, 'SocialForm');

//     // Récupère le document utilisateur dans la collection 'users' en fonction de l'ID donné
//     const userDocRef = doc(usersRef, userId);

//     return from(getDoc(userDocRef)).pipe(
//       switchMap(userDocSnapshot => {
//         const userDocData = userDocSnapshot.data() as Users | undefined;
//         console.log('userDocData.cp', userDocData);

// // subordonner ce qui suit à l'absence dans userDocRef d'une propriété centerId !!!!

//         // Si `cp` dans `userDocData` est un tableau de chaînes de caractères
//         if (userDocData && Array.isArray(userDocData.cp) && userDocData.cp.length > 0) {
//           const cpArray = userDocData.cp; // Le tableau de CPs dans le document de l'utilisateur
//           console.log('utilisateur référent de', cpArray);

//           // Requête pour trouver tous les centres dont le `cp` est dans le tableau `cpArray`
//           const centersQuery = query(centersRef, where('cp', 'in', cpArray));
//           console.log('Exécution de la requête Firestore pour CPs:', cpArray);

//           return from(getDocs(centersQuery)).pipe(
//             tap(querySnapshot => {
//               console.log('Résultats de la requête centers:', querySnapshot.docs.map(doc => doc.data()));
//             }),
//             map(querySnapshot => {
//               // Récupère les IDs des centres correspondant aux CPs
//               const centerIDs = querySnapshot.docs.map(doc => doc.id);
//               return centerIDs;
//             }),
//             switchMap(centerIDs => {
//               if (centerIDs.length > 0) {
//                 // Requête pour les documents SocialForm en fonction des centerIDs obtenus
//                 const socialFormQuery = query(socialFormRef, where('center', 'in', centerIDs));
//                 return from(getDocs(socialFormQuery));
//               } else {
//                 return of([]); // Aucun centre trouvé
//               }
//             }),
//             map((socialFormQuerySnapshot: any) => {
//               const returnedPriors = socialFormQuerySnapshot.docs.map((doc: any) => doc.id);
//               return returnedPriors;
//             })
//           );
//         } else {
//           return of([]); // Si l'utilisateur n'a pas de CP
//         }
//       })
//     );
//   }
// essai tentative optimisée si plusieurs codes postaux identiques
getCentersAndSocialFormByUserId(userId: string) {
  const usersRef = collection(this.firestore, 'users');
  const centersRef = collection(this.firestore, 'centers');
  const socialFormRef = collection(this.firestore, 'SocialForm');

  const userDocRef = doc(usersRef, userId);

  return from(getDoc(userDocRef)).pipe(
    switchMap(userDocSnapshot => {
      const userDocData = userDocSnapshot.data() as Users | undefined;
      console.log('userDocData:', userDocData);

      // **Cas 1 :** Si `centerId` est défini et non vide
      if (userDocData?.centerId && userDocData.centerId.length > 0) {
        console.log(`Recherche avec centerIds: ${userDocData.centerId}`);
        return of(userDocData.centerId); // On retourne directement le tableau `centerId`
      }

      // **Cas 2 :** Si `centerId` est absent, rechercher par `cp`
      if (userDocData?.cp && Array.isArray(userDocData.cp) && userDocData.cp.length > 0) {
        const cpArray = userDocData.cp;
        console.log('Recherche de centres avec CPs:', cpArray);

        const centersQuery = query(centersRef, where('cp', 'in', cpArray));
        return from(getDocs(centersQuery)).pipe(
          tap(querySnapshot => {
            console.log('Résultats centers:', querySnapshot.docs.map(doc => doc.data()));
          }),
          map(querySnapshot => querySnapshot.docs.map(doc => doc.id)) // Récupère les IDs des centres
        );
      }

      // **Si ni `centerId` ni `cp`, on retourne un tableau vide**
      return of([]);
    }),
    switchMap(centerIDs => {
      if (centerIDs.length > 0) {
        console.log('Recherche des SocialForms pour ces centers:', centerIDs);
        const socialFormQuery = query(socialFormRef, where('center', 'in', centerIDs));
        return from(getDocs(socialFormQuery)).pipe(
          map(socialFormQuerySnapshot => socialFormQuerySnapshot.docs.map(doc => doc.id))
        );
      }
      return of([]); // Aucun centre trouvé
    })
  );
}






  // async createStudent(student: any) {
  //   if (!this.auth.currentUser || !this.auth.currentUser.email) {
  //     console.error('Administrateur non connecté.');
  //     return;
  //   }

  //   const adminEmail = this.auth.currentUser.email;
  //   const adminUid = this.auth.currentUser.uid

  //   // Initialiser un nouvel étudiant avec des champs par défaut + celui du referent qui l'a inscrit
  //   const newStudent: Student = {
  //     created: Date.now(),
  //     status: true,
  //     trainer: "Attribué ultérieurement",
  //     innerStudent: true,
  //     // referent:adminEmail,
  //     referent: adminUid,
  //     ...student,
  //   };

  //   // Générer un mot de passe aléatoire pour le nouvel étudiant
  //   const password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

  //   try {
  //     // Créer l'utilisateur dans Firebase Authentication
  //     const result = await createUserWithEmailAndPassword(this.auth, student.email, password);

  //     if (!result || !result.user) {
  //       throw new Error("Échec de la création de l'utilisateur Firebase.");
  //     }

  //     // Ajouter l'UID généré à l'objet étudiant
  //     newStudent.id = result.user.uid;

  //     // Ajouter les informations de l'étudiant dans Firestore
  //     const studentsRef = collection(this.firestore, "students");
  //     await setDoc(doc(studentsRef, newStudent.id), newStudent);
  //     console.log("Étudiant ajouté avec succès dans Firestore.");

  //     // Ajouter le rôle de l'étudiant dans la collection des rôles
  //     const rolesRef = collection(this.firestore, "roles");
  //     await setDoc(doc(rolesRef, newStudent.id), { role: 'student' });
  //     console.log("Rôle de l'étudiant ajouté avec succès.");

  //     // Envoyer un e-mail de réinitialisation du mot de passe
  //     await sendPasswordResetEmail(this.auth, student.email
  //           ,{
  //              // URL de redirection après personnalisation du mot de passe
  //           url: 'https://be-on-top.io/login',
  //           // Utilisation de l'application pour traiter cette action
  //           handleCodeInApp: true 
  //       }
  //     );
  //     console.log("E-mail de réinitialisation du mot de passe envoyé.");
  //   } catch (error: any) {
  //     console.error("Erreur lors de la création de l'étudiant :", error.message);
  //     return; // Arrêtez le processus si une erreur se produit
  //   }

  //   // Déconnexion de l'administrateur après la création de l'étudiant
  //   try {
  //     await this.auth.signOut();
  //     console.log("Administrateur déconnecté après la création.");
  //   } catch (error) {
  //     console.error("Erreur lors de la déconnexion de l'administrateur :", error);
  //   }

  //   // Reconnexion de l'administrateur
  //   this.auth.onAuthStateChanged(async (user) => {
  //     if (!user) {
  //       const adminPassword = prompt('Veuillez entrer votre mot de passe pour vous reconnecter.');
  //       if (!adminPassword) {
  //         console.error('Mot de passe non fourni.');
  //         return;
  //       }

  //       try {
  //         await signInWithEmailAndPassword(this.auth, adminEmail, adminPassword);
  //         console.log('Reconnexion réussie.');

  //         // Rediriger vers la page des détails de l'étudiant (attention faudrait vérifier routerLink.user pour faire cette redirection)
  //         this.router.navigate(['/admin/referent/studentDetails', newStudent.id]);
  //       } catch (error: any) {
  //         console.error('Erreur lors de la reconnexion de l\'administrateur :', error.message);
  //       }
  //     }
  //   });
  // }



  // suggestion pour plus de robusteste

  async createStudent(student: any) {
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
    const cleanedEmail = student.email.trim();

    // Initialiser un nouvel étudiant avec des champs par défaut
    const newStudent: Student = {
      created: Date.now(),
      status: true,
      trainer: "Attribué ultérieurement",
      innerStudent: true,
      referent: adminUid,
      ...student,
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
      const password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

      const result = await createUserWithEmailAndPassword(this.auth, cleanedEmail, password);
      if (!result || !result.user) {
        throw new Error("Échec de la création de l'utilisateur Firebase.");
      }

      newStudent.id = result.user.uid;

      // Ajouter les informations de l'étudiant dans Firestore
      const studentsRef = collection(this.firestore, "students");
      await setDoc(doc(studentsRef, newStudent.id), newStudent);
      console.log("Étudiant ajouté avec succès dans Firestore :", newStudent);

      // Ajouter le rôle de l'étudiant dans Firestore
      const rolesRef = collection(this.firestore, "roles");
      await setDoc(doc(rolesRef, newStudent.id), { role: 'student' });
      console.log("Rôle de l'étudiant ajouté avec succès.");

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

      // Redirection vers la page des détails de l'étudiant
      this.router.navigate(['/admin/referent/studentDetails', newStudent.id]);
      console.log("Redirection vers la page des détails de l'étudiant.");
    } catch (error: any) {
      console.error("Erreur lors de la création de l'étudiant :", error.message);
      alert(`Erreur : ${error.message}`);
    }
  }

  
  // fonctionne pour une  propriété class qui n'est pas un tableau class[] OK
  // updateStudentClass(id: string, trainingClass: string) {
  //   const $studentRef = doc(this.firestore, "students/" + id);
    
  //   updateDoc($studentRef, { class: trainingClass })
  //     .then(() => console.log("Document mis à jour avec succès"))
  //     .catch((error) => {
  //       if (error.code === "not-found") {
  //         console.error("Document non trouvé, assurez-vous qu'il existe");
  //       } else {
  //         console.error("Erreur de mise à jour :", error);
  //       }
  //     });
  // }


// ne sait  plus qour quoi ce test avait été ajouté - donc à virer a priori
  // async updateStudentClass(id: string, trainingClass: string) {
  //   const $studentRef = doc(this.firestore, "students/" + id);
  
  //   try {
  //     // Récupérer le document
  //     const docSnap = await getDoc($studentRef);
  
  //     if (docSnap.exists()) {
  //       // Obtenir la propriété `class` (si elle existe)
  //       const data = docSnap.data();
  //       let classArray: string[] = data['class'] || []; // Utilise un tableau vide si `class` est inexistant
  
  //       // Ajouter `trainingClass` si elle n'est pas déjà présente
  //       if (!classArray.includes(trainingClass)) {
  //         classArray.push(trainingClass);
  //       }
  
  //       // Mettre à jour le document
  //       await updateDoc($studentRef, { class: classArray });
  //       console.log("Document mis à jour avec succès");
  //     } else {
  //       // Si le document n'existe pas
  //       console.error("Document non trouvé, assurez-vous qu'il existe");
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors de la mise à jour :", error);
  //   }
  // }

  // pour gérer class comme un tableau dans students
  async updateStudentClass(id: string, trainingClass: string) {
    const $studentRef = doc(this.firestore, "students/" + id);
  
    try {
      // Récupérer le document
      const docSnap = await getDoc($studentRef);
  
      if (docSnap.exists()) {
        // Obtenir la propriété class (si elle existe)
        const data = docSnap.data();
        let classArray: string[] = data['class'] || []; // Initialise à un tableau vide si inexistant
  
        // Ajouter trainingClass si elle n'est pas déjà présente
        if (!classArray.includes(trainingClass)) {
          classArray.push(trainingClass);
        }
  
        // Mettre à jour le document
        await updateDoc($studentRef, { class: classArray });
        console.log("Document mis à jour avec succès :", classArray);
      } else {
        console.error("Document étudiant non trouvé, vérifiez l'ID :", id);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  }
  
  
  









}



