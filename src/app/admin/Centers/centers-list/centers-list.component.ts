import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CentersService } from '../../centers.service';

@Component({
  selector: 'app-centers-list',
  templateUrl: './centers-list.component.html',
  styleUrls: ['./centers-list.component.css']
})
export class CentersListComponent {

  userRouterLinks: any;

  allCenters?: any
  // on le prépare à recevoir un terme de recherche
  searchText: string = ''


  constructor(private router: Router, private service: CentersService, private activatedRoute:ActivatedRoute) {
    this.userRouterLinks = this.activatedRoute.snapshot.data;
  }

  ngOnInit(): void {
    this.getCenters();
  }

  getCenters() {
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allCenters=this.service.get(); devient donc nécessairement
    this.service.getCenters().subscribe(data => {
      console.log("data de getCenters()", data)
      this.allCenters = data
      return this.allCenters
    })

  }

  deleteCenter(centerId: string) {
    console.log(centerId);

    this.service.deleteCenter(centerId)
    this.router.navigate(['/centers'])
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



