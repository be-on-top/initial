import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TutorsService } from '../../tutors.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-tutors-list',
  templateUrl: './tutors-list.component.html',
  styleUrls: ['./tutors-list.component.css']
})
export class TutorsListComponent {

  allUsers?: any
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  // si on partage ce composant avec un referent
  userRole: string | string[] | null = ""

  constructor(private router: Router, private service: TutorsService, private authService: AuthService) {

  }

  ngOnInit(): void {
    this.getUsers();

    this.authService.getCurrentUserRole().subscribe((role: any) => {
      this.userRole = role
      console.log('Role de l\'utilisateur :', this.userRole); // Vérification du rôle
    })
  }

  getUsers() {
    const adminUid = this.authService.getCurrentUserUid();

    this.service.getTutors().subscribe(data => {
      console.log("Données récupérées via getTutors()", data);

      if (this.userRole === 'referent') {
        this.allUsers = data.filter(tutor => tutor.referentUid === adminUid);
      } else {
        this.allUsers = data;
      }
    });
  }




  deleteUser(trainerid: string) {
    console.log(trainerid);

    this.service.deleteTutor(trainerid)
    this.router.navigate(['admin/tutors'])
    // .then(()=>{

    // })
    // .catch(()=>{

    // })
  }

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue
    console.log(this.searchText);
  }

}
