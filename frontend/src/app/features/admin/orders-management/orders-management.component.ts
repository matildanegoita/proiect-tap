import { Component, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatSelectModule,
    MatFormFieldModule, MatIconModule, MatExpansionModule,
    FormsModule, CurrencyPipe, DatePipe
  ],
  template: `
    <div class="management-container">
      <h1>📦 Gestionare Comenzi</h1>

      <mat-accordion>
        @for (order of orders(); track order.id) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <strong>#{{ order.id }}</strong>&nbsp;—&nbsp;
                {{ order.createdAt | date:'dd MMM yyyy, HH:mm' }}
              </mat-panel-title>
              <mat-panel-description>
                {{ order.items.length }} produse &nbsp;|&nbsp;
                {{ order.totalAmount | currency:'RON':'symbol':'1.2-2' }} &nbsp;|&nbsp;
                <span [class]="'status-' + order.status.toLowerCase()">{{ order.status }}</span>
              </mat-panel-description>
            </mat-expansion-panel-header>

            <!-- Detalii expandate -->
            <div class="order-details">

              <div class="detail-row">
                <mat-icon>location_on</mat-icon>
                <span><strong>Adresă livrare:</strong> {{ order.shippingAddress }}</span>
              </div>
              <div class="detail-row">
  <mat-icon>person</mat-icon>
  <span><strong>Client:</strong> {{ order.userFirstName }} {{ order.userLastName }}</span>
</div>

<div class="detail-row">
  <mat-icon>email</mat-icon>
  <span><strong>Email:</strong> {{ order.userEmail }}</span>
</div>

              @if (order.promoCode) {
                <div class="detail-row">
                  <mat-icon>local_offer</mat-icon>
                  <span><strong>Cod promo:</strong> {{ order.promoCode }}
                    (-{{ order.discount * 100 }}% reducere)</span>
                </div>
              }

              <h3>Produse comandate:</h3>
              <table mat-table [dataSource]="order.items" class="items-table">
                <ng-container matColumnDef="cover">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let item">
                    <img [src]="item.coverUrl || 'https://placehold.co/40x55'"
                         [alt]="item.bookTitle" class="mini-cover"/>
                  </td>
                </ng-container>

                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Carte</th>
                  <td mat-cell *matCellDef="let item">{{ item.bookTitle }}</td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Cantitate</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                </ng-container>

                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef>Preț/buc</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.unitPrice | currency:'RON':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="subtotal">
                  <th mat-header-cell *matHeaderCellDef>Subtotal</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.subtotal | currency:'RON':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="itemColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: itemColumns;"></tr>
              </table>

              <div class="order-footer">
                <div class="status-update">
                  <strong>Actualizează status:</strong>
                  <mat-form-field appearance="outline" class="status-select">
                    <mat-select [(ngModel)]="order.status" (ngModelChange)="updateStatus(order)">
                      <mat-option value="Pending">Pending</mat-option>
                      <mat-option value="Processing">Processing</mat-option>
                      <mat-option value="Shipped">Shipped</mat-option>
                      <mat-option value="Delivered">Delivered</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="total">
                  Total: <strong>{{ order.totalAmount | currency:'RON':'symbol':'1.2-2' }}</strong>
                </div>
              </div>
            </div>

          </mat-expansion-panel>
        }
      </mat-accordion>
    </div>
  `,
  styles: [`
    .management-container { padding: 1.5rem; max-width: 1100px; margin: 0 auto; }
    h1 { margin-bottom: 1.5rem; }
    .order-details { padding: 1rem 0; }
    .detail-row {
      display: flex; align-items: center; gap: 0.5rem;
      margin-bottom: 0.5rem; color: #444;
    }
    .detail-row mat-icon { color: #1976d2; font-size: 1.1rem; }
    .items-table { width: 100%; margin: 0.5rem 0 1rem; }
    .mini-cover { width: 40px; height: 55px; object-fit: cover; border-radius: 3px; }
    .order-footer {
      display: flex; justify-content: space-between;
      align-items: center; margin-top: 1rem;
    }
    .status-update { display: flex; align-items: center; gap: 1rem; }
    .status-select { width: 160px; }
    .total { font-size: 1.1rem; }
    .status-pending { color: #856404; font-weight: 500; }
    .status-processing { color: #004085; font-weight: 500; }
    .status-shipped { color: #155724; font-weight: 500; }
    .status-delivered { color: #0c5460; font-weight: 500; }
    mat-panel-description { gap: 0.3rem; }
  `]
})
export class OrdersManagementComponent implements OnInit {
  orders = signal<Order[]>([]);
  itemColumns = ['cover', 'title', 'quantity', 'unitPrice', 'subtotal'];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => this.orders.set(orders)
    });
  }

  updateStatus(order: Order) {
    this.orderService.updateStatus(order.id, order.status).subscribe();
  }
  
}
