import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, CreateOrder } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/Orders`;

  constructor(private http: HttpClient) {}

  createOrder(data: CreateOrder) {
    return this.http.post<Order>(this.apiUrl, data);
  }

  getMyOrders() {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number) {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getAllOrders() {
    return this.http.get<Order[]>(`${this.apiUrl}/all`);
  }

  updateStatus(id: number, status: string) {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}