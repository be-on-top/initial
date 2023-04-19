import { Component } from '@angular/core';
import { Router } from '@angular/router';
// import { Trainers } from '../../evaluators';
import { TrainersService } from '../../trainers.service';

@Component({
  selector: 'app-trainers-list',
  templateUrl: './trainers-list.component.html',
  styleUrls: ['./trainers-list.component.css']
})
export class TrainersListComponent {


  allTrainers?: any
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  constructor(private router: Router, private service: TrainersService) {

  }

  ngOnInit(): void {
    this.getTrainers();
  }

  getTrainers() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allEvaluators=this.service.getTrainers(); devient donc nécessairement
    this.service.getTrainers().subscribe(data => {
      console.log("data de getTrainers()", data)
      this.allTrainers = data
      return this.allTrainers
    })

  }

  deleteTrainer(trainerid: string) {
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

