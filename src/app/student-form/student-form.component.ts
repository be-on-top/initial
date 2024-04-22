import { query } from '@angular/animations';
import { Component, OnInit, Directive, HostListener, Input, OnChanges, SimpleChanges, } from '@angular/core';
import { Auth, onAuthStateChanged, user } from '@angular/fire/auth';
import { DocumentSnapshot, Firestore, addDoc, collection, doc, docData, getDocs, setDoc, where } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { getDoc } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { StudentsService } from 'src/app/admin/students.service';
import { Student } from '../admin/Students/student';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})


export class StudentFormComponent implements OnInit, OnChanges {
  // authId?: any;
  // userData?: any;
  userData: any = {};
  uid: string = ""
  // @Input() firstName: string;
  // @Input() lastName: string;
  // @Input() email: string;
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  // champsDesactives: boolean = true;
  handicap: boolean = false;
  isValidID: boolean = true;
  // demandeFinancement?: string = '';
  requestFinancing: boolean | undefined;
  employmentPromise: boolean | null = null;
  // MoyenDeTransport: boolean | undefined;
  // MoyenDeTransport: boolean | undefined;
  // selectedOrientation?: string = '';
  // isRenewalIDinProgress: boolean = false;
  // isPoleEmploi: boolean = false;
  idPoleEmploi: string = "";
  // frenchNationality: boolean =true;
  socialData: any = {};


  @Input() studentData: any;
  isReadOnly: boolean = false;



  constructor(private router: Router, private service: StudentsService, private auth: Auth, private firestore: Firestore) { }


  async ngOnInit() {

    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.uid = user.uid

        this.isDocumentInStudentsCollection(user.uid).subscribe(isStudent => {
          console.log("un étudiant est authentifié !!!!!", isStudent)
          if (isStudent) { this.retrieveStudentProperties(user.uid) }
          // else {
          //   this.processNonStudentData(this.studentData)
          // }
        })
      }
      else {
        console.log("Personne n'est authentifié actuellement !");
      }
    })

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentData'] && this.studentData) {
      const studentData = this.studentData;
      console.log('studentData', studentData);

      if (studentData.id) {
        this.processNonStudentData(studentData);
      } else {
        console.log('ID not available in studentData');
      }
    }
  }




  async onSubmit(form: NgForm) {
    console.log("form value", form.value);

    // const socialFormData = form.value; 
    // if (form.value.MoyenDeTransport !== undefined) 

    // Cloner les données du formulaire pour éviter de modifier directement form.value
    const socialFormData = { ...form.value };

    // Nettoyer l'objet des champs undefined
    Object.keys(socialFormData).forEach(key => socialFormData[key] === undefined && delete socialFormData[key]);

    try {
      let enrollRef = collection(this.firestore, "SocialForm");
      await setDoc(doc(enrollRef, this.uid), socialFormData);
      // pour l'étudiant concerné
      let studentRef = collection(this.firestore, "students");
      // Mise à jour du document dans la collection "students"
      await setDoc(doc(studentRef, this.uid), { isSocialFormSent: true }, { merge: true });
      form.reset();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données: ', error);
    }


  }

  async onInputChange(fieldName: string, value: any) {
    try {
      let enrollRef = collection(this.firestore, "SocialForm");

      // Enregistrement des données dans la collection "SocialForm"
      await setDoc(doc(enrollRef, this.uid), { [fieldName]: value }, { merge: true });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données: ', error);
    }
  }

  isDocumentInStudentsCollection(documentId: string): Observable<boolean> {
    const docRef = doc(this.firestore, 'students', documentId);

    return from(getDoc(docRef)).pipe(
      map(snapshot => snapshot.exists())
    )
  }

  retrieveStudentProperties(user: string) {
    console.log('user properties from user authentified!!!!!', user);

    // on récupère la data de l'utilisateur
    this.service.getStudentById(user).subscribe(data => {
      console.log("userData from students 0...", data);
      this.userData = data
    })
    // on récupère la data de la collection SocialForm
    const docRef = doc(this.firestore, 'SocialForm', user);

    docData(docRef).subscribe((stData: any) => {
      stData ? this.socialData = stData : ''
      // stData?alert(stData):''

    })

  }

  processNonStudentData(studentDataRetrived: Student) {
    console.log('user properties from parent StudentData', studentDataRetrived);

    if (studentDataRetrived && studentDataRetrived.id) {
      const docRef = doc(this.firestore, 'SocialForm', studentDataRetrived.id);
      docData(docRef).subscribe((data: any) => {
        this.socialData = data;
      });
      this.userData = studentDataRetrived
      this.isReadOnly = true
    } else {
      console.error('ID not available in studentDataRetrived');
    }
  }



}
