import { Injectable } from '@angular/core';
// import { NgForm } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from "@angular/fire/auth";
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc, updateDoc, query, getDocs, where } from '@angular/fire/firestore';
// import { FirebaseApp } from '@angular/fire/app';
import { Observable } from 'rxjs';
// import { switchMap, tap } from 'rxjs/operators';
import { Student } from './Students/student';
import { NgForm } from '@angular/forms';





@Injectable({
  providedIn: 'root'
})
export class StudentsService {

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
    alert(scoreCounter)

    let $studentRef = doc(this.firestore, "students/" + id);

    if (hasStartedEvaluation === true) {
      // alert('hasStartedEvaluation ! ')
      const updatedTableauObjets = studentCompetences.map((obj: any) => {
        console.log("evaluatedCompetence reçue par le service", evaluatedCompetence)

        console.log(isIncremented)
        console.log(isDecremented)
        console.log(numberOfPoints);
        

        if (evaluatedCompetence in obj && isIncremented == true && isDecremented==false) {
          return { ...obj, [evaluatedCompetence]: Number(obj[evaluatedCompetence]) + Number(numberOfPoints) }
        }
        // on le rajoute pour décrémenter LA compétence si compteurs réinitialisés parce que TOUTES les réponses ont été cochées !!!!
        if (evaluatedCompetence in obj && isIncremented == false && isDecremented == true) {
          return { ...obj, [evaluatedCompetence]: Number(obj[evaluatedCompetence]) - Number(numberOfPoints) }
        }
        if (evaluatedCompetence in obj && isIncremented == false && isDecremented==false) {
          return { ...obj, [evaluatedCompetence]: Number(obj[evaluatedCompetence]) + Number(0) }
        }
        return obj;

      })
      let updateStudent = { scoreCounter: scoreCounter, lastIndexQuestion: indexQuestion, tradeEvaluated: trade, studentCompetences: updatedTableauObjets }
      updateDoc($studentRef, updateStudent)

    } else {
      alert('has NOT startedEvaluation ! ')

      // alert("on attend toujours")
      // let updateStudent = { scoreCounter: scoreCounter, lastIndexQuestion: indexQuestion, tradeEvaluated: trade, studentCompetences }
      // updateDoc($studentRef, updateStudent);

    }



  }

}