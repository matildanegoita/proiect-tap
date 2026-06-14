import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule, CurrencyPipe],
  template: `
    <div class="checkout-page">
      <div class="checkout-inner">
        <h1>Finalizare comandă</h1>

        <div class="checkout-layout">

          <!-- Form -->
          <div class="checkout-form">
            <div class="form-section">
              <h2>Adresa de livrare</h2>
              <textarea [(ngModel)]="shippingAddress" rows="3"
                placeholder="Strada, număr, bloc, apartament, oraș, județ, cod poștal">
              </textarea>
            </div>

            <div class="form-section">
              <h2>Cod promoțional</h2>
              <div class="promo-row">
                <input type="text" [(ngModel)]="promoCode"
                       placeholder="Introdu codul promo"
                       (keyup.enter)="applyPromo()"/>
                <button class="btn-promo" (click)="applyPromo()">Aplică</button>
              </div>
              @if (promoApplied()) {
                <p class="promo-success">
                  <mat-icon>check_circle</mat-icon>
                  Cod aplicat! Reducere 20%
                </p>
              }
              @if (promoError()) {
                <p class="promo-error">
                  <mat-icon>error</mat-icon>
                  {{ promoError() }}
                </p>
              }
            </div>

            @if (error()) {
              <p class="form-error">{{ error() }}</p>
            }
          </div>

          <!-- Sumar -->
          <div class="order-summary">
            <h2>Sumar comandă</h2>

            <div class="summary-items">
              @for (item of cartService.cartItems(); track item.id) {
                <div class="summary-item">
                  <img [src]="item.coverUrl || 'https://placehold.co/45x62/F2EDE4/B09880'"
                       [alt]="item.bookTitle"/>
                  <div class="item-details">
                    <p class="item-title">{{ item.bookTitle }}</p>
                    <p class="item-qty">x{{ item.quantity }}</p>
                  </div>
                  <span class="item-price">{{ item.subtotal | currency:'RON ':'symbol':'1.2-2' }}</span>
                </div>
              }
            </div>

            <div class="summary-calc">
              <div class="calc-row">
                <span>Subtotal</span>
                <span>{{ cartService.cartTotal() | currency:'RON ':'symbol':'1.2-2' }}</span>
              </div>

              @if (promoApplied()) {
                <div class="calc-row discount">
                  <span>Reducere (20%)</span>
                  <span>− {{ cartService.cartTotal() * 0.20 | currency:'RON ':'symbol':'1.2-2' }}</span>
                </div>
              }

              <div class="calc-row">
                <span>Transport</span>
                <span class="free">Gratuit</span>
              </div>
            </div>

            <div class="summary-total">
              <span>Total</span>
              <span>{{ finalTotal() | currency:'RON ':'symbol':'1.2-2' }}</span>
            </div>

            <button class="btn-place" (click)="placeOrder()" [disabled]="loading()">
              {{ loading() ? 'Se procesează...' : 'Plasează comanda' }}
            </button>

            <a routerLink="/cart" class="btn-back">← Înapoi la coș</a>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page { min-height: 100vh; background: var(--beige); padding: 2rem 0; }

    .checkout-inner { max-width: 1000px; margin: 0 auto; padding: 0 2.5rem; }

    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    .checkout-layout { display: flex; gap: 2rem; align-items: flex-start; }

    .checkout-form { flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }

    .form-section {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }

    .form-section h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
    }

    textarea {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 1px solid var(--border-2);
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.875rem;
      color: var(--text-primary);
      background: var(--beige);
      resize: none;
      outline: none;
      transition: border-color 0.15s;
      line-height: 1.6;
    }

    textarea:focus { border-color: var(--caramel); }

    .promo-row {
      display: flex;
      gap: 0.5rem;
    }

    .promo-row input {
      flex: 1;
      padding: 0.6rem 0.9rem;
      border: 1px solid var(--border-2);
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.875rem;
      background: var(--beige);
      color: var(--text-primary);
      outline: none;
      transition: border-color 0.15s;
    }

    .promo-row input:focus { border-color: var(--caramel); }

    .btn-promo {
      padding: 0.6rem 1.1rem;
      background: var(--caramel);
      color: white;
      border: none;
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }

    .btn-promo:hover { background: var(--caramel-dark); }

    .promo-success {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.85rem;
      color: #6B8F5E;
      margin-top: 0.5rem;
    }

    .promo-success mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .promo-error {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.85rem;
      color: #B05050;
      margin-top: 0.5rem;
    }

    .promo-error mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .form-error {
      font-size: 0.875rem;
      color: #B05050;
      padding: 0.75rem 1rem;
      background: #FFF5F5;
      border: 1px solid #F5C6C6;
      border-radius: var(--radius);
    }

    /* Summary */
    .order-summary {
      width: 300px;
      flex-shrink: 0;
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      position: sticky;
      top: 84px;
    }

    .order-summary h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .summary-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .summary-item img {
      width: 40px;
      height: 55px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .item-details { flex: 1; min-width: 0; }

    .item-title {
      font-size: 0.8rem;
      color: var(--text-primary);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-qty { font-size: 0.75rem; color: var(--text-muted); }

    .item-price { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; }

    .summary-calc {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .calc-row.discount { color: #6B8F5E; font-weight: 500; }
    .free { color: #6B8F5E; }

    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.25rem;
    }

    .btn-place {
      display: block;
      width: 100%;
      padding: 0.75rem;
      background: var(--caramel);
      color: white;
      border: none;
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      margin-bottom: 0.6rem;
    }

    .btn-place:hover:not(:disabled) { background: var(--caramel-dark); }
    .btn-place:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-back {
      display: block;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
      padding: 0.3rem;
      transition: color 0.15s;
    }

    .btn-back:hover { color: var(--caramel-dark); }
  `]
})
export class CheckoutComponent {
  shippingAddress = '';
  promoCode = '';
  promoApplied = signal(false);
  promoError = signal('');
  loading = signal(false);
  error = signal('');

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  finalTotal() {
    const total = this.cartService.cartTotal();
    return this.promoApplied() ? total * 0.80 : total;
  }

  applyPromo() {
    if (this.promoCode.trim().toUpperCase() === 'BOOK20') {
      this.promoApplied.set(true);
      this.promoError.set('');
    } else {
      this.promoApplied.set(false);
      this.promoError.set('Cod promoțional invalid!');
    }
  }

  placeOrder() {
    if (!this.shippingAddress.trim()) {
      this.error.set('Adresa de livrare este obligatorie!');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.orderService.createOrder({
      shippingAddress: this.shippingAddress,
      promoCode: this.promoApplied() ? 'BOOK20' : undefined
    }).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.router.navigate(['/orders', order.id]);
      },
      error: () => {
        this.error.set('Eroare la plasarea comenzii!');
        this.loading.set(false);
      }
    });
  }
}