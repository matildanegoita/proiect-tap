import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterLink, MatIconModule, CurrencyPipe, DatePipe],
  template: `
    <div class="orders-page">
      <div class="orders-inner">
        <h1>Comenzile mele</h1>

        @if (orders().length === 0) {
          <div class="empty">
            <span class="empty-icon">📦</span>
            <p>Nu ai nicio comandă încă.</p>
            <a routerLink="/catalog" class="btn-primary">Explorează catalogul</a>
          </div>
        } @else {
          <div class="orders-list">
            @for (order of orders(); track order.id) {
              <a [routerLink]="['/orders', order.id]" class="order-card">
                <div class="order-left">
                  <div class="order-covers">
                    @for (item of order.items.slice(0, 3); track item.bookId) {
                      <img [src]="item.coverUrl || 'https://placehold.co/45x62/F2EDE4/B09880'"
                           [alt]="item.bookTitle"/>
                    }
                    @if (order.items.length > 3) {
                      <div class="more-covers">+{{ order.items.length - 3 }}</div>
                    }
                  </div>
                  <div class="order-info">
                    <p class="order-id">Comanda #{{ order.id }}</p>
                    <p class="order-date">{{ order.createdAt | date:'dd MMMM yyyy' }}</p>
                    <p class="order-items-count">{{ order.items.length }} {{ order.items.length === 1 ? 'produs' : 'produse' }}</p>
                  </div>
                </div>
                <div class="order-right">
                  <span class="status-badge" [class]="'status-' + order.status.toLowerCase()">
                    {{ getStatusLabel(order.status) }}
                  </span>
                  <p class="order-total">{{ order.totalAmount | currency:'RON ':'symbol':'1.2-2' }}</p>
                  <mat-icon class="chevron">chevron_right</mat-icon>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .orders-page { min-height: 100vh; background: var(--beige); padding: 2rem 0; }

    .orders-inner { max-width: 750px; margin: 0 auto; padding: 0 2.5rem; }

    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    .empty {
      text-align: center;
      padding: 5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .empty-icon { font-size: 3rem; }
    .empty p {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.3rem;
      color: var(--text-secondary);
    }

    .btn-primary {
      display: inline-block;
      padding: 0.7rem 1.5rem;
      background: var(--caramel);
      color: white;
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.15s;
    }

    .btn-primary:hover { background: var(--caramel-dark); }

    .orders-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .order-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.1rem 1.25rem;
      transition: box-shadow 0.15s, transform 0.15s;
      color: inherit;
    }

    .order-card:hover {
      box-shadow: var(--shadow);
      transform: translateX(3px);
      border-color: var(--caramel-light);
    }

    .order-left { display: flex; align-items: center; gap: 1rem; }

    .order-covers { display: flex; gap: 0.3rem; align-items: center; }

    .order-covers img {
      width: 40px;
      height: 55px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .more-covers {
      width: 40px;
      height: 55px;
      background: var(--beige-2);
      border: 1px solid var(--border);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .order-id {
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--text-primary);
      margin-bottom: 0.15rem;
    }

    .order-date { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.1rem; }
    .order-items-count { font-size: 0.8rem; color: var(--text-muted); }

    .order-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-pending { background: #FEF3C7; color: #92400E; }
    .status-processing { background: #DBEAFE; color: #1E40AF; }
    .status-shipped { background: #D1FAE5; color: #065F46; }
    .status-delivered { background: #F3F4F6; color: #374151; }

    .order-total {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .chevron { color: var(--text-muted); font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
  `]
})
export class OrderListComponent implements OnInit {
  orders = signal<Order[]>([]);

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({ next: (o) => this.orders.set(o) });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Pending': 'În așteptare',
      'Processing': 'În procesare',
      'Shipped': 'Expediat',
      'Delivered': 'Livrat'
    };
    return labels[status] ?? status;
  }
}