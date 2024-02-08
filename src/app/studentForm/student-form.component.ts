import { query } from '@angular/animations';
import { Component, OnInit, Directive, HostListener, } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { DocumentSnapshot, Firestore, addDoc, collection, doc, docData, getDocs, setDoc, where } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { getDoc } from 'firebase/firestore';
import { StudentsService } from 'src/app/admin/students.service';

@Component({
  selector: 'app-social-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})


export class StudentFormComponent implements OnInit {
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
  pieceIdentiteAJour: boolean = true;
  // demandeFinancement?: string = '';
  demandeFinancement: boolean | undefined;
  promesseEmbauche: boolean | null = null;
  // MoyenDeTransport: boolean | undefined;
  // MoyenDeTransport: boolean | undefined;
  // selectedOrientation?: string = '';
  // renouvellementPIEnCours: boolean = false;
  inscritPoleEmploi: boolean = false;
  numIdentifiantPoleEmploi: string = "";
  // nationaliteFrancaise: boolean =true;
  socialData: any = {};



  constructor(private router: Router, private service: StudentsService, private auth: Auth, private firestore: Firestore) { }


  async ngOnInit() {

    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.uid = user.uid
        // on récupère la data de l'utilisateur
        this.service.getStudentById(user.uid).subscribe(data => {
          console.log("userData from students 0...", data);
          this.userData = data
        })
        // on récupère la data de la collection SocialForm
        const docRef = doc(this.firestore, 'SocialForm', user.uid);

        docData(docRef).subscribe((data: any) => {
          this.socialData = data;
        });
      }
      else {
        console.log("Personne n'est authentifié actuellement !");
      }
    })


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


}
