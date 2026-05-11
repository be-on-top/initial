import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';




import { NewsRoutingModule } from './news-routing.module';
import { AdminNewsEditComponent } from './admin-news-edit/admin-news-edit.component';
import { AdminNewsListComponent } from './admin-news-list/admin-news-list.component';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NewsListComponent } from './news-list/news-list.component';
import { NewsDetailsComponent } from './news-details/news-details.component';




@NgModule({
  declarations: [
    AdminNewsEditComponent,
    AdminNewsListComponent,
    NewsListComponent,
    NewsDetailsComponent
  ],
  imports: [
    CommonModule,
    NewsRoutingModule,
    FormsModule,
    EditorModule

  ]
})
export class NewsModule { }

