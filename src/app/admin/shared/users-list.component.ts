import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainersService } from '../trainers.service';
import { EvaluatorsService } from '../evaluators.service';

@Component({
  selector: 'app-users-list',
  templateUrl: 'users-list.component.html',
  // templateUrl: './trainers-list.component.html',
  // styleUrls: ['./trainers-list.component.css']
})
export class UsersListComponent {


  allUsers?: any
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  userDetails:any;

  // vous pouvez injecter le service ActivatedRoute pour accéder aux paramètres de route et déterminer quelle méthode doit être utilisée
  constructor(private router: Router, private service: TrainersService, private activatedRoute:ActivatedRoute) {
    this.userDetails = this.activatedRoute.snapshot.data;
    console.log("user to edit", this.userDetails);    
    console.log("user to edit", this.userDetails.details);    

  }


  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allEvaluators=this.service.getTrainers(); devient donc nécessairement
    this.service.getTrainers().subscribe(data => {
      console.log("data de getTrainers()", data)
      this.allUsers = data
      return this.allUsers
    })

  }

  deleteUser(trainerid: string) {
    console.log(trainerid);

    this.service.deleteTrainer(trainerid)
    this.router.navigate(['admin/trainers'])
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

