import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Evaluators } from '../../evaluators';
import { EvaluatorsService } from '../../evaluators.service';

@Component({
  selector: 'app-evaluators-list',
  templateUrl: './evaluators-list.component.html',
  // templateUrl: '../../shared/users-list.component.html',
  styleUrls: ['./evaluators-list.component.css']
})

export class EvaluatorsListComponent implements OnInit {
  allUsers?: any
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''


  constructor(private router: Router, private service: EvaluatorsService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allEvaluators=this.service.getEvaluators(); devient donc nécessairement
    this.service.getEvaluators().subscribe(data => {
      console.log("data de getEvaluators()", data)
      this.allUsers = data
      return this.allUsers
    })

  }

  deleteUser(userId: string) {
    console.log(userId);

    this.service.deleteEvaluator(userId)
    this.router.navigate(['/evaluators'])
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
