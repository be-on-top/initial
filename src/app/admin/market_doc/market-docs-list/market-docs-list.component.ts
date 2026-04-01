import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MarketDoc } from '../market-doc';
import { MarketingDocService } from '../marketing-doc.service';

@Component({
  selector: 'app-market-docs-list',
  templateUrl: './market-docs-list.component.html',
  styleUrls: ['./market-docs-list.component.css']
})
export class MarketDocsListComponent implements OnInit {


  // Liste des documents marketing à afficher dans le tableau
  marketingDocs: MarketDoc[] = [];

  constructor(
    private service: MarketingDocService, // Service CRUD Firestore + Storage
    private router: Router // Pour naviguer vers le formulaire
  ) {}

  ngOnInit(): void {
    // Récupération de tous les documents depuis Firestore
    this.service.getMarketingDocs().subscribe(docs => {
      this.marketingDocs = docs;
    });
  }

  /**
   * Navigation vers le formulaire en mode création
   */
  goToCreate(): void {
    this.router.navigate(['admin/marketing-doc-form']);
  }

  /**
   * Navigation vers le formulaire en mode édition
   * @param doc Le document sélectionné
   */
  onEdit(doc: MarketDoc): void {
    this.router.navigate(['/admin/marketing/edit', doc.id]);
  }

  /**
   * Suppression d'un document marketing
   * @param id Id du document Firestore
   * @param fileUrl URL du fichier dans Storage (optionnel)
   */
  onDelete(id: string, fileUrl?: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce document ?')) {
      this.service.deleteMarketingDoc(id, fileUrl)
        .then(() => {
          // Retirer le document supprimé de la liste locale
          this.marketingDocs = this.marketingDocs.filter(doc => doc.id !== id);
        })
        .catch((err:any) => {
          console.error('Erreur lors de la suppression :', err);
        });
    }
  }

}

  


