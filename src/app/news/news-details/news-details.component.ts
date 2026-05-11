
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../news.service';
import { News } from '../news';

// SEO
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-news-details',
  templateUrl: './news-details.component.html',
  styleUrls: ['./news-details.component.css']
})
export class NewsDetailsComponent implements OnInit {

  news: News | null = null;

constructor(
  private route: ActivatedRoute,
  private newsService: NewsService,
  // SEO
  private titleService: Title,
  private metaService: Meta,
  @Inject(DOCUMENT) private document: Document
) {}

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.newsService.getOne(id).subscribe(n => {
      if (!n) return;

      this.news = n;

      // 🔹 TITLE
      this.titleService.setTitle(n.title + ' | Mon site');

      // 🔹 DESCRIPTION (fallback si pas d'excerpt)
      const description = this.stripHtml(n.content).slice(0, 150);

      this.metaService.updateTag({
        name: 'description',
        content: description
      });

      // 🔹 CANONICAL
      this.setCanonical(`https://be-on-top.io/news/${id}`);

      this.metaService.updateTag({
  property: 'og:title',
  content: n.title
});

this.metaService.updateTag({
  
  property: 'og:description',
  content: description
});

if (n.heroImage) {
  this.metaService.updateTag({
    property: 'og:image',
    content: n.heroImage
  });
}


    });
  }
}

  stripHtml(text: string): string {
    if (!text) return '';

    const div = document.createElement('div');
    div.innerHTML = text;

    // Enlève toutes les images
    const images = div.getElementsByTagName('img');
    while (images.length) {
      images[0].remove();
    }

    return div.textContent || '';
  }

  setCanonical(url: string) {
  let link: HTMLLinkElement | null =
    this.document.querySelector("link[rel='canonical']");

  if (!link) {
    link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.document.head.appendChild(link);
  }

  link.setAttribute('href', url);
}
  
}
