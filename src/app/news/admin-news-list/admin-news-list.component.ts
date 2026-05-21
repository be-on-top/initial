import { Component, OnInit } from '@angular/core';
import { NewsService } from '../news.service';
import { News } from '../news';
import { AuthService } from 'src/app/admin/auth.service';
import { map, Observable, take, tap } from 'rxjs';

@Component({
  selector: 'app-admin-news-list',
  templateUrl: './admin-news-list.component.html'
})
export class AdminNewsListComponent implements OnInit {

  news$ = this.newsService.getAll();
  isEditor$!: Observable<boolean>; // Je garde ce nom pour mon HTML actuel, il vaut maintenant pour "Editor ou Admin"

  constructor(
    private newsService: NewsService, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isEditor$ = this.authService.getCurrentUserRole().pipe(
      tap(role => console.log("Rôle brut reçu du service au chargement :", role)),
      map(role => {
        if (!role) return false;

        // Si c'est un tableau, on vérifie s'il contient l'un ou l'autre
        if (Array.isArray(role)) {
          return role.includes('editor') || role.includes('admin');
        }

        // Si c'est une chaîne, elle doit être égale à 'editor' OU 'admin'
        return role === 'editor' || role === 'admin';
      }),
      tap(hasAccess => console.log("Résultat final Accès Autorisé :", hasAccess))
    );
  }

  delete(id: string) {
    this.isEditor$.pipe(take(1)).subscribe(hasAccess => {
      if (!hasAccess) {
        alert("Action non autorisée. Vous devez être éditeur ou administrateur.");
        return;
      }

      if (confirm('Supprimer cette news ?')) {
        this.newsService.delete(id);
      }
    });
  }
}