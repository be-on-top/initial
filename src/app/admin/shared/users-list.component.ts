import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainersService } from '../trainers.service';
import { EvaluatorsService } from '../evaluators.service';
import { UsersService } from '../users.service';
import { TutorsService } from '../tutors.service';
import { ExternalsService } from '../externals.service';

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

  userRouterLinks: any;
  title?: string
  linkToDetails: string = ""
  linkBackToList: string = ""

  // vous pouvez injecter le service ActivatedRoute pour accéder aux paramètres de route et déterminer quelle méthode doit être utilisée
  constructor(private router: Router, private sTrainer: TrainersService, private sUsers: UsersService, private sEvaluator: EvaluatorsService, private sTutor: TutorsService, private sExternal: ExternalsService, private activatedRoute: ActivatedRoute) {
    this.userRouterLinks = this.activatedRoute.snapshot.data;
    // console.log("user to edit", this.userRouterLinks);
  }


  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire

    // on voit qu'on peut boucler sur la même data pour aller chercher dans des tables (collections) différentes le résultat de allUsers pour le repasser à la vue ! 
    // ça fonctionne plutôt bien donc. mais je préfère quand même à ce stade avoir un composant par catégorie d'utilisateur... 

    if (this.userRouterLinks.user == "trainer") {
      this.title = "Formateurs"
      this.linkToDetails = "/admin/trainer"
      this.linkBackToList = "admin/trainers"
      this.sTrainer.getTrainers().subscribe(data => {
        console.log("data de getTrainers()", data)
        this.allUsers = data
        return this.allUsers
      }
      )
    } else if (this.userRouterLinks.user == "evaluator") {
      this.title = "Evaluateurs"
      this.linkToDetails = "/admin/evaluator"
      this.linkBackToList = "/admin/evaluators"
      this.sEvaluator.getEvaluators().subscribe(data => {
        console.log("data de getTrainers()", data)
        this.allUsers = data
        return this.allUsers
      })
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "referents") {
      this.title = "Référents Administratifs"
      this.linkToDetails = "/admin/referent"
      this.linkBackToList = "/admin/referents"
      this.sUsers.getUsers().subscribe(data => {
        console.log("data de getUers pour admin()", data)
        this.allUsers = data.filter(user => user.role == 'referent')
        return this.allUsers
      })
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "editors") {
      this.title = "Contributeurs"
      this.linkToDetails = "/admin/editor"
      this.linkBackToList = "/admin/editors"
      this.sUsers.getUsers().subscribe(data => {
        console.log("data de getUsers for editor()", data)
        this.allUsers = data.filter(user => user.role == "editor")
        return this.allUsers
      })
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "externals") {
      this.title = "Observateurs Externes"
      this.linkToDetails = "/admin/external"
      this.linkBackToList = "admin/editors"
      // this.sExternal.getExternals().subscribe(data => {
      //   console.log("data de getExternals()", data)
      //   this.allUsers = data
      //   return this.allUsers
      // })
      this.sUsers.getUsers().subscribe(data => {
        console.log("data de getUsers for external()", data)
        this.allUsers = data.filter(user => user.role == "external")
        return this.allUsers
      })
    }
    else if (this.userRouterLinks.user == "tutor") {
      this.title = "Tuteurs"
      this.linkToDetails = "/admin/tutor"
      this.linkBackToList = "/admin/tutors"
      this.sTutor.getTutors().subscribe(data => {
        console.log("data de getTutors()", data)
        this.allUsers = data
        return this.allUsers
      })
    }


  }

  deleteUser(userId: string) {
    // console.log(trainerid);
    if (this.userRouterLinks.user == "admin") {    

    this.sUsers.deleteUser(userId)
    // this.router.navigate([this.linkBackToList]);
    }

    else if (this.userRouterLinks.user == "trainer") {      
      this.sTrainer.deleteTrainer(userId)
    }
    else if (this.userRouterLinks.user == "tutor") {      
      this.sTutor.deleteTutor(userId)
    }
    else if (this.userRouterLinks.user == "evaluator") {      
      this.sEvaluator.deleteEvaluator(userId)
    }
    else if (this.userRouterLinks.user == "external") {      
      this.sExternal.deleteExternal(userId)
    }
    // else if (this.userRouterLinks.user == "editor") {      
    //   this.sEditor.deleteUser(userId)
    // }
    this.router.navigate([this.linkBackToList]);
  }


  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue
    console.log(this.searchText);
  }

}

