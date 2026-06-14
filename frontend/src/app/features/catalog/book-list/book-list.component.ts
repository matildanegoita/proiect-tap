import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { BookService } from '../../../core/services/book.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Book, Category, BookFilter } from '../../../core/models/book.model';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule, CurrencyPipe],
  template: `
    <div class="catalog-page">

      <div class="catalog-header">
        <div class="header-inner">
          <div>
            <h1>Colecția noastră</h1>
            <p class="subtitle">{{ totalCount() }} de titluri te așteaptă</p>
          </div>
          <div class="search-wrap">
            <mat-icon>search</mat-icon>
            <input type="text" [(ngModel)]="filter.search"
                   (ngModelChange)="onSearch()"
                   placeholder="Caută după titlu sau autor..."/>
          </div>
        </div>
      </div>

      <div class="catalog-body">

        <aside class="sidebar">
          <div class="sidebar-section">
            <p class="sidebar-label">Categorii</p>
            <button class="cat-btn" [class.active]="!filter.categoryId"
                    (click)="setCategory(undefined)">Toate</button>
            @for (cat of categories(); track cat.id) {
              <button class="cat-btn" [class.active]="filter.categoryId === cat.id"
                      (click)="setCategory(cat.id)">{{ cat.name }}</button>
            }
          </div>

          <div class="sidebar-section">
            <p class="sidebar-label">Preț (RON)</p>
            <div class="price-row">
              <input type="number" [(ngModel)]="filter.minPrice"
                     (ngModelChange)="loadBooks()" placeholder="Min"/>
              <span>—</span>
              <input type="number" [(ngModel)]="filter.maxPrice"
                     (ngModelChange)="loadBooks()" placeholder="Max"/>
            </div>
          </div>

          <div class="sidebar-section">
            <p class="sidebar-label">Sortare</p>
            <select [(ngModel)]="filter.sortBy" (ngModelChange)="loadBooks()">
              <option value="title">Titlu A-Z</option>
              <option value="price">Preț</option>
              <option value="rating">Rating</option>
            </select>
            <select [(ngModel)]="filter.sortOrder" (ngModelChange)="loadBooks()">
              <option value="asc">Crescător ↑</option>
              <option value="desc">Descrescător ↓</option>
            </select>
          </div>
        </aside>

        <main class="books-main">
          @if (loading()) {
            <div class="state-center">
              <div class="spinner"></div>
            </div>
          } @else if (allBooks().length === 0) {
            <div class="state-center">
              <p class="empty-text">Nicio carte găsită.</p>
              <button class="btn-reset" (click)="resetFilters()">Resetează filtrele</button>
            </div>
          } @else {
            <div class="books-grid">
              @for (book of visibleBooks; track book.id) {
                <article class="book-card">
                  <a [routerLink]="['/catalog', book.id]" class="cover-link">
                    <img [src]="book.coverUrl || 'https://placehold.co/200x290/F2EDE4/B09880'"
                         [alt]="book.title" loading="lazy"/>
                    @if (book.stock === 0) {
                      <div class="oos">Stoc epuizat</div>
                    }
                  </a>
                  <div class="card-body">
                    <p class="card-cat">{{ book.categoryName }}</p>
                    <h3><a [routerLink]="['/catalog', book.id]">{{ book.title }}</a></h3>
                    <p class="card-author">{{ book.author }}</p>
                    <div class="card-footer">
                      <div>
                        <span class="stars">{{ getStars(book.avgRating) }}</span>
                        <span class="rc">({{ book.reviewCount }})</span>
                      </div>
                      <div class="price-row-card">
                        <span class="price">{{ book.price | currency:'RON ':'symbol':'1.0-0' }}</span>
                        @if (book.stock > 0 && authService.isLoggedIn()) {
                          <button class="btn-add" (click)="addToCart(book)" title="Adaugă în coș">
                            <mat-icon>add_shopping_cart</mat-icon>
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </article>
              }
            </div>

            @if (hasMore) {
              <div class="show-more">
                <button class="btn-show-more" (click)="showMore()">
                  Afișează mai mult
                  <span class="show-more-count">({{ allBooks().length - visibleCount() }} rămase)</span>
                </button>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .catalog-page { min-height: 100vh; background: var(--beige); }

    .catalog-header {
      background: var(--white);
      border-bottom: 1px solid var(--border);
      padding: 1.75rem 0;
    }

    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .header-inner h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }

    .search-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--beige);
      border: 1px solid var(--border-2);
      border-radius: 50px;
      padding: 0.5rem 1.2rem;
      width: 320px;
      transition: border-color 0.15s;
    }

    .search-wrap:focus-within { border-color: var(--caramel); }
    .search-wrap mat-icon { color: var(--text-muted); font-size: 1.1rem; flex-shrink: 0; }
    .search-wrap input {
      border: none; outline: none; background: transparent;
      font-family: 'Jost', sans-serif; font-size: 0.875rem;
      color: var(--text-primary); width: 100%;
    }

    .catalog-body {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 2.5rem;
      display: flex;
      gap: 2.5rem;
      align-items: flex-start;
    }

    .sidebar {
      width: 190px;
      flex-shrink: 0;
      position: sticky;
      top: 84px;
    }

    .sidebar-section { margin-bottom: 1.75rem; }

    .sidebar-label {
      font-size: 0.68rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--text-muted);
      margin-bottom: 0.7rem;
    }

    .cat-btn {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.38rem 0.7rem;
      background: none;
      border: none;
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.875rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.12s;
      margin-bottom: 2px;
    }

    .cat-btn:hover { background: var(--beige-2); color: var(--text-primary); }
    .cat-btn.active { background: var(--caramel); color: white; font-weight: 500; }

    .price-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.4rem;
    }

    .price-row input {
      width: calc(50% - 0.4rem);
      padding: 0.35rem 0.5rem;
      border: 1px solid var(--border-2);
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.85rem;
      background: var(--white);
      color: var(--text-primary);
      outline: none;
    }

    .price-row span { color: var(--text-muted); font-size: 0.8rem; }

    select {
      display: block;
      width: 100%;
      padding: 0.38rem 0.6rem;
      border: 1px solid var(--border-2);
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.85rem;
      background: var(--white);
      color: var(--text-primary);
      outline: none;
      cursor: pointer;
      margin-bottom: 0.4rem;
    }

    .books-main { flex: 1; min-width: 0; }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
      gap: 1.25rem;
    }

    .book-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .book-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
      border-color: transparent;
    }

    .cover-link {
      display: block;
      position: relative;
      height: 240px;
      overflow: hidden;
      background: var(--beige-2);
    }

    .cover-link img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .book-card:hover .cover-link img { transform: scale(1.04); }

    .oos {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      background: rgba(61,43,31,0.75);
      color: white;
      text-align: center;
      font-size: 0.75rem;
      padding: 0.4rem;
    }

    .card-body {
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.18rem;
    }

    .card-cat {
      font-size: 0.65rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--caramel);
    }

    .card-body h3 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.25;
      color: var(--text-primary);
    }

    .card-body h3 a:hover { color: var(--caramel-dark); }
    .card-author { font-size: 0.78rem; color: var(--text-muted); font-style: italic; }

    .card-footer {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border);
    }

    .stars { font-size: 0.7rem; color: #D4956A; letter-spacing: 1px; }
    .rc { font-size: 0.7rem; color: var(--text-muted); margin-left: 0.2rem; }

    .price-row-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .price { font-size: 0.95rem; font-weight: 500; color: var(--text-primary); }

    .btn-add {
      width: 28px; height: 28px;
      background: var(--caramel);
      border: none; border-radius: 50%;
      color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.15s; flex-shrink: 0;
    }

    .btn-add:hover { background: var(--caramel-dark); }
    .btn-add mat-icon { font-size: 0.95rem; width: 0.95rem; height: 0.95rem; }

    .state-center {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 1rem; padding: 5rem; color: var(--text-muted);
    }

    .spinner {
      width: 32px; height: 32px;
      border: 2px solid var(--border);
      border-top-color: var(--caramel);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-text { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; }

    .btn-reset {
      padding: 0.5rem 1.2rem;
      background: var(--caramel); color: white;
      border: none; border-radius: var(--radius);
      font-family: 'Jost', sans-serif; font-size: 0.875rem; cursor: pointer;
    }

    .show-more {
      display: flex;
      justify-content: center;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
    }

    .btn-show-more {
      padding: 0.7rem 2rem;
      background: var(--white);
      border: 1px solid var(--border-2);
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif;
      font-size: 0.9rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-show-more:hover { border-color: var(--caramel); color: var(--caramel-dark); }
    .show-more-count { font-size: 0.8rem; color: var(--text-muted); }
  `]
})
export class BookListComponent implements OnInit {
  allBooks = signal<Book[]>([]);
  categories = signal<Category[]>([]);
  totalCount = signal(0);
  visibleCount = signal(15);
  loading = signal(false);

