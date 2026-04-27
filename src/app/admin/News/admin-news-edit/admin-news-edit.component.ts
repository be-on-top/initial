import { NgForm } from '@angular/forms';
import { NewsService } from '../news.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { News } from '../../news';

@Component({
  selector: 'app-admin-news-edit',
  templateUrl: './admin-news-edit.component.html',
  styleUrls: ['./admin-news-edit.component.css']
})
export class AdminNewsEditComponent implements OnInit {

  // 🧩 Modèle utilisé par le formulaire (création / édition)
  news: News = {
    title: '',
    content: '',
    heroImage: '',
    status: 'draft'
  };

  // 📌 ID de la news (présent uniquement en mode édition)
  id: string | null = null;

  // ⏳ Flag de chargement (désactive le bouton / UX)
  loading = false;

  constructor(
    private route: ActivatedRoute,   // 🔗 accès aux paramètres de route (/edit/:id)
    private newsService: NewsService, // 🔥 service Firestore + Storage
    private router: Router            // 🧭 navigation après action
  ) {}

  ngOnInit() {
    // 🔍 Récupération de l'ID depuis l'URL
    this.id = this.route.snapshot.paramMap.get('id');

    // ✏️ Si ID présent → mode édition → on charge la news existante
    if (this.id) {
      this.newsService.getOne(this.id).subscribe(n => {
        if (n) this.news = n; // hydrate le form avec les données
      });
    }
  }

  // 💾 Sauvegarde (create ou update)
  async save(form: NgForm) {

    // 🚫 Stop si formulaire invalide
    if (form.invalid) return;

    this.loading = true;

    if (this.id) {
      // ✏️ UPDATE
      await this.newsService.update(this.id, this.news);
    } else {
      // ➕ CREATE
      await this.newsService.create(this.news);
    }

    this.loading = false;

    // 🔙 Retour à la liste admin
    this.router.navigate(['/admin/news']);
  }

  // 🖼️ Upload image vers Firebase Storage
  onFileSelected(event: any) {

    const file: File = event.target.files[0];
    if (!file) return;

    this.loading = true;

    // 📤 Upload → récupération URL publique
    this.newsService.uploadImage(file).then(url => {

      // 🔗 On stocke l'URL dans le modèle (sera sauvegardé en Firestore)
      this.news.heroImage = url;

      this.loading = false;
    });
  }
}