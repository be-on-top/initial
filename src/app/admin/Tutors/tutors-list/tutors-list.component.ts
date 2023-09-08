import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TutorsService } from '../../tutors.service';

@Component({
  selector: 'app-tutors-list',
  templateUrl: './tutors-list.component.html',
  styleUrls: ['./tutors-list.component.css']
})
export class TutorsListComponent {

  allUsers?: any
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  constructor(private router: Router, private service: TutorsService) {

  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allEvaluators=this.service.getTrainers(); devient donc nécessairement
    this.service.getTutors().subscribe(data => {
      console.log("data de getTrainers()", data)
      this.allUsers = data
      return this.allUsers
    })

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
