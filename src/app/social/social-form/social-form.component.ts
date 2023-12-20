import { query } from '@angular/animations';
import { Component, OnInit,  Directive, HostListener,  } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, addDoc, collection, doc, getDocs, setDoc, where } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentsService } from 'src/app/admin/students.service';

@Component({
  selector: 'app-social-form',
  templateUrl: './social-form.component.html',
  styleUrls: ['./social-form.component.css']
})


export class SocialFormComponent implements OnInit {
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
  // pieceIdentiteAJour: boolean = true;
  // demandeFinancement?: string = '';
  demandeFinancement: boolean | undefined;
  // promesseEmbauche: boolean | null = null;
  promesseEmbauche: boolean | undefined;
  MoyenDeTransport: boolean | undefined;
  // selectedOrientation?: string = '';
  // renouvellementPIEnCours: boolean = false;
  inscritPoleEmploi: boolean = false;
  numIdentifiantPoleEmploi: string = "";
  nationaliteFrancaise:boolean | undefined;

  constructor(private router: Router, private service: StudentsService, private auth: Auth, private firestore: Firestore) { }

  ngOnInit() {

    onAuthStateChanged(this.auth, (user: any) => {

      if (user) {
        this.service.getStudentById(user.uid).subscribe(data => {
          console.log("userData from students 0...", data);
          this.userData = data
        })
      }
    })


    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.uid = user.uid
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
