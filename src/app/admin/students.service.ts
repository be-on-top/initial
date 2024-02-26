import { Injectable } from '@angular/core';
// import { NgForm } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from "@angular/fire/auth";
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc, updateDoc, query, getDocs, where, getDoc } from '@angular/fire/firestore';
// import { FirebaseApp } from '@angular/fire/app';
import { Observable } from 'rxjs';
// import { switchMap, tap } from 'rxjs/operators';
import { Student } from './Students/student';
import { NgForm } from '@angular/forms';
import { Evaluation } from './evaluation';





@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  // private fullResults: { [key: string]: { duration: number; cost: number } }[] = [];

  constructor(private auth: Auth, private firestore: Firestore) { }

  // createStudent(studentForm: NgForm) {
  async createStudent(student: any) {
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
    }

    // const newStudent: any = {
    //   id: '', created: Date.now(), status: true, cp: '', details: '', ...student
    // };

    // // if (!student.email) {
    // //   console.error("Error: Email is missing");
    // //   return;
    // // }

    //  let userCredential=await createUserWithEmailAndPassword(this.auth, student.email, student.studentPw)
    //   // .then((userCredential) => {
    //     console.log("userCredential depuis le service", userCredential);
    //     // const user = userCredential.user;
    //     newStudent.id = userCredential.user.uid;
    //     newStudent.trainer = "Attribué ultérieurement"       
    //   // }).catch((error) => {
    //   //   const errorCode = error.code;
    //   //   const errorMessage = error.message;
    //   //   console.log(errorCode, errorMessage);
    //   // });

    let studentsRef = collection(this.firestore, "students");
    // delete newStudent.studentPw;
    // addDoc(studentsRef, newStudent).then(() => {
    setDoc(doc(studentsRef, newStudent.id), newStudent)
    // .then(() => {
    //   console.log("New student added successfully");
    // }).catch((error) => {
    //   console.error("Error adding student document: ", error);
    // });
    // enregistre dans Firestore d'autre part le role attribué dans une collection roles qui regroupera tous les roles de tous les utilisateurs avec comme idDoc uid d'authentification là aussi
    let $rolesRef = collection(this.firestore, "roles");
    // addDoc($trainersRef, newTrainer)
    setDoc(doc($rolesRef, newStudent.id), { role: 'student' })
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

  async activateSubscription(id:string, sigle:string){
    const studentRef = doc(this.firestore, "students/" + id)
    const updateStudent = {
      subscriptions: [sigle]
    }
    setDoc(studentRef, updateStudent, { merge: true })
  }


}