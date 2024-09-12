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
    // Demande de confirmation à l'utilisateur
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce centre ?');
    if (confirmed) {
      // Si l'utilisateur confirme, procéder à la suppression
      this.service.deleteCenter(centerId).then(() => {
        console.log('Centre supprimé avec succès');
        this.router.navigate(['/admin/centers']); // Naviguer vers la liste des centres
      }).catch((error) => {
        console.error('Erreur lors de la suppression du centre:', error);
        // Vous pouvez afficher un message d'erreur à l'utilisateur si nécessaire
      });
    }
    
  }
  

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue
    console.log(this.searchText);
  }

}



