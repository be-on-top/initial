import { Component, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { TrainersService } from '../../trainers.service';
import { Student } from '../../Students/student';
import { ActivatedRoute } from '@angular/router';
import { TutorsService } from '../../tutors.service';

@Component({
  selector: 'app-students-list',
  templateUrl: './my-students.component.html',
  styleUrls: ['./my-students.component.css']
})
export class MyStudentsComponent implements OnInit {


  myStudents: Student[] = [];
  user?: any
  userLastName: string = ""
  // va falloir revoir ce que j'avais fait à l'époque...
  // en attendant, pour afficher un message contextuel si désactivé : 
  userStatus?:boolean

  // essai pour différencier le tuteur du formateur
  userRouterLinks: any
  userTrades: string[] = [];

  constructor(private service: StudentsService, private auth: Auth, private trainerService: TrainersService, private tutorService: TutorsService, private route: ActivatedRoute) {
    this.userRouterLinks = this.route.snapshot.data;
  }

  ngOnInit() {

    onAuthStateChanged(this.auth, (user: any) => {
      // impeccable
      // console.log("this.user dispensé par onAuthStateChanged", this.auth.currentUser);
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user.uid
        console.log('utilisateur authentifié', this.user)

        // pour vérifier au préalable si c'est un tuteur ou pas
        if (this.userRouterLinks.user == 'tutor') {

          // alert("c'est un tutor ! ")
          this.tutorService.getTutor(user.uid).subscribe(data => {


            // console.log("userData from myStudents 0...", data)
            console.log("userData lastName from myStudents...", data.lastName)
            this.userLastName = data.lastName
            this.userStatus = data.status
            // on ne devrait plus utiliser cette propriété pour tutor
            // this.userTrades= data.sigle
            // console.log('trades récupérés pour tutor', this.userTrades= data.sigle);

            // et maintenant qu'on a le lastName
            this.service.getStudents().subscribe(students => {
              students.filter((student): any => {
                student['tutor'] && student['tutor'].includes(this.userLastName) ? this.myStudents.push(student) : ''
              })

              console.log('this.myStudents filtré avec trainer', this.myStudents)
            })

          })


        }

        if (this.userRouterLinks.user == 'trainer'){
          // alert("c'est un trainer ! ")

          // pour récupérer le nom de l'utilisateur authentifié, mais faudra changer ça :
          this.trainerService.getTrainer(user.uid).subscribe(data => {
            console.log("data", data);

            if (data) {
              console.log("userData from myStudents 0...", data)
              console.log("userData lastName from myStudents...", data.lastName)
              this.userLastName = data.lastName
              this.userStatus = data.status
              this.userTrades= data.sigle
              console.log('trades récupérés pour trainer', this.userTrades= data.sigle);
              

              // et maintenant qu'on a le lastName
              // this.service.getStudents().subscribe(students => {
              //   students.filter((student): any => {
              //     console.log('student qu\'on essaie de filtrer', student.trainer)
              //     student.trainer.includes(this.userLastName) ? this.myStudents.push(student) : ''
              //     // c'est là qu'on va pouvoir chercher à faire coexister le meilleur des 2 mondes !!!!
              //   })
              //   console.log('this.myStudents filtré avec trainer', this.myStudents)
              // })

              // nouvelle méthode optimisée à terme OK :
              // this.service.getStudents().subscribe(students => {
              //   // Filtrer les étudiants dont le formateur correspond à l'utilisateur connecté
              //   this.myStudents = students.filter((student): any => {
                  
              //     // Vérifie si le champ legacy 'trainer' (string) contient le nom du formateur
              //     const hasLegacyMatch = student.trainer && student.trainer.includes(this.userLastName);
              
              //     // Vérifie si le nouveau champ 'trainers' (tableau) contient le nom du formateur
              //     const hasArrayMatch = Array.isArray(student.trainers) && student.trainers.includes(this.userLastName);
              
              //     // On garde l'étudiant s'il correspond à l'un des deux cas
              //     return hasLegacyMatch && hasArrayMatch;
              //   });
              
              //   // Affichage pour contrôle
              //   console.log('this.myStudents filtré avec trainer(s)', this.myStudents);
              // });
              // fin méthode optimisée à terme...

              this.service.getStudents().subscribe(students => {
                const filtered: any[] = [];
              
                students.forEach((student: any) => {
                  // Vérifie si l'étudiant a un formateur 'trainer' dont le nom de famille correspond au formateur authentifié
                  const hasLegacyMatch = student.trainer && student.trainer.includes(this.userLastName);
              
                  // Vérifie si l'étudiant a un formateur dans 'trainers' dont le nom de famille correspond au formateur authentifié
                  const hasArrayMatch = Array.isArray(student.trainers) && student.trainers.some((trainer:any) => trainer.includes(this.userLastName));
              
                  // Si l'étudiant correspond à l'un des critères, on l'ajoute au tableau filtré
                  if (hasLegacyMatch || hasArrayMatch) {
                    filtered.push(student);
                  }
                });
              
                // Créer un Set pour éliminer les doublons basés sur l'id de l'étudiant
                const seen = new Set();
                
                // Filtrer les doublons dans le tableau 'filtered' en utilisant l'id de l'étudiant
                this.myStudents = filtered.filter(student => {
                  // Si l'id de l'étudiant a déjà été vu, on le supprime du tableau
                  if (seen.has(student.id)) return false;
                  // Sinon, on ajoute son id au Set et on garde l'étudiant dans le tableau
                  seen.add(student.id);
                  return true;
                });
              
                // Affichage pour contrôle, montrant les étudiants filtrés et sans doublon
                console.log('this.myStudents avec trainer et/ou trainers, sans doublon', this.myStudents);
              });  
                           

            } else {

              // c'est que c'est un  admin
              this.service.getStudents().subscribe(students => {
                // et là, ne filtrer que ceux qui ont des évaluations
                students.filter((student): any => {
                  console.log('student qu\'on essaie de filtrer', student.trainer)
                  student.evaluations ? this.myStudents.push(student) : ''
                })

                console.log("this.myStudents sans filtres", this.myStudents)
              })
            }

          })

        }

      }


      // getStudents() {
      //   this.service.getStudents().subscribe(students => {
      //     this.myStudents = students.filter((student): any => {
      //       student.trainer = this.userLastName
      //     })

      //     console.log(this.myStudents)
      //   })
      // }

    })

  }

}