  get visibleBooks() {
    return this.allBooks().slice(0, this.visibleCount());
  }

  get hasMore() {
    return this.visibleCount() < this.allBooks().length;
  }

  filter: BookFilter = { page: 1, pageSize: 200, sortBy: 'title', sortOrder: 'asc' };
  private searchTimeout: any;

  constructor(
    private bookService: BookService,
    public authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() { this.loadBooks(); this.loadCategories(); }

  loadBooks() {
    this.loading.set(true);
    this.bookService.getBooks({ ...this.filter, pageSize: 200 }).subscribe({
      next: (r) => {
        this.allBooks.set(r.items);
        this.totalCount.set(r.totalCount);
        this.visibleCount.set(15);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadCategories() {
    this.bookService.getCategories().subscribe({ next: (c) => this.categories.set(c) });
  }

  showMore() {
    this.visibleCount.update(v => v + 15);
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.filter.page = 1; this.loadBooks(); }, 400);
  }

  setCategory(id: number | undefined) {
    this.filter.categoryId = id;
    this.filter.page = 1;
    this.loadBooks();
  }

  resetFilters() {
    this.filter = { page: 1, pageSize: 200, sortBy: 'title', sortOrder: 'asc' };
    this.loadBooks();
  }

  addToCart(book: Book) { this.cartService.addToCart(book.id).subscribe(); }

  getStars(rating: number): string {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
}