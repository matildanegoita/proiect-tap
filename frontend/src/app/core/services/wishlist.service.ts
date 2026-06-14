import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '../models/book.model';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly apiUrl = `${environment.apiUrl}/Wishlist`;

  wishlistItems = signal<Book[]>([]);
  wishlistCount = signal(0);

  constructor(private http: HttpClient) {}

  loadWishlist() {
    return this.http.get<Book[]>(this.apiUrl).pipe(
      tap(items => {
        this.wishlistItems.set(items);
        this.wishlistCount.set(items.length);
      })
    );
  }

  add(bookId: number) {
    return this.http.post(`${this.apiUrl}/${bookId}`, {}).pipe(
      tap(() => this.loadWishlist().subscribe())
    );
  }

  remove(bookId: number) {
    return this.http.delete(`${this.apiUrl}/${bookId}`).pipe(
      tap(() => this.loadWishlist().subscribe())
    );
  }

  check(bookId: number) {
    return this.http.get<{ inWishlist: boolean }>(`${this.apiUrl}/check/${bookId}`);
  }
}