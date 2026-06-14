import { Routes } from '@angular/router';

export const ORDER_ROUTES: Routes = [
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.component').then(c => c.CheckoutComponent)
  },
  {
    path: '',
    loadComponent: () => import('./order-list/order-list.component').then(c => c.OrderListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./order-detail/order-detail.component').then(c => c.OrderDetailComponent)
  }
];