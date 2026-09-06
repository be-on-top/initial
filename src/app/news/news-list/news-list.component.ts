import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { NewsService } from '../news.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { News } from '../news';
import { AuthService } from 'src/app/admin/auth.service';

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
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document,
    private ngZone: NgZone, // 👈 Ajout ici
  ) { }

  ngOnInit(): void {
    this.setMetaData();

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

  private setMetaData(): void {
    const title = "Le Magazine de la Formation sur Mesure - Be-On-Top";
    const description = "Articles, retours d'expérience et analyses d'experts sur l'évaluation en amont et la personnalisation des parcours de formation sur mesure.";
    const canonicalUrl = "https://beontop.io/news";

    this.titleService.setTitle(title);

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });

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

  /**
   * Nettoyage purement textuel sans interaction avec le DOM
   * Supprime les balises HTML via Regex pour ne pas bloquer le thread principal.
   */
  // stripHtml(text: string): string {
  //   if (!text) return '';
  //   return text.replace(/<[^>]*>?/gm, '').trim();
  // }
  stripHtml(text: string): string {
    if (!text) return '';

    const withoutTags = text.replace(/<[^>]*>?/gm, '');

    const textarea = this.document.createElement('textarea');
    textarea.innerHTML = withoutTags;

    return textarea.value
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     if (this.carouselElement && typeof bootstrap !== 'undefined') {
  //       const carousel = new bootstrap.Carousel(this.carouselElement.nativeElement, {
  //         interval: 3000,
  //         ride: 'carousel'
  //       });
  //     }
  //   }, 2000);
  // }

  ngAfterViewInit() {
    // Sort le carrousel du cycle de détection d'Angular
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.carouselElement && typeof bootstrap !== 'undefined') {
          new bootstrap.Carousel(this.carouselElement.nativeElement, {
            interval: 3000,
            ride: 'carousel'
          });
        }
      }, 1000);
    });
  }

  formatTitle(title: string): string {
    return title.replace(/\s+([:;!?])/g, '\u00A0$1');
  }

  truncate(text: string, maxLength: number = 210): string {
    const cleanText = this.stripHtml(text);

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    const truncated = cleanText.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return truncated.slice(0, lastSpace) + '...';
  }

}