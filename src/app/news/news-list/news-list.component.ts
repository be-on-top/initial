import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Inject } from '@angular/core'; // 👈 Ajout de Inject
import { DOCUMENT } from '@angular/common'; // 👈 Important pour accéder proprement au DOM sous Angular
import { Title, Meta } from '@angular/platform-browser'; // 👈 Les services natifs d'Angular pour le SEO
import { NewsService } from '../news.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { News } from '../news';
import { AuthService } from 'src/app/admin/auth.service';

// Déclaration pour éviter les erreurs TypeScript avec Bootstrap global
declare var bootstrap: any;

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css']
})
export class NewsListComponent implements OnInit, AfterViewInit {

  news$: Observable<News[]> = this.newsService.getPublished();
  userRole: string = "";

  @ViewChild('socialCarousel') carouselElement!: ElementRef;

  socialCards = [
    { name: 'Facebook', url: 'https://www.facebook.com/beontop.io', icon: 'bi-facebook', description: 'Rejoignez-nous sur Facebook.' },
    { name: 'Linkedin', url: 'https://www.linkedin.com/company/be-on-top-io/posts/?feedView=all', icon: 'bi-linkedin', description: 'Suivez-nous sur Linkedin.' },
    { name: 'Instagram', url: 'https://www.instagram.com/be_on_top.io/', icon: 'bi-instagram', description: 'Découvrez nos photos sur Instagram.' }
  ];

  constructor(
    private newsService: NewsService,
    private authService: AuthService,
    private titleService: Title, // 👈 Service Title
    private metaService: Meta,   // 👈 Service Meta
    @Inject(DOCUMENT) private document: Document // 👈 Injection du Document pour la balise canonique
  ) { }

  ngOnInit(): void {
    // 1️⃣ Configuration des Meta-données et de l'URL Canonique pour la liste
    this.setMetaData();

    // 2️⃣ Chargement des données d'authentification et des articles
    this.news$ = this.authService.getCurrentUserRole().pipe(
      switchMap(userInfo => {
        if (userInfo === 'editor') {
          this.userRole = 'editor';
          return this.newsService.getAll();
        } else {
          this.userRole = '';
          return this.newsService.getPublished();
        }
      })
    );
  }

  /**
   * Configure dynamiquement les balises SEO indispensables pour la page liste
   */
  private setMetaData(): void {
    const title = "Le Magazine de la Formation sur Mesure - Be-On-Top";
    const description = "Articles, retours d'expérience et analyses d'experts sur l'évaluation en amont et la personnalisation des parcours de formation sur mesure.";
    const canonicalUrl = "https://beontop.io/news"; // 👈 Remplacer par ton vrai nom de domaine si besoin

    // A. Titre de l'onglet
    this.titleService.setTitle(title);

    // B. Balises Meta (Standard et Réseaux Sociaux / Open Graph)
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });

    // C. Injection / Mise à jour propre de la balise Canonique dans le Head
    let canonicalLink = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    } else {
      canonicalLink = this.document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
      this.document.head.appendChild(canonicalLink);
    }
  }

  stripHtml(text: string): string {
    if (!text) return '';
    const div = this.document.createElement('div');
    div.innerHTML = text;
    const images = div.getElementsByTagName('img');
    while (images.length) {
      images[0].remove();
    }
    return div.textContent || '';
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.carouselElement && typeof bootstrap !== 'undefined') {
        const carousel = new bootstrap.Carousel(this.carouselElement.nativeElement, {
          interval: 3000,
          ride: 'carousel'
        });
      }
    }, 2000);
  }
}