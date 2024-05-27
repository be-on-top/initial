import { Injectable } from '@angular/core';
// import { NgForm } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, deleteUser, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithRedirect } from "@angular/fire/auth";
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc, updateDoc, query, getDocs, where, getDoc, QuerySnapshot } from '@angular/fire/firestore';
// import { FirebaseApp } from '@angular/fire/app';
import { Observable } from 'rxjs';
// import { switchMap, tap } from 'rxjs/operators';
import { Student } from './Students/student';
import { NgForm } from '@angular/forms';
import { Evaluation } from './evaluation';
import { Analytics, setUserId } from "@angular/fire/analytics";
import { Router } from '@angular/router';





@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  // private fullResults: { [key: string]: { duration: number; cost: number } }[] = [];

  constructor(private auth: Auth, private firestore: Firestore, private analytics: Analytics, private router: Router) { }

  // createStudent(studentForm: NgForm) {
  async createStudent(student: any) {

    // Vérifier si currentUser est défini
    if (this.auth.currentUser && this.auth.currentUser.email) {
      // Récupérer l'email de l'administrateur
      const adminEmail = this.auth.currentUser.email;
      // const actualRoute = this.router.url


      // let newEvaluator = { id: Date.now(), ...evaluator };
      let newStudent = { created: Date.now(), status: true, trainer: "Attribué ultérieurement", ...student };
      // on va lui affecter un password aléatoire en fonction de la date
      // let password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
      // juste le temps du test, let password sera le même pour tous : password
      let password = "password"

      // enregistrement en base dans fireAuth d'une part : 
      const result = await createUserWithEmailAndPassword(this.auth, student.email, password);

      if (result && result.user) {
        // const { uid, emailVerified } = this.result.user;
        newStudent.id = result.user.uid
        delete newStudent.studentPw;

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

        // envoie un mail de réinitialisation du mot de passe
        await sendPasswordResetEmail(this.auth, student.email)
          .then((result) => {
            // Password reset email sent!
            console.log("result sentPasswordReset", result)

          })
          .catch((error) => {
            // const errorCode = error.code;
            const errorMessage = error.message;
            return errorMessage
            // ..
          });

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

  async register(student: any) {
    alert(student.studentPw)
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


  getStudents() {
    const studentsRef = collection(this.firestore, "students");
    return collectionData(studentsRef, { idField: "id" }) as Observable<Student[]>;
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

    try {
      if (this.auth.currentUser) {
        await this.auth.currentUser.delete();
        console.log('Compte utilisateur auth supprimé.');
      }

    } catch (error) {
      console.log(error);

    }

    // try {
    //   await deleteDoc(studentRef);
    //   console.log(`Student with id=${student.id} deleted from firebase successfully`);
    // } catch (error) {
    //   console.error(`Error deleting student from firebase with id=${student.id}: `, error);
    // }

  }

  updateStudent(id: string, student: any) {
    // let $studentRef = doc(this.firestore, "students/" + id);
    // setDoc($studentRef, student);
    let $studentRef = doc(this.firestore, "students/" + id);
    updateDoc($studentRef, student);
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

  async activateSubscription(id: string, sigle: any) {
    const studentRef = doc(this.firestore, "students/" + id)
    const updateStudent = {
      subscriptions: sigle
    }
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






}