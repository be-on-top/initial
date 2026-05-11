import { Component } from '@angular/core';
import { NewsService } from '../news.service';
import { Observable } from 'rxjs';
import { News } from '../news';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css'] // 👈 important

})
export class NewsListComponent {

  news$: Observable<News[]> = this.newsService.getPublished();

  constructor(private newsService: NewsService) { }

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

}