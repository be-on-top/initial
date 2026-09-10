import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NewsService } from '../news.service';
import { News } from '../news';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

interface NewsFallbackItem {
  title: string;
  excerpt: string;
}

interface NewsFallbackMap {
  [id: string]: NewsFallbackItem;
}

@Component({
  selector: 'app-news-details',
  templateUrl: './news-details.component.html',
  styleUrls: ['./news-details.component.css']
})
export class NewsDetailsComponent implements OnInit, OnDestroy {

  news: News | null = null;
  private newsSub?: Subscription;
  private jsonLdScriptElement: HTMLScriptElement | null = null;
  private breadcrumbScriptElement: HTMLScriptElement | null = null; // <- Ajout

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private newsService: NewsService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      const fullUrl = `https://be-on-top.io/news/${id}`;

      // 1. Positionnement SYNCHRONE de l'URL Canonical
      this.setCanonical(fullUrl);

      // 2. Chargement immédiat du Fallback JSON
      this.http.get<NewsFallbackMap>('/assets/news-fallback.json')
        .pipe(take(1))
        .subscribe(fallbackMap => {
          if (!this.news && fallbackMap && fallbackMap[id]) {
            const fallback = fallbackMap[id];
            this.titleService.setTitle(`${fallback.title} | BE-ON-TOP`);
            this.metaService.updateTag({ name: 'description', content: fallback.excerpt });
            this.metaService.updateTag({ property: 'og:title', content: fallback.title });
            this.metaService.updateTag({ property: 'og:description', content: fallback.excerpt });

            // Injection immédiate des Schémas
            this.injectArticleSchema(fullUrl, fallback.title, fallback.excerpt);
            this.injectBreadcrumbSchema(fullUrl, fallback.title); // <- Ajout
          }
        });

      // 3. Appel Firestore
      this.newsSub = this.newsService.getOne(id).pipe(
        take(1)
      ).subscribe(n => {
        if (!n) return;
        this.news = n;

        const pageTitle = `${n.title} | BE-ON-TOP`;
        const description = this.stripHtmlFast(n.content).slice(0, 150);

        this.titleService.setTitle(pageTitle);
        this.metaService.updateTag({ name: 'description', content: description });

        this.metaService.updateTag({ property: 'og:title', content: n.title });
        this.metaService.updateTag({ property: 'og:description', content: description });
        this.metaService.updateTag({ property: 'og:url', content: fullUrl });

        if (n.heroImage) {
          this.metaService.updateTag({ property: 'og:image', content: n.heroImage });
        }

        // Mise à jour des Schémas
        this.injectArticleSchema(fullUrl, n.title, description, n.heroImage, n.createdAt);
        this.injectBreadcrumbSchema(fullUrl, n.title); // <- Ajout
      });
    }
  }

  ngOnDestroy() {
    if (this.newsSub) {
      this.newsSub.unsubscribe();
    }
    if (this.jsonLdScriptElement) {
      this.jsonLdScriptElement.remove();
    }
    if (this.breadcrumbScriptElement) { // <- Nettoyage
      this.breadcrumbScriptElement.remove();
    }
  }

  // --- Injection du Fil d'Ariane Schema.org ---
  private injectBreadcrumbSchema(url: string, title: string) {
    if (!this.breadcrumbScriptElement) {
      this.breadcrumbScriptElement = this.document.createElement('script');
      this.breadcrumbScriptElement.type = 'application/ld+json';
      this.document.head.appendChild(this.breadcrumbScriptElement);
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Accueil',
          'item': 'https://be-on-top.io'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Actualités',
          'item': 'https://be-on-top.io/news'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': title,
          'item': url
        }
      ]
    };

    this.breadcrumbScriptElement.text = JSON.stringify(schema);
  }

  private injectArticleSchema(
    url: string,
    title: string,
    description: string,
    imageUrl?: string,
    datePublished?: string | Date
  ) {
    if (!this.jsonLdScriptElement) {
      this.jsonLdScriptElement = this.document.createElement('script');
      this.jsonLdScriptElement.type = 'application/ld+json';
      this.document.head.appendChild(this.jsonLdScriptElement);
    }

    const finalImage = imageUrl || 'https://be-on-top.io/assets/icons/icon-512x512.png';

    const schema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': url
      },
      'headline': title,
      'description': description,
      'image': [finalImage],
      'author': {
        '@type': 'Organization',
        '@id': 'https://be-on-top.io/#organization',
        'name': 'BE-ON-TOP.io',
        'url': 'https://be-on-top.io'
      },
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://be-on-top.io/#organization',
        'name': 'BE-ON-TOP.io',
        'url': 'https://be-on-top.io'
      }
    };

    if (datePublished) {
      schema['datePublished'] = new Date(datePublished).toISOString();
    }

    this.jsonLdScriptElement.text = JSON.stringify(schema);
  }

  private stripHtmlFast(html: string): string {
    if (!html) return '';
    return html
      .replace(/<img[^>]*>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
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