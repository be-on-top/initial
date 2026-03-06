import { Component } from '@angular/core';
import { UsersService } from '../../users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { StudentsService } from '../../students.service';
import { Student } from '../../Students/student';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})

export class UpdateUserComponent {

  userId: any
  user: any = {}
  selectedSigles: string[] = []

  // pour affecter des étudiants à son compte
  studentsList: any = []
  mirorList: any = []
  filteredStudents: Student[] = []; // Liste des étudiants filtrée
  selectedStudent: string[] = []; // Déclarer en tant que tableau de chaînes
  allStudents: any[] = [];
  adminId: any

  // ... Autres propriétés et initialisation ...
  contactList: any[] = []


  cpArray: string[] = []

  constructor(private service: UsersService,
    private ac: ActivatedRoute,
    private router: Router,
    private studentService: StudentsService,
    private authService: AuthService
  ) {
    this.userId = this.ac.snapshot.params["id"];
    // on fait appel à getuser pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    // this.service.getUser(this.userId).subscribe((data) => {
    //   console.log("data from update-user component", data)
    //   this.user = data
    //   this.userId=data.id
    //   console.log("data depuis constructor", data)
    //   alert(data.id)
    // })

  }

  ngOnInit(): void {

    this.service.getUser(this.userId).subscribe((data) => {
      console.log("data depuis update-user component!!!!!!!!!", data)
      this.user = data

    })

    this.adminId = this.authService.getCurrentUserUid();

    // On peut maintenant utiliser cet UID pour d'autres opérations
    if (this.adminId) {
      this.service.getUser(this.adminId).subscribe(data => {
        this.cpArray = data.cp
        // alert(this.cpArray)     

      })

      // c'est l'uid de celui qu'on consulte ici !
      if (this.userId) {
        this.service.getUser(this.userId).subscribe((data) => {
          this.contactList = data.students?.filter((student: any) => student.trim() !== '') || [];
          // Stocker les étudiants assignés à l'utilisateur
          this.selectedStudent = this.contactList;

          // // Appel à `getStudents` après avoir obtenu `this.user.sigle`
          this.studentService.getStudents().subscribe((students) => {
            this.studentsList = students.filter(student =>
              // qu'il soit inscrit
              student.localTraining ? this.cpArray.includes(student.localTraining) : ''
            )
            this.mirorList = [...this.studentsList]
          })

        })
      }


    }

  }

  updateUser(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }
    console.log("form update values!!!!!!!", form.value);
    this.service.updateUser(this.userId, form.value)
    // this.service.updateUser(this.userId, form.value)
    // il faudra prévoir une redirection...
    const routerUser = this.user.role
    this.router.navigate([`/admin/${routerUser}`, this.userId])
  }



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


    this.service.deleteStudentFromUser(this.userId, studentUid)

  }

  // essai mais pas pertinent dans le context (?)
  // getCentersAndSocialFormByUserId(userId: string) {
  //   // Utiliser une méthode de service qui 
  //   // Récupère le document utilisateur dans la collection 'users' en fonction de l'ID de l'admin  
  //   // Si le champ CP est renseigné, on boucle sur chaque CP
  //   // Interroge la collection 'centers' pour chaque CP
  //   // Récupère les IDs des centres correspondant au CP
  //   // Interroge la collection 'socialForm' pour les centerIDs obtenus
  //   // Récupère les IDs des documents de la collection 'socialForm'

  //   this.studentService.getCentersAndSocialFormByUserId(userId)
  //     .subscribe(returnedPriors => {
  //       console.log('ReturnedPriors:', returnedPriors);
  //       // Après avoir récupéré returnedPriors, on filtre la liste des étudiants
  //       this.filteredStudents = this.filterStudentsByPriorCenter(this.allStudents, returnedPriors);
  //       console.log('Filtered Students:', this.filteredStudents);
  //     })

  // }

  //   filterStudentsByPriorCenter(students: Student[], returnedPriors: string[]): Student[] {
  //     return students.filter(student => returnedPriors.includes(student.id));
  //   }


}
