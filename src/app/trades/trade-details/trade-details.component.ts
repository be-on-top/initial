import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, docData, doc } from '@angular/fire/firestore';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Student } from 'src/app/admin/Students/student';
import { AuthService } from 'src/app/admin/auth.service';
import { SettingsService } from 'src/app/admin/settings.service';
import { StudentsService } from 'src/app/admin/students.service';
import { Trade } from 'src/app/admin/trade';
import { Location } from '@angular/common';


@Component({
  selector: 'app-trade-details',
  templateUrl: './trade-details.component.html',
  styleUrls: ['./trade-details.component.css']
})
export class TradeDetailsComponent implements OnInit {

  // si on passe effectivement des paramètres au router au lieu de faire un input 
  tradeId: string = ""
  tradeData!: Trade
  firstValuesSum: number = 0

  // il va falloir forcément user et userData pour la gestion des quizz
  studentId?: string
  studentData?: Student
  hasStartedEvaluation: boolean = false
  isEvaluationCompleted: boolean = false
  userRole: string = ""
  // pour charger l'image associée si image
  imageUrl: string = ''; // Pour stocker l'URL de l'image
  imageUrlReduced: string = ''; 

  offline: boolean = false


  constructor(
    private service: SettingsService, 
    private ac: ActivatedRoute, 
    private auth: Auth, 
    // private authService: AuthService, 
    private studentService: StudentsService, 
    private firestore: Firestore, 
    public sanitizer: DomSanitizer, 
    private location: Location,
    private titleService:Title
  ) {
    this.offline = !navigator.onLine
  }

  ngOnInit(): void {
    // this.tradeId = this.ac.snapshot.params["id"]
    this.ac.paramMap.subscribe(params => {
      this.tradeId = params.get('id') ?? ''
      // Faire quelque chose avec this.tradeId ici si online
      if (!this.offline) {
        // 1 récupération du doc en ligne
        this.service.getSigle(this.tradeId).subscribe(data => {
          console.log("metier récupéré via le paramètre de route", data)
          this.tradeData = data

          // Pour extraire et additionner les premières valeurs des tableaux associés aux clés spécifiques dans l'objet tradeData.durations, vous pouvez utiliser TypeScript avec Angular de la manière suivante :  
          const keysToExtractFrom = Object.keys(this.tradeData.durations)
          this.firstValuesSum = keysToExtractFrom.reduce((sum, key) => {
            const valuesArray = this.tradeData.durations[key]
            if (valuesArray && valuesArray.length > 0) {
              sum += valuesArray[0]
            }
            return sum;
          }, 0)

          console.log("Sum of first values:", this.firstValuesSum)
        })

        // 2 récupérer l'image en ligne
        
    // Charge les URLs des deux versions de l'image
    this.service.loadImage(this.tradeId).then(({ originalUrl, resizedUrl }) => {
      this.imageUrl = originalUrl;
      this.imageUrlReduced = resizedUrl;
    }).catch((error) => {
      if (error.code === 'storage/object-not-found') {
        console.log('Aucune image n\'a encore été ajoutée.');
      } else {
        console.error('Erreur lors du chargement de l\'image', error);
      }
    });

  

      } else if (this.offline) {

        alert("offline")
        // 1 pour ouvrir la base indexedDB et récupérer le doc sauverdé :
        const openRequest = window.indexedDB.open('my-database');
        // Pour gérer les évènements à l'ouverture de la base
        openRequest.onsuccess = (event) => {
          const db = openRequest.result;
          const transaction = db.transaction('sigles', 'readonly');
          const objectStore = transaction.objectStore('sigles');
          const getOneRequest = objectStore.get(this.tradeId);

          // alert(this.tradesData)

          // Traite les données récupérées ici depuis base de données indexée my-database
          getOneRequest.onsuccess = (event) => {
            console.log("métier récupéré depuis indexedDB")
            this.tradeData = getOneRequest.result
            // Pour extraire et additionner les premières valeurs des tableaux associés aux clés spécifiques dans l'objet tradeData.durations, vous pouvez utiliser TypeScript avec Angular de la manière suivante :  
            const keysToExtractFrom = Object.keys(this.tradeData.durations)
            this.firstValuesSum = keysToExtractFrom.reduce((sum, key) => {
              const valuesArray = this.tradeData.durations[key]
              if (valuesArray && valuesArray.length > 0) {
                sum += valuesArray[0]
              }
              return sum;
            }, 0)

            console.log("Sum of first values:", this.firstValuesSum);

          }

        } // fin de la requête indexedDB

        // pour récupérer l'image locale si image locale
        this.imageUrl = `../../assets/${this.tradeId}.jpeg`

      }


      onAuthStateChanged(this.auth, (user: any) => {
        if (user) {
          this.studentId = user.uid
          this.studentService.getStudentById(user.uid).subscribe((data) => {
            this.studentData = data
            // alert(JSON.stringify(this.studentData!['quizz_' + this.tradeId].scoreCounter))
            this.studentData && this.studentData!['quizz_' + this.tradeId] ? this.hasStartedEvaluation = true : this.hasStartedEvaluation = false;
            console.log('this.hasStartedEvaluation', this.hasStartedEvaluation);
            this.studentData && this.studentData['quizz_' + this.tradeData.sigle] && this.studentData['quizz_' + this.tradeData.sigle].fullResults ? this.isEvaluationCompleted = true : this.isEvaluationCompleted = false;

          })

          // quant à savoir qui est qui et quel est son rôle
          // soit on l'a reçu en paramètre, soit on ne l'a pas et faut faire une vérification dans la collection roles

          if (this.ac.snapshot.params["userRole"]) {
            this.userRole = this.ac.snapshot.params["userRole"]
          } else {
            this.getRole(user.uid).subscribe(data => {
              console.log("data de l'utilisateur depuis header", data);
              // si on a un tableau de rôles, c'est data.role[0]
              this.userRole = data.role
              // console.log("roles depuis header", data.role);

            })

          }
        }
        else {

          this.userRole = "none"

          // alert("pour commencer un quizz, vous identifier ou vous créer un compte !!!!")
        }


      })


      // alert(this.hasStartedEvaluation)


      // fin ac.paramMap.subscribe
    })

    // Mettre à jour le titre de la page
    this.titleService.setTitle(`Formation ${this.tradeId }: compétences métier et emploi`)

  }



  getRole(id: any) {
    // finalement, compte tenu du fait que les evaluators peuvent potentiellement aussi être des tuteurs (formateurs) roles sera un tableau
    // au niveau de getRole, cela ne change pas grand chose
    let $roleRef = doc(this.firestore, "roles/" + id)
    return docData($roleRef) as Observable<any>;

  }

  backToPrevious() {
    this.location.back();
  }

  isDescriptionCollapsed: boolean = true;
  isCPCollapsed: boolean = true;

  toggleDescriptionCollapse() {
    this.isDescriptionCollapsed = !this.isDescriptionCollapsed;
    !this.isDescriptionCollapsed && this.isCPCollapsed ? this.toggleCPCollapse() : ''

  }

  toggleCPCollapse() {
    this.isCPCollapsed = !this.isCPCollapsed;
    // !this.isDescriptionCollapsed?this.isCPCollapsed:''
    !this.isDescriptionCollapsed && this.isCPCollapsed ? this.toggleDescriptionCollapse() : ''

  }


}
