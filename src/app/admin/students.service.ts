import { Injectable } from '@angular/core';
// import { NgForm } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from "@angular/fire/auth";
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc} from '@angular/fire/firestore';
// import { FirebaseApp } from '@angular/fire/app';
import { Observable } from 'rxjs';
// import { switchMap, tap } from 'rxjs/operators';
import { Student } from './Students/student';



@Injectable({
  providedIn: 'root'
})
export class StudentsService {

  constructor(private auth: Auth, private firestore: Firestore) { }

  // createStudent(studentForm: NgForm) {
  createStudent(student:any) {
    const newStudent: any = {
      id: '', created: Date.now(), roles: 'student', status: true, cp: '', details: '', ...student
    };

    if (!student.email) {
      console.error("Error: Email is missing");
      return;
    }

    createUserWithEmailAndPassword(this.auth, student.email, student.studentPw)
      .then((userCredential) => {
        const user = userCredential.user;
        newStudent.id = user.uid;

        const studentsRef = collection(this.firestore, "students");
        delete newStudent.studentPw;
        addDoc(studentsRef, newStudent).then(() => {
          console.log("New student added successfully");
        }).catch((error) => {
          console.error("Error adding student document: ", error);
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }


  getStudents() {
    const studentsRef = collection(this.firestore, "students");
    return collectionData(studentsRef, { idField: "id" }) as Observable<Student[]>;
  }

  getStudentById(studentId: string) {
    const studentRef = doc(this.firestore, 'students/' + studentId);
    return docData(studentRef, { idField: 'id' }) as Observable<Student>;
  }

  async deleteStudent(student: Student): Promise<void> {
    try {
      if (this.auth.currentUser) {
        await this.auth.currentUser.delete(); // Utilisation de await pour attendre la fin de la suppression de compte avant de continuer
        console.log('Compte utilisateur auth supprimé.');
      }
  
      const studentRef = doc(this.firestore, 'students', student.id);
      try {
        await deleteDoc(studentRef);
        console.log(`Student with id=${student.id} deleted from firebase successfully`);
      } catch (error) {
        console.error(`Error deleting student from firebase with id=${student.id}: `, error);
      }
    } catch (error) {
      console.error('Error deleting user account:', error);
    }
  }

  updateStudent(id: string, student: Student) {
    let $studentRef = doc(this.firestore, "students/" + id);
    setDoc($studentRef, student);
  }
  
}