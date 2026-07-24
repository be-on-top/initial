import { Component, OnInit, OnDestroy, AfterViewInit, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-market-app',
  templateUrl: './market-app.component.html',
  styleUrls: ['./market-app.component.css']
})
export class MarketAppComponent implements OnInit, AfterViewInit, OnDestroy {
  // On stocke la balise pour pouvoir la supprimer proprement
  private canonicalTag: HTMLLinkElement | null = null;
  private scriptElement: HTMLScriptElement | null = null;

  paragraphs: string[] = [
    "...en réunissant organismes de formation, entreprises, spécialistes de l'intérim et partenaires de l'accompagnement",
    "...en restituant, par métier et compétences, les durées préconisées selon le niveau chacun",
    "...en privilégiant smartphones, tablettes et interactivité entre apprenants, formateurs et conseillers",
    "...en confiant à des experts, la conception d'outils d'évaluation, en phase avec les entreprises",

  ];

  currentIndex: number = 0;

  constructor(
    private metaService: Meta,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document // Indispensable pour toucher au <head>,

  ) { }

  ngOnInit(): void {
    this.addTag();
    this.setPureCanonical(); // Verrouillage de l'URL
    this.injectSoftwareSchema();
  }

  // FORCE L'URL PROPRE (Supprime les UTM et paramètres de tracking pour Google)
  setPureCanonical() {
    const pureUrl = 'https://be-on-top.io/market-app'; // Remplace par ton URL exacte

    // On cherche si une balise existe déjà
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

  ngAfterViewInit(): void {
    // @ts-ignore (si bootstrap n'est pas typé)
    const myCarousel = document.querySelector('#demo');
    if (myCarousel) {
      // @ts-ignore
      const carousel = new bootstrap.Carousel(myCarousel, {
        interval: 9000,
        ride: 'carousel'
      });
      setTimeout(() => { carousel.cycle(); }, 1000);
      myCarousel.addEventListener('slide.bs.carousel', (event: any) => {
        this.currentIndex = event.to;
      });
    }
  }

  addTag() {
    this.titleService.setTitle(`Mieux qu'un bilan de compétences, évaluez les compétences professionnelles avec BE-ON-TOP.io`);
    this.metaService.updateTag({ name: 'description', content: 'Mieux qu\'un bilan de compétences, nos questionnaires permettent d\'évaluer un niveau d\'entrée en formation...' });

    // On utilise updateTag plutôt que addTag pour éviter les doublons
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ property: 'og:title', content: 'Informations Prescripteurs | BE-ON-TOP.io' });
    this.metaService.updateTag({ property: 'og:description', content: 'Des questionnaires conçus par des experts métiers...' });
  }

  // NETTOYAGE CHIRURGICAL
  ngOnDestroy(): void {
    try {
      // 1. On retire la balise canonique pour que la page suivante n'en hérite pas
      // if (this.canonicalTag) {
      //   this.document.head.removeChild(this.canonicalTag);
      // }

      // 2. On vide les metas pour éviter la pollution
      // this.metaService.removeTag("name='description'");
      // this.metaService.removeTag("name='robots'");
      // this.metaService.removeTag("property='og:title'");
      // this.metaService.removeTag("property='og:description'");

      console.log('[SEO-CLEAN] Page Prescripteurs nettoyée.');
    } catch (e) {
      console.warn('Erreur lors du nettoyage SEO');
    }

    // Nettoyage : on retire la balise quand on quitte le composant
    if (this.scriptElement && this.document.head.contains(this.scriptElement)) {
      this.document.head.removeChild(this.scriptElement);
    }

  }





  injectSoftwareSchema() {
    // 1. Création de la balise script pour le JSON-LD
    this.scriptElement = this.document.createElement('script');
    this.scriptElement.type = 'application/ld+json';

    // 2. Définition du schéma SoftwareApplication adapté à notre écosystème
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'BE-ON-TOP',
      'applicationCategory': 'EducationalApplication', // Ou BusinessApplication selon votre cible
      'operatingSystem': 'All',
      'description': 'Application PWA d\'évaluation sémantique et de positionnement initial des candidats en amont de la formation professionnelle. Gère l\'individualisation des parcours, le suivi des compétences en présentiel, le tutorat en entreprise et le sourcing pour les recruteurs.',
      // Ici, on s'efforce de verrouiller les fonctionnalités clés pour éviter les erreurs de la Communication
      'featureList': [
        'Évaluation initiale et positionnement des candidats en amont de la formation',
        'Ingénierie de parcours personnalisés (optimisation des coûts et de la durée)',
        'Suivi des compétences professionnelles en présentiel',
        'Suivi et évaluation des acquis en tutorat d\'entreprise',
        'Accès back-office pour les prescripteurs, financeurs et réseaux de centres de formation',
        'Mise à disposition des profils de compétences qualifiés pour les recruteurs'
      ],

      // On peut lier l'organisation (votre marque) pour faire le pont sémantique
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://be-on-top.io/#organization', // Identifiant sémantique unique de la marque mère
        'name': 'BE-ON-TOP', 
        'url': 'https://be-on-top.io'
      }
    };

    // 3. Injection du JSON dans la balise et insertion dans le <head>
    this.scriptElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.scriptElement);
  }





}