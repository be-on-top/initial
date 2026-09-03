import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../news.service';
import { News } from '../news';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-news-details',
  templateUrl: './news-details.component.html',
  styleUrls: ['./news-details.component.css']
})
export class NewsDetailsComponent implements OnInit, OnDestroy {

  news: News | null = null;
  private newsSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      const fullUrl = `https://be-on-top.io/news/${id}`;

      // 1. Positionnement SYNCHRONE immédiat (avant Firestore)
      this.setCanonical(fullUrl);
      this.titleService.setTitle('Article | BE-ON-TOP'); // Évite le titre par défaut de la homepage
      
      // 2. Appel Firestore avec coupure automatique du Subscription (take(1))
      this.newsSub = this.newsService.getOne(id).pipe(
        take(1)
      ).subscribe(n => {
        if (!n) return;
        this.news = n;

        const pageTitle = `${n.title} | BE-ON-TOP`;
        const description = this.stripHtmlFast(n.content).slice(0, 150);

        // Mise à jour des métadonnées
        this.titleService.setTitle(pageTitle);
        this.metaService.updateTag({ name: 'description', content: description });
        
        // OpenGraph
        this.metaService.updateTag({ property: 'og:title', content: n.title });
        this.metaService.updateTag({ property: 'og:description', content: description });
        this.metaService.updateTag({ property: 'og:url', content: fullUrl });

        if (n.heroImage) {
          this.metaService.updateTag({ property: 'og:image', content: n.heroImage });
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.newsSub) {
      this.newsSub.unsubscribe();
    }
  }

  // Nettoyage HTML performant sans instancier de DOM
  private stripHtmlFast(html: string): string {
    if (!html) return '';
    return html
      .replace(/<img[^>]*>/gi, '') // Supprime les balises <img>
      .replace(/<[^>]+>/g, '')     // Supprime toutes les autres balises HTML
      .replace(/\s+/g, ' ')        // Normalise les espaces/retours à la ligne
      .trim();
  }

  private setCanonical(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}