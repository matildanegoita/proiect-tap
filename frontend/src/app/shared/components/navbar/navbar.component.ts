import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatBadgeModule],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <a class="logo" [routerLink]="authService.isAdmin() ? '/admin' : '/catalog'">
          <span class="logo-icon">🕮</span>
          <span class="logo-text">Book Store</span>
        </a>

        <div class="nav-links">
          @if (authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="nav-active">Dashboard</a>
            <a routerLink="/admin/books" routerLinkActive="nav-active">Cărți</a>
            <a routerLink="/admin/orders" routerLinkActive="nav-active">Comenzi</a>
            <button class="btn-user" (click)="logout()">
              {{ authService.currentUser()?.firstName }}
              <mat-icon>logout</mat-icon>
            </button>
          } @else if (authService.isLoggedIn()) {
            <a routerLink="/catalog" routerLinkActive="nav-active">Catalog</a>
            <a routerLink="/orders" routerLinkActive="nav-active">Comenzile mele</a>
            <a routerLink="/cart" class="btn-cart" routerLinkActive="nav-active">
  <div class="cart-icon-wrap">
    <mat-icon aria-hidden="false" aria-label="Coș">shopping_bag</mat-icon>
    @if (cartService.cartCount() > 0) {
      <span class="cart-badge">{{ cartService.cartCount() }}</span>
    }
  </div>
</a>
            <a routerLink="/wishlist" class="btn-cart" routerLinkActive="nav-active" title="Wishlist">
  <mat-icon [matBadge]="wishlistService.wishlistCount() || null"
            matBadgeColor="accent" matBadgeSize="small">
    favorite_border
  </mat-icon>
</a>
            <button class="btn-user" (click)="logout()">
              {{ authService.currentUser()?.firstName }}
              <mat-icon>logout</mat-icon>
            </button>
          } @else {
            <a routerLink="/catalog" routerLinkActive="nav-active">Catalog</a>
            <a routerLink="/auth/login" routerLinkActive="nav-active">Autentificare</a>
            <a routerLink="/auth/register" class="btn-cta">Înregistrare</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--white);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-primary);
    }

    .logo-icon { font-size: 1.4rem; }

    .logo-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.4rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      color: var(--text-primary);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }

    .nav-links a {
      padding: 0.4rem 0.85rem;
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--text-secondary);
      border-radius: var(--radius);
      transition: color 0.15s, background 0.15s;
    }

    .nav-links a:hover {
      color: var(--text-primary);
      background: var(--beige);
    }

    .nav-active {
      color: var(--caramel-dark) !important;
      font-weight: 500 !important;
    }

    .btn-cart {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      padding: 0 !important;
      color: var(--text-secondary);
      border-radius: 50% !important;
    }

    .btn-cart:hover { background: var(--beige) !important; }

    .cart-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--caramel);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Jost', sans-serif;
}
    .btn-user {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.4rem 0.85rem;
      background: none;
      border: 1px solid var(--border-2);
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.875rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-user:hover {
      color: var(--text-primary);
      border-color: var(--caramel);
    }

    .btn-user mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .btn-cta {
      background: var(--caramel) !important;
      color: white !important;
      padding: 0.4rem 1.1rem !important;
      border-radius: var(--radius) !important;
      font-weight: 500 !important;
      transition: background 0.15s !important;
    }

    .btn-cta:hover {
      background: var(--caramel-dark) !important;
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, public cartService: CartService, public wishlistService: WishlistService) {}
  logout() { this.authService.logout(); }
}