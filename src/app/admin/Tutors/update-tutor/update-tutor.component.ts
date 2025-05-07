import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TutorsService } from '../../tutors.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../../students.service';
import { AuthService } from '../../auth.service';
import { UsersService } from '../../users.service';
import { Student } from '../../Students/student';

@Component({
  selector: 'app-update-tutor',
  templateUrl: './update-tutor.component.html',
  styleUrls: ['./update-tutor.component.css']
})

export class UpdateTutorComponent implements OnInit {

  userId: string = ""
  user: any = {}
  selectedSigles: string[] = []
  // pour affecter des étudiants à son compte
  studentsList: any = []

  // si on partage ce formulaire avec un referent, autaht aller récupérer le role directement en base
  userRole?: any
  cpArray: string[] = []
  adminUid?: any
  allStudents: any[] = [];

  searchText: string = ''; // Assurez-vous de définir la propriété searchText ici
  selectedStudent: string[] = []; // Déclarer en tant que tableau de chaînes

  constructor(private service: TutorsService,
    private ac: ActivatedRoute,
    private router: Router,
    private studentsService: StudentsService,
    private authService: AuthService,
    private userService: UsersService
  ) {

    // Récupérer l'UID de manière synchrone
    this.adminUid = this.authService.getCurrentUserUid();
    console.log('UID de l\'utilisateur authentifié dans le composant :', this.adminUid);
    // si j'utilise pas un attribut de route
    this.authService.getCurrentUserRole().subscribe(role => this.userRole = role)




  }

  ngOnInit(): void {
    this.userId = this.ac.snapshot.params["id"];
    // on fait appel à geTutor pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getTutor(this.userId).subscribe((data) => {
      // console.log("data depuis update-user component", data);
      this.user = data

      data.students ? this.selectedStudent = this.user.students : ""
    })

    // parce que j'ai besoin de récupérer la liste pour les affectations
    // this.studentsService.getStudents().subscribe((students) => {
    //   this.studentsList = students
    // })

    // si partage des affectations avec referent
    this.studentsService.getStudents().subscribe((students) => {
      this.allStudents = students
      // On peut maintenant utiliser cet UID pour d'autres opérations
      if (this.adminUid && this.userRole === 'referent') {
        // alert("referent")
        // on veut récupérer le cp[] du référent
        this.userService.getUser(this.adminUid).subscribe(data => {
          console.log("data du referent", data)
          console.log("this.cpArray", data.cp);
          this.cpArray = data.cp

          // on veut que seuls les étudiants dont le localTraining est inclu dans cp[] remontent dans la liste
          this.studentsList = students.filter(student =>
            student.localTraining && this.cpArray.includes(student.localTraining) && !student.endedSubscriptions
          )
        })


      } else {
        this.studentsList = students.filter(student =>
          // qu'il soit inscrit
          student.subscriptions &&
          // que la fin de formation ne soit pas actéé
          !student.endedSubscriptions
        )
      }

    })

  }

  updateUser(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form non valid');
      return
    }

    console.log("form update values", form.value);
    this.service.updateTutor(this.userId, form.value)
    // pour notifier le(s) candidat(s) concerné(s)
    // this.notificationsService.notifyStudent(form.value)
    // puis redirection
    this.router.navigate(['/admin/tutor', this.userId])
  }

  // pour affecation métiers
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }


  // la logique ci-dessous est inutile, pour tutor, une simple comparaison localtraining et cpArray était suffisante
  // getCentersAndSocialFormByUserId(userId: string) {

  //   this.studentsService.getCentersAndSocialFormByUserId(userId)
  //     .subscribe(returnedPriors => {
  //       console.log('ReturnedPriors:', returnedPriors);
  //       // Après avoir récupéré returnedPriors, on filtre la liste des étudiants
  //       this.studentsList = this.filterStudentsByPriorCenter(this.allStudents, returnedPriors);
  //       console.log('Filtered Students:', this.studentsList);
  //     })
  // }

  // filterStudentsByPriorCenter(students: Student[], returnedPriors: string[]): Student[] {
  //   return students.filter(student => returnedPriors.includes(student.id));
  // }

  delete(studentUid: string) {
    console.log('Student à supprimer :', studentUid);

    // Trouver l'index de l'étudiant correspondant
    const index = this.studentsList.findIndex((student: any) => student.id === studentUid);

    if (index !== -1) {
      // Supprimer l'étudiant du tableau
      this.studentsList.splice(index, 1);
      console.log('this.studentsList mis à jour :', this.studentsList);
    } else {
      console.log('Étudiant non trouvé dans la liste');
    }


    this.studentsService.deleteStudentFromTutor(this.userId, studentUid)

  }




}
