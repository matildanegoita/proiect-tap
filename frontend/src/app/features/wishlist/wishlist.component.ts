import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Book } from '../../core/models/book.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, MatIconModule, CurrencyPipe],
  template: `
    <div class="wishlist-page">
      <div class="wishlist-inner">
        <h1>Lista mea de dorințe</h1>

        @if (wishlistService.wishlistItems().length === 0) {
          <div class="empty">
            <span class="empty-icon">🤍</span>
            <p>Lista ta de dorințe este goală.</p>
            <a routerLink="/catalog" class="btn-primary">Explorează catalogul</a>
          </div>
        } @else {
          <div class="wishlist-grid">
            @for (book of wishlistService.wishlistItems(); track book.id) {
              <div class="wishlist-card">
                <a [routerLink]="['/catalog', book.id]" class="card-cover">
                  <img [src]="book.coverUrl || 'https://placehold.co/180x240/F2EDE4/B09880'"
                       [alt]="book.title"/>
                </a>
                <div class="card-info">
                  <p class="card-cat">{{ book.categoryName }}</p>
                  <h3><a [routerLink]="['/catalog', book.id]">{{ book.title }}</a></h3>
                  <p class="card-author">{{ book.author }}</p>
                  <div class="card-footer">
                    <span class="price">{{ book.price | currency:'RON ':'symbol':'1.0-0' }}</span>
                    <div class="card-actions">
                      @if (book.stock > 0) {
                        <button class="btn-cart" (click)="addToCart(book)" title="Adaugă în coș">
                          <mat-icon>add_shopping_cart</mat-icon>
                        </button>
                      }
                      <button class="btn-remove" (click)="removeFromWishlist(book.id)" title="Elimină">
                        <mat-icon>favorite</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page { min-height: 100vh; background: var(--beige); padding: 2rem 0; }
    .wishlist-inner { max-width: 1100px; margin: 0 auto; padding: 0 2.5rem; }

    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem; font-weight: 600;
      margin-bottom: 1.5rem; color: var(--text-primary);
    }

    .empty {
      text-align: center; padding: 5rem 2rem;
      display: flex; flex-direction: column;
      align-items: center; gap: 1rem;
    }

    .empty-icon { font-size: 3rem; }
    .empty p { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: var(--text-secondary); }

    .btn-primary {
      display: inline-block; padding: 0.7rem 1.5rem;
      background: var(--caramel); color: white;
      border-radius: var(--radius); font-family: 'Jost', sans-serif;
      font-size: 0.9rem; font-weight: 500; transition: background 0.15s;
    }
    .btn-primary:hover { background: var(--caramel-dark); }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.25rem;
    }

    .wishlist-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .wishlist-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-hover);
    }

    .card-cover {
      display: block; height: 240px;
      overflow: hidden; background: var(--beige-2);
    }

    .card-cover img {
      width: 100%; height: 100%;
      object-fit: cover; transition: transform 0.3s;
    }

    .wishlist-card:hover .card-cover img { transform: scale(1.04); }

    .card-info { padding: 0.85rem; }

    .card-cat {
      font-size: 0.65rem; font-weight: 500;
      text-transform: uppercase; letter-spacing: 1.5px;
      color: var(--caramel); margin-bottom: 0.2rem;
    }

    .card-info h3 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem; font-weight: 600;
      line-height: 1.25; color: var(--text-primary);
      margin-bottom: 0.15rem;
    }

    .card-info h3 a:hover { color: var(--caramel-dark); }
    .card-author { font-size: 0.78rem; color: var(--text-muted); font-style: italic; }

    .card-footer {
      display: flex; align-items: center;
      justify-content: space-between;
      margin-top: 0.6rem; padding-top: 0.6rem;
      border-top: 1px solid var(--border);
    }

    .price { font-size: 0.95rem; font-weight: 500; color: var(--text-primary); }

    .card-actions { display: flex; gap: 0.4rem; }

    .btn-cart {
      width: 28px; height: 28px;
      background: var(--caramel); border: none;
      border-radius: 50%; color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.15s;
    }

    .btn-cart:hover { background: var(--caramel-dark); }
    .btn-cart mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }

    .btn-remove {
      width: 28px; height: 28px;
      background: #FFF5F5; border: 1px solid #F5C6C6;
      border-radius: 50%; color: #E57373;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.15s;
    }

    .btn-remove:hover { background: #FFE0E0; }
    .btn-remove mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
  `]
})
export class WishlistComponent implements OnInit {
  constructor(
    public wishlistService: WishlistService,
    private cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit() { this.wishlistService.loadWishlist().subscribe(); }

  addToCart(book: Book) { this.cartService.addToCart(book.id).subscribe(); }

  removeFromWishlist(bookId: number) { this.wishlistService.remove(bookId).subscribe(); }
}