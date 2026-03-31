import { Component, Inject, OnInit } from '@angular/core';
import { CentersService } from '../admin/centers.service';
// import { CentersService } from '../centers/centers.service';
import { HttpClient } from '@angular/common/http'; // <-- Import nécessaire
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
Title



@Component({
  selector: 'app-centers-index',
  templateUrl: './centers-index.component.html',
  styleUrls: ['./centers-index.component.css']
})
export class CentersIndexComponent implements OnInit {

  partnerCenters: any[] = [];
  memberCenters: any[] = [];
  independentCenters: any[] = [];
  subsidiaryCenters: any[] = [];

  query: string = '';

  private canonicalTag: HTMLLinkElement | null = null;

  constructor(
    private centersService: CentersService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document // Injection pour la canonique
  ) { }

  ngOnInit(): void {

    // 1. Metas Manuelles Immédiates
    this.titleService.setTitle('BE-ON-TOP : Nos Centres de Formations Profesionnelles Experts');
    this.metaService.updateTag({
      name: 'description',
      content: "Avec BE-ON-TOP vous bénéficiez d'un réseau de centres de formation experts pour le suivi de vos formations personnalisées et des évaluations pédagogiques."
    });

        this.setPureCanonical();// Verrouillage de l'URL


    this.centersService.getCenters().subscribe(data => {
      // ÉTAPE TEMPORAIRE : On génère le dump dans la console
      // if (data && data.length > 0) {
      //   console.log("--- COPIEZ LE CONTENU CI-DESSOUS ---");
      //   console.log(JSON.stringify(data)); 
      //   console.log("--- FIN DU DUMP ---");
      // }
      const centers = data || [];
      this.groupCenters(centers);
    });
  }

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


  filteredCenters(centers: any[]): any[] {
    if (!this.query) {
      return centers;
    }
    const q = this.query.toLowerCase();
    return centers.filter(center =>
      center.name.toLowerCase().includes(q) ||
      (center.city && center.city.toLowerCase().includes(q)) ||
      (center.cp && center.cp.includes(q))
    );
  }

   /**
     * FORCE L'URL CANONIQUE PURE
     * Cette méthode sert de "bouclier" contre le Duplicate Content.
     * Elle garantit que Google n'indexe QUE l'URL officielle, même si l'utilisateur
     * arrive avec des paramètres de tracking (UTM, Facebook ID, Gclid, etc.).
     */
  setPureCanonical() {
    // 1. On définit l'URL "parfaite" (sans aucun paramètre après le ?)
    const pureUrl = 'https://be-on-top.io/centersIndex';

    // 2. On vérifie si une balise <link rel="canonical"> existe déjà dans le <head>
    // pour éviter d'en créer des dizaines à chaque navigation.
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");

    // 3. Si elle n'existe pas (première visite ou après un nettoyage OnDestroy)
    if (!link) {
      // On crée dynamiquement l'élément <link>
      link = this.document.createElement('link');
      // On lui donne son identité : c'est une balise "canonical"
      link.setAttribute('rel', 'canonical');
      // On l'injecte physiquement dans la partie <head> de la page
      this.document.head.appendChild(link);
    }

    // 4. On force l'attribut "href" avec notre URL propre.
    // Si une vieille URL traînait, elle est écrasée par celle-ci.
    link.setAttribute('href', pureUrl);

    // 5. On stocke cette balise dans une variable de classe (this.canonicalTag)
    // C'est CRUCIAL pour que le ngOnDestroy puisse la supprimer en quittant la page.
    this.canonicalTag = link;

    // 6. Petit log de contrôle pour vérifier que le bouclier est actif en console
    console.log(`[SEO-SHIELD] Canonical verrouillée sur : ${pureUrl}`);
  }

  
  ngOnDestroy(): void {
    try {
      if (this.canonicalTag) {
        this.document.head.removeChild(this.canonicalTag);
      }
      this.metaService.removeTag("name='description'");
      // this.metaService.removeTag("name='robots'");
      // this.metaService.removeTag("property='og:title'");
      // this.metaService.removeTag("property='og:description'");
      console.log('[SEO-CLEAN] Page Benefits nettoyée.');
    } catch (e) {
      console.warn('Erreur nettoyage Benefits');
    }
  }


}
