import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../models/cart.model';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/Cart`;

  cartItems = signal<CartItem[]>([]);
  cartCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  cartTotal = computed(() => this.cartItems().reduce((acc, item) => acc + item.subtotal, 0));

  constructor(private http: HttpClient) {}

  loadCart() {
    return this.http.get<CartItem[]>(this.apiUrl).pipe(
      tap(items => this.cartItems.set(items))
    );
  }

  addToCart(bookId: number, quantity: number = 1) {
    return this.http.post<CartItem>(this.apiUrl, { bookId, quantity }).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  updateQuantity(bookId: number, quantity: number) {
    return this.http.put<CartItem>(`${this.apiUrl}/${bookId}`, quantity).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  removeFromCart(bookId: number) {
    return this.http.delete(`${this.apiUrl}/${bookId}`).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }
}