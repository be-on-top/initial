import { query } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, addDoc, collection, getDocs, where } from '@angular/fire/firestore';
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
  uid:string=""
  // @Input() firstName: string;
  // @Input() lastName: string;
  // @Input() email: string;
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  champsDesactives: boolean = true;
  handicap?: string = 'non';
  pieceIdentiteAJour?: string = 'oui';
  demandeFinancement?: string = '';
  promesseEmbauche?: string = '';
  MoyenDeTransport?: string = '';
  selectedOrientation?: string = '';
  renouvellementPIEnCours?: string = 'non';
  inscritPoleEmploi: boolean = false;
  numIdentifiantPoleEmploi: string = "";

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


    // onAuthStateChanged(this.auth, (user: any) => {
    //   if (user) {
    //     this.authId = user.uid
    //     this.service.getStudentById(user.uid).subscribe();
    //     console.log("UID: ", user.uid);
    //     console.log("Email: ", user.email);
    //     this.getDocsByParam(this.authId)
    //   }
    //   else {
    //     console.log("Personne n'est authentifié actuellement !");
    //   }
    // })
  }
  // async getDocsByParam(uid: string) {
  //   const myData = query(collection(this.firestore, 'students'), where('id', '==', uid));
  //   const querySnapshot = await getDocs(myData);
  //   querySnapshot.forEach((doc) => {
  //     console.log(doc.id, ' => ', doc.data());
  //     this.userData = doc.data()
  //     // Assignez les valeurs récupérées aux propriétés correspondantes
  //     this.firstName = this.userData.firstName;
  //     this.lastName = this.userData.lastName;
  //     this.email = this.userData.email;
  //     console.log("this.userData", this.userData);
  //   });
  // }

  async onSubmit(form: NgForm) {
    console.log("form value", form.value);

    const socialFormData = form.value; // Copie des valeurs du formulaire

    try {
      // Ajoutez le nouvel objet à la collection "SocialForm" dans Firestore
      // const docRef = await addDoc(collection(this.firestore, 'SocialForm'), socialFormData);
      // console.log('Document ID: ', docRef.id);

      // form.reset();
      // this.router.navigate(['/']);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données: ', error);
    }
  }




}
