import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./book-list/book-list.component').then(c => c.BookListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./book-detail/book-detail.component').then(c => c.BookDetailComponent)
  }
];