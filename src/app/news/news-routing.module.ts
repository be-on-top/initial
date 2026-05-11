import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminNewsEditComponent } from './admin-news-edit/admin-news-edit.component';
import { AdminNewsListComponent } from './admin-news-list/admin-news-list.component';


const routes: Routes = [
  { path: '', component: AdminNewsListComponent },
  { path: 'create', component: AdminNewsEditComponent },
  { path: 'edit/:id', component: AdminNewsEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
