import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CentersService } from '../../centers.service';
import { Centers } from '../../centers';

@Component({
  selector: 'app-centers-list',
  templateUrl: './centers-list.component.html',
  styleUrls: ['./centers-list.component.css']
})
export class CentersListComponent {

  userRouterLinks: any;

  // ✅ Option 1 : initialiser comme tableau vide (jamais undefined)
  allCenters: Centers[] = [];
  
  searchText: string = '';

  // filtre : '' = tous, sinon 'partner'|'subsidiary'|'member'|'independent'
  selectedType: '' | 'partner' | 'subsidiary' | 'member' | 'independent' = '';

  centerTypes = [
    { value: '', label: 'Tous les centres' },
    { value: 'partner', label: 'Partenaires du réseau' },
    { value: 'subsidiary', label: 'Filiales du réseau' },
    { value: 'member', label: 'Adhérents du réseau' },
    { value: 'independent', label: 'Centres hors réseau' }
  ];

  filteredCenters: Centers[] = [];

  constructor(
    private router: Router,
    private service: CentersService,
    private activatedRoute: ActivatedRoute
  ) {
    this.userRouterLinks = this.activatedRoute.snapshot.data;
  }

  ngOnInit(): void {
    this.getCenters();
    // this.updateCentersWithId() // ponctuel si nécessaire
  }

  getCenters() {
    this.service.getCenters().subscribe(data => {
      console.log("data de getCenters()", data);
      this.allCenters = data;
      this.applyFilter(); // initialiser la vue
    });
  }

  deleteCenter(centerId: string) {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce centre ?');
    if (!confirmed) return;

    this.service.deleteCenter(centerId).then(() => {
      console.log('Centre supprimé avec succès');
      this.router.navigate(['/admin/centers']);
    }).catch(error => {
      console.error('Erreur lors de la suppression du centre:', error);
    });
  }

  disableCenter(centerId: string) {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir désactiver ce centre ?');
    if (!confirmed) return;

    this.service.disableCenter(centerId).then(() => {
      console.log('✅ Centre désactivé avec succès');
      alert('Le centre a bien été désactivé.');
      this.router.navigate(['/admin/centers']);
    }).catch(error => {
      console.error('❌ Erreur lors de la désactivation du centre :', error);
      alert('Une erreur est survenue lors de la désactivation du centre.');
    });
  }

  enableCenter(centerId: string) {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir réactiver ce centre ?');
    if (!confirmed) return;

    this.service.enableCenter(centerId).then(() => {
      console.log('✅ Centre réactivé avec succès');
      alert('Le centre a bien été réactivé.');
      this.router.navigate(['/admin/centers']);
    }).catch(error => {
      console.error('❌ Erreur lors de la réactivation du centre :', error);
      alert('Une erreur est survenue lors de la réactivation du centre.');
    });
  }

  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue;
    console.log(this.searchText);
  }

  async updateCentersWithId() {
    try {
      await this.service.addIdToExistingCenters();
      console.log('Mise à jour des centres réussie.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des centres:', error);
    }
  }

  applyFilter(): void {
    if (!this.selectedType) {
      this.filteredCenters = this.allCenters.slice();
      return;
    }

    // Sécurité : traite undefined comme false
    this.filteredCenters = this.allCenters.filter(
      (center: Centers) => !!(center as any)[this.selectedType]
    );
  }

}
