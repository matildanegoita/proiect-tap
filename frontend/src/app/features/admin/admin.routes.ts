import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  {
    path: 'books',
    loadComponent: () => import('./books-management/books-management.component').then(c => c.BooksManagementComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders-management/orders-management.component').then(c => c.OrdersManagementComponent)
  }
];