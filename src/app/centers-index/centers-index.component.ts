import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CentersService } from '../admin/centers.service';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-centers-index',
  templateUrl: './centers-index.component.html',
  styleUrls: ['./centers-index.component.css']
})
export class CentersIndexComponent implements OnInit, OnDestroy {

  // Tableaux typés pour la répartition par catégories (Optimise le rendu HTML)
  partnerCenters: any[] = [];
  memberCenters: any[] = [];
  independentCenters: any[] = [];
  subsidiaryCenters: any[] = [];

  // Chaîne liée au champ de recherche (ngModel)
  query: string = '';

  // Référence vers la balise canonical pour gestion dynamique
  private canonicalTag: HTMLLinkElement | null = null;

  // Contrôle l'affichage du spinner et stabilise le CLS (Cumulative Layout Shift)
  isLoading: boolean = true; 

  constructor(
    private centersService: CentersService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document // Accès au DOM pour le SEO technique
  ) { }

  ngOnInit(): void {
    // 1. SEO - Injection immédiate des métadonnées (évite l'indexation sans description)
    this.titleService.setTitle('BE-ON-TOP : Nos Centres de Formations Professionnelles Experts');
    this.metaService.updateTag({
      name: 'description',
      content: "Avec BE-ON-TOP vous bénéficiez d'un réseau de centres de formation experts pour le suivi de vos formations personnalisées et des évaluations pédagogiques."
    });

    // 2. SEO - Verrouillage de l'URL pour éviter le Duplicate Content
    this.setPureCanonical();

    // 3. Récupération des données via le service
    this.centersService.getCenters().subscribe({
      next: (data) => {
        const centers = data || [];
        this.groupCenters(centers); // Répartition logique des données
        this.isLoading = false;      // Arrêt du spinner : déclenche l'affichage du contenu
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des centres :", err);
        this.isLoading = false;      // Évite de bloquer l'utilisateur sur le spinner en cas d'erreur
      }
    });
  }

  /**
   * Ventile les centres dans leurs catégories respectives.
   * Cette séparation permet un maillage interne (Bot) clair et structuré dans le template.
   */
  private groupCenters(centers: any[]): void {
    this.partnerCenters = [];
    this.memberCenters = [];
    this.independentCenters = [];
    this.subsidiaryCenters = [];

    centers.forEach(center => {
      if (center.partner) {
        this.partnerCenters.push(center);
      } else if (center.subsidiary) {
        this.subsidiaryCenters.push(center);
      } else if (center.independent) {
        this.independentCenters.push(center);
      } else {
        this.memberCenters.push(center);
      }
    });
  }

  /**
   * Filtrage dynamique pour la barre de recherche.
   * @param centers - Le tableau de centres à filtrer
   * @returns Le tableau filtré selon la 'query' (nom, ville ou CP)
   */
  filteredCenters(centers: any[]): any[] {
    if (!this.query) return centers;
    const q = this.query.toLowerCase();
    return centers.filter(center =>
      center.name.toLowerCase().includes(q) ||
      (center.city && center.city.toLowerCase().includes(q)) ||
      (center.cp && center.cp.includes(q))
    );
  }

  /**
   * Gestion de la balise Canonical.
   * Empêche l'indexation d'URLs avec paramètres (ex: tracking ads) pour protéger le jus SEO.
   */
  setPureCanonical() {
    const pureUrl = 'https://be-on-top.io/centersIndex';
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', pureUrl);
    this.canonicalTag = link;
    console.log(`[SEO-SHIELD] Canonical verrouillée sur : ${pureUrl}`);
  }

  /**
   * Cycle de vie de destruction : Nettoie le DOM pour les pages suivantes.
   * Évite les conflits de balises Meta et Canonical lors de la navigation SPA.
   */
ngOnDestroy(): void {
  try {
    // 1. On NE supprime PAS la canonique pour éviter le "trou noir" SEO.
    // Elle sera écrasée proprement par le prochain composant via setPureCanonical().

    // 2. On nettoie la description pour éviter les textes incohérents dans Google.
    this.metaService.removeTag("name='description'");

    console.log('[SEO-CLEAN] Meta Description nettoyée, Canonical maintenue pour continuité.');
  } catch (e) {
    console.warn('Erreur lors du nettoyage SEO');
  }
}
}