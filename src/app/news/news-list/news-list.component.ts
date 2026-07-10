import { Component, OnInit } from '@angular/core';
import { NewsService } from '../news.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators'; // 👈 Important pour le basculement propre
import { News } from '../news';
import { AuthService } from 'src/app/admin/auth.service';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css']
})
export class NewsListComponent implements OnInit {

  // 1️⃣ PAR DÉFAUT : On charge le publié. Si le service d'auth met du temps ou ne répond pas, la page n'est PAS vide.
  news$: Observable<News[]> = this.newsService.getPublished();
  userRole: string = "";

  constructor(
    private newsService: NewsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // 2️⃣ On écoute le rôle. 
    // Grâce à switchMap, on change dynamiquement la source SANS casser le comportement par défaut.
    this.news$ = this.authService.getCurrentUserRole().pipe(
      switchMap(userInfo => {
        // TRÈS IMPORTANT : La vraie comparaison ===
        if (userInfo === 'editor') {
          this.userRole = 'editor';
          return this.newsService.getAll(); // L'éditeur voit TOUT
        } else {
          this.userRole = '';
          return this.newsService.getPublished(); // Tous les autres voient UNIQUEMENT le publié
        }
      })
    );
  }

  stripHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerHTML = text;
    const images = div.getElementsByTagName('img');
    while (images.length) {
      images[0].remove();
    }
    return div.textContent || '';
  }
}