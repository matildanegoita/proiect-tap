import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, MatIconModule, CurrencyPipe],
  template: `
    <div class="cart-page">
      <div class="cart-inner">
        <h1>Coșul meu</h1>

        @if (cartService.cartItems().length === 0) {
          <div class="empty-cart">
            <span class="empty-icon">🛍️</span>
            <p>Coșul tău este gol.</p>
            <a routerLink="/catalog" class="btn-primary">Explorează catalogul</a>
          </div>
        } @else {
          <div class="cart-layout">

            <div class="cart-items">
              @for (item of cartService.cartItems(); track item.id) {
                <div class="cart-item">
                  <img [src]="item.coverUrl || 'https://placehold.co/70x95/F2EDE4/B09880'"
                       [alt]="item.bookTitle"/>
                  <div class="item-info">
                    <h3>{{ item.bookTitle }}</h3>
                    <p>{{ item.bookAuthor }}</p>
                    <p class="unit-price">{{ item.unitPrice | currency:'RON ':'symbol':'1.2-2' }} / buc</p>
                  </div>
                  <div class="qty-control">
                    <button (click)="decrease(item)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="increase(item)">+</button>
                  </div>
                  <span class="subtotal">{{ item.subtotal | currency:'RON ':'symbol':'1.2-2' }}</span>
                  <button class="btn-remove" (click)="remove(item)" title="Șterge">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }
            </div>

            <div class="cart-summary">
              <h2>Sumar</h2>

              <div class="summary-rows">
                <div class="summary-row">
                  <span>Produse ({{ cartService.cartCount() }})</span>
                  <span>{{ cartService.cartTotal() | currency:'RON ':'symbol':'1.2-2' }}</span>
                </div>
                <div class="summary-row">
                  <span>Transport</span>
                  <span class="free">Gratuit</span>
                </div>
              </div>

              <div class="summary-total">
                <span>Total</span>
                <span>{{ cartService.cartTotal() | currency:'RON ':'symbol':'1.2-2' }}</span>
              </div>

              <a routerLink="/orders/checkout" class="btn-checkout">
                Finalizează comanda
              </a>
              <a routerLink="/catalog" class="btn-continue">
                ← Continuă cumpărăturile
              </a>
            </div>

          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cart-page { min-height: 100vh; background: var(--beige); padding: 2rem 0; }

    .cart-inner { max-width: 1100px; margin: 0 auto; padding: 0 2.5rem; }

    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    .empty-cart {
      text-align: center;
      padding: 5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .empty-icon { font-size: 3rem; }

    .empty-cart p {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.3rem;
      color: var(--text-secondary);
    }

    .cart-layout { display: flex; gap: 2rem; align-items: flex-start; }

    .cart-items {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .cart-item {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: box-shadow 0.15s;
    }

    .cart-item:hover { box-shadow: var(--shadow); }

    .cart-item img {
      width: 60px;
      height: 82px;
      object-fit: cover;
      border-radius: var(--radius);
      flex-shrink: 0;
    }

    .item-info { flex: 1; min-width: 0; }

    .item-info h3 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.15rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-info p {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .unit-price { color: var(--caramel) !important; margin-top: 0.2rem; }

    .qty-control {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid var(--border-2);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .qty-control button {
      width: 30px;
      height: 30px;
      background: var(--beige);
      border: none;
      font-size: 1.1rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: background 0.12s;
    }

    .qty-control button:hover { background: var(--beige-2); color: var(--text-primary); }

    .qty-control span {
      width: 36px;
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      border-left: 1px solid var(--border);
      border-right: 1px solid var(--border);
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .subtotal {
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--text-primary);
      min-width: 90px;
      text-align: right;
    }

    .btn-remove {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0.2rem;
      border-radius: var(--radius);
      transition: color 0.15s, background 0.15s;
    }

    .btn-remove:hover { color: #B05050; background: #FFF0F0; }
    .btn-remove mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .cart-summary {
      width: 280px;
      flex-shrink: 0;
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      position: sticky;
      top: 84px;
    }

    .cart-summary h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
      color: var(--text-primary);
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .free { color: #6B8F5E; font-weight: 500; }

    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.25rem;
    }

    .btn-checkout {
      display: block;
      text-align: center;
      padding: 0.75rem;
      background: var(--caramel);
      color: white;
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.15s;
      margin-bottom: 0.6rem;
    }

    .btn-checkout:hover { background: var(--caramel-dark); }

    .btn-continue {
      display: block;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
      padding: 0.4rem;
      transition: color 0.15s;
    }

    .btn-continue:hover { color: var(--caramel-dark); }

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
  `]
})
export class CartComponent implements OnInit {
  constructor(public cartService: CartService) {}

  ngOnInit() { this.cartService.loadCart().subscribe(); }

  increase(item: CartItem) {
    this.cartService.updateQuantity(item.bookId, item.quantity + 1).subscribe();
  }

  decrease(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.bookId, item.quantity - 1).subscribe();
    } else {
      this.remove(item);
    }
  }

  remove(item: CartItem) {
    this.cartService.removeFromCart(item.bookId).subscribe();
  }
}