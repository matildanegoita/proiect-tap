import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { BookService } from '../../../core/services/book.service';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatIconModule, CurrencyPipe],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-inner">
        <h1>Panou de administrare</h1>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon books">
              <mat-icon>menu_book</mat-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ totalBooks() }}</p>
              <p class="stat-label">Cărți în catalog</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orders">
              <mat-icon>shopping_bag</mat-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ totalOrders() }}</p>
              <p class="stat-label">Comenzi totale</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon pending">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ pendingOrders() }}</p>
              <p class="stat-label">În așteptare</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon revenue">
              <mat-icon>payments</mat-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ totalRevenue() | currency:'RON ':'symbol':'1.0-0' }}</p>
              <p class="stat-label">Venituri totale</p>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
          <div class="chart-card">
            <h2>Venituri pe zile</h2>
            <div class="chart-wrap">
              <canvas #revenueChart></canvas>
            </div>
          </div>

          <div class="chart-card">
            <h2>Comenzi după status</h2>
            <div class="chart-wrap chart-wrap-sm">
              <canvas #statusChart></canvas>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
       <div class="quick-actions">
  <h2>Acțiuni rapide</h2>
  <div class="actions-row">
    <a routerLink="/admin/books" class="action-btn">
      <mat-icon>menu_book</mat-icon>
      Gestionare cărți
    </a>
    <a routerLink="/admin/orders" class="action-btn">
      <mat-icon>shopping_bag</mat-icon>
      Gestionare comenzi
    </a>
    <button class="action-btn" (click)="exportCsv()">
      <mat-icon>download</mat-icon>
      Export comenzi CSV
    </button>
  </div>
</div>
  `,
  styles: [`
    .dashboard-page { min-height: 100vh; background: var(--beige); padding: 2rem 0; }

    .dashboard-inner { max-width: 1100px; margin: 0 auto; padding: 0 2.5rem; }

    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 1.5rem;
    }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon.books { background: #EEF2FF; color: #4F46E5; }
    .stat-icon.orders { background: #FEF3C7; color: #D97706; }
    .stat-icon.pending { background: #FEE2E2; color: #DC2626; }
    .stat-icon.revenue { background: #DCFCE7; color: #16A34A; }

    .stat-icon mat-icon { font-size: 1.4rem; width: 1.4rem; height: 1.4rem; }

    .stat-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.6rem; font-weight: 600;
      color: var(--text-primary); line-height: 1;
      margin-bottom: 0.2rem;
    }

    .stat-label { font-size: 0.8rem; color: var(--text-muted); }

    /* Charts */
    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .chart-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }

    .chart-card h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 1rem;
    }

    .chart-wrap { height: 220px; position: relative; }
    .chart-wrap-sm { height: 220px; position: relative; }

    /* Quick actions */
    .quick-actions {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }

    .quick-actions h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 1rem;
    }

    .actions-row { display: flex; gap: 0.75rem; }

    .action-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      background: var(--beige); border: 1px solid var(--border-2);
      border-radius: var(--radius);
      font-family: 'Jost', sans-serif; font-size: 0.875rem;
      color: var(--text-secondary); transition: all 0.15s;
    }

    .action-btn:hover {
      background: var(--caramel);
      color: white; border-color: var(--caramel);
    }

    .action-btn mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('statusChart') statusChartRef!: ElementRef;

  totalBooks = signal(0);
  totalOrders = signal(0);
  pendingOrders = signal(0);
  totalRevenue = signal(0);

  private orders: Order[] = [];
  private chartsReady = false;
  private dataReady = false;

  constructor(
    private bookService: BookService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.bookService.getBooks({ pageSize: 1 }).subscribe({
      next: (r) => this.totalBooks.set(r.totalCount)
    });

    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.totalOrders.set(orders.length);
        this.pendingOrders.set(orders.filter(o => o.status === 'Pending').length);
        this.totalRevenue.set(orders.reduce((acc, o) => acc + o.totalAmount, 0));
        this.dataReady = true;
        if (this.chartsReady) this.buildCharts();
      }
    });
  }

  ngAfterViewInit() {
    this.chartsReady = true;
    if (this.dataReady) this.buildCharts();
  }

  buildCharts() {
    this.buildRevenueChart();
    this.buildStatusChart();
  }

  buildRevenueChart() {
    // Grupează comenzile pe ultimele 7 zile
    const days: string[] = [];
    const revenues: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
      days.push(label);

      const dayRevenue = this.orders
        .filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.toDateString() === date.toDateString();
        })
        .reduce((acc, o) => acc + o.totalAmount, 0);

      revenues.push(Math.round(dayRevenue * 100) / 100);
    }

    new Chart(this.revenueChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: 'Venituri (RON)',
          data: revenues,
          borderColor: '#C9956B',
          backgroundColor: 'rgba(201,149,107,0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#C9956B',
          pointRadius: 4,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#EAE0D4' },
            ticks: {
              font: { family: 'Jost', size: 11 },
              color: '#B09880'
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Jost', size: 11 },
              color: '#B09880'
            }
          }
        }
      }
    });
  }

  buildStatusChart() {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const labels = ['În așteptare', 'În procesare', 'Expediat', 'Livrat'];
    const counts = statuses.map(s => this.orders.filter(o => o.status === s).length);
    const colors = ['#FEF3C7', '#DBEAFE', '#D1FAE5', '#F3F4F6'];
    const borders = ['#D97706', '#2563EB', '#16A34A', '#6B7280'];

    new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderColor: borders,
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Jost', size: 11 },
              color: '#7A5C48',
              padding: 12,
              boxWidth: 12
            }
          }
        }
      }
    });
  }
  exportCsv() {
  const headers = ['ID', 'Data', 'Client', 'Email', 'Adresa', 'Produse', 'Total', 'Status'];

  const rows = this.orders.map(o => [
    o.id,
    new Date(o.createdAt).toLocaleDateString('ro-RO'),
    `${o.userFirstName} ${o.userLastName}`,
    o.userEmail,
    o.shippingAddress,
    o.items.map(i => `${i.bookTitle} x${i.quantity}`).join(' | '),
    o.totalAmount.toFixed(2) + ' RON',
    o.status
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `comenzi_${new Date().toLocaleDateString('ro-RO').replace(/\//g, '-')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
}