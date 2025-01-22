import { Component, OnInit } from '@angular/core';
import { TrainersService } from '../../trainers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../../students.service';
import { forkJoin, Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';
// import { StudentDetailsComponent } from '../../Students/student-details/student-details.component';
// import { pipe } from 'rxjs';



@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.css']
})

export class TrainerDetailsComponent implements OnInit {
  userId: any;
  user: any
  studentsList?: any = []

  isReferent: boolean = false;

  private trainerSubscription: Subscription = new Subscription();  // Abonnement pour le formateur
  private studentsSubscriptions: Subscription[] = [];  // Tableau pour les abonnements des étudiants

    // pour différencier la vue si user trainer
    userRouterLinks:any




  constructor(private service: TrainersService, private ac: ActivatedRoute, private router: Router, private studentsService: StudentsService, private authService:AuthService) {
    // this.userId = this.ac.snapshot.params["id"];
    this.ac.snapshot.params["id"]?this.userId = this.ac.snapshot.params["id"]:this.userId=this.authService.getCurrentUserUid();
    this.userRouterLinks = this.ac.snapshot.data;
    

  }

  // fonctionne  bien mais doublons dans le rendu après génère doublons
  // async ngOnInit(): Promise<void> {
  //   // this.getFullIdentity(this.user.students)
  //   this.service.getTrainer(this.userId)
  //     .subscribe(data => {
  //       console.log("data de getTrainer", data);
  //       this.user = data
  //       console.log('element!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', this.user.students)
  //       // option concluante 
  //       if (this.user.students) {
  //         let list: any = [];
  //         for (let student of this.user.students) {
  //           // console.log('ce que je récupère getLinkedStudentName', this.service.getLinkedStudentName(student));
  //           this.service.getLinkedStudentName(student).subscribe(dataStudent => list.push(dataStudent.lastName))
  //         }
  //         this.studentsList = list
  //       }

  //     })


  //   // Vérifier si l'utilisateur authentifié est un référent
  //   this.isReferent = await this.service.isCurrentUserReferent();
  //   console.log("Est-ce un référent ?", this.isReferent);

  // }




  async ngOnInit(): Promise<void> {
    // On récupère les données du formateur
    this.service.getTrainer(this.userId).subscribe(data => {
      console.log("data de getTrainer", data);
      this.user = data;
      console.log('élément des étudiants:', this.user.students);

      // Vérification si des étudiants sont associés au formateur
      if (this.user.students) {
        let list: string[] = [];

        // On attend que tous les abonnements des étudiants soient terminés
        this.user.students.forEach((student: any, index: number) => {
          this.service.getLinkedStudentName(student).subscribe(dataStudent => {
            // list.push(dataStudent.lastName);
            list.push(dataStudent.lastName + " " + dataStudent.firstName);

            // Quand tous les abonnements sont terminés, on met à jour studentsList
            if (list.length === this.user.students.length) {
              // Utilisation de Set pour supprimer les doublons
              this.studentsList = [...new Set(list)];
              console.log('Liste des étudiants sans doublons:', this.studentsList);
            }
          });
        });
      }
    });

    // Vérifier si l'utilisateur authentifié est un référent
    this.isReferent = await this.service.isCurrentUserReferent();
    console.log("Est-ce un référent ?", this.isReferent);
  }


  // Méthode séparée pour récupérer les noms des étudiants
  private async getStudentNames(students: string[]): Promise<string[]> {
    const studentPromises = students.map(studentId =>
      this.service.getLinkedStudentName(studentId).toPromise()
    );
    const studentData = await Promise.all(studentPromises);
    return studentData.map(dataStudent => dataStudent.lastName);
  }




  deleteUser(userId: string) {
    console.log(userId);
    this.service.deleteTrainer(userId)
    this.router.navigate(['/admin/trainers'])
  }

  ngOnDestroy(): void {
    this.studentsList = []

  }

}
