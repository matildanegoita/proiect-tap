import { Component, OnInit, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BookService } from '../../../core/services/book.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewService } from '../../../core/services/review.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Book } from '../../../core/models/book.model';
import { Review } from '../../../core/models/review.model';
import { DecimalPipe } from "@angular/common";
@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <div class="detail-page">
      <div class="detail-inner">
        <a routerLink="/catalog" class="back-link">
          <mat-icon>arrow_back</mat-icon> Înapoi la catalog
        </a>

        @if (loading()) {
          <div class="state-center"><div class="spinner"></div></div>
        }

        @if (book()) {
          <div class="book-layout">
            <div class="book-cover">
              <img [src]="book()!.coverUrl || 'https://placehold.co/280x400/F2EDE4/B09880'"
                   [alt]="book()!.title"/>

              @if (authService.isLoggedIn() && !authService.isAdmin()) {
                <button class="btn-wishlist" (click)="toggleWishlist()"
                        [class.in-wishlist]="inWishlist()">
                  <mat-icon>{{ inWishlist() ? 'favorite' : 'favorite_border' }}</mat-icon>
                  {{ inWishlist() ? 'În wishlist' : 'Adaugă la wishlist' }}
                </button>
              }
            </div>

            <div class="book-info">
              <p class="book-cat">{{ book()!.categoryName }}</p>
              <h1>{{ book()!.title }}</h1>
              <p class="book-author">de <em>{{ book()!.author }}</em></p>

              <div class="book-rating">
                <span class="stars">{{ getStars(book()!.avgRating) }}</span>
                <span class="rating-val">{{ book()!.avgRating | number:'1.1-1' }}</span>
                <span class="rating-count">({{ book()!.reviewCount }} recenzii)</span>
              </div>

              <div class="book-price">{{ book()!.price | currency:'RON ':'symbol':'1.2-2' }}</div>

              <div class="book-stock">
                @if (book()!.stock > 0) {
                  <span class="in-stock">
                    <mat-icon>check_circle</mat-icon>
                    În stoc — {{ book()!.stock }} disponibile
                  </span>
                } @else {
                  <span class="out-stock">
                    <mat-icon>cancel</mat-icon>
                    Stoc epuizat
                  </span>
                }
              </div>

              <p class="book-isbn">ISBN: {{ book()!.isbn }}</p>

              <div class="book-desc">
                <p class="desc-label">Descriere</p>
                <p>{{ book()!.description }}</p>
              </div>

              @if (book()!.stock > 0 && authService.isLoggedIn() && !authService.isAdmin()) {
                <button class="btn-primary" (click)="addToCart()">
                  <mat-icon>add_shopping_cart</mat-icon>
                  Adaugă în coș
                </button>
              }

              @if (!authService.isLoggedIn()) {
                <p class="login-hint">
                  <a routerLink="/auth/login">Autentifică-te</a> pentru a cumpăra.
                </p>
              }
            </div>
          </div>

          <!-- Reviews -->
          <div class="reviews-section">
            <h2>Recenzii</h2>

            <!-- Formular recenzie -->
            @if (canReview()) {
              <div class="review-form">
                <h3>Lasă o recenzie</h3>
                <div class="star-picker">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button class="star-btn" (click)="newRating.set(star)"
                            [class.active]="star <= newRating()">
                      ★
                    </button>
                  }
                </div>
                <textarea [(ngModel)]="newComment" rows="3"
                          placeholder="Împărtășește-ți părerea despre această carte...">
                </textarea>
                @if (reviewError()) {
                  <p class="review-error">{{ reviewError() }}</p>
                }
                <button class="btn-review" (click)="submitReview()" [disabled]="submitting()">
                  {{ submitting() ? 'Se trimite...' : 'Trimite recenzia' }}
                </button>
              </div>
            }

            <!-- Lista recenzii -->
            @if (reviews().length === 0) {
              <div class="no-reviews">
                <p>Nicio recenzie încă. Fii primul care recenzează!</p>
              </div>
            } @else {
              <div class="reviews-list">
                @for (review of reviews(); track review.id) {
                  <div class="review-card">
                    <div class="review-header">
                      <div class="reviewer-avatar">
                        {{ review.userFirstName[0] }}{{ review.userLastName[0] }}
                      </div>
                      <div class="reviewer-info">
                        <p class="reviewer-name">{{ review.userFirstName }} {{ review.userLastName }}</p>
                        <p class="review-date">{{ review.createdAt | date:'dd MMM yyyy' }}</p>
                      </div>
                      <div class="review-stars">{{ getStars(review.rating) }}</div>
                    </div>
                    <p class="review-comment">{{ review.comment }}</p>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-page { min-height: 100vh; background: var(--beige); padding: 2rem 0; }
    .detail-inner { max-width: 1000px; margin: 0 auto; padding: 0 2.5rem; }

    .back-link {
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-size: 0.875rem; color: var(--text-secondary);
      margin-bottom: 1.5rem; transition: color 0.15s;
    }
    .back-link:hover { color: var(--caramel-dark); }
    .back-link mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .book-layout {
      display: flex; gap: 3rem;
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      margin-bottom: 2rem;
    }

    .book-cover { display: flex; flex-direction: column; gap: 1rem; }

    .book-cover img {
      width: 220px; border-radius: var(--radius);
      box-shadow: var(--shadow-hover); display: block;
    }

    .btn-wishlist {
      display: flex; align-items: center; gap: 0.4rem;
      width: 100%; padding: 0.6rem;
      background: var(--beige); border: 1px solid var(--border-2);
      border-radius: var(--radius); cursor: pointer;
      font-family: 'Jost', sans-serif; font-size: 0.85rem;
      color: var(--text-secondary); transition: all 0.15s;
      justify-content: center;
    }

    .btn-wishlist:hover { border-color: #E57373; color: #E57373; }
    .btn-wishlist.in-wishlist { background: #FFF5F5; border-color: #E57373; color: #E57373; }
    .btn-wishlist mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .book-info { flex: 1; }

    .book-cat {
      font-size: 0.68rem; font-weight: 500;
      text-transform: uppercase; letter-spacing: 2px;
      color: var(--caramel); margin-bottom: 0.5rem;
    }

    .book-info h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.2rem; font-weight: 600;
      line-height: 1.2; color: var(--text-primary); margin-bottom: 0.4rem;
    }

    .book-author { font-size: 1rem; color: var(--text-secondary); margin-bottom: 1rem; }

    .book-rating { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1rem; }
    .stars { font-size: 0.9rem; color: #D4956A; letter-spacing: 2px; }
    .rating-val { font-weight: 500; font-size: 0.9rem; }
    .rating-count { font-size: 0.85rem; color: var(--text-muted); }

    .book-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 0.75rem;
    }

    .book-stock { display: flex; align-items: center; margin-bottom: 0.5rem; }
    .in-stock { display: flex; align-items: center; gap: 0.3rem; font-size: 0.875rem; color: #6B8F5E; }
    .out-stock { display: flex; align-items: center; gap: 0.3rem; font-size: 0.875rem; color: #B05050; }
    .in-stock mat-icon, .out-stock mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .book-isbn { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem; }

    .book-desc { border-top: 1px solid var(--border); padding-top: 1.25rem; margin-bottom: 1.5rem; }
    .desc-label {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);
    }
    .book-desc p:last-child { font-size: 0.9rem; line-height: 1.7; color: var(--text-secondary); }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.7rem 1.5rem; background: var(--caramel);
      color: white; border: none; border-radius: var(--radius);
      font-family: 'Jost', sans-serif; font-size: 0.9rem;
      font-weight: 500; cursor: pointer; transition: background 0.15s;
    }
    .btn-primary:hover { background: var(--caramel-dark); }
    .btn-primary mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .login-hint { font-size: 0.875rem; color: var(--text-muted); }
    .login-hint a { color: var(--caramel-dark); font-weight: 500; }

    /* Reviews */
    .reviews-section {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem 2.5rem;
    }

    .reviews-section h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.6rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    .review-form {
      background: var(--beige);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
    }

    .review-form h3 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 0.75rem;
    }

    .star-picker { display: flex; gap: 0.25rem; margin-bottom: 0.75rem; }

    .star-btn {
      font-size: 1.5rem; background: none; border: none;
      color: var(--border-2); cursor: pointer;
      transition: color 0.1s; line-height: 1;
    }

    .star-btn.active { color: #D4956A; }
    .star-btn:hover { color: #D4956A; }

    .review-form textarea {
      width: 100%; padding: 0.7rem 0.9rem;
      border: 1px solid var(--border-2); border-radius: var(--radius);
      font-family: 'Jost', sans-serif; font-size: 0.875rem;
      color: var(--text-primary); background: var(--white);
      resize: none; outline: none; transition: border-color 0.15s;
      line-height: 1.6; margin-bottom: 0.75rem;
    }

    .review-form textarea:focus { border-color: var(--caramel); }

    .review-error { font-size: 0.85rem; color: #B05050; margin-bottom: 0.5rem; }

    .btn-review {
      padding: 0.55rem 1.25rem;
      background: var(--caramel); color: white;
      border: none; border-radius: var(--radius);
      font-family: 'Jost', sans-serif; font-size: 0.875rem;
      font-weight: 500; cursor: pointer; transition: background 0.15s;
    }

    .btn-review:hover:not(:disabled) { background: var(--caramel-dark); }
    .btn-review:disabled { opacity: 0.6; cursor: not-allowed; }

    .no-reviews {
      text-align: center; padding: 2.5rem;
      color: var(--text-muted); font-size: 0.9rem;
    }

    .reviews-list { display: flex; flex-direction: column; gap: 1rem; }

    .review-card {
      padding: 1.1rem 1.25rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--beige);
    }

    .review-header {
      display: flex; align-items: center;
      gap: 0.75rem; margin-bottom: 0.6rem;
    }

    .reviewer-avatar {
      width: 36px; height: 36px;
      background: var(--caramel-light);
      color: var(--caramel-dark);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 600;
      flex-shrink: 0;
    }

    .reviewer-name { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
    .review-date { font-size: 0.75rem; color: var(--text-muted); }
    .review-stars { margin-left: auto; font-size: 0.85rem; color: #D4956A; letter-spacing: 1px; }

    .review-comment { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }

    .state-center { display: flex; justify-content: center; padding: 4rem; }
    .spinner {
      width: 32px; height: 32px;
      border: 2px solid var(--border);
      border-top-color: var(--caramel);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class BookDetailComponent implements OnInit {
  id = input<string>('');
  book = signal<Book | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(false);
  inWishlist = signal(false);
  canReview = signal(false);
  newRating = signal(5);
  newComment = '';
  submitting = signal(false);
  reviewError = signal('');

  constructor(
    private bookService: BookService,
    public authService: AuthService,
    private cartService: CartService,
    private reviewService: ReviewService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.loading.set(true);
    this.bookService.getBookById(+this.id()).subscribe({
      next: (b) => {
        this.book.set(b);
        this.loading.set(false);
        this.loadReviews();
        if (this.authService.isLoggedIn()) {
          this.checkWishlist();
          if (!this.authService.isAdmin()) this.checkCanReview();
        }
      },
      error: () => this.loading.set(false)
    });
  }

  loadReviews() {
    this.reviewService.getBookReviews(+this.id()).subscribe({
      next: (r) => this.reviews.set(r)
    });
  }

  checkWishlist() {
    this.wishlistService.check(+this.id()).subscribe({
      next: (r) => this.inWishlist.set(r.inWishlist)
    });
  }

  checkCanReview() {
    this.reviewService.canReview(+this.id()).subscribe({
      next: (r) => this.canReview.set(r.canReview)
    });
  }

  toggleWishlist() {
    if (this.inWishlist()) {
      this.wishlistService.remove(+this.id()).subscribe({
        next: () => this.inWishlist.set(false)
      });
    } else {
      this.wishlistService.add(+this.id()).subscribe({
        next: () => this.inWishlist.set(true)
      });
    }
  }

  addToCart() { this.cartService.addToCart(this.book()!.id).subscribe(); }

  submitReview() {
    if (!this.newComment.trim()) {
      this.reviewError.set('Adaugă un comentariu!');
      return;
    }

    this.submitting.set(true);
    this.reviewError.set('');

    this.reviewService.addReview({
      bookId: +this.id(),
      rating: this.newRating(),
      comment: this.newComment
    }).subscribe({
      next: (review) => {
        this.reviews.update(r => [review, ...r]);
        this.canReview.set(false);
        this.newComment = '';
        this.newRating.set(5);
        this.submitting.set(false);
      },
      error: (err) => {
        this.reviewError.set(err.error?.message ?? 'Eroare la trimiterea recenziei!');
        this.submitting.set(false);
      }
    });
  }

  getStars(rating: number): string {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
}