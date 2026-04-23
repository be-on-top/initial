import { Component } from '@angular/core';
import { NewsService } from '../news.service';
import { News } from '../../news'



@Component({
  selector: 'app-admin-news-list',
  templateUrl: './admin-news-list.component.html'
})
export class AdminNewsListComponent {

  news$ = this.newsService.getAll();

  constructor(private newsService: NewsService) {}

  delete(id: string) {
    if (confirm('Supprimer cette news ?')) {
      this.newsService.delete(id);
    }
  }
}