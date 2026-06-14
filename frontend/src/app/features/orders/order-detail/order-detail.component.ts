import { Component, OnInit, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { DecimalPipe } from "@angular/common";
@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, MatIconModule, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <div class="detail-page">
      <div class="detail-inner">
        <a routerLink="/orders" class="back-link">
          <mat-icon>arrow_back</mat-icon> Înapoi la comenzi
        </a>

        @if (order()) {
          <div class="order-header">
            <div>
              <h1>Comanda #{{ order()!.id }}</h1>
              <p class="order-date">Plasată pe {{ order()!.createdAt | date:'dd MMMM yyyy, HH:mm' }}</p>
            </div>
            <span class="status-badge" [class]="'status-' + order()!.status.toLowerCase()">
              {{ getStatusLabel(order()!.status) }}
            </span>
          </div>

          <div class="order-layout">

            <div class="order-main">
              <div class="section-card">
                <h2>Produse comandate</h2>
                <div class="items-list">
                  @for (item of order()!.items; track item.bookId) {
                    <div class="order-item">
                      <img [src]="item.coverUrl || 'https://placehold.co/55x75/F2EDE4/B09880'"
                           [alt]="item.bookTitle"/>
                      <div class="item-info">
                        <p class="item-title">{{ item.bookTitle }}</p>
                        <p class="item-qty">Cantitate: {{ item.quantity }}</p>
                        <p class="item-price">{{ item.unitPrice | currency:'RON ':'symbol':'1.2-2' }} / buc</p>
                      </div>
                      <span class="item-subtotal">{{ item.subtotal | currency:'RON ':'symbol':'1.2-2' }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="section-card">
                <h2>Adresa de livrare</h2>
                <p class="address-text">{{ order()!.shippingAddress }}</p>
              </div>
            </div>

            <div class="order-sidebar">
              <div class="section-card">
                <h2>Sumar plată</h2>
                <div class="payment-rows">
                  <div class="payment-row">
                    <span>Subtotal</span>
                    <span>{{ getSubtotal() | currency:'RON ':'symbol':'1.2-2' }}</span>
                  </div>
                  @if (order()!.promoCode) {
                    <div class="payment-row discount">
                      <span>Cod promo ({{ order()!.promoCode }})</span>
                      <span>−{{ order()!.discount * 100 | number:'1.0-0' }}%</span>
                    </div>
                  }
                  <div class="payment-row">
                    <span>Transport</span>
                    <span class="free">Gratuit</span>
                  </div>
                </div>
                <div class="payment-total">
                  <span>Total plătit</span>
                  <span>{{ order()!.totalAmount | currency:'RON ':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>

          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-page { min-height: 100vh; background: var(--beige); padding: 2rem 0; }

    .detail-inner { max-width: 950px; margin: 0 auto; padding: 0 2.5rem; }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      transition: color 0.15s;
    }

    .back-link:hover { color: var(--caramel-dark); }
    .back-link mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .order-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .order-date { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }

    .status-badge {
      padding: 0.35rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-top: 0.5rem;
    }

    .status-pending { background: #FEF3C7; color: #92400E; }
    .status-processing { background: #DBEAFE; color: #1E40AF; }
    .status-shipped { background: #D1FAE5; color: #065F46; }
    .status-delivered { background: #F3F4F6; color: #374151; }

    .order-layout { display: flex; gap: 1.5rem; align-items: flex-start; }

    .order-main { flex: 1; display: flex; flex-direction: column; gap: 1rem; }

    .order-sidebar { width: 260px; flex-shrink: 0; }

    .section-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
    }

    .section-card h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--border);
    }

    .items-list { display: flex; flex-direction: column; gap: 1rem; }

    .order-item { display: flex; align-items: center; gap: 1rem; }

    .order-item img {
      width: 50px;
      height: 68px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid var(--border);
      flex-shrink: 0;
    }

    .item-info { flex: 1; }
    .item-title { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); margin-bottom: 0.15rem; }
    .item-qty { font-size: 0.8rem; color: var(--text-muted); }
    .item-price { font-size: 0.8rem; color: var(--caramel); margin-top: 0.1rem; }
    .item-subtotal { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); white-space: nowrap; }

    .address-text { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }

    .payment-rows { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }

    .payment-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .payment-row.discount { color: #6B8F5E; font-weight: 500; }
    .free { color: #6B8F5E; }

    .payment-total {
      display: flex;
      justify-content: space-between;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  id = input<string>('');
  order = signal<Order | null>(null);

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getOrderById(+this.id()).subscribe({
      next: (o) => this.order.set(o)
    });
  }

  getSubtotal(): number {
    return this.order()!.items.reduce((acc, i) => acc + i.subtotal, 0);
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