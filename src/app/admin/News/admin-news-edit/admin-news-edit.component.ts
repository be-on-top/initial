
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

  news: News = {
    title: '',
    content: '',
    heroImage: '',
    status: 'draft'
  };

  id: string | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.newsService.getOne(this.id).subscribe(n => {
        if (n) this.news = n;
      });
    }
  }

 async save(form: NgForm) {
  if (form.invalid) return;
    this.loading = true;

    if (this.id) {
      await this.newsService.update(this.id, this.news);
    } else {
      await this.newsService.create(this.news);
    }

    this.loading = false;
    this.router.navigate(['/admin/news']);
  }

  onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (!file) return;

  this.loading = true;

  this.newsService.uploadImage(file).then(url => {
    this.news.heroImage = url;
    this.loading = false;
  });
}
}