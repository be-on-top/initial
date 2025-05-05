import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainersService } from '../../trainers.service';
import { StudentsService } from '../../students.service';
// import { getToken, getMessaging } from '@firebase/messaging';
import { PushNotificationService } from 'src/app/push-notification.service';
import { SettingsService } from '../../settings.service';
import { AuthService } from '../../auth.service';
import { Trainer } from '../../trainer';
import { CentersService } from '../../centers.service';
import { UsersService } from '../../users.service';
import { Centers } from '../../centers';
import { Trade } from '../../trade';
import { Student } from '../../Students/student';

@Component({
  selector: 'app-update-trainer',
  templateUrl: './update-trainer.component.html',
  styleUrls: ['./update-trainer.component.css']
})
export class UpdateTrainerComponent implements OnInit {
  userId: any
  user: any = {}
  selectedSigles: string[] = []
  // pour affecter des étudiants à son compte
  studentsList: any = []
  // pour le champs de recherche à intégrer au select
  searchText: string = ''; // Assurez-vous de définir la propriété searchText ici
  selectedStudent: string[] = []; // Déclarer en tant que tableau de chaînes
  // ... Autres propriétés et initialisation ...
  trainersList: any[] = []
  // pour récupérer côté composant l'uid dont on va avoir besoin pour le changement de paradigme...
  userUid: string | null = '';

  // tradesData?: Trade[]=[]
  // si on se contente de récupérer le sigle
  tradesData?: string[] = []

  trainerStudents: any = []

  // pour différencier la vue si user trainer
  userRouterLinks: any

  mirorList: any = []



  constructor(
    private service: TrainersService,
    private ac: ActivatedRoute,
    private router: Router,
    private studentsService: StudentsService,
    private settingsService: SettingsService,
    // private authService: AuthService,
    // private trainerService: TrainersService,
    // private centersService: CentersService,
    // private usersService: UsersService,
    private notificationsService: PushNotificationService
  ) {
    this.userId = this.ac.snapshot.params["id"];
    this.userRouterLinks = this.ac.snapshot.data;
  }

  ngOnInit(): void {
    // Appel à `getTrainer` pour récupérer les données de l'utilisateur
    this.service.getTrainer(this.userId).subscribe((data) => {
      console.log("data depuis update-user component!!!!!!!!!", data)
      this.user = data

      // this.trainerStudents = data.students
      // fixing error on console
      // this.trainerStudents = Array.isArray(data.students) ? data.students : [];
      this.trainerStudents = data.students?.filter((student: any) => student.trim() !== '') || [];
      // Stocker les étudiants assignés à l'utilisateur
      // this.selectedStudent = this.user.students
      this.selectedStudent = this.trainerStudents;


      // Transformer le champ `cp` en chaîne de caractères

      // this.user.cp = data.cp.join(', ')
      // fixing erreur en console
      this.user.cp = Array.isArray(data.cp) ? data.cp.join(', ') : '';



      // Appel à `getStudents` après avoir obtenu `this.user.sigle`
      this.studentsService.getStudents().subscribe((students) => {
        this.studentsList = students.filter(student =>
          // qu'il soit inscrit
          student.subscriptions &&
          // que le tableau de ses inscriptions contienne un des métiers du formateur
          student.subscriptions.some(subscription => this.user.sigle.includes(subscription))
          // que le tableau du formateur contienne le localTraining candidat
          // &&   this.user.cp.includes(student['localTraining'])
          && this.user.cp.includes(student.localTraining)
          // que la fin de formation ne soit pas actéé
          && !student.endedSubscriptions
        )
        this.mirorList = [...this.studentsList]
      })
    })


    // essai > a été transféré à la liste trainersList component...
    // Récupérer l'UID de manière synchrone
    // this.userUid = this.authService.getCurrentUserUid();
    // console.log('UID de l\'utilisateur authentifié dans le composant :', this.userUid);
    // // On peut maintenant utiliser cet UID pour d'autres opérations
    // if (this.userUid) {
    //   this.getTrainersWithSameCp(this.userUid)
    // }


    // essai pour récupérer une liste des métiers 
    this.settingsService.getTrades().subscribe(trades => {
      trades.forEach(trade => this.tradesData?.push(trade.sigle))
    })

  }



  delete(studentUid: string) {
    console.log('Student à supprimer :', studentUid);

    // Copie de l'état initial de selectedStudent (si tu veux garder l'original)
    const initialSelectedStudents = [...this.selectedStudent];

    const index = this.mirorList.findIndex((student: any) => student.id === studentUid);

    if (index !== -1) {
      // Supprime l'étudiant de studentsList
      this.studentsList.splice(index, 1);
      console.log('this.studentsList mis à jour :', this.studentsList);

      // Supprime l'UID de selectedStudent, sans toucher au reste de la liste
      this.selectedStudent = initialSelectedStudents.filter((id: string) => id !== studentUid);
      console.log('this.selectedStudent :', this.selectedStudent);

    } else {
      console.log('Étudiant non trouvé dans la liste');
    }
  }

  
  
 updateUser(form: NgForm) {
    if (!form.valid) {
      console.log('form non valid');
      return;
    }
  
    // Sécurité : on aligne form.value.students sur selectedStudent
    form.value.students = this.selectedStudent;
  
    console.log('form update values', form.value);
  
    this.service.updateTrainer(this.userId, form.value);
  
    this.userRouterLinks.user === 'referent'
      ? this.router.navigate(['/admin/referent/trainerDetails', this.userId])
      : this.router.navigate(['/admin/trainer', this.userId]);
  }  
  


  // pour affecation métiers
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }




alertMessage: string | null = null;

onStudentSelect(selectedIds: string[]) {
  selectedIds.forEach((studentId: string) => {
    const student = this.mirorList.find((s: Student) => s.id === studentId);
    if (student && student.trainers && student.trainers.length > 0 && !this.trainerStudents.includes(student.id)) {
      this.alertMessage = `L'étudiant ${student.firstName} ${student.lastName} a déjà un formateur.`;
    }
  });
}





}


