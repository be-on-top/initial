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
import { SettingsService } from '../admin/settings.service';
import { CentersService } from '../admin/centers.service';
import { Centers } from '../admin/centers';

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
  sentCompanyEmployee: boolean | null = null
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

  // tradesData?: any
  tradesEvaluated: Array<any> = [];
  priorTrade:string=''

  // on ne peut pas savoir si un quizz est terminé sans interroger tous les quizz, 
  // ce qu'on ne veut pas côté template, donc on crée un bolean
  isOneQuizzAchieved: boolean = false;

  relatedCenters: any = []

  isLoading: boolean = false;  // Initialiser l'indicateur de chargement
  errorMessage: string = '';   // Pour stocker le message d'erreur

  dataFiltered:Centers[]=[]

  constructor(
    private router: Router, 
    private service: StudentsService, 
    private auth: Auth, 
    private firestore: Firestore, 
    private settingsService: SettingsService,
  private centersService:CentersService) { }


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

    // pour récupérer les métiers (sigles) enregistrés en base une fois studentData mis à jour :
    // this.settingsService.getTrades().subscribe(data => {
    //   this.tradesData = data;
    //   console.log("this.tradesData", this.tradesData)
    // })




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
      this.router.navigate(['/account'], { queryParams: this.userData.id });
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
      this.processStudentData();
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

  processStudentData(): void {

    // Logique pour obtenir tradesEvaluated + accessoirement documents
    this.tradesEvaluated = [];
    for (const key in this.userData) {
      if (key.includes('quizz')) {
        this.tradesEvaluated.push(key.replace('quizz_',''));
        console.log('this.tradesEvaluated', this.tradesEvaluated);
      }
    }

    // Logique pour récupérer isOneQuizzAchieved
    // const achievedArray: any[] = [];
    // for (const item of this.tradesEvaluated) {
    //   if (this.userData[item].fullResults) {
    //     achievedArray.push(item);
    //     this.isOneQuizzAchieved = true;
    //   }
    // }

   // logique pour gérer les selects si un seul quizz terminé
   this.tradesEvaluated.length===1?(this.dataFiltered=this.tradesEvaluated, this.checkIfSelected(this.tradesEvaluated[0])):''
   console.log('dataFiltered si unique', this.dataFiltered);
   


  }



  // checkIfSelected(sigle: any) {
  //   console.log(sigle);
  //   this.priorTrade = sigle



  //   // c'est l'endroit pour récupérer la liste des centres qui contiennent sigle dans leur tableau sigles
  //   // puis boucler dessus pour extraire le cp de chacun
  //   this.centersService.getCenters().subscribe(data => {
  //     console.log('data dans checkIfSelected', data);
      
  //     this.dataFiltered = data.filter(reducedData => {
  //       // tous les console log sont corrects !!!
  //       console.log("sigle de comparaison", sigle);
        
  //       console.log("reducedDat!!!!!", reducedData.sigles);
  //       console.log(reducedData.sigles.includes(sigle));
  //       return reducedData.sigles.includes(sigle)
  //     });

  //     console.log(this.dataFiltered);
      

      


  //     // attention : c'est la différence avec prior-form, on ne veut pas afficher les 20 premières questions dans le dénombre
  //     // for (let n of dataFiltered) {
  //     //   // console.log("n.number", n.number);
  //     //   this.registryNumbers.push(n.number)
  //     //   // Triez les numéros dans l'ordre croissant
  //     //   this.registryNumbers.sort((a, b) => a - b);
  //     //   this.numbers = this.numbers.filter(element => element != n.number)
  //     //   // console.log("result", this.numbers);
  //     // }

  //   })
  // }

  // checkIfSelected(sigle: string) {
  //   console.log("Sigle sélectionné :", sigle);
  //   this.priorTrade = sigle;
  
  //   // Récupération des centres contenant le sigle sélectionné
  //   this.centersService.getCenters().subscribe(data => {
  //     console.log('Data récupérée dans checkIfSelected:', data);
      
  //     // Filtrage des centres basés sur le sigle
  //     this.dataFiltered = data.filter(center => {
  //       console.log("Centre retourné :", center);
  //       console.log("Sigles du centre :", center.sigles);
  //       return center.sigles.includes(sigle);
  //     });
  
  //     console.log("Données filtrées :", this.dataFiltered);
  //   });
  // }

  checkIfSelected(sigle: string) {
    console.log("Sigle sélectionné :", sigle);
    this.priorTrade = sigle;
    
    // Début du chargement
    this.isLoading = true;

    // Récupération des centres contenant le sigle sélectionné
    this.centersService.getCenters().subscribe({
      next: (data) => {
        console.log('Data récupérée dans checkIfSelected:', data);
        
        // Filtrage des centres basés sur le sigle
        this.dataFiltered = data.filter(center => center.sigles.includes(sigle));
        console.log("Données filtrées :", this.dataFiltered);
        
        // Arrêter le chargement dès que les données sont chargées
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des centres:', err);
        this.isLoading = false;  // Arrêter le chargement en cas d'erreur
      }
    });
  }
  



  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }


}
