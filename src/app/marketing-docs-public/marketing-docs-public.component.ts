import { Component, OnInit } from '@angular/core';
import { MarketingDocService } from '../admin/market_doc/marketing-doc.service';
import { MarketDoc } from '../admin/market_doc/market-doc';

@Component({
  selector: 'app-marketing-docs-public',
  templateUrl: './marketing-docs-public.component.html'
})
export class MarketingDocsPublicComponent implements OnInit {

  marketingDocs: MarketDoc[] = [];
  isLoading = true;

  constructor(private service: MarketingDocService) {}

  ngOnInit(): void {
    this.service.getMarketingDocs().subscribe(docs => {
      // Tri par date décroissante (plus récent en haut)
      this.marketingDocs = docs.sort((a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );

      this.isLoading = false;
    });
  }

/**
 * Vérifie si l'URL fournie correspond à un fichier image
 * Supporte les extensions : .png, .jpg, .jpeg
 * @param url - URL du fichier à vérifier (optionnelle)
 * @returns true si l'URL correspond à une image, false sinon
 */
isImage(url?: string): boolean {
  // Si l'URL est undefined ou null, on retourne false directement
  if (!url) return false;

  // Convertit l'URL en minuscules pour éviter les problèmes avec .JPG ou .PNG
  const lower = url.toLowerCase();

  // Vérifie si l'URL contient l'une des extensions d'image
  // `includes` est utilisé au lieu de `endsWith` car l'URL Firebase peut finir par des paramètres
  // Exemple : ?alt=media&token=xxxx
  return lower.includes('.png') || lower.includes('.jpg') || lower.includes('.jpeg');
}

}